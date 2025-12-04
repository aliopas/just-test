import { useMutation } from '@tanstack/react-query';
import { apiClient, type ApiClientOptions } from '../utils/api-client';
import { getSupabaseBrowserClient, resetSupabaseClient } from '../utils/supabase-client';
import { storeSessionTokens } from '../utils/session-storage';
import { useAuth } from '../context/AuthContext';

type LoginPayload = {
  email: string;
  password: string;
  totpToken?: string;
};

type UserRole = 'investor' | 'admin';

type LoginSuccessResponse = {
  user: {
    id: string;
    email: string | null;
    role?: UserRole | null;
  };
  session?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    expiresAt?: number | null;
    tokenType?: string;
  };
  expiresIn?: number;
  tokenType?: string;
};

type LoginResponse =
  | {
      requires2FA: true;
      message?: string;
    }
  | LoginSuccessResponse;

function isTwoFactorResponse(
  response: LoginResponse
): response is Extract<LoginResponse, { requires2FA: true }> {
  return 'requires2FA' in response && response.requires2FA === true;
}

async function loginRequest(payload: LoginPayload) {
  const response = await apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  } satisfies ApiClientOptions);

  return response;
}

export function useLogin() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: async response => {
      if (isTwoFactorResponse(response)) {
        return;
      }

      if (!response.user?.id) {
        throw new Error('لم يتم العثور على بيانات المستخدم في الاستجابة.');
      }

      const role: UserRole = response.user.role === 'admin' ? 'admin' : 'investor';

      const normalizedUser = {
        id: response.user.id,
        email: response.user.email ?? '',
        role,
      };

      setUser(normalizedUser);
      storeSessionTokens({
        accessToken: response.session?.accessToken,
        refreshToken: response.session?.refreshToken,
      });

      // Initialize Supabase session after login
      // Reset client to ensure fresh state
      resetSupabaseClient();
      const supabase = getSupabaseBrowserClient();
      if (supabase && response.session?.accessToken && response.session?.refreshToken) {
        try {
          // Set session with tokens from backend
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: response.session.accessToken,
            refresh_token: response.session.refreshToken,
          });

          if (sessionError) {
            console.error('[Supabase Auth] Failed to set session:', {
              error: sessionError,
              message: sessionError.message,
              status: sessionError.status,
            });
            
            // Even if setSession fails, tokens are stored in localStorage
            // Try to get session to verify
            const { data: currentSession } = await supabase.auth.getSession();
            if (!currentSession?.session) {
              console.warn('[Supabase Auth] Session not set, but tokens are stored in localStorage');
              // Force a refresh by calling getSession again after a short delay
              setTimeout(async () => {
                const { data: retrySession } = await supabase.auth.getSession();
                if (retrySession?.session) {
                  console.log('[Supabase Auth] Session recovered after retry');
                }
              }, 100);
            }
          } else {
            console.log('[Supabase Auth] Session initialized successfully', {
              userId: sessionData?.user?.id,
              email: sessionData?.user?.email,
            });
            
            // Verify session is accessible immediately
            const { data: verifySession } = await supabase.auth.getSession();
            if (verifySession?.session) {
              console.log('[Supabase Auth] Session verified successfully');
            } else {
              console.warn('[Supabase Auth] Session set but not immediately accessible, will retry');
              // Retry after a short delay to allow Supabase to sync
              setTimeout(async () => {
                const { data: retrySession } = await supabase.auth.getSession();
                if (retrySession?.session) {
                  console.log('[Supabase Auth] Session accessible after retry');
                }
              }, 200);
            }
          }
        } catch (error) {
          console.error('[Supabase Auth] Failed to hydrate Supabase client session:', error);
          // Session tokens are still stored, so the app can continue working
          // The Supabase client will use them on next request
          // Try to recover by getting session after a delay
          setTimeout(async () => {
            try {
              const { data: recoveredSession } = await supabase.auth.getSession();
              if (recoveredSession?.session) {
                console.log('[Supabase Auth] Session recovered after error');
              }
            } catch (recoverError) {
              console.error('[Supabase Auth] Failed to recover session:', recoverError);
            }
          }, 300);
        }
      } else {
        if (!supabase) {
          console.warn('[Supabase Auth] Supabase client not available');
        }
        if (!response.session?.accessToken || !response.session?.refreshToken) {
          console.warn('[Supabase Auth] Session tokens missing from response');
        }
        console.warn('[Supabase Auth] Session tokens stored but not synced with Supabase client');
      }
    },
  });
}


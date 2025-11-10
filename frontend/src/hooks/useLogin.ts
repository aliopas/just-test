import { useMutation } from '@tanstack/react-query';
import { apiClient, type ApiClientOptions } from '../utils/api-client';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
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

function storeSessionTokens(session?: LoginSuccessResponse['session']) {
  if (typeof window === 'undefined' || !session) {
    return;
  }

  if (session.accessToken) {
    window.localStorage.setItem('access_token', session.accessToken);
  }

  if (session.refreshToken) {
    window.localStorage.setItem('refresh_token', session.refreshToken);
  }
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
      storeSessionTokens(response.session);

      const supabase = getSupabaseBrowserClient();
      if (supabase && response.session?.accessToken && response.session?.refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: response.session.accessToken,
            refresh_token: response.session.refreshToken,
          });
        } catch (error) {
          console.warn('Failed to hydrate Supabase client session', error);
        }
      }
    },
  });
}


'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '../utils/api-client';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

async function logoutRequest() {
  // First, sign out from Supabase to clear the Supabase session
  const supabase = getSupabaseBrowserClient();
  if (supabase) {
    try {
      const { error: supabaseError } = await supabase.auth.signOut();
      if (supabaseError) {
        console.error('[Logout] Supabase signOut error:', supabaseError);
        // Continue with backend logout even if Supabase signOut fails
      }
    } catch (supabaseError) {
      console.error('[Logout] Supabase signOut exception:', supabaseError);
      // Continue with backend logout even if Supabase signOut fails
    }
  }

  // Then, call backend logout endpoint
  try {
    await apiClient('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (backendError) {
    // If backend fails, we still want to clear local state
    // The error will be handled in onError
    throw backendError;
  }
}

function clearAuthArtifacts() {
  // Clear all auth-related tokens and data
  const tokens = [
    'access_token',
    'refresh_token',
    'sb-access-token',
    'sb-refresh-token',
    'sb:token',
    'auth_user',
  ];
  
  tokens.forEach(token => {
    localStorage.removeItem(token);
    sessionStorage.removeItem(token);
    document.cookie = `${token}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  });

  // Clear all Supabase-related storage
  if (typeof window !== 'undefined') {
    // Clear Supabase session storage
    const supabaseKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') || key.startsWith('supabase.')
    );
    supabaseKeys.forEach(key => localStorage.removeItem(key));

    const supabaseSessionKeys = Object.keys(sessionStorage).filter(key => 
      key.startsWith('sb-') || key.startsWith('supabase.')
    );
    supabaseSessionKeys.forEach(key => sessionStorage.removeItem(key));
  }
}

export function useLogout() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { language } = useLanguage();
  const { setUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearAuthArtifacts();
      setUser(null);
      
      // Clear all React Query cache to remove any user-specific data
      queryClient.clear();
      
      pushToast({
        message:
          language === 'ar'
            ? 'تم تسجيل الخروج بنجاح.'
            : 'You have been signed out successfully.',
        variant: 'success',
      });
      router.push('/');
    },
    onError: () => {
      // Even if backend logout fails, clear local state
      clearAuthArtifacts();
      setUser(null);
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Try to sign out from Supabase as a fallback
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        supabase.auth.signOut().catch((error) => {
          console.error('[Logout] Fallback Supabase signOut error:', error);
        });
      }
      
      pushToast({
        message:
          language === 'ar'
            ? 'تعذّر تسجيل الخروج، تم مسح بيانات الجلسة محلياً.'
            : 'Unable to reach the server. Your local session was cleared.',
        variant: 'error',
      });
      router.push('/');
    },
  });
}



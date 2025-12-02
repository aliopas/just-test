'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '../utils/api-client';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

async function logoutRequest() {
  await apiClient('/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
}

function clearAuthArtifacts() {
  const tokens = [
    'access_token',
    'refresh_token',
    'sb-access-token',
    'sb-refresh-token',
    'sb:token',
  ];
  tokens.forEach(token => {
    localStorage.removeItem(token);
    sessionStorage.removeItem(token);
    document.cookie = `${token}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
  });
}

export function useLogout() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { language } = useLanguage();
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearAuthArtifacts();
      setUser(null);
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
      clearAuthArtifacts();
      setUser(null);
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



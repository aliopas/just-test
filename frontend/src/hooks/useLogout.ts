import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../utils/api-client';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

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
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { language } = useLanguage();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      clearAuthArtifacts();
      pushToast({
        message:
          language === 'ar'
            ? 'ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ Ø¨Ù†Ø¬Ø§Ø­.'
            : 'You have been signed out successfully.',
        variant: 'success',
      });
      navigate('/');
    },
    onError: () => {
      clearAuthArtifacts();
      pushToast({
        message:
          language === 'ar'
            ? 'ØªØ¹Ø°Ø± ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬ØŒ ØªÙ… Ù…Ø³Ø­ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø¬Ù„Ø³Ø© Ù…Ø­Ù„ÙŠØ§Ù‹.'
            : 'Unable to reach the server. Your local session was cleared.',
        variant: 'error',
      });
      navigate('/');
    },
  });
}



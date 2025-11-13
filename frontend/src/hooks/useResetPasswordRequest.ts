import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '../utils/api-client';

interface ResetPasswordRequestResponse {
  message: string;
}

async function resetPasswordRequest(email: string) {
  return apiClient<ResetPasswordRequestResponse>('/auth/reset-password-request', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email }),
  });
}

export function useResetPasswordRequest() {
  return useMutation({
    mutationFn: resetPasswordRequest,
  });
}


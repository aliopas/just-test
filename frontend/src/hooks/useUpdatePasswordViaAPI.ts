import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

interface UpdatePasswordResponse {
  updated: boolean;
  message: string;
}

async function updatePassword(password: string) {
  return apiClient<UpdatePasswordResponse>('/auth/update-password', {
    method: 'POST',
    auth: true,
    body: JSON.stringify({ password }),
  });
}

export function useUpdatePasswordViaAPI() {
  return useMutation({
    mutationFn: updatePassword,
  });
}


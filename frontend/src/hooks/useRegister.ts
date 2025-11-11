import { useMutation } from '@tanstack/react-query';
import { apiClient, type ApiClientOptions } from '../utils/api-client';

type RegisterPayload = {
  email: string;
  fullName: string;
  phone?: string;
  company?: string;
  message?: string;
  language?: 'ar' | 'en';
};

type RegisterResponse = {
  request: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  };
  message: string;
};

async function registerRequest(payload: RegisterPayload) {
  return apiClient<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  } satisfies ApiClientOptions);
}

export function useRegister() {
  return useMutation({
    mutationFn: registerRequest,
  });
}


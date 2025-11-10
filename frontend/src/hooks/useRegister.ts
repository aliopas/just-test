import { useMutation } from '@tanstack/react-query';
import { apiClient, type ApiClientOptions } from '../utils/api-client';

type RegisterPayload = {
  email: string;
  password: string;
  phone?: string;
  role?: 'investor' | 'admin';
};

type RegisterResponse = {
  user: {
    id: string;
    email: string;
  };
  emailConfirmationSent?: boolean;
  otpSent?: boolean;
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


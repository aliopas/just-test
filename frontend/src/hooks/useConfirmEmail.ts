import { useMutation } from '@tanstack/react-query';
import { apiClient, type ApiClientOptions } from '../utils/api-client';

type ConfirmEmailPayload = {
  email: string;
  token?: string;
  token_hash?: string;
};

type ConfirmEmailResponse = {
  verified: boolean;
  user?: {
    id: string;
    email: string | null;
  };
};

async function confirmEmailRequest(payload: ConfirmEmailPayload) {
  return apiClient<ConfirmEmailResponse>('/auth/confirm-email', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  } satisfies ApiClientOptions);
}

export function useConfirmEmail() {
  return useMutation({
    mutationFn: confirmEmailRequest,
  });
}



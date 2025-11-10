import { useMutation } from '@tanstack/react-query';
import { apiClient, type ApiClientOptions } from '../utils/api-client';

type VerifyOtpPayload = {
  email: string;
  otp: string;
};

type VerifyOtpResponse = {
  activated: boolean;
  message?: string;
};

async function verifyOtpRequest(payload: VerifyOtpPayload) {
  return apiClient<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  } satisfies ApiClientOptions);
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtpRequest,
  });
}



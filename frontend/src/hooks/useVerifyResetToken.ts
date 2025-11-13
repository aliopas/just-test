import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '../utils/api-client';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import { storeSessionTokens } from '../utils/session-storage';

interface VerifyResetTokenResponse {
  verified: boolean;
  session: {
    access_token: string;
    refresh_token: string;
  };
  user: {
    id: string;
    email: string;
  };
}

interface VerifyResetTokenInput {
  token_hash: string;
  email?: string;
}

async function verifyResetToken(input: VerifyResetTokenInput) {
  const response = await apiClient<VerifyResetTokenResponse>('/auth/verify-reset-token', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  });

  // Set session in Supabase client
  const supabase = getSupabaseBrowserClient();
  if (supabase && response.session) {
    await supabase.auth.setSession({
      access_token: response.session.access_token,
      refresh_token: response.session.refresh_token,
    });

    // Store tokens in localStorage so apiClient can use them
    storeSessionTokens({
      accessToken: response.session.access_token,
      refreshToken: response.session.refresh_token,
    });
  }

  return response;
}

export function useVerifyResetToken() {
  return useMutation({
    mutationFn: verifyResetToken,
  });
}


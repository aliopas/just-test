import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

async function resetPasswordRequest(email: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPasswordRequest,
  });
}


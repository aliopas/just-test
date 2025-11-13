import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

async function updatePasswordRequest(newPassword: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      'Supabase client is not configured. Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.'
    );
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw error;
  }

  return data;
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: updatePasswordRequest,
  });
}


import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

async function updatePasswordRequest(newPassword: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client not available');
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


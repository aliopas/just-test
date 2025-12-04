import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

async function resetPasswordRequest(email: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      'Supabase client is not configured. Please check that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.'
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new Error('Invalid email address');
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    // Provide more user-friendly error messages
    if (error.message.includes('rate limit') || error.message.includes('too many')) {
      throw new Error('Too many requests. Please wait a few minutes before trying again.');
    }
    if (error.message.includes('not found') || error.message.includes('user')) {
      // Don't reveal if user exists or not for security
      throw new Error('If an account exists with this email, a password reset link has been sent.');
    }
    throw error;
  }

  // Even if data is null, the email was sent successfully
  return data;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: resetPasswordRequest,
  });
}


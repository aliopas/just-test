/**
 * Hook للتحقق من OTP مباشرة من Supabase
 * بديل لـ useVerifyOtp الذي يستخدم API backend
 */

import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

type VerifyOtpPayload = {
  email: string;
  otp: string;
};

type VerifyOtpResponse = {
  activated: boolean;
  message?: string;
};

async function verifyOtpRequestDirect(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // First, find user by email
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', payload.email.trim().toLowerCase())
    .maybeSingle();

  if (userError) {
    throw new Error(`خطأ في البحث عن المستخدم: ${userError.message}`);
  }

  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  // Find the OTP record
  const { data: otpRecord, error: otpError } = await supabase
    .from('user_otps')
    .select('*')
    .eq('user_id', user.id)
    .eq('code', payload.otp.trim())
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpError) {
    throw new Error(`خطأ في التحقق من OTP: ${otpError.message}`);
  }

  if (!otpRecord) {
    throw new Error('رمز OTP غير صحيح أو منتهي الصلاحية');
  }

  // Check attempts
  if (otpRecord.attempts >= otpRecord.max_attempts) {
    throw new Error('تم تجاوز عدد المحاولات المسموح بها');
  }

  // Increment attempts
  const { error: attemptError } = await supabase
    .from('user_otps')
    .update({ attempts: otpRecord.attempts + 1 })
    .eq('id', otpRecord.id);

  if (attemptError) {
    console.warn('Failed to update OTP attempts:', attemptError);
  }

  // Mark OTP as verified
  const { error: updateError } = await supabase
    .from('user_otps')
    .update({ verified: true })
    .eq('id', otpRecord.id);

  if (updateError) {
    throw new Error(`خطأ في تحديث حالة OTP: ${updateError.message}`);
  }

  return {
    activated: true,
    message: 'تم تفعيل الحساب بنجاح',
  };
}

export function useVerifyOtpDirect() {
  return useMutation({
    mutationFn: verifyOtpRequestDirect,
  });
}

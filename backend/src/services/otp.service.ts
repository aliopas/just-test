import { requireSupabaseAdmin } from '../lib/supabase';
import { generateOTP, getOTPExpiration } from '../utils/otp.util';

export interface OTPRecord {
  id: string;
  user_id: string;
  code: string;
  expires_at: string;
  attempts: number;
  max_attempts: number;
  verified: boolean;
  created_at: string;
}

export const otpService = {
  /**
   * Create and store OTP for a user
   */
  async createOTP(userId: string): Promise<{ code: string; expiresAt: Date }> {
    const code = generateOTP();
    const expiresAt = getOTPExpiration(10); // 10 minutes

    const adminClient = requireSupabaseAdmin();

    const { error } = await adminClient.from('user_otps').insert({
      user_id: userId,
      code,
      expires_at: expiresAt.toISOString(),
      attempts: 0,
      max_attempts: 5,
      verified: false,
    });

    if (error) {
      throw new Error(`Failed to create OTP: ${error.message}`);
    }

    return { code, expiresAt };
  },

  /**
   * Find active OTP for a user
   */
  async findActiveOTP(userId: string): Promise<OTPRecord | null> {
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('user_otps')
      .select('*')
      .eq('user_id', userId)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw new Error(`Failed to find OTP: ${error.message}`);
    }

    return data as OTPRecord;
  },

  /**
   * Verify OTP code
   */
  async verifyOTP(userId: string, code: string): Promise<boolean> {
    const adminClient = requireSupabaseAdmin();
    const otp = await this.findActiveOTP(userId);

    if (!otp) {
      return false;
    }

    // Check if expired
    if (new Date(otp.expires_at) < new Date()) {
      return false;
    }

    // Check if max attempts exceeded
    if (otp.attempts >= otp.max_attempts) {
      return false;
    }

    // Check if code matches
    if (otp.code !== code) {
      // Increment attempts only if code is wrong
      const { error: updateError } = await adminClient
        .from('user_otps')
        .update({ attempts: otp.attempts + 1 })
        .eq('id', otp.id);

      if (updateError) {
        throw new Error(
          `Failed to update OTP attempts: ${updateError.message}`
        );
      }

      return false;
    }

    // Code matches - mark as verified
    const { error: verifyError } = await adminClient
      .from('user_otps')
      .update({ verified: true })
      .eq('id', otp.id);

    if (verifyError) {
      throw new Error(`Failed to verify OTP: ${verifyError.message}`);
    }

    return true;
  },

  /**
   * Check if user has exceeded max attempts
   */
  async hasExceededMaxAttempts(userId: string): Promise<boolean> {
    const otp = await this.findActiveOTP(userId);

    if (!otp) {
      return false;
    }

    return otp.attempts >= otp.max_attempts;
  },

  /**
   * Invalidate all OTPs for a user (after successful verification)
   */
  async invalidateUserOTPs(userId: string): Promise<void> {
    const adminClient = requireSupabaseAdmin();
    const { error } = await adminClient
      .from('user_otps')
      .update({ verified: true })
      .eq('user_id', userId)
      .eq('verified', false);

    if (error) {
      throw new Error(`Failed to invalidate OTPs: ${error.message}`);
    }
  },
};

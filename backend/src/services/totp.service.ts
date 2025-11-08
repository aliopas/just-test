import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { requireSupabaseAdmin } from '../lib/supabase';

export interface TOTPSetupResult {
  secret: string;
  otpauthUrl: string;
  qr: string;
}

export const totpService = {
  /**
   * Generate TOTP secret and QR code
   */
  async generateSecret(
    _userId: string,
    userEmail: string
  ): Promise<TOTPSetupResult> {
    const secret = speakeasy.generateSecret({
      name: `Bakurah Investors Portal (${userEmail})`,
      issuer: 'Bakurah Investors Portal',
      length: 32,
    });

    // Generate QR code as data URL
    const qr = await QRCode.toDataURL(secret.otpauth_url || '');

    return {
      secret: secret.base32 || '',
      otpauthUrl: secret.otpauth_url || '',
      qr,
    };
  },

  /**
   * Verify TOTP token
   */
  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time steps before/after current time
    });
  },

  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string, secret: string): Promise<void> {
    const adminClient = requireSupabaseAdmin();
    const { error } = await adminClient
      .from('users')
      .update({
        mfa_enabled: true,
        mfa_secret: secret,
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to enable 2FA: ${error.message}`);
    }
  },

  /**
   * Disable 2FA for user
   */
  async disable2FA(userId: string): Promise<void> {
    const adminClient = requireSupabaseAdmin();
    const { error } = await adminClient
      .from('users')
      .update({
        mfa_enabled: false,
        mfa_secret: null,
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to disable 2FA: ${error.message}`);
    }
  },

  /**
   * Get user's 2FA status
   */
  async get2FAStatus(
    userId: string
  ): Promise<{ enabled: boolean; hasSecret: boolean }> {
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('users')
      .select('mfa_enabled, mfa_secret')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get 2FA status: ${error.message}`);
    }

    return {
      enabled: data?.mfa_enabled || false,
      hasSecret: !!data?.mfa_secret,
    };
  },

  /**
   * Get user's TOTP secret (for verification)
   */
  async getSecret(userId: string): Promise<string | null> {
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('users')
      .select('mfa_secret')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get TOTP secret: ${error.message}`);
    }

    return data?.mfa_secret || null;
  },
};

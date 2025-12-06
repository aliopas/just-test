import React, { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useVerifyOtpDirect } from '../hooks/useVerifyOtpDirect';
import { ApiError } from '../utils/api-client';

export function VerifyOtpPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyOtpMutation = useVerifyOtpDirect();

  const initialEmail = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await verifyOtpMutation.mutateAsync({
        email,
        otp,
      });

      if (response.activated) {
        setSuccess(
          isArabic
            ? 'تم تفعيل حسابك بنجاح. يمكنك الآن تسجيل الدخول.'
            : 'Your account has been activated. You can now sign in.'
        );
        // توجيه تلقائي بعد ثوانٍ إلى صفحة الدخول
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setSuccess(
          isArabic
            ? response.message || 'تم تحديث حالة حسابك.'
            : response.message || 'Your account status has been updated.'
        );
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          isArabic
            ? err.message || 'رمز التحقق غير صحيح أو منتهي.'
            : err.message || 'The verification code is invalid or expired.'
        );
      } else if (err instanceof Error) {
        setError(isArabic ? err.message : err.message || 'Unable to verify code.');
      } else {
        setError(
          isArabic
            ? 'حدث خطأ غير متوقع أثناء التحقق من الرمز.'
            : 'An unexpected error occurred while verifying the code.'
        );
      }
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: palette.backgroundSurface,
        padding: '2rem',
        direction,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: palette.backgroundBase,
          borderRadius: radius.lg,
          boxShadow: shadow.medium,
          padding: '2rem',
          border: `1px solid ${palette.neutralBorderSoft}`,
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: '0.75rem',
            fontSize: typography.sizes.heading,
            fontWeight: typography.weights.bold,
            color: palette.textPrimary,
          }}
        >
          {isArabic ? 'تأكيد رمز التحقق' : 'Verify security code'}
        </h1>
        <p
          style={{
            margin: 0,
            marginBottom: '1.5rem',
            fontSize: typography.sizes.body,
            color: palette.textSecondary,
          }}
        >
          {isArabic
            ? 'أدخل رمز التحقق المكون من 6 أرقام الذي تم إرساله إلى بريدك الإلكتروني.'
            : 'Enter the 6‑digit verification code sent to your email address.'}
        </p>

        {error && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 0.9rem',
              borderRadius: radius.md,
              background: '#FEF2F2',
              color: palette.error,
              fontSize: typography.sizes.caption,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 0.9rem',
              borderRadius: radius.md,
              background: '#ECFDF3',
              color: palette.success,
              fontSize: typography.sizes.caption,
            }}
          >
            {success}
          </div>
        )}

        <form
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
          onSubmit={handleSubmit}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              htmlFor="email"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.medium,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'البريد الإلكتروني' : 'Email address'}
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              style={{
                padding: '0.7rem 0.85rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: typography.sizes.body,
                outline: 'none',
              }}
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              htmlFor="otp"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.medium,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'رمز التحقق' : 'Verification code'}
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              placeholder={isArabic ? '••••••' : '••••••'}
              style={{
                padding: '0.7rem 0.85rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: typography.sizes.body,
                letterSpacing: '0.35em',
                textAlign: 'center',
                outline: 'none',
              }}
              value={otp}
              onChange={event => setOtp(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem 1rem',
              borderRadius: radius.md,
              border: 'none',
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              cursor: 'pointer',
            }}
          >
            {verifyOtpMutation.isPending
              ? isArabic
                ? 'جاري التحقق...'
                : 'Verifying...'
              : isArabic
                ? 'تأكيد الرمز'
                : 'Verify code'}
          </button>
        </form>

        <p
          style={{
            marginTop: '1.25rem',
            fontSize: typography.sizes.caption,
            color: palette.textMuted,
          }}
        >
          {isArabic
            ? 'لم يصلك الرمز؟ تحقق من مجلد الرسائل غير المرغوب فيها أو اطلب إرسال الرمز مرة أخرى من شاشة الدخول.'
            : "Didn't receive a code? Check your spam folder or request a new code from the sign‑in screen."}
        </p>
      </div>
    </div>
  );
}


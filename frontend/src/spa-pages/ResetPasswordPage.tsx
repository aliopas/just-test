import React, { FormEvent, useState } from 'react';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useResetPassword } from '../hooks/useResetPassword';

export function ResetPasswordPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const resetPasswordMutation = useResetPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await resetPasswordMutation.mutateAsync(email);
      setSuccess(
        isArabic
          ? 'إذا كان هناك حساب مرتبط بهذا البريد، سيتم إرسال رابط لإعادة تعيين كلمة المرور.'
          : 'If an account exists with this email, a password reset link has been sent.'
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(
          isArabic ? err.message : err.message || 'Unable to send reset link. Please try again.'
        );
      } else {
        setError(
          isArabic
            ? 'حدث خطأ غير متوقع. حاول مرة أخرى.'
            : 'An unexpected error occurred. Please try again.'
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
          {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset your password'}
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
            ? 'ادخل البريد الإلكتروني المسجّل وسنرسل لك رابط إعادة تعيين كلمة المرور.'
            : 'Enter the email associated with your account and we will send you a reset link.'}
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
            {resetPasswordMutation.isPending
              ? isArabic
                ? 'جاري الإرسال...'
                : 'Sending...'
              : isArabic
                ? 'إرسال رابط إعادة التعيين'
                : 'Send reset link'}
          </button>
        </form>

        <p
          style={{
            marginTop: '1.25rem',
            fontSize: typography.sizes.caption,
            color: palette.textMuted,
          }}
        >
          {isArabic ? 'تذكرت كلمة المرور؟ ' : 'Remember your password? '}
          <a
            href="/login"
            style={{
              color: palette.brandPrimary,
              textDecoration: 'none',
              fontWeight: typography.weights.medium,
            }}
          >
            {isArabic ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
          </a>
        </p>
      </div>
    </div>
  );
}


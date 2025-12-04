import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { palette, radius, typography } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useResetPassword } from '../hooks/useResetPassword';

export function ForgotPasswordPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const router = useRouter();
  const resetPasswordMutation = useResetPassword();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email || !email.trim()) {
      setError(
        isArabic
          ? 'الرجاء إدخال البريد الإلكتروني.'
          : 'Please enter your email address.'
      );
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(email.trim());
      setSuccess(true);
    } catch (err: any) {
      console.error('[ForgotPassword] Error:', err);
      
      if (err && typeof err === 'object' && 'message' in err) {
        const errorMessage = err.message as string;
        
        // رسائل خطأ بالعربية
        if (isArabic) {
          if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
            setError('تم إجراء محاولات كثيرة. يرجى الانتظار قليلاً والمحاولة مرة أخرى.');
          } else if (errorMessage.includes('Invalid email')) {
            setError('البريد الإلكتروني غير صحيح.');
          } else {
            setError(errorMessage || 'حدث خطأ أثناء إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.');
          }
        } else {
          setError(errorMessage || 'Unable to send reset link. Please try again.');
        }
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
        background: `linear-gradient(135deg, ${palette.brandPrimaryDark} 0%, ${palette.brandPrimary} 50%, ${palette.brandAccent} 100%)`,
        padding: '2rem',
        direction,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: palette.backgroundBase,
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          padding: '3rem',
          border: 'none',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo/Brand section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1rem',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 24px rgba(45, 111, 163, 0.3)`,
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            style={{
              margin: 0,
              marginBottom: '0.5rem',
              fontSize: '1.875rem',
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
              letterSpacing: '-0.02em',
            }}
          >
            {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
              fontWeight: typography.weights.regular,
            }}
          >
            {isArabic
              ? 'لا تقلق، سنرسل لك رابط لإعادة تعيين كلمة المرور'
              : "Don't worry, we'll send you a reset link"}
          </p>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.875rem 1rem',
              borderRadius: radius.md,
              background: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: palette.error,
              fontSize: typography.sizes.caption,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            {error}
          </div>
        )}

        {success ? (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '1.5rem',
              borderRadius: radius.md,
              background: '#ECFDF3',
              border: '1px solid #D1FAE5',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto 1rem',
                borderRadius: '50%',
                background: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              style={{
                margin: 0,
                marginBottom: '0.5rem',
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                color: '#065F46',
              }}
            >
              {isArabic ? 'تم إرسال الرابط!' : 'Link Sent!'}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: typography.sizes.caption,
                color: '#047857',
              }}
            >
              {isArabic
                ? 'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، سيتم إرسال رابط إعادة تعيين كلمة المرور. تحقق من بريدك الإلكتروني.'
                : 'If an account exists with this email, a password reset link has been sent. Please check your email.'}
            </p>
          </div>
        ) : (
          <form
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
            onSubmit={handleSubmit}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: typography.sizes.caption,
                  fontWeight: typography.weights.semibold,
                  color: palette.textPrimary,
                  letterSpacing: '0.01em',
                }}
              >
                {isArabic ? 'البريد الإلكتروني' : 'Email address'}
              </label>
              <input
                id="email"
                type="email"
                placeholder={isArabic ? 'name@company.com' : 'name@company.com'}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: radius.md,
                  border: `1.5px solid ${palette.neutralBorderSoft}`,
                  fontSize: typography.sizes.body,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: palette.backgroundBase,
                  color: palette.textPrimary,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = palette.brandPrimary;
                  e.target.style.boxShadow = `0 0 0 3px rgba(45, 111, 163, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = palette.neutralBorderSoft;
                  e.target.style.boxShadow = 'none';
                }}
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                disabled={resetPasswordMutation.isPending}
              />
            </div>

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              style={{
                marginTop: '0.5rem',
                padding: '0.875rem 1.5rem',
                borderRadius: radius.md,
                border: 'none',
                background: resetPasswordMutation.isPending
                  ? palette.neutralBorder
                  : `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`,
                color: palette.textOnBrand,
                fontWeight: typography.weights.semibold,
                fontSize: typography.sizes.body,
                cursor: resetPasswordMutation.isPending ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: resetPasswordMutation.isPending
                  ? 'none'
                  : `0 4px 12px rgba(45, 111, 163, 0.3)`,
                opacity: resetPasswordMutation.isPending ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!resetPasswordMutation.isPending) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 6px 16px rgba(45, 111, 163, 0.4)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!resetPasswordMutation.isPending) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px rgba(45, 111, 163, 0.3)`;
                }
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
        )}

        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: `1px solid ${palette.neutralBorderSoft}`,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.caption,
              color: palette.textMuted,
            }}
          >
            {isArabic ? 'تذكرت كلمة المرور؟ ' : 'Remember your password? '}
            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                router.push('/login');
              }}
              style={{
                color: palette.brandPrimary,
                textDecoration: 'none',
                fontWeight: typography.weights.semibold,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = palette.brandPrimaryStrong;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = palette.brandPrimary;
              }}
            >
              {isArabic ? 'العودة لتسجيل الدخول' : 'Back to sign in'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


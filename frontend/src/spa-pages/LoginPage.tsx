import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { palette, radius, typography } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useSupabaseLogin } from '../hooks/useSupabaseLogin';

export function LoginPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const router = useRouter();
  const loginMutation = useSupabaseLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    // التحقق من الحقول المطلوبة
    if (!email || !password) {
      setError(
        isArabic
          ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور.'
          : 'Please enter your email and password.'
      );
      return;
    }

    try {
      console.log('[Login] محاولة تسجيل الدخول:', { email: email.trim() });

      // استخدام Supabase Login مباشرة
      await loginMutation.mutateAsync({ 
        email: email.trim(), 
        password 
      });

      // سيتم التوجيه تلقائياً في onSuccess callback
      // لا حاجة لمعالجة إضافية هنا
    } catch (err: any) {
      console.error('[Login] حدث خطأ:', err);
      
      // معالجة الأخطاء
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else if (err instanceof Error) {
        setError(
          isArabic
            ? err.message || 'تعذّر تسجيل الدخول. حاول مرة أخرى.'
            : err.message || 'Unable to sign in. Please try again.'
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
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />
      
      {/* Investment-themed grid pattern */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
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
              <path
                d="M2 12L12 17L22 12"
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
            {isArabic ? 'تسجيل الدخول' : 'Welcome Back'}
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
              ? 'ادخل إلى لوحة المستثمر الخاصة بك'
              : 'Sign in to access your investor dashboard'}
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
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              htmlFor="password"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
                letterSpacing: '0.01em',
              }}
            >
              {isArabic ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              id="password"
              type="password"
              placeholder={isArabic ? '••••••••' : '••••••••'}
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
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              fontSize: typography.sizes.caption,
            }}
          >
            <a
              href="/forgot-password"
              onClick={(e) => {
                e.preventDefault();
                router.push('/forgot-password');
              }}
              style={{
                color: palette.brandPrimary,
                textDecoration: 'none',
                fontWeight: typography.weights.medium,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = palette.brandPrimaryStrong;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = palette.brandPrimary;
              }}
            >
              {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </a>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem 1.5rem',
              borderRadius: radius.md,
              border: 'none',
              background: loginMutation.isPending
                ? palette.neutralBorder
                : `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`,
              color: palette.textOnBrand,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              cursor: loginMutation.isPending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: loginMutation.isPending
                ? 'none'
                : `0 4px 12px rgba(45, 111, 163, 0.3)`,
              opacity: loginMutation.isPending ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!loginMutation.isPending) {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 6px 16px rgba(45, 111, 163, 0.4)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!loginMutation.isPending) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 12px rgba(45, 111, 163, 0.3)`;
              }
            }}
          >
            {loginMutation.isPending
              ? isArabic
                ? 'جاري تسجيل الدخول...'
                : 'Signing in...'
              : isArabic
                ? 'تسجيل الدخول'
                : 'Sign in'}
          </button>
        </form>

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
            {isArabic ? 'لا يوجد لديك حساب؟ ' : "Don't have an account? "}
            <a
              href="/register"
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
              {isArabic ? 'إنشاء حساب مستثمر' : 'Create an investor account'}
            </a>
          </p>
        </div>

        {/* Trust indicators */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: `1px solid ${palette.neutralBorderSoft}`,
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: palette.textMuted,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 12L11 14L15 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{isArabic ? 'آمن' : 'Secure'}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: palette.textMuted,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{isArabic ? 'موثوق' : 'Trusted'}</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: palette.textMuted,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                fill="currentColor"
              />
            </svg>
            <span>{isArabic ? 'احترافي' : 'Professional'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


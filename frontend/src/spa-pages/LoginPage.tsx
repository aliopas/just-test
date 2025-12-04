import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useLogin } from '../hooks/useLogin';
import { ApiError } from '../utils/api-client';

export function LoginPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const router = useRouter();
  const loginMutation = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      const result = await loginMutation.mutateAsync({ email, password });

      // في حال تفعيل 2FA مستقبلاً يمكن توجيه المستخدم لصفحة إدخال الكود هنا
      if ('requires2FA' in result && result.requires2FA) {
        router.push('/verify');
        return;
      }

      // التوجيه حسب الدور
      const role = (result as any).user?.role === 'admin' ? 'admin' : 'investor';
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/home');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        let errorMessage = err.message;
        
        // Provide user-friendly messages for server errors
        if (err.status >= 500) {
          errorMessage = isArabic
            ? 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
            : 'A server error occurred. Please try again later.';
        } else if (err.status === 401 || err.status === 403) {
          errorMessage = isArabic
            ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
            : 'Invalid email or password.';
        } else if (err.status === 429) {
          errorMessage = isArabic
            ? 'تم إجراء محاولات كثيرة. يرجى الانتظار قليلاً والمحاولة مرة أخرى.'
            : 'Too many attempts. Please wait a moment and try again.';
        } else if (!errorMessage || errorMessage.includes('Internal Server Error')) {
          // Fallback for generic server errors
          errorMessage = isArabic
            ? 'تعذّر تسجيل الدخول. تأكد من البيانات وحاول مرة أخرى.'
            : 'Unable to sign in. Please check your credentials and try again.';
        }
        
        setError(errorMessage);
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
          {isArabic ? 'تسجيل الدخول' : 'Sign in to your account'}
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
            ? 'ادخل بريدك الإلكتروني وكلمة المرور للوصول إلى لوحة المستثمر.'
            : 'Enter your email and password to access your investor dashboard.'}
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
              placeholder={isArabic ? 'name@company.com' : 'name@company.com'}
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
              htmlFor="password"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.medium,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'كلمة المرور' : 'Password'}
            </label>
            <input
              id="password"
              type="password"
              placeholder={isArabic ? '••••••••' : '••••••••'}
              style={{
                padding: '0.7rem 0.85rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: typography.sizes.body,
                outline: 'none',
              }}
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: typography.sizes.caption,
            }}
          >
            <div />
            <a
              href="/reset-password"
              style={{
                color: palette.brandPrimary,
                textDecoration: 'none',
                fontWeight: typography.weights.medium,
              }}
            >
              {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
            </a>
          </div>

          <button
            type="submit"
            style={{
              marginTop: '0.5rem',
              padding: '0.8rem 1rem',
              borderRadius: radius.md,
              border: 'none',
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              cursor: 'pointer',
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

        <p
          style={{
            marginTop: '1.25rem',
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
              fontWeight: typography.weights.medium,
            }}
          >
            {isArabic ? 'إنشاء حساب مستثمر' : 'Create an investor account'}
          </a>
        </p>
      </div>
    </div>
  );
}


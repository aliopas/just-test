import { ChangeEvent, FormEvent, useState } from 'react';
import { useLogin } from '../hooks/useLogin';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { ApiError } from '../utils/api-client';

type LoginFormState = {
  email: string;
  password: string;
  totpToken?: string;
};

export function LoginPage() {
  const { language } = useLanguage();
  const { pushToast } = useToast();
  const loginMutation = useLogin();
  const [requires2FA, setRequires2FA] = useState(false);
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    totpToken: '',
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const handleChange = (field: keyof LoginFormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm(current => ({
      ...current,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const payload: LoginFormState = {
        email: form.email.trim(),
        password: form.password,
        totpToken: requires2FA ? form.totpToken : undefined,
      };

      const response = await loginMutation.mutateAsync(payload);

      if ('requires2FA' in response && response.requires2FA) {
        setRequires2FA(true);
        pushToast({
          variant: 'info',
          message:
            response.message ??
            (language === 'ar'
              ? 'يرجى إدخال رمز التحقق الثنائي (TOTP) لإكمال تسجيل الدخول.'
              : 'Please enter your 2FA TOTP code to continue.'),
        });
        return;
      }

      pushToast({
        variant: 'success',
        message:
          language === 'ar'
            ? 'تم تسجيل الدخول بنجاح، مرحباً بك من جديد!'
            : 'Signed in successfully. Welcome back!',
      });
    } catch (error) {
      if (error instanceof ApiError) {
        pushToast({
          variant: 'error',
          message:
            error.message ||
            (language === 'ar'
              ? 'فشل تسجيل الدخول. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
              : 'Sign-in failed. Please verify your details and try again.'),
        });
        if (error.status === 401 && requires2FA) {
          setForm(current => ({ ...current, totpToken: '' }));
        }
        return;
      }

      pushToast({
        variant: 'error',
        message:
          language === 'ar'
            ? 'حدث خطأ غير متوقع أثناء تسجيل الدخول.'
            : 'An unexpected error occurred during sign-in.',
      });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${palette.backgroundInverse} 0%, ${palette.brandPrimary} 60%, ${palette.brandPrimaryMuted} 100%)`,
        padding: '2rem 1rem',
        direction,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: palette.backgroundSurface,
          borderRadius: '1.5rem',
          boxShadow: '0 30px 80px rgba(10, 24, 64, 0.25)',
          padding: '2.75rem 2.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            textAlign: direction === 'rtl' ? 'right' : 'left',
          }}
        >
          <Logo size={72} stacked />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '2rem',
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'تسجيل الدخول إلى البوابة' : 'Sign in to the portal'}
            </h1>
            <p
              style={{
                marginTop: '0.5rem',
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {language === 'ar'
                ? 'أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى نظام باكورة.'
                : 'Enter your email and password to access the Bakurah platform.'}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: palette.textPrimary,
            }}
          >
            <span style={{ fontWeight: 600 }}>
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange('email')}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: palette.textPrimary,
            }}
          >
            <span style={{ fontWeight: 600 }}>
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange('password')}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </label>

          {requires2FA ? (
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                color: palette.textPrimary,
              }}
            >
              <span style={{ fontWeight: 600 }}>
                {language === 'ar' ? 'رمز التحقق 2FA' : '2FA verification code'}
              </span>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                maxLength={6}
                value={form.totpToken}
                onChange={handleChange('totpToken')}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '0.85rem',
                  border: `1px solid ${palette.neutralBorder}`,
                  fontSize: '1rem',
                  outline: 'none',
                  letterSpacing: '0.4rem',
                  textAlign: 'center',
                }}
              />
            </label>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              marginTop: '0.5rem',
              padding: '0.95rem 1rem',
              borderRadius: '0.95rem',
              border: 'none',
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loginMutation.isPending ? 'wait' : 'pointer',
              transition: 'transform 0.2s ease',
            }}
          >
            {loginMutation.isPending
              ? language === 'ar'
                ? 'جارٍ تسجيل الدخول…'
                : 'Signing in…'
              : language === 'ar'
                ? 'تسجيل الدخول'
                : 'Sign in'}
          </button>
        </form>

        <p
          style={{
            margin: 0,
            fontSize: '0.85rem',
            color: palette.textSecondary,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          {language === 'ar'
            ? 'هذا الوصول مخصص للمستخدمين التجريبيين: admin.demo@invastors.dev أو investor.demo@invastors.dev.'
            : 'Use the demo accounts admin.demo@invastors.dev or investor.demo@invastors.dev to explore.'}
        </p>
      </div>
    </div>
  );
}


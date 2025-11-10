import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../hooks/useRegister';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { ApiError } from '../utils/api-client';

type RegisterFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  role: 'investor' | 'admin';
};

export function RegisterPage() {
  const passwordRequirements = useMemo(
    () => ({
      regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
      message: {
        ar: 'كلمة المرور يجب أن تكون من 8 أحرف على الأقل وتحتوي على حرف كبير، حرف صغير، ورقم.',
        en: 'Password must be at least 8 characters and include uppercase, lowercase, and a number.',
      },
    }),
    []
  );
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const registerMutation = useRegister();
  const [form, setForm] = useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'investor',
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const handleChange =
    (field: keyof RegisterFormState) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm(current => ({
        ...current,
        [field]: value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordRequirements.regex.test(form.password)) {
      pushToast({
        variant: 'error',
        message: language === 'ar' ? passwordRequirements.message.ar : passwordRequirements.message.en,
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      pushToast({
        variant: 'error',
        message:
          language === 'ar'
            ? 'كلمتا المرور غير متطابقتين.'
            : 'Passwords do not match.',
      });
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: form.email.trim(),
        password: form.password,
        phone: form.phone?.trim() || undefined,
        role: form.role,
      });

      pushToast({
        variant: 'success',
        message:
          language === 'ar'
            ? 'تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك وOTP للتفعيل.'
            : 'Account created successfully. Please check your email and OTP to activate.',
      });
      navigate(`/verify?email=${encodeURIComponent(form.email.trim())}`);
    } catch (error) {
      let message: string;
      if (error instanceof ApiError) {
        const detailsMessage =
          typeof error.payload === 'object' &&
          error.payload !== null &&
          'error' in error.payload &&
          typeof (error.payload as { error?: unknown }).error === 'object' &&
          (error.payload as { error?: { details?: unknown } }).error?.details &&
          Array.isArray((error.payload as { error?: { details?: unknown } }).error?.details)
            ? (
                (error.payload as {
                  error?: { details?: Array<{ message?: string }> };
                }).error?.details ?? []
              )
                .map(item => item?.message)
                .find((item): item is string => typeof item === 'string')
            : undefined;

        message =
          detailsMessage ||
          error.message ||
          (language === 'ar'
            ? 'تعذّر إنشاء الحساب. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
            : 'Failed to create account. Please review your details and try again.');
      } else {
        message =
          language === 'ar'
            ? 'تعذّر إنشاء الحساب. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
            : 'Failed to create account. Please review your details and try again.';
      }
      pushToast({
        variant: 'error',
        message,
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
        background: `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryMuted} 60%, ${palette.backgroundInverse} 100%)`,
        padding: '2rem 1rem',
        direction,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: palette.backgroundSurface,
          borderRadius: '1.5rem',
          boxShadow: '0 30px 80px rgba(10, 24, 64, 0.18)',
          padding: '2.75rem 2.5rem',
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
          <Logo size={64} stacked />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '2rem',
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Create a new account'}
            </h1>
            <p
              style={{
                marginTop: '0.5rem',
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {language === 'ar'
                ? 'اختر نوع الحساب، أدخل بياناتك، وسنرسل إليك رمز التحقق للتفعيل.'
                : 'Choose your role, provide your details, and we will send you an OTP to activate the account.'}
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
              {language === 'ar' ? 'نوع الحساب' : 'Account type'}
            </span>
            <select
              value={form.role}
              onChange={handleChange('role')}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1rem',
                outline: 'none',
                backgroundColor: '#fff',
              }}
            >
              <option value="investor">
                {language === 'ar' ? 'مستثمر' : 'Investor'}
              </option>
              <option value="admin">
                {language === 'ar' ? 'أدمن' : 'Admin'}
              </option>
            </select>
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: palette.textPrimary,
            }}
          >
            <span style={{ fontWeight: 600 }}>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange('email')}
              style={{
                padding: '0.9rem 1rem',
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
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange('password')}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            <span
              style={{
                fontSize: '0.8rem',
                color: palette.textSecondary,
                lineHeight: 1.4,
              }}
            >
              {language === 'ar' ? passwordRequirements.message.ar : passwordRequirements.message.en}
            </span>
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
              {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm password'}
            </span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              style={{
                padding: '0.9rem 1rem',
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
              {language === 'ar' ? 'رقم الجوال (اختياري)' : 'Phone (optional)'}
            </span>
            <input
              type="tel"
              placeholder="+9665XXXXXXX"
              value={form.phone}
              onChange={handleChange('phone')}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1rem',
                outline: 'none',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            style={{
              marginTop: '0.5rem',
              padding: '1rem 1rem',
              borderRadius: '0.95rem',
              border: 'none',
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: 700,
              fontSize: '1rem',
              cursor: registerMutation.isPending ? 'wait' : 'pointer',
              transition: 'transform 0.2s ease',
            }}
          >
            {registerMutation.isPending
              ? language === 'ar'
                ? 'جارٍ إنشاء الحساب…'
                : 'Creating account…'
              : language === 'ar'
                ? 'إنشاء الحساب'
                : 'Create account'}
          </button>
        </form>

        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            color: palette.textSecondary,
            textAlign: 'center',
          }}
        >
          {language === 'ar' ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
          <Link
            to="/"
            style={{
              color: palette.brandPrimaryStrong,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {language === 'ar' ? 'سجّل الدخول' : 'Sign in'}
          </Link>
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '0.95rem',
            color: palette.textSecondary,
            textAlign: 'center',
          }}
        >
          {language === 'ar' ? 'وصلتك رسالة OTP وتريد التفعيل؟ ' : 'Received your OTP already? '}
          <Link
            to="/verify"
            style={{
              color: palette.brandPrimaryStrong,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {language === 'ar' ? 'اذهب لصفحة التفعيل' : 'Go to the activation page'}
          </Link>
        </p>
      </div>
    </div>
  );
}


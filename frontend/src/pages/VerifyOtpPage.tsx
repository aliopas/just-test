import { ChangeEvent, FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVerifyOtp } from '../hooks/useVerifyOtp';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { ApiError } from '../utils/api-client';

type VerifyFormState = {
  email: string;
  otp: string;
};

export function VerifyOtpPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const verifyMutation = useVerifyOtp();
  const [form, setForm] = useState<VerifyFormState>({
    email: '',
    otp: '',
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const handleChange =
    (field: keyof VerifyFormState) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm(current => ({
        ...current,
        [field]: field === 'otp' ? value.replace(/\D/g, '').slice(0, 6) : value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.otp.length !== 6) {
      pushToast({
        variant: 'error',
        message:
          language === 'ar'
            ? 'رمز التحقق يجب أن يتكون من 6 أرقام.'
            : 'Verification code must be 6 digits.',
      });
      return;
    }

    try {
      const response = await verifyMutation.mutateAsync({
        email: form.email.trim(),
        otp: form.otp,
      });

      pushToast({
        variant: 'success',
        message:
          response.message ??
          (language === 'ar'
            ? 'تم تفعيل الحساب بنجاح. يمكنك تسجيل الدخول الآن.'
            : 'Account activated successfully. You can now sign in.'),
      });
      navigate('/');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message ||
            (language === 'ar'
              ? 'تعذّر التحقق من الرمز. يرجى التأكد من البيانات والمحاولة مرة أخرى.'
              : 'Unable to verify the code. Please check your details and try again.')
          : language === 'ar'
          ? 'تعذّر التحقق من الرمز. يرجى التأكد من البيانات والمحاولة مرة أخرى.'
          : 'Unable to verify the code. Please check your details and try again.';

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
        background: `linear-gradient(135deg, ${palette.brandPrimaryMuted} 0%, ${palette.brandPrimary} 60%, ${palette.backgroundInverse} 100%)`,
        padding: '2rem 1rem',
        direction,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: palette.backgroundSurface,
          borderRadius: '1.5rem',
          boxShadow: '0 30px 80px rgba(10, 24, 64, 0.18)',
          padding: '2.75rem 2.35rem',
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
          <Logo size={68} stacked />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '2rem',
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'تفعيل الحساب' : 'Activate your account'}
            </h1>
            <p
              style={{
                marginTop: '0.5rem',
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {language === 'ar'
                ? 'أدخل البريد الإلكتروني ورمز OTP المرسل إليك عبر البريد الإلكتروني لإكمال التفعيل.'
                : 'Enter the email and the OTP code sent to you to finish activating your account.'}
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
              {language === 'ar' ? 'رمز التحقق (OTP)' : 'Verification code (OTP)'}
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              maxLength={6}
              value={form.otp}
              onChange={handleChange('otp')}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1.15rem',
                outline: 'none',
                letterSpacing: '0.45rem',
                textAlign: 'center',
              }}
            />
            <span
              style={{
                fontSize: '0.8rem',
                color: palette.textSecondary,
              }}
            >
              {language === 'ar'
                ? 'إذا انتهت صلاحية الرمز، يمكنك طلب رمز جديد من رابط إعادة الإرسال في البريد الإلكتروني.'
                : 'If the code expired, request a new one using the resend link in your email.'}
            </span>
          </label>

          <button
            type="submit"
            disabled={verifyMutation.isPending}
            style={{
              marginTop: '0.5rem',
              padding: '1rem 1rem',
              borderRadius: '0.95rem',
              border: 'none',
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: 700,
              fontSize: '1rem',
              cursor: verifyMutation.isPending ? 'wait' : 'pointer',
              transition: 'transform 0.2s ease',
            }}
          >
            {verifyMutation.isPending
              ? language === 'ar'
                ? 'جارٍ التحقق…'
                : 'Verifying…'
              : language === 'ar'
              ? 'تفعيل الحساب'
              : 'Activate account'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.95rem',
              color: palette.textSecondary,
            }}
          >
            {language === 'ar' ? 'جاهز لتسجيل الدخول؟ ' : 'Ready to sign in? '}
            <Link
              to="/"
              style={{
                color: palette.brandPrimaryStrong,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {language === 'ar' ? 'العودة لصفحة تسجيل الدخول' : 'Return to sign in'}
            </Link>
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.9rem',
              color: palette.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {language === 'ar'
              ? 'لم يصلك الرمز؟ تحقق من مجلد البريد غير المرغوب أو اطلب رمزاً جديداً من البريد.'
              : "Didn't receive the code? Check your spam folder or use the resend link in the email."}
          </p>
        </div>
      </div>
    </div>
  );
}



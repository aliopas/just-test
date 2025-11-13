import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUpdatePassword } from '../hooks/useUpdatePassword';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';

export function ResetPasswordPage() {
  const { language } = useLanguage();
  const { pushToast } = useToast();
  const updatePasswordMutation = useUpdatePassword();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const copy = {
    ar: {
      title: 'إعادة تعيين كلمة المرور',
      subtitle: 'أدخل كلمة المرور الجديدة',
      passwordLabel: 'كلمة المرور الجديدة',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      submitButton: 'تحديث كلمة المرور',
      submitting: 'جارٍ التحديث…',
      success: 'تم تحديث كلمة المرور بنجاح',
      passwordsNotMatch: 'كلمات المرور غير متطابقة',
      passwordRequired: 'يرجى إدخال كلمة المرور',
      minLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    },
    en: {
      title: 'Reset Password',
      subtitle: 'Enter your new password',
      passwordLabel: 'New Password',
      confirmPasswordLabel: 'Confirm Password',
      submitButton: 'Update Password',
      submitting: 'Updating…',
      success: 'Password updated successfully',
      passwordsNotMatch: 'Passwords do not match',
      passwordRequired: 'Please enter a password',
      minLength: 'Password must be at least 8 characters',
    },
  } as const;

  const currentCopy = copy[language];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password.trim()) {
      pushToast({
        variant: 'error',
        message: currentCopy.passwordRequired,
      });
      return;
    }

    if (password.length < 8) {
      pushToast({
        variant: 'error',
        message: currentCopy.minLength,
      });
      return;
    }

    if (password !== confirmPassword) {
      pushToast({
        variant: 'error',
        message: currentCopy.passwordsNotMatch,
      });
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync(password);
      pushToast({
        variant: 'success',
        message: currentCopy.success,
      });
      navigate('/login', { replace: true });
    } catch (error) {
      pushToast({
        variant: 'error',
        message:
          error instanceof Error
            ? error.message
            : language === 'ar'
              ? 'فشل تحديث كلمة المرور. يرجى المحاولة مرة أخرى.'
              : 'Failed to update password. Please try again.',
      });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.backgroundAlt,
        padding: '2.5rem 1.25rem 3rem',
        direction,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: palette.backgroundSurface,
          borderRadius: '1.75rem',
          boxShadow: '0 32px 70px rgba(15, 23, 42, 0.18)',
          padding: '2.75rem 2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.25rem',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Logo size={64} />
        </div>

        <header
          style={{
            textAlign: direction === 'rtl' ? 'right' : 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '2.05rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            {currentCopy.title}
          </h2>
          <p
            style={{
              margin: 0,
              color: palette.textSecondary,
              lineHeight: 1.7,
              fontSize: '0.98rem',
            }}
          >
            {currentCopy.subtitle}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.35rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              color: palette.textPrimary,
            }}
          >
            <span style={{ fontWeight: 600 }}>{currentCopy.passwordLabel}</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              style={{
                padding: '0.95rem 1rem',
                borderRadius: '0.95rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1rem',
                outline: 'none',
                background: palette.backgroundBase,
                transition: 'border 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
              }}
            />
          </label>

          <label
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              color: palette.textPrimary,
            }}
          >
            <span style={{ fontWeight: 600 }}>{currentCopy.confirmPasswordLabel}</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={8}
              style={{
                padding: '0.95rem 1rem',
                borderRadius: '0.95rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1rem',
                outline: 'none',
                background: palette.backgroundBase,
                transition: 'border 0.2s ease, box-shadow 0.2s ease',
                boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={updatePasswordMutation.isPending}
            style={{
              marginTop: '0.5rem',
              padding: '1rem',
              borderRadius: '1rem',
              border: 'none',
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: 700,
              fontSize: '1.05rem',
              cursor: updatePasswordMutation.isPending ? 'wait' : 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 22px 40px rgba(44, 116, 204, 0.25)',
            }}
          >
            {updatePasswordMutation.isPending
              ? currentCopy.submitting
              : currentCopy.submitButton}
          </button>
        </form>
      </div>
    </div>
  );
}


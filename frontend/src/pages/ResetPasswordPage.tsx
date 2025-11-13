import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUpdatePassword } from '../hooks/useUpdatePassword';
import { useResetPassword } from '../hooks/useResetPassword';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

export function ResetPasswordPage() {
  const { language } = useLanguage();
  const { pushToast } = useToast();
  const updatePasswordMutation = useUpdatePassword();
  const resetPasswordMutation = useResetPassword();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null);

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
      verifying: 'جارٍ التحقق من الرابط…',
      invalidLink: 'الرابط غير صالح أو منتهي الصلاحية',
      invalidLinkDesc: 'الرابط منتهي الصلاحية. روابط إعادة تعيين كلمة المرور صالحة لمدة ساعة واحدة فقط.',
      requestNewLink: 'طلب رابط جديد',
      requestingLink: 'جارٍ الإرسال…',
      newLinkSent: 'تم إرسال رابط جديد إلى بريدك الإلكتروني',
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
      verifying: 'Verifying link…',
      invalidLink: 'Invalid or expired link',
      invalidLinkDesc: 'The link has expired. Password reset links are valid for 1 hour only.',
      requestNewLink: 'Request New Link',
      requestingLink: 'Sending…',
      newLinkSent: 'A new link has been sent to your email',
    },
  } as const;

  const currentCopy = copy[language];

  // Verify the reset token from URL when component mounts
  useEffect(() => {
    const verifyResetToken = async () => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        pushToast({
          variant: 'error',
          message: currentCopy.invalidLink,
        });
        setIsVerifying(false);
        return;
      }

      // Check for Supabase errors in URL hash (e.g., expired link)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      if (error || errorCode === 'otp_expired') {
        pushToast({
          variant: 'error',
          message: currentCopy.invalidLink,
        });
        setIsVerifying(false);
        setIsVerified(false);
        return;
      }

      // Get token_hash and type from URL
      const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
      const type = searchParams.get('type') || hashParams.get('type');
      const email = searchParams.get('email') || hashParams.get('email');
      
      // Save email for requesting new link if expired
      if (email) {
        setExpiredEmail(email);
      }

      if (!tokenHash || type !== 'recovery') {
        pushToast({
          variant: 'error',
          message: currentCopy.invalidLink,
        });
        setIsVerifying(false);
        return;
      }

      try {
        // Verify the recovery token
        const { data, error } = await supabase.auth.verifyOtp({
          email: email || undefined,
          token_hash: tokenHash,
          type: 'recovery',
        });

        if (error || !data.session) {
          throw error || new Error('Verification failed');
        }

        // Set session to allow password update
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        setIsVerified(true);
      } catch (error) {
        console.error('Password reset verification error:', error);
        pushToast({
          variant: 'error',
          message: currentCopy.invalidLink,
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyResetToken();
  }, [searchParams, pushToast, currentCopy.invalidLink]);

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
            {isVerifying
              ? currentCopy.verifying
              : !isVerified
                ? currentCopy.invalidLinkDesc
                : currentCopy.subtitle}
          </p>
        </header>

        {isVerifying ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: palette.textSecondary,
            }}
          >
            {currentCopy.verifying}
          </div>
        ) : !isVerified ? (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '0.95rem',
              background: palette.brandSecondarySoft,
              border: `1px solid ${palette.brandSecondary}`,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div>
              <p style={{ margin: 0, color: palette.textPrimary, fontWeight: 600, marginBottom: '0.5rem' }}>
                {currentCopy.invalidLink}
              </p>
              <p style={{ margin: 0, color: palette.textSecondary, fontSize: '0.9rem' }}>
                {currentCopy.invalidLinkDesc}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {expiredEmail ? (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await resetPasswordMutation.mutateAsync(expiredEmail);
                        pushToast({
                          variant: 'success',
                          message: currentCopy.newLinkSent,
                        });
                      } catch (error) {
                        // Error is already handled by the mutation
                      }
                    }}
                    disabled={resetPasswordMutation.isPending}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: `1px solid ${palette.brandPrimaryStrong}`,
                      background: palette.brandPrimaryStrong,
                      color: palette.textOnBrand,
                      fontWeight: 600,
                      cursor: resetPasswordMutation.isPending ? 'wait' : 'pointer',
                      transition: 'transform 0.2s ease',
                      opacity: resetPasswordMutation.isPending ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!resetPasswordMutation.isPending) {
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {resetPasswordMutation.isPending
                      ? currentCopy.requestingLink
                      : currentCopy.requestNewLink}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login', { replace: true })}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: `1px solid ${palette.neutralBorder}`,
                      background: 'transparent',
                      color: palette.textPrimary,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login', { replace: true })}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${palette.brandPrimaryStrong}`,
                    background: palette.brandPrimaryStrong,
                    color: palette.textOnBrand,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
                </button>
              )}
              <p style={{ margin: 0, color: palette.textSecondary, fontSize: '0.85rem' }}>
                {language === 'ar' 
                  ? expiredEmail
                    ? 'يمكنك طلب رابط جديد مباشرة أو العودة إلى صفحة تسجيل الدخول'
                    : 'يمكنك طلب رابط استعادة جديد من صفحة تسجيل الدخول'
                  : expiredEmail
                    ? 'You can request a new link directly or go back to the sign in page'
                    : 'You can request a new reset link from the sign in page'}
              </p>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}


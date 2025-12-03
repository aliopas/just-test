import { FormEvent, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNextNavigate } from '../utils/next-router';
import { useUpdatePasswordViaAPI } from '../hooks/useUpdatePasswordViaAPI';
import { useResetPasswordRequest } from '../hooks/useResetPasswordRequest';
import { useVerifyResetToken } from '../hooks/useVerifyResetToken';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useCompanyLogoUrl } from '../hooks/usePublicContent';
import { ApiError } from '../utils/api-client';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import { storeSessionTokens } from '../utils/session-storage';

export function ResetPasswordPage() {
  const { language } = useLanguage();
  const { pushToast } = useToast();
  const companyLogoUrl = useCompanyLogoUrl();
  const updatePasswordMutation = useUpdatePasswordViaAPI();
  const resetPasswordMutation = useResetPasswordRequest();
  const verifyTokenMutation = useVerifyResetToken();
  const navigate = useNextNavigate();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [expiredEmail, setExpiredEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');

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
      // Check for Supabase errors in URL hash (e.g., expired link)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const error = hashParams.get('error');
      const errorCode = hashParams.get('error_code');
      const errorDescription = hashParams.get('error_description');

      if (error || errorCode === 'otp_expired') {
        // Try to extract email from URL before showing error
        const emailFromUrl = searchParams?.get('email') || hashParams.get('email');
        if (emailFromUrl) {
          setExpiredEmail(emailFromUrl);
        }
        // Don't show toast here - the UI already shows the error message
        setIsVerifying(false);
        setIsVerified(false);
        return;
      }

      // Supabase sends access_token and refresh_token in hash for password reset
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
      
      // Also check for token_hash (older format)
      const tokenHash = searchParams?.get('token_hash') || hashParams.get('token_hash');
      const email = searchParams?.get('email') || hashParams.get('email');
      
      // Save email for requesting new link if expired
      if (email) {
        setExpiredEmail(email);
      }

      // If we have access_token in hash, use it directly (new Supabase format)
      if (accessToken && refreshToken && type === 'recovery') {
        try {
          // Set session directly using access_token
          const supabase = getSupabaseBrowserClient();
          
          if (supabase) {
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError || !data.session) {
              throw sessionError || new Error('Failed to set session');
            }

            // Store tokens in localStorage so apiClient can use them
            storeSessionTokens({
              accessToken: data.session.access_token,
              refreshToken: data.session.refresh_token,
            });

            setIsVerified(true);
          } else {
            throw new Error('Supabase client not available');
          }
        } catch (error) {
          console.error('Password reset session error:', error);
          setIsVerified(false);
        } finally {
          setIsVerifying(false);
        }
        return;
      }

      // Fallback: use token_hash if available (older format)
      if (tokenHash && type === 'recovery') {
        try {
          // Verify the recovery token via API
          const result = await verifyTokenMutation.mutateAsync({
            token_hash: tokenHash,
            email: email || undefined,
          });

          if (result.verified) {
            setIsVerified(true);
          } else {
            throw new Error('Verification failed');
          }
        } catch (error) {
          console.error('Password reset verification error:', error);
          // Only show toast for API errors, not for expired links (UI already shows message)
          if (error instanceof ApiError && !error.message.includes('expired') && !error.message.includes('Invalid')) {
            pushToast({
              variant: 'error',
              message: error.message,
            });
          }
        } finally {
          setIsVerifying(false);
        }
        return;
      }

      // No valid token found
      setIsVerifying(false);
    };

    verifyResetToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          error instanceof ApiError
            ? error.message
            : error instanceof Error
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
          <Logo size={64} logoUrl={companyLogoUrl} />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        color: palette.textPrimary,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                      </span>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '0.75rem',
                          border: `1px solid ${palette.neutralBorder}`,
                          fontSize: '0.95rem',
                          outline: 'none',
                          background: palette.backgroundBase,
                          transition: 'border 0.2s ease',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = palette.brandPrimary;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = palette.neutralBorder;
                        }}
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!emailInput.trim()) {
                        pushToast({
                          variant: 'error',
                          message: language === 'ar' 
                            ? 'يرجى إدخال البريد الإلكتروني'
                            : 'Please enter your email address',
                        });
                        return;
                      }
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(emailInput.trim())) {
                        pushToast({
                          variant: 'error',
                          message: language === 'ar'
                            ? 'البريد الإلكتروني غير صحيح'
                            : 'Invalid email address',
                        });
                        return;
                      }
                      try {
                        await resetPasswordMutation.mutateAsync(emailInput.trim());
                        pushToast({
                          variant: 'success',
                          message: currentCopy.newLinkSent,
                        });
                      } catch (error) {
                        // Error is already handled by the mutation
                      }
                    }}
                    disabled={resetPasswordMutation.isPending || !emailInput.trim()}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: `1px solid ${palette.brandPrimaryStrong}`,
                      background: palette.brandPrimaryStrong,
                      color: palette.textOnBrand,
                      fontWeight: 600,
                      cursor: resetPasswordMutation.isPending || !emailInput.trim() ? 'not-allowed' : 'pointer',
                      transition: 'transform 0.2s ease',
                      opacity: resetPasswordMutation.isPending || !emailInput.trim() ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!resetPasswordMutation.isPending && emailInput.trim()) {
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
              )}
              <p style={{ margin: 0, color: palette.textSecondary, fontSize: '0.85rem' }}>
                {language === 'ar' 
                  ? expiredEmail
                    ? 'يمكنك طلب رابط جديد مباشرة أو العودة إلى صفحة تسجيل الدخول'
                    : 'أدخل بريدك الإلكتروني لطلب رابط استعادة جديد'
                  : expiredEmail
                    ? 'You can request a new link directly or go back to the sign in page'
                    : 'Enter your email address to request a new reset link'}
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

// Default export used only for legacy Next.js pages directory validation.
// We export a simple stub that does not rely on React Router, React Query, or
// any browser-only APIs so that static generation in Netlify succeeds.
export default function ResetPasswordPageStub() {
  return null;
}

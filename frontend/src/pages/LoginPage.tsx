import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useNextNavigate } from '../utils/next-router';
import { useLogin } from '../hooks/useLogin';
import { useResetPasswordRequest } from '../hooks/useResetPasswordRequest';
import { useUpdatePassword } from '../hooks/useUpdatePassword';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useCompanyLogoUrl } from '../hooks/usePublicContent';
import { ApiError } from '../utils/api-client';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

type LoginFormState = {
  email: string;
  password: string;
  totpToken?: string;
};

export function LoginPage() {
  const { language } = useLanguage();
  const { pushToast } = useToast();
  const companyLogoUrl = useCompanyLogoUrl();
  const loginMutation = useLogin();
  const resetPasswordMutation = useResetPasswordRequest();
  const updatePasswordMutation = useUpdatePassword();
  const navigate = useNextNavigate();
  const searchParams = useSearchParams();
  const [requires2FA, setRequires2FA] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [isTokenVerified, setIsTokenVerified] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    totpToken: '',
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const copy = {
    ar: {
      headline: 'شركاء باكورة التقنيات',
      heroTitle: 'مرحباً بك في مركز أخبار باكورة',
      heroSubtitle:
        'تابع آخر المستجدات الاستثمارية، تقارير السوق، والمصادقة على الصفقات قبل الانضمام إلى منصتك.',
      formTitle: 'تسجيل الدخول',
      formSubtitle:
        'ادخل بيانات الوصول الخاصة بك للاستمرار إلى لوحة التحكم الاستثمارية.',
      emailLabel: 'البريد الإلكتروني',
      passwordLabel: 'كلمة المرور',
      totpLabel: 'رمز التحقق الثنائي',
      signIn: 'تسجيل الدخول',
      signingIn: 'جارٍ تسجيل الدخول…',
      inviteCta: 'طلب إنشاء حساب مستثمر جديد',
      noAccount: 'ليس لديك حساب؟',
      forgotPassword: 'نسيت كلمة المرور؟',
      resetPasswordTitle: 'استعادة كلمة المرور',
      resetPasswordSubtitle: 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور',
      resetPasswordButton: 'إرسال رابط الاستعادة',
      resetPasswordSending: 'جارٍ الإرسال…',
      resetPasswordSuccess: 'تم إرسال رابط الاستعادة إلى بريدك الإلكتروني',
      backToLogin: 'العودة لتسجيل الدخول',
      newPasswordLabel: 'كلمة المرور الجديدة',
      confirmPasswordLabel: 'تأكيد كلمة المرور',
      updatePasswordButton: 'تحديث كلمة المرور',
      updatingPassword: 'جارٍ التحديث…',
      passwordUpdated: 'تم تحديث كلمة المرور بنجاح',
      passwordsNotMatch: 'كلمات المرور غير متطابقة',
      passwordRequired: 'يرجى إدخال كلمة المرور',
      minLength: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      verifyingToken: 'جارٍ التحقق من الرابط…',
      invalidToken: 'الرابط غير صالح أو منتهي الصلاحية',
    },
    en: {
      headline: 'Bacura Technologies Partners',
      heroTitle: 'Your Investment Newsroom',
      heroSubtitle:
        'Track market sentiment, monitor Bakurah initiatives, and authenticate your access to the investor workspace.',
      formTitle: 'Sign In',
      formSubtitle:
        'Enter your secure credentials to unlock the investor operations console.',
      emailLabel: 'Email address',
      passwordLabel: 'Password',
      totpLabel: '2FA verification code',
      signIn: 'Sign in',
      signingIn: 'Signing in…',
      inviteCta: 'Submit a new investor signup request',
      noAccount: "Don't have an account?",
      forgotPassword: 'Forgot password?',
      resetPasswordTitle: 'Reset Password',
      resetPasswordSubtitle: 'Enter your email address and we\'ll send you a link to reset your password',
      resetPasswordButton: 'Send Reset Link',
      resetPasswordSending: 'Sending…',
      resetPasswordSuccess: 'Password reset link has been sent to your email',
      backToLogin: 'Back to Sign In',
      newPasswordLabel: 'New Password',
      confirmPasswordLabel: 'Confirm Password',
      updatePasswordButton: 'Update Password',
      updatingPassword: 'Updating…',
      passwordUpdated: 'Password updated successfully',
      passwordsNotMatch: 'Passwords do not match',
      passwordRequired: 'Please enter a password',
      minLength: 'Password must be at least 8 characters',
      verifyingToken: 'Verifying link…',
      invalidToken: 'Invalid or expired link',
    },
  } as const;

  const currentCopy = copy[language];

  // Check for password reset token in URL on mount
  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const email = searchParams.get('email');

    if (tokenHash && type === 'recovery') {
      setIsResettingPassword(true);
      setIsVerifyingToken(true);
      setResetEmail(email || '');

      const verifyResetToken = async () => {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          const errorMsg =
            language === 'ar'
              ? 'خطأ في إعدادات الاتصال. يرجى التحقق من إعدادات Supabase.'
              : 'Connection configuration error. Please check Supabase settings.';
          pushToast({
            variant: 'error',
            message: errorMsg,
          });
          setIsVerifyingToken(false);
          return;
        }

        try {
          const { data, error } = await supabase.auth.verifyOtp({
            email: email || undefined,
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (error || !data.session) {
            throw error || new Error('Verification failed');
          }

          await supabase.auth.setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          });

          setIsTokenVerified(true);
        } catch (error) {
          console.error('Password reset verification error:', error);
          pushToast({
            variant: 'error',
            message: currentCopy.invalidToken,
          });
        } finally {
          setIsVerifyingToken(false);
        }
      };

      verifyResetToken();
    }
  }, [searchParams, pushToast, currentCopy.invalidToken]);

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

      if (!('user' in response) || !response.user) {
        throw new Error(
          language === 'ar'
            ? 'استجابة تسجيل الدخول غير صالحة.'
            : 'Invalid login response received.'
        );
      }

      pushToast({
        variant: 'success',
        message:
          language === 'ar'
            ? 'تم تسجيل الدخول بنجاح، مرحباً بك من جديد!'
            : 'Signed in successfully. Welcome back!',
      });

      const isAdmin = response.user.role === 'admin';
      // After login, route admins to the admin dashboard and investors to the
      // investor home route. These paths are handled by the React Router app
      // mounted via the Next.js catch-all route in app/[...slug]/page.tsx.
      navigate(isAdmin ? '/admin' : '/home', { replace: true });
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

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!resetEmail.trim()) {
      pushToast({
        variant: 'error',
        message:
          language === 'ar'
            ? 'يرجى إدخال بريدك الإلكتروني'
            : 'Please enter your email address',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      pushToast({
        variant: 'error',
        message:
          language === 'ar'
            ? 'يرجى إدخال بريد إلكتروني صحيح'
            : 'Please enter a valid email address',
      });
      return;
    }

    try {
      await resetPasswordMutation.mutateAsync(resetEmail.trim());
      
      // Always show success message (for security, don't reveal if email exists)
      pushToast({
        variant: 'success',
        message:
          language === 'ar'
            ? 'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، سيتم إرسال رابط الاستعادة.'
            : 'If an account exists with this email, a password reset link has been sent.',
      });
      
      setShowResetPassword(false);
      setResetEmail('');
    } catch (error) {
      console.error('Password reset error:', error);
      
      // Show user-friendly error message
      let errorMessage: string;
      if (error instanceof Error) {
        if (error.message.includes('rate limit') || error.message.includes('too many')) {
          errorMessage =
            language === 'ar'
              ? 'تم إرسال طلبات كثيرة. يرجى الانتظار بضع دقائق قبل المحاولة مرة أخرى.'
              : 'Too many requests. Please wait a few minutes before trying again.';
        } else if (error.message.includes('Supabase client not available')) {
          errorMessage =
            language === 'ar'
              ? 'خطأ في الاتصال. يرجى التحقق من إعدادات الاتصال.'
              : 'Connection error. Please check your connection settings.';
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage =
          language === 'ar'
            ? 'فشل إرسال رابط الاستعادة. يرجى المحاولة مرة أخرى.'
            : 'Failed to send reset link. Please try again.';
      }

      pushToast({
        variant: 'error',
        message: errorMessage,
      });
    }
  };

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newPassword.trim()) {
      pushToast({
        variant: 'error',
        message: currentCopy.passwordRequired,
      });
      return;
    }

    if (newPassword.length < 8) {
      pushToast({
        variant: 'error',
        message: currentCopy.minLength,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      pushToast({
        variant: 'error',
        message: currentCopy.passwordsNotMatch,
      });
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync(newPassword);
      pushToast({
        variant: 'success',
        message: currentCopy.passwordUpdated,
      });
      
      // Clear URL params and reset state
      navigate('/login', { replace: true });
      setIsResettingPassword(false);
      setIsTokenVerified(false);
      setNewPassword('');
      setConfirmPassword('');
      setResetEmail('');
    } catch (error) {
      console.error('Update password error:', error);
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
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'grid',
          gap: '2rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          alignItems: 'stretch',
          direction,
        }}
      >
        <section
          style={{
            position: 'relative',
            borderRadius: '1.75rem',
            padding: '2rem 2.25rem',
            background: `linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(13, 35, 74, 0.35) 45%, rgba(8, 29, 66, 0.8) 100%)`,
            color: '#F8FAFC',
            boxShadow: '0 45px 90px rgba(8, 25, 58, 0.35)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                direction === 'rtl'
                  ? 'radial-gradient(120% 85% at 95% 15%, rgba(59,130,246,0.35), transparent), radial-gradient(120% 130% at 10% 90%, rgba(96,165,250,0.15), transparent)'
                  : 'radial-gradient(120% 85% at 5% 15%, rgba(59,130,246,0.35), transparent), radial-gradient(120% 130% at 90% 90%, rgba(96,165,250,0.15), transparent)',
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <Logo
              size={72}
              stacked
              tagline={
                language === 'ar'
                  ? 'استثمر بذكاء مع باكورة'
                  : 'Invest smarter with Bakurah'
              }
              logoUrl={companyLogoUrl}
              
            />
            <div>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: 'rgba(226, 232, 240, 0.75)',
                }}
              >
                {currentCopy.headline}
              </span>
              <h1
                style={{
                  margin: '0.75rem 0 0.5rem',
                  fontSize: '2rem',
                  lineHeight: 1.2,
                  fontWeight: 700,
                }}
              >
                {currentCopy.heroTitle}
              </h1>
              <p
                style={{
                  margin: 0,
                  color: 'rgba(226, 232, 240, 0.85)',
                  lineHeight: 1.6,
                  fontSize: '0.95rem',
                  maxWidth: '34rem',
                  marginBottom: '1.5rem',
                }}
              >
                {currentCopy.heroSubtitle}
              </p>
            </div>
            
            {/* Feature Icons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1rem',
                marginTop: '0.5rem',
              }}
            >
              {/* Security Icon */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'rgba(226, 232, 240, 0.9)' }}
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(226, 232, 240, 0.8)',
                    textAlign: 'center',
                  }}
                >
                  {language === 'ar' ? 'الأمان' : 'Security'}
                </span>
              </div>

              {/* Analytics Icon */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'rgba(226, 232, 240, 0.9)' }}
                >
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(226, 232, 240, 0.8)',
                    textAlign: 'center',
                  }}
                >
                  {language === 'ar' ? 'التحليلات' : 'Analytics'}
                </span>
              </div>

              {/* Network Icon */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  borderRadius: '1rem',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'rgba(226, 232, 240, 0.9)' }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'rgba(226, 232, 240, 0.8)',
                    textAlign: 'center',
                  }}
                >
                  {language === 'ar' ? 'الشبكة' : 'Network'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.75rem',
            boxShadow: '0 32px 70px rgba(15, 23, 42, 0.18)',
            padding: '2.75rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2.25rem',
          }}
        >
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
              {isResettingPassword && isTokenVerified
                ? currentCopy.resetPasswordTitle
                : showResetPassword
                  ? currentCopy.resetPasswordTitle
                  : currentCopy.formTitle}
            </h2>
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.7,
                fontSize: '0.98rem',
              }}
            >
              {isResettingPassword && isTokenVerified
                ? (language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password')
                : showResetPassword
                  ? currentCopy.resetPasswordSubtitle
                  : currentCopy.formSubtitle}
            </p>
          </header>

          {isResettingPassword && isTokenVerified ? (
            // Show password update form if token is verified
            <form
              onSubmit={handleUpdatePassword}
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
                <span style={{ fontWeight: 600 }}>{currentCopy.newPasswordLabel}</span>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  ? currentCopy.updatingPassword
                  : currentCopy.updatePasswordButton}
              </button>
            </form>
          ) : isResettingPassword && isVerifyingToken ? (
            // Show verifying message while checking token
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: '1rem',
              }}
            >
              {currentCopy.verifyingToken}
            </div>
          ) : isResettingPassword && !isTokenVerified ? (
            // Show error if token is invalid
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '0.95rem',
                background: palette.brandSecondarySoft,
                border: `1px solid ${palette.brandSecondary}`,
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, color: palette.textPrimary, marginBottom: '1rem' }}>
                {currentCopy.invalidToken}
              </p>
              <button
                type="button"
                onClick={() => {
                  navigate('/login', { replace: true });
                  setIsResettingPassword(false);
                  setResetEmail('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${palette.brandPrimaryStrong}`,
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {currentCopy.backToLogin}
              </button>
            </div>
          ) : showResetPassword ? (
            // Show email input form for requesting reset
            <form
              onSubmit={handleResetPassword}
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
                <span style={{ fontWeight: 600 }}>{currentCopy.emailLabel}</span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
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
              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                }}
              >
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    borderRadius: '1rem',
                    border: 'none',
                    background: palette.brandPrimaryStrong,
                    color: palette.textOnBrand,
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    cursor: resetPasswordMutation.isPending ? 'wait' : 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    boxShadow: '0 22px 40px rgba(44, 116, 204, 0.25)',
                  }}
                >
                  {resetPasswordMutation.isPending
                    ? currentCopy.resetPasswordSending
                    : currentCopy.resetPasswordButton}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setResetEmail('');
                  }}
                  style={{
                    padding: '1rem 1.5rem',
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorder}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    cursor: 'pointer',
                  }}
                >
                  {currentCopy.backToLogin}
                </button>
              </div>
            </form>
          ) : (
            // Show normal login form
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
              <span style={{ fontWeight: 600 }}>{currentCopy.emailLabel}</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={handleChange('email')}
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
              <span style={{ fontWeight: 600 }}>
                {currentCopy.passwordLabel}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange('password')}
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
                {!showResetPassword && !isResettingPassword && (
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    style={{
                      alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-end',
                      background: 'none',
                      border: 'none',
                      color: palette.brandPrimaryStrong,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '0.25rem 0',
                      textDecoration: 'none',
                    }}
                  >
                    {currentCopy.forgotPassword}
                  </button>
                )}
              </div>
            </label>

            {requires2FA ? (
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.55rem',
                  color: palette.textPrimary,
                }}
              >
                <span style={{ fontWeight: 600 }}>{currentCopy.totpLabel}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  maxLength={6}
                  value={form.totpToken}
                  onChange={handleChange('totpToken')}
                  style={{
                    padding: '0.95rem 1rem',
                    borderRadius: '0.95rem',
                    border: `1px solid ${palette.brandSecondarySoft}`,
                    fontSize: '1.05rem',
                    outline: 'none',
                    letterSpacing: '0.4rem',
                    textAlign: 'center',
                    background: palette.backgroundBase,
                    boxShadow: '0 8px 18px rgba(59, 130, 246, 0.15)',
                  }}
                />
              </label>
            ) : null}

            <button
                type="submit"
                disabled={loginMutation.isPending}
                style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  borderRadius: '1rem',
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  cursor: loginMutation.isPending ? 'wait' : 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 22px 40px rgba(44, 116, 204, 0.25)',
                }}
              >
                {loginMutation.isPending
                  ? currentCopy.signingIn
                  : currentCopy.signIn}
              </button>
            </form>
          )}

          <ul
              style={{
                margin: '0.25rem 0 0',
                paddingInlineStart: direction === 'rtl' ? '1.2rem' : '1.4rem',
                color: palette.textSecondary,
                fontSize: '0.85rem',
                lineHeight: 1.6,
                display: 'grid',
                gap: '0.35rem',
              }}
            >
              <li>
                {language === 'ar'
                  ? 'مصادقة متعددة العوامل مع رموز مؤقتة لمدة 60 ثانية.'
                  : 'Multi-factor auth with rolling 60-second TOTP codes.'}
              </li>
              <li>
                {language === 'ar'
                  ? 'حماية RLS على مستوى البيانات لضمان خصوصية المحافظ.'
                  : 'Row-level security keeps portfolios isolated per investor.'}
              </li>
              <li>
                {language === 'ar'
                  ? 'يتم مراقبة التسجيلات والتحذيرات عبر لوحة العمليات.'
                  : 'Session events and alerts monitored by the ops desk.'}
              </li>
            </ul>

          <footer
            style={{
              textAlign: 'center',
              color: palette.textSecondary,
              fontSize: '0.95rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <p style={{ margin: 0 }}>
              {currentCopy.noAccount}{' '}
              <Link
                href="/register"
                style={{
                  color: palette.brandPrimaryStrong,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {currentCopy.inviteCta}
              </Link>
            </p>
            <span style={{ fontSize: '0.82rem', color: palette.textMuted }}>
              {language === 'ar'
                ? 'محمي عبر المصادقة متعددة العوامل و RLS على مستوى الصفوف.'
                : 'Secured with multi-factor authentication and row-level security.'}
            </span>
          </footer>
        </section>
      </div>
    </div>
  );
}

// Default export used only for legacy Next.js pages directory validation.
// We export a simple stub that does not rely on React Router, React Query, or
// any browser-only APIs so that static generation in Netlify succeeds.
export default function LoginPageStub() {
  return null;
}

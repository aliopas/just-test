import React, { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { palette, radius, typography } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useUpdatePassword } from '../hooks/useUpdatePassword';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

export function NewPasswordPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const router = useRouter();
  const updatePasswordMutation = useUpdatePassword();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // دالة لقراءة معاملات URL
  function getUrlParams() {
    if (typeof window === 'undefined') return {};
    
    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // قراءة من query string
    urlParams.forEach((value, key) => {
      params[key] = value;
    });
    
    // قراءة من hash (Supabase قد يضع المعاملات في hash)
    hashParams.forEach((value, key) => {
      params[key] = value;
    });
    
    return params;
  }

  // التحقق من معاملات الخطأ في URL أولاً
  useEffect(() => {
    const params = getUrlParams();
    const urlError = params.error;
    const errorCode = params.error_code;
    const errorDescription = params.error_description;

    if (urlError || errorCode) {
      let errorMessage = '';
      
      if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
        errorMessage = isArabic
          ? 'رابط إعادة التعيين منتهي الصلاحية. يرجى طلب رابط جديد.'
          : 'Reset link has expired. Please request a new link.';
      } else if (errorCode === 'access_denied' || urlError === 'access_denied') {
        errorMessage = isArabic
          ? 'رابط إعادة التعيين غير صالح. يرجى طلب رابط جديد.'
          : 'Reset link is invalid. Please request a new link.';
      } else if (errorDescription) {
        // Decode URL-encoded error description
        const decodedDescription = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
        errorMessage = isArabic
          ? `رابط إعادة التعيين غير صالح: ${decodedDescription}`
          : `Reset link error: ${decodedDescription}`;
      } else {
        errorMessage = isArabic
          ? 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.'
          : 'Reset link is invalid or expired. Please request a new link.';
      }

      setError(errorMessage);
      setTokenValid(false);
      setIsValidatingToken(false);
      
      // تنظيف URL من معاملات الخطأ
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      return;
    }

    // التحقق من صحة token عند تحميل الصفحة
    async function validateToken() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError(isArabic ? 'Supabase client غير متاح.' : 'Supabase client not available.');
        setIsValidatingToken(false);
        return;
      }

      try {
        // التحقق من وجود session نشط (من رابط إعادة التعيين)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          setError(
            isArabic
              ? 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.'
              : 'Reset link is invalid or expired. Please request a new link.'
          );
          setTokenValid(false);
        } else {
          setTokenValid(true);
        }
      } catch (err) {
        console.error('[NewPassword] Error validating token:', err);
        setError(
          isArabic
            ? 'حدث خطأ أثناء التحقق من الرابط. يرجى المحاولة مرة أخرى.'
            : 'Error validating reset link. Please try again.'
        );
        setTokenValid(false);
      } finally {
        setIsValidatingToken(false);
      }
    }

    validateToken();
  }, [isArabic]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    // التحقق من الحقول
    if (!password || !confirmPassword) {
      setError(
        isArabic
          ? 'الرجاء إدخال كلمة المرور وتأكيدها.'
          : 'Please enter and confirm your password.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        isArabic
          ? 'كلمات المرور غير متطابقة.'
          : 'Passwords do not match.'
      );
      return;
    }

    if (password.length < 8) {
      setError(
        isArabic
          ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'
          : 'Password must be at least 8 characters.'
      );
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        password,
        confirmPassword,
      });
    } catch (err: any) {
      console.error('[NewPassword] Error:', err);
      
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError(
          isArabic
            ? 'حدث خطأ أثناء تحديث كلمة المرور. حاول مرة أخرى.'
            : 'An error occurred while updating password. Please try again.'
        );
      }
    }
  }

  if (isValidatingToken) {
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
        }}
      >
        <div
          style={{
            textAlign: 'center',
            color: palette.textOnBrand,
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 1rem',
              border: `4px solid rgba(255, 255, 255, 0.3)`,
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <p style={{ margin: 0 }}>
            {isArabic ? 'جاري التحقق من الرابط...' : 'Validating reset link...'}
          </p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
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
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: palette.backgroundBase,
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            padding: '3rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              background: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
              <path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2
            style={{
              margin: 0,
              marginBottom: '1rem',
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {isArabic ? 'رابط غير صالح' : 'Invalid Link'}
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: '1.5rem',
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {error || (isArabic
              ? 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية.'
              : 'The reset link is invalid or has expired.')}
          </p>
          <button
            onClick={() => router.push('/forgot-password')}
            style={{
              padding: '0.875rem 1.5rem',
              borderRadius: radius.md,
              border: 'none',
              background: `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`,
              color: palette.textOnBrand,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              cursor: 'pointer',
            }}
          >
            {isArabic ? 'طلب رابط جديد' : 'Request new link'}
          </button>
        </div>
      </div>
    );
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
      {/* Decorative background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)
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
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          padding: '3rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
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
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 6V12L16 14"
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
            }}
          >
            {isArabic ? 'كلمة مرور جديدة' : 'New Password'}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {isArabic
              ? 'أدخل كلمة المرور الجديدة'
              : 'Enter your new password'}
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
            }}
          >
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
              htmlFor="password"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
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
              value={password}
              onChange={event => setPassword(event.target.value)}
              required
              disabled={updatePasswordMutation.isPending}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              htmlFor="confirmPassword"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
            </label>
            <input
              id="confirmPassword"
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
              value={confirmPassword}
              onChange={event => setConfirmPassword(event.target.value)}
              required
              disabled={updatePasswordMutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={updatePasswordMutation.isPending}
            style={{
              marginTop: '0.5rem',
              padding: '0.875rem 1.5rem',
              borderRadius: radius.md,
              border: 'none',
              background: updatePasswordMutation.isPending
                ? palette.neutralBorder
                : `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`,
              color: palette.textOnBrand,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              cursor: updatePasswordMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: updatePasswordMutation.isPending ? 0.7 : 1,
            }}
          >
            {updatePasswordMutation.isPending
              ? isArabic
                ? 'جاري التحديث...'
                : 'Updating...'
              : isArabic
                ? 'تحديث كلمة المرور'
                : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}


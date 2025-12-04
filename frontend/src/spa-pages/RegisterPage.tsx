import React, { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import { useRegister } from '../hooks/useRegister';
import { ApiError } from '../utils/api-client';

export function RegisterPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const router = useRouter();
  const registerMutation = useRegister();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic client-side validation
    if (!email || !email.trim()) {
      setError(isArabic ? 'البريد الإلكتروني مطلوب' : 'Email is required');
      return;
    }

    if (!fullName || fullName.trim().length < 3) {
      setError(
        isArabic
          ? 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل'
          : 'Full name must be at least 3 characters'
      );
      return;
    }

    try {
      const payload = {
        email: email.trim(),
        fullName: fullName.trim(),
        phone: phone?.trim() || undefined,
        company: company?.trim() || undefined,
        message: message?.trim() || undefined,
        language: (isArabic ? 'ar' : 'en') as 'ar' | 'en',
      };

      console.log('[RegisterPage] Submitting request:', {
        email: payload.email,
        fullName: payload.fullName,
        hasPhone: !!payload.phone,
        hasCompany: !!payload.company,
        hasMessage: !!payload.message,
      });

      const response = await registerMutation.mutateAsync(payload);

      console.log('[RegisterPage] Request submitted successfully:', response);

      setSuccess(
        isArabic
          ? 'تم استقبال طلب إنشاء حسابك بنجاح. سيقوم فريق باكورة بمراجعته والتواصل معك.'
          : 'Your investor signup request has been received. The Bacura team will review it and contact you.'
      );

      // Reset form after successful submission
      setFullName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setMessage('');

      // يمكن لاحقاً التوجيه لصفحة مخصصة لتأكيد الطلب
      // router.push('/thanks'); مثلاً
    } catch (err) {
      console.error('[RegisterPage] Error submitting request:', err);

      if (err instanceof ApiError) {
        let errorMessage = err.message;

        // Extract validation errors if available
        if (err.payload && typeof err.payload === 'object') {
          const payload = err.payload as Record<string, unknown>;
          if (payload.error && typeof payload.error === 'object') {
            const errorObj = payload.error as Record<string, unknown>;
            if (errorObj.details && Array.isArray(errorObj.details)) {
              const details = errorObj.details as Array<{ field: string; message: string }>;
              if (details.length > 0) {
                errorMessage = details.map(d => d.message).join(', ');
              }
            } else if (errorObj.message && typeof errorObj.message === 'string') {
              errorMessage = errorObj.message;
            }
          }
        }

        setError(
          isArabic
            ? errorMessage || 'تعذّر إرسال الطلب. حاول مرة أخرى.'
            : errorMessage || 'Unable to submit your request. Please try again.'
        );
      } else if (err instanceof Error) {
        setError(
          isArabic
            ? err.message || 'حدث خطأ أثناء إرسال الطلب.'
            : err.message || 'Something went wrong.'
        );
      } else {
        setError(
          isArabic
            ? 'حدث خطأ غير متوقع. حاول مرة أخرى.'
            : 'An unexpected error occurred.'
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
          maxWidth: 480,
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
          {isArabic ? 'طلب إنشاء حساب مستثمر' : 'Investor signup request'}
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
            ? 'ادخل بياناتك الأساسية لإرسال طلب إنشاء حساب مستثمر ليتم مراجعته من قبل إدارة باكورة.'
            : 'Enter your details to submit an investor signup request for review by the Bacura team.'}
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

        {success && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.75rem 0.9rem',
              borderRadius: radius.md,
              background: '#ECFDF3',
              color: palette.success,
              fontSize: typography.sizes.caption,
            }}
          >
            {success}
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
              htmlFor="name"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.medium,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'الاسم الكامل' : 'Full name'}
            </label>
            <input
              id="name"
              type="text"
              placeholder={isArabic ? 'الاسم كما في الهوية' : 'Your full name'}
              style={{
                padding: '0.7rem 0.85rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: typography.sizes.body,
                outline: 'none',
              }}
              value={fullName}
              onChange={event => setFullName(event.target.value)}
              required
            />
          </div>

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
              placeholder="name@company.com"
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
              htmlFor="phone"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.medium,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'رقم الجوال (اختياري)' : 'Phone number (optional)'}
            </label>
            <input
              id="phone"
              type="tel"
              placeholder={isArabic ? '05XXXXXXXX' : '+9665XXXXXXX'}
              style={{
                padding: '0.7rem 0.85rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: typography.sizes.body,
                outline: 'none',
              }}
              value={phone}
              onChange={event => setPhone(event.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              htmlFor="company"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.medium,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'اسم الجهة / الشركة (اختياري)' : 'Company / entity (optional)'}
            </label>
            <input
              id="company"
              type="text"
              placeholder={isArabic ? 'اسم الجهة الاستثمارية' : 'Your company or entity name'}
              style={{
                padding: '0.7rem 0.85rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: typography.sizes.body,
                outline: 'none',
              }}
              value={company}
              onChange={event => setCompany(event.target.value)}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              htmlFor="message"
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.medium,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'ملاحظات أو رسالة (اختياري)' : 'Notes or message (optional)'}
            </label>
            <textarea
              id="message"
              rows={3}
              placeholder={
                isArabic
                  ? 'اذكر بإيجاز نوع الاستثمار أو الاهتمام الرئيسي.'
                  : 'Briefly describe the type of investment or your main interest.'
              }
              style={{
                padding: '0.7rem 0.85rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: typography.sizes.body,
                outline: 'none',
                resize: 'vertical',
              }}
              value={message}
              onChange={event => setMessage(event.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            style={{
              marginTop: '0.5rem',
              padding: '0.85rem 1rem',
              borderRadius: radius.md,
              border: 'none',
              background: registerMutation.isPending
                ? palette.neutralBorder
                : palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              cursor: registerMutation.isPending ? 'not-allowed' : 'pointer',
              opacity: registerMutation.isPending ? 0.7 : 1,
            }}
          >
            {registerMutation.isPending
              ? isArabic
                ? 'جاري إرسال الطلب...'
                : 'Submitting request...'
              : isArabic
                ? 'إرسال طلب إنشاء حساب'
                : 'Submit signup request'}
          </button>
        </form>

        <p
          style={{
            marginTop: '1.25rem',
            fontSize: typography.sizes.caption,
            color: palette.textMuted,
          }}
        >
          {isArabic ? 'لديك حساب بالفعل؟ ' : 'Already have an account? '}
          <a
            href="/login"
            style={{
              color: palette.brandPrimary,
              textDecoration: 'none',
              fontWeight: typography.weights.medium,
            }}
          >
            {isArabic ? 'تسجيل الدخول' : 'Sign in'}
          </a>
        </p>
      </div>
    </div>
  );
}


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

    // Validate required fields
    if (!email || !fullName) {
      setError(
        isArabic
          ? 'الرجاء إدخال البريد الإلكتروني والاسم الكامل.'
          : 'Please enter your email and full name.'
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

      console.log('[Register] Submitting request:', { email: payload.email, fullName: payload.fullName });

      const response = await registerMutation.mutateAsync(payload);

      console.log('[Register] Request successful:', response);

      setSuccess(
        isArabic
          ? 'تم استقبال طلب إنشاء حسابك بنجاح. سيقوم فريق باكورة بمراجعته والتواصل معك.'
          : 'Your investor signup request has been received. The Bacura team will review it and contact you.'
      );

      // Reset form after success
      setFullName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setMessage('');

      // يمكن لاحقاً التوجيه لصفحة مخصصة لتأكيد الطلب
      // router.push('/thanks'); مثلاً
    } catch (err) {
      console.error('[Register] Error occurred:', err);
      
      if (err instanceof ApiError) {
        let errorMessage = err.message;
        
        // Provide user-friendly messages based on error status
        if (err.status >= 500) {
          errorMessage = isArabic
            ? 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'
            : 'A server error occurred. Please try again later.';
        } else if (err.status === 409) {
          errorMessage = isArabic
            ? 'يوجد طلب قيد المراجعة لهذا البريد الإلكتروني أو حساب موجود بالفعل.'
            : 'A request is already pending for this email or an account already exists.';
        } else if (err.status === 400) {
          errorMessage = isArabic
            ? 'الرجاء التحقق من البيانات المدخلة وإعادة المحاولة.'
            : 'Please check your input and try again.';
        }
        
        setError(errorMessage);
      } else if (err instanceof Error) {
        setError(
          isArabic
            ? err.message || 'تعذّر إرسال الطلب. حاول مرة أخرى.'
            : err.message || 'Unable to submit your request. Please try again.'
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


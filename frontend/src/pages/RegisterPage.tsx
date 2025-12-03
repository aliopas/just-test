import { ChangeEvent, FormEvent, useState } from 'react';
import Link from 'next/link';
import { useNextNavigate } from '../utils/next-router';
import { useRegister } from '../hooks/useRegister';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useCompanyLogoUrl } from '../hooks/usePublicContent';
import { ApiError } from '../utils/api-client';

type RegisterFormState = {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  language: 'ar' | 'en';
};

export function RegisterPage() {
  const { language } = useLanguage();
  const navigate = useNextNavigate();
  const { pushToast } = useToast();
  const companyLogoUrl = useCompanyLogoUrl();
  const registerMutation = useRegister();
  const [form, setForm] = useState<RegisterFormState>({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    language,
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const handleChange =
    (field: keyof RegisterFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm(current => ({
        ...current,
        [field]: value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await registerMutation.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        company: form.company?.trim() || undefined,
        message: form.message?.trim() || undefined,
        language: form.language,
      });

      pushToast({
        variant: 'success',
        message:
          response?.message ??
          (language === 'ar'
            ? 'تم استلام طلب إنشاء الحساب وسيتم التواصل معك بعد المراجعة.'
            : 'Your account request has been submitted and will be reviewed shortly.'),
      });
      navigate('/', { replace: true });
    } catch (error) {
      let message: string;
      if (error instanceof ApiError) {
        message =
          error.message ||
          (language === 'ar'
            ? 'تعذّر إرسال الطلب. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
            : 'Failed to submit the request. Please review your details and try again.');
      } else {
        message =
          language === 'ar'
            ? 'تعذّر إرسال الطلب. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
            : 'Failed to submit the request. Please review your details and try again.';
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
          <Logo size={64} stacked logoUrl={companyLogoUrl} />
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '2rem',
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'طلب إنشاء حساب مستثمر' : 'Request an investor account'}
            </h1>
            <p
              style={{
                marginTop: '0.5rem',
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {language === 'ar'
                ? 'أرسل بياناتك للتسجيل كمستثمر، وسيقوم فريق الإدارة بمراجعة الطلب وإرسال تعليمات الدخول إذا تمت الموافقة.'
                : 'Share your details to request an investor account. The admin team will review your request and contact you with next steps upon approval.'}
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
              {language === 'ar' ? 'الاسم الكامل' : 'Full name'}
            </span>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={handleChange('fullName')}
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorder}`,
                fontSize: '1rem',
                outline: 'none',
              }}
              placeholder={language === 'ar' ? 'الاسم كما هو في وثائقك الرسمية' : 'Your full legal name'}
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

        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            color: palette.textPrimary,
          }}
        >
          <span style={{ fontWeight: 600 }}>
            {language === 'ar' ? 'اللغة المفضلة' : 'Preferred language'}
          </span>
          <select
            value={form.language}
            onChange={handleChange('language')}
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '0.85rem',
              border: `1px solid ${palette.neutralBorder}`,
              fontSize: '1rem',
              outline: 'none',
              backgroundColor: '#fff',
            }}
          >
            <option value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</option>
            <option value="en">{language === 'ar' ? 'الإنجليزية' : 'English'}</option>
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
          <span style={{ fontWeight: 600 }}>
            {language === 'ar' ? 'الجهة أو الشركة (اختياري)' : 'Organisation or company (optional)'}
          </span>
          <input
            type="text"
            value={form.company}
            onChange={handleChange('company')}
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '0.85rem',
              border: `1px solid ${palette.neutralBorder}`,
              fontSize: '1rem',
              outline: 'none',
            }}
            placeholder={
              language === 'ar'
                ? 'اسم الشركة أو الجهة الاستثمارية'
                : 'Company or organisation name'
            }
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
            {language === 'ar'
              ? 'نبذة عن أهدافك الاستثمارية (اختياري)'
              : 'Tell us about your investment goals (optional)'}
          </span>
          <textarea
            value={form.message}
            onChange={handleChange('message')}
            rows={4}
            style={{
              padding: '0.9rem 1rem',
              borderRadius: '0.85rem',
              border: `1px solid ${palette.neutralBorder}`,
              fontSize: '1rem',
              outline: 'none',
              resize: 'vertical',
              minHeight: '6rem',
            }}
            placeholder={
              language === 'ar'
                ? 'شارك أي تفاصيل تود أن يعرفها فريق الدعم قبل إنشاء الحساب.'
                : 'Share any details you would like the admin team to know.'
            }
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
              ? 'جارٍ إرسال الطلب…'
              : 'Submitting request…'
            : language === 'ar'
              ? 'إرسال الطلب'
              : 'Submit request'}
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
            href="/login"
            style={{
              color: palette.brandPrimaryStrong,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
          {language === 'ar' ? 'سجّل الدخول' : 'Sign in'}
          </Link>
        </p>
      </div>
    </div>
  );
}

// Default export used only for legacy Next.js pages directory validation.
// We export a simple stub that does not rely on React Router, React Query, or
// any browser-only APIs so that static generation in Netlify succeeds.
export default function RegisterPageStub() {
  return null;
}

// Prevent static generation - this page uses client-side hooks and state
// In Pages Router, we need to use getServerSideProps instead of export const dynamic
export async function getServerSideProps() {
  return {
    props: {},
  };
}

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { ApiError } from '../utils/api-client';

type LoginFormState = {
  email: string;
  password: string;
  totpToken?: string;
};

export function LoginPage() {
  const { language } = useLanguage();
  const { pushToast } = useToast();
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const [requires2FA, setRequires2FA] = useState(false);
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    totpToken: '',
  });

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const copy = {
    ar: {
      headline: 'بوابة المستثمرين',
      heroTitle: 'مرحباً بك في مركز أخبار باكورة',
      heroSubtitle:
        'تابع آخر المستجدات الاستثمارية، تقارير السوق، والمصادقة على الصفقات قبل الانضمام إلى منصتك.',
      highlightsTitle: 'مختارات اليوم',
      snapshotTitle: 'نظرة على السوق',
      snapshotItems: [
        { label: 'مؤشر تاسي', value: '+1.3%' },
        { label: 'قطاع التقنية', value: '+2.1%' },
        { label: 'صفقات جارية', value: '17' },
      ],
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
      quickLinks: ['الملف الاستثماري', 'التقارير التفاعلية', 'مركز التنبيهات'],
    },
    en: {
      headline: 'Investors Portal',
      heroTitle: 'Your Investment Newsroom',
      heroSubtitle:
        'Track market sentiment, monitor Bakurah initiatives, and authenticate your access to the investor workspace.',
      highlightsTitle: 'Today’s Highlights',
      snapshotTitle: 'Market Snapshot',
      snapshotItems: [
        { label: 'TASI Index', value: '+1.3%' },
        { label: 'Tech Sector', value: '+2.1%' },
        { label: 'Active Deals', value: '17' },
      ],
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
      quickLinks: ['Investor Profile', 'Interactive Reports', 'Alert Center'],
    },
  } as const;

  const headlineStories = {
    ar: [
      {
        title: 'مذكرة تفاهم مع صندوق نمو واعد',
        summary: 'فرص استثمار مشتركة في التقنية المالية والأسواق الناشئة.',
      },
      {
        title: 'تقرير الربع الثالث',
        summary: 'أداء المحافظ الاستثمارية يتفوق على المؤشر بـ 2.4٪.',
      },
      {
        title: 'نشرة المخاطر',
        summary: 'توجيهات للحد من مكامن التذبذب في رأس المال الجريء.',
      },
    ],
    en: [
      {
        title: 'Strategic MoU with Prominent Growth Fund',
        summary: 'Co-investment pipeline expands across fintech and emerging markets.',
      },
      {
        title: 'Q3 Performance Brief',
        summary: 'Managed portfolios outperformed the market benchmark by 2.4%.',
      },
      {
        title: 'Risk Advisory Bulletin',
        summary: 'Guidance to navigate volatility across venture allocations.',
      },
    ],
  } as const;

  const currentCopy = copy[language];
  const stories = headlineStories[language];
  const marketMood = {
    ar: ['إيجابي', 'محايد', 'حذر'],
    en: ['Bullish', 'Neutral', 'Cautious'],
  } as const;
  const tickerItems = {
    ar: [
      'تقارير الربع الرابع تصدر الأسبوع القادم',
      'سياسات هيئة السوق الجديدة تدخل حيّز التنفيذ',
      'انتهاء فترة الاكتتاب العام لفرصة التقنية المتقدمة',
    ],
    en: [
      'Q4 reports scheduled for release next week',
      'CMA introduces updated listing guidelines',
      'Subscription window closing for Advanced Tech opportunity',
    ],
  } as const;

  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [headlineIndex, setHeadlineIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const rotator = window.setInterval(() => {
      setHeadlineIndex(prev => (prev + 1) % stories.length);
    }, 8_000);
    return () => window.clearInterval(rotator);
  }, [stories.length]);

  useEffect(() => {
    setHeadlineIndex(0);
  }, [language]);

  const currentHeadline = stories[headlineIndex];
  const ticker = tickerItems[language];

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
      navigate(isAdmin ? '/admin' : '/', { replace: true });
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
            padding: '2.75rem',
            background: `linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(13, 35, 74, 0.35) 45%, rgba(8, 29, 66, 0.8) 100%)`,
            color: '#F8FAFC',
            boxShadow: '0 45px 90px rgba(8, 25, 58, 0.35)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
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
              gap: '1.5rem',
            }}
          >
            <Logo
              size={88}
              stacked
              tagline={
                language === 'ar'
                  ? 'استثمر بذكاء مع باكورة'
                  : 'Invest smarter with Bakurah'
              }
            />
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: '0.85rem',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  fontSize: '0.92rem',
                  color: 'rgba(226, 232, 240, 0.85)',
                }}
              >
                <span
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '999px',
                    background: 'rgba(15, 118, 237, 0.25)',
                    border: '1px solid rgba(148, 197, 253, 0.3)',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {language === 'ar' ? 'تحديث مباشر' : 'Live Update'}
                </span>
                <span>
                  {currentTime.toLocaleString(
                    language === 'ar' ? 'ar-SA' : 'en-US',
                    {
                      weekday: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    }
                  )}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.9rem',
                  color: 'rgba(226, 232, 240, 0.8)',
                }}
              >
                <span
                  style={{
                    width: '0.65rem',
                    height: '0.65rem',
                    borderRadius: '999px',
                    background: '#34D399',
                    boxShadow: '0 0 12px rgba(52, 211, 153, 0.5)',
                  }}
                />
                <span>{marketMood[language][headlineIndex % marketMood[language].length]}</span>
              </div>
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.85rem',
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
                  margin: '1rem 0 0.35rem',
                  fontSize: '2.45rem',
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
                  lineHeight: 1.7,
                  fontSize: '1.05rem',
                  maxWidth: '34rem',
                }}
              >
                {currentCopy.heroSubtitle}
              </p>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'grid',
              gap: '1.4rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            }}
          >
            <div
              style={{
                background: 'rgba(15, 118, 237, 0.15)',
                border: '1px solid rgba(148, 197, 253, 0.3)',
                borderRadius: '1.25rem',
                padding: '1.35rem',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <strong style={{ fontSize: '1.05rem', letterSpacing: '0.06em' }}>
                {currentCopy.snapshotTitle}
              </strong>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  color: 'rgba(226, 232, 240, 0.85)',
                  fontSize: '0.95rem',
                }}
              >
                {currentCopy.snapshotItems.map(item => (
                  <li
                    key={item.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '0.75rem',
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontWeight: 600, color: '#F8FAFC' }}>
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                background: 'rgba(15, 23, 42, 0.55)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '1.25rem',
                padding: '1.35rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backdropFilter: 'blur(4px)',
              }}
            >
              <strong style={{ fontSize: '1.05rem', letterSpacing: '0.05em' }}>
                {currentCopy.highlightsTitle}
              </strong>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.9rem',
                }}
              >
                {stories.map(item => (
                  <div
                    key={item.title}
                    style={{
                      padding: '0.1rem 0 0.35rem',
                      borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#F8FAFC',
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        margin: '0.35rem 0 0',
                        fontSize: '0.88rem',
                        color: 'rgba(226, 232, 240, 0.65)',
                        lineHeight: 1.55,
                      }}
                    >
                      {item.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                background: 'rgba(8, 16, 35, 0.65)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                borderRadius: '1.25rem',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backdropFilter: 'blur(6px)',
              }}
            >
              <strong style={{ fontSize: '1.02rem', letterSpacing: '0.05em' }}>
                {language === 'ar' ? 'زاوية التحليل' : 'Analyst Corner'}
              </strong>
              <p
                style={{
                  margin: 0,
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  color: 'rgba(226, 232, 240, 0.75)',
                }}
              >
                {language === 'ar'
                  ? currentHeadline.summary
                  : currentHeadline.summary}
              </p>
              <span
                style={{
                  fontSize: '0.82rem',
                  color: 'rgba(148, 197, 253, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                }}
              >
                {language === 'ar' ? 'مميّز الآن' : 'Spotlight'}
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: '#F8FAFC',
                }}
              >
                {currentHeadline.title}
              </h3>
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              color: 'rgba(226, 232, 240, 0.75)',
              fontSize: '0.9rem',
            }}
          >
            {currentCopy.quickLinks.map(label => (
              <span
                key={label}
                style={{
                  padding: '0.35rem 0.9rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(148, 197, 253, 0.25)',
                  background: 'rgba(148, 197, 253, 0.08)',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {label}
              </span>
            ))}
          </div>
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              marginTop: 'auto',
              borderRadius: '1.1rem',
              padding: '1rem 1.35rem',
              background: 'rgba(6, 16, 40, 0.6)',
              border: '1px solid rgba(148, 197, 253, 0.25)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '2rem',
                whiteSpace: 'nowrap',
                animation: 'news-marquee 28s linear infinite',
                animationDirection: direction === 'rtl' ? 'reverse' : 'normal',
                fontSize: '0.88rem',
                color: 'rgba(226, 232, 240, 0.82)',
              }}
            >
              {[...ticker, ...ticker].map((item, idx) => (
                <span key={`${item}-${idx}`}>{item}</span>
              ))}
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
              {currentCopy.formTitle}
            </h2>
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.7,
                fontSize: '0.98rem',
              }}
            >
              {currentCopy.formSubtitle}
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
          </form>

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
                to="/register"
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
                ? 'محمي عبر المصادقة متعددة العوامل وRLS على مستوى الصفوف.'
                : 'Secured with multi-factor authentication and row-level security.'}
            </span>
          </footer>
        </section>
      </div>
      <style>
        {`
          @keyframes news-marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
}


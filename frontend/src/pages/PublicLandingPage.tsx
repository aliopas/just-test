import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useInvestorNewsList } from '../hooks/useInvestorNews';
import { resolveCoverUrl } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';

const heroSectionStyle: React.CSSProperties = {
  padding: '4rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  textAlign: 'center',
  background: `linear-gradient(135deg, ${palette.brandSecondarySoft}, ${palette.backgroundSurface})`,
};

const sectionStyle: React.CSSProperties = {
  padding: '3rem 2rem',
  maxWidth: '960px',
  margin: '0 auto',
  display: 'grid',
  gap: '1.5rem',
};

const featureCardStyle: React.CSSProperties = {
  padding: '1.75rem',
  borderRadius: '1rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundSurface,
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
};

const navLinkStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: palette.textSecondary,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};

const highlightCardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '1.25rem',
  background: palette.backgroundSurface,
  border: `1px solid ${palette.neutralBorderSoft}`,
  boxShadow: '0 8px 20px rgba(4, 44, 84, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const timelineCardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '1.25rem',
  border: `1px solid ${palette.neutralBorder}`,
  background: palette.backgroundSurface,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const testimonialCardStyle: React.CSSProperties = {
  padding: '2rem',
  borderRadius: '1.5rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundSurface,
  boxShadow: '0 10px 30px rgba(3, 20, 45, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};


export function PublicLandingPage() {
  const { language, setLanguage } = useLanguage();
  const isArabic = language === 'ar';
  const {
    data: newsResponse,
    isLoading: isNewsLoading,
    isError: isNewsError,
    isFetching: isNewsFetching,
  } = useInvestorNewsList({ page: 1, limit: 3 });
  const newsItems = useMemo(() => newsResponse?.news ?? [], [newsResponse]);

  const heroTitle = isArabic
    ? 'منصة باكورة للتقنيات'
    : 'Bakurah Technologies Platform';

  const heroSubtitle = isArabic
    ? 'بوابة ذكية لربط المستثمرين بالفرص النوعية في التقنيات الناشئة.'
    : 'A smart gateway connecting investors with high-potential technology ventures.';

  const ctaLabel = isArabic ? 'تسجيل الدخول إلى البوابة' : 'Sign in to the portal';

  const featureTitle = isArabic ? 'لماذا باكورة؟' : 'Why Bakurah?';

  const features = isArabic
    ? [
        {
          title: 'شبكة استثمارية موثوقة',
          description:
            'نربطك بقادة التقنيات الناشئة عبر شبكة من الخبراء والمستثمرين المعتمدين.',
        },
        {
          title: 'تحليلات وتقارير عميقة',
          description:
            'حزم معلوماتية دقيقة تساعدك على اتخاذ قرارات استثمارية أكثر ثقة.',
        },
        {
          title: 'رحلة استثمار متكاملة',
          description:
            'من التعرف على الفرص إلى إغلاق الصفقة، ندعمك بأدوات ذكية ومسار واضح.',
        },
      ]
    : [
        {
          title: 'Curated investment network',
          description:
            'Connect with vetted founders, sector experts, and co-investors aligned with your thesis.',
        },
        {
          title: 'Insight-rich analytics',
          description:
            'Get data-driven reports that help you evaluate opportunities with confidence.',
        },
        {
          title: 'End-to-end investor journey',
          description:
            'Streamlined workflows that guide you from discovery to deal completion.',
        },
      ];

  const navLinks = [
    {
      id: 'capabilities',
      label: isArabic ? 'قدرات المنصة' : 'Platform capabilities',
    },
    {
      id: 'journey',
      label: isArabic ? 'رحلة المستثمر' : 'Investor journey',
    },
    {
      id: 'newsroom',
      label: isArabic ? 'الأخبار' : 'Newsroom',
    },
    {
      id: 'testimonials',
      label: isArabic ? 'ثقة المجتمع' : 'Proof points',
    },
  ];

  const heroHighlights = isArabic
    ? [
        {
          value: '220+',
          label: 'فرص تم تمحيصها',
          helper: 'تم اختيارها خلال الـ 12 شهر الماضية',
        },
        {
          value: '48 ساعة',
          label: 'لإطلاق التقييم',
          helper: 'متوسط زمن تجهيز تقارير الفرص',
        },
        {
          value: '92%',
          label: 'رضا المستثمرين',
          helper: 'بناءً على استطلاعات مستخدمين ربعيّة',
        },
      ]
    : [
        {
          value: '220+',
          label: 'screened opportunities',
          helper: 'curated over the past 12 months',
        },
        {
          value: '48 hrs',
          label: 'to launch diligence',
          helper: 'average time to ship analyst briefs',
        },
        {
          value: '92%',
          label: 'investor satisfaction',
          helper: 'measured via quarterly NPS survey',
        },
      ];

  const journeySteps = isArabic
    ? [
        {
          phase: '01',
          title: 'اكتشف الفرص',
          description:
            'شاشات ذكية، تنبيهات قطاعات، وملخصات مختصرة تساعدك على فرز السوق خلال دقائق.',
        },
        {
          phase: '02',
          title: 'عمّق التحليل',
          description:
            'تقارير تدقيق، مقاييس التشغيل، وحوارات مباشرة مع الخبراء الداخليين.',
        },
        {
          phase: '03',
          title: 'نسّق الصفقة',
          description:
            'مسار موحّد للتفاوض، الفحص النافي للجهالة، وإدارة المستندات مع الفرق القانونية.',
        },
        {
          phase: '04',
          title: 'تابع الأثر',
          description:
            'لوحات تحكم تفاعلية تقيس التقدم، وتغذّي قرارات إعادة الاستثمار.',
        },
      ]
    : [
        {
          phase: '01',
          title: 'Discover',
          description:
            'Sector alerts, curated deal rooms, and rapid screeners surface the right pipeline.',
        },
        {
          phase: '02',
          title: 'Evaluate',
          description:
            'Deep dives, operator briefs, and direct access to domain specialists.',
        },
        {
          phase: '03',
          title: 'Execute',
          description:
            'Guided workflows for negotiation, diligence, and document orchestration.',
        },
        {
          phase: '04',
          title: 'Amplify',
          description:
            'Performance dashboards keep stakeholders aligned post-investment.',
        },
      ];

  const testimonials = isArabic
    ? [
        {
          quote:
            'الشفافية في مسار الصفقات عبر باكورة خفضت الوقت المستغرق لاتخاذ القرار بنسبة 35٪ لدينا.',
          name: 'نورة الحربي',
          role: 'شريك إداري، صندوق نمو تقني',
        },
        {
          quote:
            'تغطية القطاعات المتخصصة في باكورة جعلتنا نكتشف فرصًا لم تكن ضمن الرادار التقليدي.',
          name: 'عبدالله المقيطيب',
          role: 'مستثمر ملائكي',
        },
      ]
    : [
        {
          quote:
            'Bakurah’s guided diligence reduced our decision cycle by almost forty percent.',
          name: 'Nora Al-Harbi',
          role: 'Managing Partner, Growth Tech Fund',
        },
        {
          quote:
            'Their analyst network surfaces off-radar founders we would have otherwise missed.',
          name: 'Abdullah Al-Muqaitib',
          role: 'Angel investor',
        },
      ];

  const footerColumns = isArabic
    ? [
        {
          title: 'المنصة',
          links: [
            { label: 'عن باكورة', href: '#capabilities' },
            { label: 'رحلة المستثمر', href: '#journey' },
            { label: 'الشهادات', href: '#testimonials' },
          ],
        },
        {
          title: 'الدعم',
          links: [
            { label: 'تواصل معنا', href: 'mailto:hello@bakurah.sa' },
            { label: 'حجز جلسة تعريفية', href: '/register' },
            { label: 'المركز الإعلامي', href: '#newsroom' },
          ],
        },
      ]
    : [
        {
          title: 'Platform',
          links: [
            { label: 'Overview', href: '#capabilities' },
            { label: 'Investor journey', href: '#journey' },
            { label: 'Proof points', href: '#testimonials' },
          ],
        },
        {
          title: 'Support',
          links: [
            { label: 'Contact', href: 'mailto:hello@bakurah.sa' },
            { label: 'Book a walkthrough', href: '/register' },
            { label: 'Newsroom', href: '#newsroom' },
          ],
        },
      ];

  const newsTitle = isArabic ? 'أحدث القصص الإخبارية' : 'Latest newsroom highlights';
  const newsEmptyMessage = isArabic
    ? 'لم يتم نشر أخبار جديدة بعد. تابع باكورة للتقنيات للاطلاع على آخر المستجدات.'
    : 'No newsroom updates are available yet. Follow Bakurah Technologies for upcoming announcements.';
  const newsErrorMessage = isArabic
    ? 'تعذر تحميل الأخبار حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
    : 'We could not load the newsroom feed right now. Please try again soon.';
  const readMoreLabel = isArabic ? 'تعرّف على التفاصيل بعد تسجيل الدخول' : 'Sign in to read more';
  const publishedLabel = isArabic ? 'تاريخ النشر' : 'Published';
  const primaryCtaLabel = isArabic ? 'اطلب دعوة للمنصة' : 'Request platform access';
  const secondaryCtaLabel = isArabic ? 'جرّب العرض التفاعلي' : 'Explore the interactive tour';
  const heroHelper = isArabic
    ? 'بإشراف خبراء القطاعات وفرق التحليل المتخصصة'
    : 'Guided by sector experts and operator-grade analysts';
  const journeyTitle = isArabic ? 'رحلة المستثمر داخل باكورة' : 'The Bakurah investor journey';
  const journeySubtitle = isArabic
    ? 'أدوات متكاملة تغطي سلسلة القيمة من الاكتشاف وحتى المتابعة.'
    : 'Integrated workflows that span discovery, diligence, execution, and monitoring.';
  const testimonialTitle = isArabic ? 'الثقة تبدأ من الشركاء' : 'Trusted by industry peers';
  const testimonialSubtitle = isArabic
    ? 'مقتطفات من مستثمرين استخدموا باكورة لبناء محافظ عالية الأداء.'
    : 'Voices from investors who rely on Bakurah to compound alpha.';
  const ctaSectionTitle = isArabic
    ? 'جاهز لاكتشاف فرصك القادمة؟'
    : 'Ready to unlock your next investment edge?';
  const ctaSectionSubtitle = isArabic
    ? 'انضم إلى مجتمع باكورة وابدأ في تتبع الفرص المفلترة خلال دقائق.'
    : 'Join Bakurah and start following curated opportunities in minutes.';
  const languageToggleLabel = isArabic ? 'English' : 'العربية';
  const languageToggleAriaLabel = isArabic
    ? 'التبديل إلى اللغة الإنجليزية'
    : 'Switch interface to Arabic';
  const newsroomCtaLabel = isArabic
    ? 'اطلب الوصول الكامل للنشرة'
    : 'Get full newsroom access';

  const renderNewsContent = () => {
    if (isNewsLoading && newsItems.length === 0) {
      return Array.from({ length: 3 }).map((_, index) => (
        <article
          key={`news-skeleton-${index}`}
          style={{
            borderRadius: '1.25rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              paddingBottom: '56.25%',
              background: `${palette.neutralBorderSoft}40`,
            }}
          />
          <div
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div
              style={{
                height: '0.875rem',
                width: '40%',
                borderRadius: '999px',
                background: `${palette.neutralBorderSoft}80`,
              }}
            />
            <div
              style={{
                height: '1.4rem',
                width: '85%',
                borderRadius: '0.5rem',
                background: `${palette.neutralBorderSoft}66`,
              }}
            />
            <div
              style={{
                height: '3.5rem',
                borderRadius: '0.5rem',
                background: `${palette.neutralBorderSoft}4D`,
              }}
            />
            <div
              style={{
                height: '2.5rem',
                width: '45%',
                borderRadius: '0.75rem',
                background: `${palette.neutralBorderSoft}66`,
                marginTop: '0.5rem',
              }}
            />
          </div>
        </article>
      ));
    }

    if (isNewsError) {
      return (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: '3rem 2rem',
            borderRadius: '1.25rem',
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            background: palette.backgroundSurface,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '1rem',
            lineHeight: 1.7,
          }}
        >
          {newsErrorMessage}
        </div>
      );
    }

    if (newsItems.length === 0) {
      return (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: '3rem 2rem',
            borderRadius: '1.25rem',
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            background: palette.backgroundSurface,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '1rem',
            lineHeight: 1.7,
          }}
        >
          {newsEmptyMessage}
        </div>
      );
    }

    return newsItems.map(item => {
      const coverUrl = resolveCoverUrl(item.coverKey);
      const publishedAt = new Date(item.publishedAt).toLocaleDateString(
        isArabic ? 'ar-SA' : 'en-GB',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }
      );
      const excerpt =
        item.excerpt ??
        (isArabic
          ? 'للاطلاع على تفاصيل هذا الخبر، الرجاء تسجيل الدخول إلى بوابة باكورة.'
          : 'Sign in to the Bakurah portal to read the full story.');

      return (
        <article
          key={item.id}
          style={{
            borderRadius: '1.25rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(4, 44, 84, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(4, 44, 84, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(4, 44, 84, 0.08)';
          }}
          onClick={() => window.location.href = '/login'}
        >
          {coverUrl && (
            <div style={{ position: 'relative' }}>
              <OptimizedImage
                src={coverUrl}
                alt={item.title}
                aspectRatio={16 / 9}
                objectFit="cover"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  ...(isArabic ? { right: '1rem' } : { left: '1rem' }),
                  padding: '0.4rem 0.85rem',
                  borderRadius: '999px',
                  background: `${palette.backgroundSurface}E6`,
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: palette.brandPrimaryStrong,
                  letterSpacing: '0.05em',
                  zIndex: 1,
                }}
              >
                {isArabic ? 'خبر باكورة' : 'Bakurah News'}
              </div>
            </div>
          )}
          <div
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              flexGrow: 1,
              textAlign: isArabic ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                color: palette.textSecondary,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <span>{publishedLabel}</span>
              <time dateTime={item.publishedAt}>{publishedAt}</time>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: 700,
                color: palette.textPrimary,
                lineHeight: 1.3,
                marginBottom: '0.5rem',
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.7,
                fontSize: '0.95rem',
                flexGrow: 1,
              }}
            >
              {excerpt}
            </p>
            <div style={{ marginTop: '1.25rem' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '0.75rem',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = palette.brandPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = palette.brandPrimaryStrong;
                }}
              >
                {readMoreLabel}
                <span
                  aria-hidden
                  style={{
                    transform: isArabic ? 'scaleX(-1)' : 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </article>
      );
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.backgroundBase,
        color: palette.textPrimary,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '1.5rem 2rem',
          flexWrap: 'wrap',
        }}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flex: '1 1 220px',
          }}
        >
          <Logo size={64} showWordmark={false} aria-hidden />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              textAlign: isArabic ? 'right' : 'left',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>{heroTitle}</span>
            <span style={{ color: palette.textSecondary }}>{heroSubtitle}</span>
          </div>
        </div>
        <nav
          role="navigation"
          aria-label={isArabic ? 'روابط رئيسية' : 'Primary navigation'}
          style={{
            display: 'flex',
            gap: '1.25rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            flex: '2 1 320px',
          }}
        >
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{
                ...navLinkStyle,
                textAlign: 'center',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
            aria-label={languageToggleAriaLabel}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '999px',
              border: `1px solid ${palette.neutralBorderSoft}`,
              background: palette.backgroundSurface,
              color: palette.textSecondary,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {languageToggleLabel}
          </button>
          <Link
            to="/register"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '999px',
              border: `1px solid ${palette.brandSecondaryMuted}`,
              color: palette.brandPrimaryStrong,
              background: `${palette.brandSecondarySoft}40`,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {primaryCtaLabel}
          </Link>
          <Link
            to="/login"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: `1px solid ${palette.brandPrimaryStrong}`,
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        <section style={heroSectionStyle} dir={isArabic ? 'rtl' : 'ltr'}>
          <div
            style={{
              width: '100%',
              maxWidth: '1200px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                textAlign: isArabic ? 'right' : 'left',
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: '2.75rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
              >
                {heroTitle}
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: '1.15rem',
                  color: palette.textSecondary,
                  lineHeight: 1.7,
                }}
              >
                {heroSubtitle}
              </p>
              <span
                style={{
                  fontSize: '0.95rem',
                  color: palette.brandPrimaryStrong,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {heroHelper}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <Link
                  to="/register"
                  style={{
                    padding: '0.85rem 1.75rem',
                    borderRadius: '1rem',
                    background: palette.brandPrimaryStrong,
                    color: palette.textOnBrand,
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {primaryCtaLabel}
                </Link>
                <Link
                  to="/login"
                  style={{
                    padding: '0.85rem 1.5rem',
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    color: palette.textPrimary,
                    fontWeight: 600,
                    textDecoration: 'none',
                    background: palette.backgroundSurface,
                  }}
                >
                  {secondaryCtaLabel}
                </Link>
              </div>
            </div>
            <div
              aria-hidden
              style={{
                borderRadius: '2rem',
                border: `1px solid ${palette.brandSecondaryMuted}`,
                background: `linear-gradient(145deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondarySoft})`,
                padding: '2rem',
                minHeight: '260px',
                color: palette.textOnBrand,
                boxShadow: '0 20px 50px rgba(3, 12, 37, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <span style={{ fontSize: '0.9rem', letterSpacing: '0.08em' }}>
                {isArabic ? 'لوحة نشاط السوق' : 'Live market intelligence'}
              </span>
              <strong style={{ fontSize: '2.5rem', lineHeight: 1 }}>
                {isArabic ? '12' : '12'}
              </strong>
              <span style={{ fontSize: '1rem', opacity: 0.9 }}>
                {isArabic
                  ? 'فرص قيد المراجعة حالياً ضمن القطاعات السحابية والطبية.'
                  : 'Opportunities currently under review across cloud and health tech verticals.'}
              </span>
              <div
                style={{
                  marginTop: 'auto',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <span>{isArabic ? 'آخر تحديث منذ 6 دقائق' : 'Refreshed 6 minutes ago'}</span>
                <span style={{ opacity: 0.8 }}>
                  {isArabic ? 'اطلب الوصول لرؤية لوحة المتابعة الكاملة.' : 'Request access to see the full tracker.'}
                </span>
              </div>
            </div>
          </div>
          <div
            style={{
              width: '100%',
              maxWidth: '1200px',
              marginTop: '3rem',
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            }}
          >
            {heroHighlights.map((item) => (
              <div key={item.label} style={highlightCardStyle}>
                <strong style={{ fontSize: '2rem' }}>{item.value}</strong>
                <span style={{ fontWeight: 600 }}>{item.label}</span>
                <span style={{ color: palette.textSecondary, fontSize: '0.9rem' }}>
                  {item.helper}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="capabilities" style={sectionStyle} dir={isArabic ? 'rtl' : 'ltr'}>
          <h2
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {featureTitle}
          </h2>
          <p
            style={{
              margin: 0,
              textAlign: 'center',
              color: palette.textSecondary,
              fontSize: '1rem',
              lineHeight: 1.6,
            }}
          >
            {isArabic
              ? 'حوّل قنوات البحث عن الفرص إلى عمليات تعتمد على البيانات، مع تبسيط العمل بين الفرق الداخلية والخارجية.'
              : 'Turn opportunity sourcing into a data-driven, collaborative workflow across internal and external teams.'}
          </p>
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            }}
          >
            {features.map((feature) => (
              <article key={feature.title} style={featureCardStyle}>
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: '0.75rem',
                    fontSize: '1.25rem',
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: palette.textSecondary,
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="journey"
          style={{
            ...sectionStyle,
            padding: '4rem 2rem',
            background: palette.backgroundSurface,
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {journeyTitle}
            </h2>
            <p
              style={{
                margin: '0.75rem auto 0',
                maxWidth: '720px',
                color: palette.textSecondary,
                lineHeight: 1.7,
              }}
            >
              {journeySubtitle}
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            }}
          >
            {journeySteps.map((step) => (
              <article key={step.phase} style={timelineCardStyle}>
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: palette.brandPrimaryStrong,
                  }}
                >
                  {step.phase}
                </span>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.35rem',
                    fontWeight: 700,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: palette.textSecondary,
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            ...sectionStyle,
            padding: '4rem 2rem',
            maxWidth: '1200px',
            background: palette.backgroundBase,
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
          id="newsroom"
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 700,
                color: palette.textPrimary,
                marginBottom: '0.75rem',
              }}
            >
              {newsTitle}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '1.05rem',
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {isArabic
                ? 'تابع آخر التحديثات والأخبار لمنصة باكورة للتقنيات'
                : 'Stay updated with the latest news and updates from Bakurah Technologies'}
            </p>
          </div>
          {isNewsFetching && newsItems.length > 0 && !isNewsError && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.9rem',
                }}
              >
                {isArabic ? 'يتم تحديث النشرة الإخبارية…' : 'Refreshing newsroom feed…'}
              </span>
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gap: '2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
          >
            {renderNewsContent()}
          </div>
          <div
            style={{
              marginTop: '3rem',
              textAlign: 'center',
              borderRadius: '1.5rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
              padding: '2rem',
              background: palette.backgroundSurface,
            }}
          >
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {isArabic
                ? 'النشرة الكاملة تحتوي على تقارير داخلية وإشعارات لحظية حول القطاعات المفضلة لديك.'
                : 'Access the full newsroom for insider reports and instant alerts on your focus sectors.'}
            </p>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                marginTop: '1rem',
                padding: '0.85rem 1.5rem',
                borderRadius: '999px',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {newsroomCtaLabel}
            </Link>
          </div>
        </section>

        <section
          id="testimonials"
          style={{
            ...sectionStyle,
            padding: '4rem 2rem',
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 700,
              }}
            >
              {testimonialTitle}
            </h2>
            <p
              style={{
                margin: '0.75rem auto 0',
                maxWidth: '720px',
                color: palette.textSecondary,
                lineHeight: 1.7,
              }}
            >
              {testimonialSubtitle}
            </p>
          </div>
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            {testimonials.map((item) => (
              <article key={item.name} style={testimonialCardStyle}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    lineHeight: 1.8,
                  }}
                >
                  “{item.quote}”
                </p>
                <div>
                  <strong>{item.name}</strong>
                  <p
                    style={{
                      margin: '0.25rem 0 0',
                      color: palette.textSecondary,
                      fontSize: '0.9rem',
                    }}
                  >
                    {item.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          style={{
            ...sectionStyle,
            padding: '4rem 2rem',
            textAlign: 'center',
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '2.25rem',
              fontWeight: 800,
            }}
          >
            {ctaSectionTitle}
          </h2>
          <p
            style={{
              margin: '1rem auto 2rem',
              maxWidth: '600px',
              color: palette.textSecondary,
              lineHeight: 1.7,
            }}
          >
            {ctaSectionSubtitle}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/register"
              style={{
                padding: '0.95rem 1.9rem',
                borderRadius: '999px',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {primaryCtaLabel}
            </Link>
            <Link
              to="/login"
              style={{
                padding: '0.95rem 1.75rem',
                borderRadius: '999px',
                border: `1px solid ${palette.neutralBorderSoft}`,
                color: palette.textPrimary,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {ctaLabel}
            </Link>
          </div>
        </section>
      </main>

      <footer
        style={{
          padding: '3rem 2rem',
          background: palette.backgroundSurface,
        }}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Logo size={48} showWordmark={false} aria-hidden />
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.7,
              }}
            >
              {isArabic
                ? 'منصة باكورة للتقنيات تربط المستثمرين بقادة الابتكار في المنطقة وتوفر أدوات تحليل عميقة لاتخاذ القرار.'
                : 'Bakurah Technologies connects investors with emerging innovators through rich intelligence and guided workflows.'}
            </p>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4
                style={{
                  marginTop: 0,
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {column.title}
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {column.links.map((link) =>
                  link.href.startsWith('/') ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      style={{
                        color: palette.textSecondary,
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{
                        color: palette.textSecondary,
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            color: palette.textSecondary,
          }}
        >
          {isArabic
            ? '© ' + new Date().getFullYear().toString() + ' باكورة للتقنيات. جميع الحقوق محفوظة.'
            : `© ${new Date().toLocaleDateString(undefined, { year: 'numeric' })} Bakurah Technologies. All rights reserved.`}
        </div>
      </footer>
    </div>
  );
}




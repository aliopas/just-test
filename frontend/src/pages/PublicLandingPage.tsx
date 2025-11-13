import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useInvestorNewsList } from '../hooks/useInvestorNews';
import { resolveCoverUrl } from '../utils/supabase-storage';

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


export function PublicLandingPage() {
  const { language } = useLanguage();
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

  const newsTitle = isArabic ? 'أحدث القصص الإخبارية' : 'Latest newsroom highlights';
  const newsEmptyMessage = isArabic
    ? 'لم يتم نشر أخبار جديدة بعد. تابع باكورة للتقنيات للاطلاع على آخر المستجدات.'
    : 'No newsroom updates are available yet. Follow Bakurah Technologies for upcoming announcements.';
  const newsErrorMessage = isArabic
    ? 'تعذر تحميل الأخبار حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
    : 'We could not load the newsroom feed right now. Please try again soon.';
  const readMoreLabel = isArabic ? 'تعرّف على التفاصيل بعد تسجيل الدخول' : 'Sign in to read more';
  const publishedLabel = isArabic ? 'تاريخ النشر' : 'Published';

  const renderNewsContent = () => {
    if (isNewsLoading && newsItems.length === 0) {
      return Array.from({ length: 3 }).map((_, index) => (
        <article
          key={`news-skeleton-${index}`}
          style={{
            padding: '1.75rem',
            borderRadius: '1rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundBase,
            display: 'grid',
            gap: '1rem',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              height: '0.9rem',
              width: '40%',
              borderRadius: '999px',
              background: `${palette.neutralBorderSoft}80`,
            }}
          />
          <div
            style={{
              height: '1.2rem',
              width: '70%',
              borderRadius: '0.75rem',
              background: `${palette.neutralBorderSoft}66`,
            }}
          />
          <div
            style={{
              height: '3.5rem',
              borderRadius: '0.75rem',
              background: `${palette.neutralBorderSoft}4D`,
            }}
          />
          <div
            style={{
              height: '0.85rem',
              width: '30%',
              borderRadius: '0.75rem',
              background: `${palette.neutralBorderSoft}66`,
            }}
          />
        </article>
      ));
    }

    if (isNewsError) {
      return (
        <div
          style={{
            padding: '2rem',
            borderRadius: '1.25rem',
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            background: palette.backgroundBase,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
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
            padding: '2rem',
            borderRadius: '1.25rem',
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            background: palette.backgroundBase,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
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
            borderRadius: '1rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundBase,
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
            display: 'grid',
            gridTemplateColumns: coverUrl ? 'minmax(0, 1fr) minmax(0, 1.25fr)' : '1fr',
          }}
        >
          {coverUrl && (
            <div
              style={{
                position: 'relative',
                minHeight: '220px',
                background: palette.backgroundInverse,
              }}
            >
              <img
                src={coverUrl}
                alt={item.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
          <div
            style={{
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.9rem',
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
                fontSize: '0.85rem',
              }}
            >
              <span>{publishedLabel}</span>
              <time dateTime={item.publishedAt}>{publishedAt}</time>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 700,
                color: palette.textPrimary,
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.65,
              }}
            >
              {excerpt}
            </p>
            <div style={{ marginTop: 'auto' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: palette.brandSecondary,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                {readMoreLabel}
                <span
                  aria-hidden
                  style={{
                    transform: isArabic ? 'scaleX(-1)' : 'none',
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
          padding: '1.5rem 2rem',
        }}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
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
      </header>

      <main style={{ flex: 1 }}>
        <section style={heroSectionStyle} dir={isArabic ? 'rtl' : 'ltr'}>
          <div
            style={{
              maxWidth: '720px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: '2.5rem',
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {heroTitle}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '1.15rem',
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {heroSubtitle}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Link
                to="/login"
                style={{
                  padding: '0.9rem 2.25rem',
                  borderRadius: '999px',
                  border: `1px solid ${palette.brandSecondary}`,
                  background: palette.brandSecondary,
                  color: palette.textOnBrand,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {ctaLabel}
              </Link>
            </div>
          </div>
        </section>

        <section style={sectionStyle} dir={isArabic ? 'rtl' : 'ltr'}>
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
          style={{
            ...sectionStyle,
            background: palette.backgroundSurface,
            borderTop: `1px solid ${palette.neutralBorderSoft}`,
            borderBottom: `1px solid ${palette.neutralBorderSoft}`,
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.75rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {newsTitle}
          </h2>
          {isNewsFetching && newsItems.length > 0 && !isNewsError && (
            <span
              style={{
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: '0.85rem',
              }}
            >
              {isArabic ? 'يتم تحديث النشرة الإخبارية…' : 'Refreshing newsroom feed…'}
            </span>
          )}
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
            }}
          >
            {renderNewsContent()}
          </div>
        </section>
      </main>

      <footer
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: palette.textSecondary,
        }}
      >
        {isArabic
          ? '© ' + new Date().getFullYear().toString() + ' باكورة للتقنيات. جميع الحقوق محفوظة.'
          : `© ${new Date().getFullYear().toString()} Bakurah Technologies. All rights reserved.`}
      </footer>
    </div>
  );
}



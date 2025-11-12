import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';

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
  const newsItems = isArabic
    ? [
        {
          heading: 'باكورة تطلق مبادرة الاستثمارات التقنية للعام 2025',
          body: 'أطلقت باكورة مسارًا جديدًا لدعم الشركات الناشئة في مجالات الذكاء الاصطناعي والحوسبة المتقدمة بالتعاون مع شركاء محليين وعالميين.',
        },
        {
          heading: 'تقرير ربع سنوي عن مؤشرات التقنيات الناشئة',
          body: 'يكشف التقرير عن زيادة ملحوظة في الاستثمارات الخليجية في قطاع الأمن السيبراني والتطبيقات السحابية المتخصصة.',
        },
      ]
    : [
        {
          heading: 'Bakurah launches 2025 Tech Investment Track',
          body: 'A new program partnering with regional and international funds to accelerate AI and advanced computing ventures.',
        },
        {
          heading: 'Q3 emerging tech insights published',
          body: 'Latest report spotlights increased GCC investor activity across cybersecurity and vertical cloud applications.',
        },
      ];

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
          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
            }}
          >
            {newsItems.map((item) => (
              <article
                key={item.heading}
                style={{
                  padding: '1.5rem',
                  borderRadius: '1rem',
                  border: `1px solid ${palette.neutralBorderSoft}`,
                  background: palette.backgroundBase,
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: '0.5rem',
                    fontSize: '1.25rem',
                  }}
                >
                  {item.heading}
                </h3>
                <p
                  style={{
                    margin: 0,
                    color: palette.textSecondary,
                    lineHeight: 1.6,
                  }}
                >
                  {item.body}
                </p>
              </article>
            ))}
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



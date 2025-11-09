import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { palette } from '../styles/theme';
import { Logo } from '../components/Logo';

type NewsItem = {
  id: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  href?: string;
};

const newsItems: NewsItem[] = [
  {
    id: '1',
    title: 'Saudi Tadawul launches new fintech sandbox',
    summary:
      'The Capital Market Authority announced an extended sandbox programme aimed at supporting fintech startups entering the Saudi market.',
    category: 'Regulation',
    publishedAt: '2025-11-03',
    href: 'https://www.cma.org.sa/',
  },
  {
    id: '2',
    title: 'Bakurah portfolio company closes Series A round',
    summary:
      'Our fintech portfolio company “RiyadhPay” has completed a SAR 75M Series A to accelerate AI-driven credit scoring.',
    category: 'Portfolio',
    publishedAt: '2025-10-28',
  },
  {
    id: '3',
    title: 'Supabase announces enhanced database observability tools',
    summary:
      'Supabase shipped new observability features, improving query tracing, row-level security debugging, and real-time performance dashboards.',
    category: 'Technology',
    publishedAt: '2025-10-21',
    href: 'https://supabase.com/blog',
  },
];

export function HomePage() {
  const { direction, language } = useLanguage();

  return (
    <div
      style={{
        direction,
        minHeight: 'calc(100vh - 180px)',
        padding: '3rem 1.5rem 4rem',
        background: palette.backgroundBase,
      }}
    >
      <section
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem',
            }}
          >
            <Logo size={120} stacked tagline={language === 'ar' ? 'بوابتك للاستثمار الذكي' : 'Your gateway to smart investing'} />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '2.4rem',
                  color: palette.textPrimary,
                  lineHeight: 1.1,
                }}
              >
                {language === 'ar'
                  ? 'مرحباً بك في باكورة للاستثمار'
                  : 'Welcome to Bakurah Investors Portal'}
              </h2>
              <p
                style={{
                  marginTop: '1rem',
                  fontSize: '1.05rem',
                  color: palette.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                {language === 'ar'
                  ? 'تابع آخر أخبار السوق ومبادرات باكورة، وابدأ رحلة طلبك الاستثماري بخطوات واضحة وسلسة.'
                  : 'Stay on top of market headlines and Bakurah initiatives, and launch your investment requests with a clear, guided journey.'}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginTop: '1.75rem',
                }}
              >
                <Link
                  to="/requests/new"
                  style={{
                    padding: '0.85rem 2rem',
                    background: palette.brandPrimaryStrong,
                    color: palette.textOnBrand,
                    borderRadius: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {language === 'ar' ? 'ابدأ طلباً جديداً' : 'Start a new request'}
                </Link>
                <Link
                  to="/profile"
                  style={{
                    padding: '0.85rem 2rem',
                    background: palette.backgroundSurface,
                    color: palette.brandAccentDeep,
                    borderRadius: '0.85rem',
                    border: `1px solid ${palette.brandSecondarySoft}`,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {language === 'ar' ? 'عرض الملف الاستثماري' : 'View investor profile'}
                </Link>
              </div>
            </div>
          </div>
          <div
            style={{
              background: `linear-gradient(135deg, ${palette.backgroundInverse} 0%, ${palette.brandPrimary} 100%)`,
              borderRadius: '1.5rem',
              color: palette.textOnInverse,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 24px 60px rgba(4, 44, 84, 0.25)',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: `${palette.textOnInverse}B3`,
              }}
            >
              {language === 'ar' ? 'مستجدات باكورة' : 'Bakurah Pulse'}
            </span>
            <strong style={{ fontSize: '1.4rem', lineHeight: 1.4 }}>
              {language === 'ar'
                ? 'تجربة موحدة لإدارة المستثمرين، مع إشعارات مباشرة وركائز أمان مدعومة بسوبابيس.'
                : 'A unified investor journey with real-time updates and secure Supabase foundations.'}
            </strong>
            <p
              style={{
                margin: 0,
                color: `${palette.textOnInverse}B3`,
                lineHeight: 1.6,
              }}
            >
              {language === 'ar'
                ? 'استفد من مركز التوعية لتجد مقالات مختارة حول الفرص واللوائح المالية في المملكة.'
                : 'Explore curated guidance on opportunities and regulatory movements shaping the Kingdom’s financial landscape.'}
            </p>
          </div>
        </header>

        <section
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.5rem',
            border: `1px solid ${palette.neutralBorder}`,
            padding: '2rem',
            boxShadow: '0 24px 60px rgba(4, 44, 84, 0.08)',
          }}
        >
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.6rem',
                  color: palette.textPrimary,
                }}
              >
                {language === 'ar' ? 'آخر الأخبار' : 'Latest updates'}
              </h3>
              <p style={{ margin: '0.4rem 0 0', color: palette.textSecondary }}>
                {language === 'ar'
                  ? 'اطّلع على أبرز أخبار السوق والتقنية والصفقات.'
                  : 'A snapshot of market, technology, and deal-flow highlights.'}
              </p>
            </div>
            <Link
              to="/requests/new"
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '0.75rem',
                border: `1px solid ${palette.brandSecondaryMuted}`,
                color: palette.textPrimary,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'انتقل لنموذج الطلب' : 'Go to request form'}
            </Link>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {newsItems.map(item => (
              <article
                key={item.id}
                style={{
                  border: `1px solid ${palette.neutralBorder}`,
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  background: palette.backgroundSurface,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.85rem',
                    color: palette.brandPrimaryStrong,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {item.category}
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: palette.brandSecondarySoft,
                    }}
                  />
                  <time style={{ color: palette.textSecondary, textTransform: 'none' }}>
                    {new Date(item.publishedAt).toLocaleDateString(
                      language === 'ar' ? 'ar-SA' : 'en-GB',
                      { month: 'short', day: 'numeric' }
                    )}
                  </time>
                </span>
                <h4
                  style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    color: palette.textPrimary,
                  }}
                >
                  {item.title}
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: palette.textSecondary,
                    lineHeight: 1.5,
                    flexGrow: 1,
                  }}
                >
                  {item.summary}
                </p>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      marginTop: 'auto',
                      color: palette.brandPrimaryStrong,
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    {language === 'ar' ? 'قراءة المزيد' : 'Read article →'}
                  </a>
                ) : (
                  <span
                    style={{
                      marginTop: 'auto',
                      color: palette.brandAccentDeep,
                      fontWeight: 600,
                    }}
                  >
                    {language === 'ar' ? 'تحديث داخلي' : 'Internal update'}
                  </span>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}



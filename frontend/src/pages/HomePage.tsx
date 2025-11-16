import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { palette } from '../styles/theme';
import { Logo } from '../components/Logo';
import { useInvestorNewsList } from '../hooks/useInvestorNews';
import { resolveCoverUrl, NEWS_IMAGES_BUCKET } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';
import type { InvestorNewsItem } from '../types/news';

const PAGE_LIMIT = 12;

export function HomePage() {
  const { direction, language } = useLanguage();
  const [page, setPage] = useState(1);
  const [allNews, setAllNews] = useState<InvestorNewsItem[]>([]);

  const {
    data: newsResponse,
    isLoading: isNewsLoading,
    isError: isNewsError,
    isFetching: isNewsFetching,
  } = useInvestorNewsList({ page, limit: PAGE_LIMIT });

  useEffect(() => {
    if (!newsResponse) {
      return;
    }

    setAllNews((prev: InvestorNewsItem[]) => {
      if (page === 1) {
        return newsResponse.news;
      }

      const existing = new Set(prev.map((item: InvestorNewsItem) => item.id));
      const merged = [...prev];
      newsResponse.news.forEach((item: InvestorNewsItem) => {
        if (!existing.has(item.id)) {
          merged.push(item);
        }
      });
      return merged;
    });
  }, [newsResponse, page]);

  const latestNews = useMemo(
    () => allNews,
    [allNews]
  );

  const hasMore = newsResponse?.meta.hasNext ?? false;

  const renderNewsCards = () => {
    if (isNewsLoading && latestNews.length === 0) {
      return Array.from({ length: 6 }).map((_, index) => (
        <article
          key={`news-skeleton-${index}`}
          style={{
            border: `1px solid ${palette.neutralBorder}`,
            borderRadius: '1.25rem',
            padding: '1.5rem',
            background: palette.backgroundSurface,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              height: '0.85rem',
              width: '60%',
              background: `${palette.neutralBorder}66`,
              borderRadius: '999px',
            }}
          />
          <div
            style={{
              height: '1.1rem',
              width: '80%',
              background: `${palette.neutralBorder}66`,
              borderRadius: '0.75rem',
            }}
          />
          <div
            style={{
              height: '3.2rem',
              width: '100%',
              background: `${palette.neutralBorder}44`,
              borderRadius: '0.75rem',
            }}
          />
          <div
            style={{
              height: '0.9rem',
              width: '40%',
              background: `${palette.neutralBorder}66`,
              borderRadius: '0.75rem',
              marginTop: 'auto',
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
            background: palette.backgroundBase,
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          {language === 'ar'
            ? 'تعذر تحميل الأخبار الآن. نعمل على إصلاح المشكلة، حاول مرة أخرى لاحقاً.'
            : 'We could not load the latest news right now. Please try again shortly.'}
        </div>
      );
    }

    if (latestNews.length === 0) {
      return (
        <div
          style={{
            padding: '2rem',
            borderRadius: '1.25rem',
            background: palette.backgroundBase,
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          {language === 'ar'
            ? 'لم يتم نشر أخبار جديدة بعد. تابعنا لتتعرف على أحدث التحديثات من فريق باكورة.'
            : 'No news have been published yet. Check back soon for the latest updates from the Bakurah team.'}
        </div>
      );
    }

    return latestNews.map((item: InvestorNewsItem) => {
      const coverUrl = resolveCoverUrl(item.coverKey, NEWS_IMAGES_BUCKET);
      const publishedLabel = new Date(item.publishedAt).toLocaleDateString(
        language === 'ar' ? 'ar-SA' : 'en-GB',
        { month: 'short', day: 'numeric' }
      );
      const excerpt =
        item.excerpt ??
        (language === 'ar'
          ? 'تفاصيل هذا الخبر متاحة في مركز الأخبار للتعمق في ما يقدمه فريق باكورة.'
          : 'Visit the news center for the full story and additional context from the Bakurah team.');

      return (
        <article
          key={item.id}
          style={{
            border: `1px solid ${palette.neutralBorder}`,
            borderRadius: '1.25rem',
            overflow: 'hidden',
            background: palette.backgroundSurface,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 22px 48px rgba(4, 38, 63, 0.12)',
          }}
        >
            <div style={{ position: 'relative' }}>
              <OptimizedImage
                src={coverUrl}
                alt={item.title}
                aspectRatio={16 / 9}
                fallbackText={language === 'ar' ? 'لا توجد صورة مرفقة' : 'No cover image'}
                objectFit="cover"
              />
              <span
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: direction === 'rtl' ? undefined : '1rem',
                  right: direction === 'rtl' ? '1rem' : undefined,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  background: `${palette.backgroundSurface}E6`,
                  color: palette.brandPrimaryStrong,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  zIndex: 1,
                }}
              >
                {language === 'ar' ? 'خبر باكورة' : 'Bakurah News'}
              </span>
            </div>

          <div
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              flexGrow: 1,
            }}
          >
            <time
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
              }}
            >
              {publishedLabel}
            </time>
            <h4
              style={{
                margin: 0,
                fontSize: '1.25rem',
                color: palette.textPrimary,
                lineHeight: 1.4,
              }}
            >
              {item.title}
            </h4>
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.6,
                flexGrow: 1,
              }}
            >
              {excerpt}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  color: palette.brandAccentDeep,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {language === 'ar'
                  ? 'اقرأ المزيد داخل مركز الأخبار'
                  : 'Read the full story in the news hub'}
              </span>
              <Link
                to={`/news/${item.id}`}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '0.75rem',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  textDecoration: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {language === 'ar' ? 'عرض التفاصيل' : 'View details'}
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
            {renderNewsCards()}
          </div>
          
          {hasMore && (
            <div
              style={{
                marginTop: '2.5rem',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setPage((current: number) => current + 1)}
                disabled={isNewsFetching}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.85rem 2.4rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  boxShadow: '0 18px 35px rgba(44, 116, 204, 0.25)',
                  cursor: isNewsFetching ? 'not-allowed' : 'pointer',
                  opacity: isNewsFetching ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {isNewsFetching
                  ? language === 'ar' ? 'جارٍ التحميل…' : 'Loading…'
                  : language === 'ar' ? 'تحميل المزيد من الأخبار' : 'Load more news'}
              </button>
            </div>
          )}
          
          {isNewsFetching && !isNewsLoading && latestNews.length > 0 && !hasMore ? (
            <div
              style={{
                marginTop: '1.5rem',
                fontSize: '0.85rem',
                color: palette.textSecondary,
                textAlign: 'center',
              }}
            >
              {language === 'ar' ? 'جارٍ تحديث آخر الأخبار…' : 'Refreshing the latest stories…'}
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
}



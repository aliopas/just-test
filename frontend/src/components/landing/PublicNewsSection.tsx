import React from 'react';
import { useInvestorNewsList } from '../../hooks/useInvestorNews';
import { palette } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';
import { useIsMobile } from '../../hooks/useMediaQuery';
import { getStoragePublicUrl, NEWS_IMAGES_BUCKET } from '../../utils/supabase-storage';
import type { InvestorNewsItem } from '../../types/news';

interface NewsCardProps {
  item: InvestorNewsItem;
  language: string;
  isMobile: boolean;
}

function NewsCard({ item, language, isMobile }: NewsCardProps) {
  const isArabic = language === 'ar';
  const coverUrl = item.coverKey ? getStoragePublicUrl(NEWS_IMAGES_BUCKET, item.coverKey) : null;
  
  const publishedDate = new Date(item.publishedAt);
  const formattedDate = new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
  }).format(publishedDate);

  // Extract excerpt from title or use provided excerpt
  const displayExcerpt = item.excerpt || item.title;

  return (
    <a
      href={`/news/${item.slug || item.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1rem',
        background: palette.backgroundSurface,
        border: `1px solid ${palette.neutralBorderSoft}`,
        overflow: 'hidden',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.12)';
        e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
        e.currentTarget.style.borderColor = palette.neutralBorderSoft;
      }}
    >
      {coverUrl && (
        <div
          style={{
            width: '100%',
            height: isMobile ? '160px' : '200px',
            background: `url(${coverUrl}) center/cover`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      <div
        style={{
          padding: isMobile ? '1rem' : '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            color: palette.textSecondary,
            fontWeight: 500,
          }}
        >
          {formattedDate}
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: 600,
            color: palette.textPrimary,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.title}
        </h3>
        {displayExcerpt && displayExcerpt !== item.title && (
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              color: palette.textSecondary,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {displayExcerpt}
          </p>
        )}
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            color: palette.brandPrimaryStrong,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          {isArabic ? 'اقرأ المزيد' : 'Read more'}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isArabic ? 'rotate(180deg)' : 'none',
            }}
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}

export function PublicNewsSection() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const isMobile = useIsMobile();
  
  const { data, isLoading, isError } = useInvestorNewsList({
    page: 1,
    limit: 6, // Show up to 6 news items on landing page
  });

  const news = data?.news ?? [];
  const title = isArabic ? 'آخر الأخبار والإعلانات' : 'Latest News & Announcements';

  // Don't render if there's an error or no news
  if (isError || (!isLoading && news.length === 0)) {
    return null;
  }

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '3rem 1rem' : '4rem 1.5rem',
          direction,
        }}
      >
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : (isArabic ? 'row-reverse' : 'row'),
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? '1.5rem' : '2.5rem',
          gap: '1rem',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: 700,
            color: palette.textPrimary,
            letterSpacing: isArabic ? 0 : '-0.02em',
          }}
        >
          {title}
        </h2>
        {news.length > 0 && (
          <a
            href="/news"
            style={{
              padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.2rem',
              borderRadius: '999px',
              border: `1px solid ${palette.neutralBorderSoft}`,
              background: palette.backgroundSurface,
              color: palette.textPrimary,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: isMobile ? '0.85rem' : '0.9rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = palette.brandPrimaryStrong;
              e.currentTarget.style.color = palette.brandPrimaryStrong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = palette.neutralBorderSoft;
              e.currentTarget.style.color = palette.textPrimary;
            }}
          >
            {isArabic ? 'عرض الكل' : 'View all'}
          </a>
        )}
      </div>

      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: isMobile ? '1.5rem' : '2rem',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: isMobile ? '280px' : '320px',
                borderRadius: '1rem',
                background: palette.backgroundSurface,
                border: `1px solid ${palette.neutralBorderSoft}`,
                opacity: 0.6,
                backgroundImage: `linear-gradient(90deg, ${palette.backgroundSurface} 0%, ${palette.neutralBorderSoft}20 50%, ${palette.backgroundSurface} 100%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : news.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: isMobile ? '1.5rem' : '2rem',
          }}
        >
          {news.map((item) => (
            <NewsCard key={item.id} item={item} language={language} isMobile={isMobile} />
          ))}
        </div>
      ) : null}
    </section>
    </>
  );
}


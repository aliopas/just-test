import React from 'react';
import { useParams } from 'next/navigation';
import { useNextNavigate } from '../utils/next-router';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorInternalNewsDetail } from '../hooks/useSupabaseNews';
import { tInvestorInternalNews } from '../locales/investorInternalNews';
import { getStoragePublicUrl, NEWS_IMAGES_BUCKET } from '../utils/supabase-storage';
import { formatInvestorDateTime } from '../utils/date';

export function InvestorInternalNewsDetailPage() {
  const { language, direction } = useLanguage();
  const params = useParams<{ id?: string }>();
  const navigate = useNextNavigate();
  const id = params?.id;
  const isArabic = language === 'ar';

  const { data, isLoading, isError, error, refetch } = useInvestorInternalNewsDetail(id ?? null);

  const formatDateTime = (value: string) => formatInvestorDateTime(value, language);

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: palette.backgroundSurface,
        direction,
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate('/internal-news')}
          style={{
            alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
            padding: '0.65rem 1.25rem',
            borderRadius: radius.md,
            border: `1px solid ${palette.neutralBorderMuted}`,
            background: palette.backgroundBase,
            color: palette.textSecondary,
            fontSize: typography.sizes.body,
            fontWeight: typography.weights.medium,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = palette.brandPrimary;
            e.currentTarget.style.color = palette.brandPrimaryStrong;
            e.currentTarget.style.backgroundColor = palette.backgroundHighlight;
            e.currentTarget.style.transform = 'translateX(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = palette.neutralBorderMuted;
            e.currentTarget.style.color = palette.textSecondary;
            e.currentTarget.style.backgroundColor = palette.backgroundBase;
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <span>←</span>
          {isArabic ? 'العودة إلى الأخبار' : 'Back to News'}
        </button>

        {/* Main content */}
        <section
          style={{
            padding: '2rem 2.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.medium,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          {isLoading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                gap: '1rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: `4px solid ${palette.neutralBorderMuted}`,
                  borderTopColor: palette.brandPrimary,
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p
                style={{
                  margin: 0,
                  fontSize: typography.sizes.body,
                  color: palette.textSecondary,
                }}
              >
                {isArabic ? 'جاري التحميل...' : 'Loading...'}
              </p>
            </div>
          )}

          {isError && !isLoading && (
            <div
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <p
                style={{
                  margin: 0,
                  fontSize: typography.sizes.body,
                  color: palette.error,
                  marginBottom: '1rem',
                }}
              >
                {isArabic ? 'حدث خطأ في تحميل الخبر' : 'Failed to load news'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.brandPrimaryStrong}`,
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontSize: typography.sizes.body,
                  fontWeight: typography.weights.semibold,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = shadow.medium;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {isArabic ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}

          {/* حالة عدم وجود بيانات */}
          {!isLoading && !isError && id && !data && (
            <div
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: typography.sizes.body,
                  color: palette.textSecondary,
                }}
              >
                {isArabic
                  ? 'لم يتم العثور على تفاصيل هذا الخبر الداخلي.'
                  : 'Details for this internal news item could not be found.'}
              </p>
            </div>
          )}

          {!isLoading && !isError && data && (
            <article
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {/* Header */}
              <header>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
                    fontWeight: typography.weights.bold,
                    color: palette.textPrimary,
                    lineHeight: typography.lineHeights.tight,
                    marginBottom: '1rem',
                  }}
                >
                  {data.title}
                </h1>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '1rem',
                    borderRadius: radius.md,
                    background: palette.backgroundSurface,
                    border: `1px solid ${palette.neutralBorderMuted}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: typography.sizes.caption,
                      color: palette.textSecondary,
                    }}
                  >
                    <span>📅</span>
                    <span>
                      <strong>{isArabic ? 'تاريخ النشر:' : 'Published:'}</strong>{' '}
                      {formatDateTime(data.publishedAt)}
                    </span>
                  </div>
                  {data.updatedAt && data.updatedAt !== data.createdAt && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: typography.sizes.caption,
                        color: palette.textSecondary,
                      }}
                    >
                      <span>🔄</span>
                      <span>
                        <strong>{isArabic ? 'آخر تحديث:' : 'Last updated:'}</strong>{' '}
                        {formatDateTime(data.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </header>

              {/* Cover Image */}
              {data.coverKey && (
                <div
                  style={{
                    width: '100%',
                    maxHeight: '500px',
                    borderRadius: radius.lg,
                    overflow: 'hidden',
                    border: `1px solid ${palette.neutralBorderMuted}`,
                    boxShadow: shadow.medium,
                    background: palette.backgroundSurface,
                  }}
                >
                  <img
                    src={getStoragePublicUrl(NEWS_IMAGES_BUCKET, data.coverKey) || data.coverKey}
                    alt={data.title}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '500px',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      // Hide image on error
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Body - render basic Markdown (عناوين + فقرات + قوائم) */}
              <section
                style={{
                  marginTop: '0.5rem',
                  fontSize: typography.sizes.body,
                  color: palette.textPrimary,
                  lineHeight: typography.lineHeights.relaxed,
                  wordBreak: 'break-word',
                }}
              >
                {data.bodyMd
                  .split('\n\n')
                  .map((block, index) => {
                    const text = block.trim();
                    if (!text) return null;

                    // عناوين Markdown (#, ##, ...)
                    if (/^#{1,6}\s/.test(text)) {
                      const level = Math.min(text.match(/^#{1,6}/)?.[0].length || 1, 6);
                      const content = text.replace(/^#{1,6}\s+/, '');
                      const commonStyle = {
                        marginTop: index === 0 ? 0 : '1.25rem',
                        marginBottom: '0.5rem',
                        fontWeight: typography.weights.bold,
                        color: palette.textPrimary,
                      } as const;

                      switch (level) {
                        case 1:
                          return (
                            <h1 key={index} style={{ ...commonStyle, fontSize: '1.5rem' }}>
                              {content}
                            </h1>
                          );
                        case 2:
                          return (
                            <h2 key={index} style={{ ...commonStyle, fontSize: '1.3rem' }}>
                              {content}
                            </h2>
                          );
                        default:
                          return (
                            <h3 key={index} style={{ ...commonStyle, fontSize: '1.1rem' }}>
                              {content}
                            </h3>
                          );
                      }
                    }

                    // قوائم بسيطة (- أو *)
                    if (/^[-*]\s+/m.test(text)) {
                      const items = text
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => /^[-*]\s+/.test(line))
                        .map(line => line.replace(/^[-*]\s+/, ''));

                      return (
                        <ul
                          key={index}
                          style={{
                            margin: '0.5rem 1.25rem',
                            paddingInlineStart: direction === 'rtl' ? '1.25rem' : '1.75rem',
                          }}
                        >
                          {items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      );
                    }

                    // فقرة عادية
                    return (
                      <p key={index} style={{ margin: '0.4rem 0' }}>
                        {text}
                      </p>
                    );
                  })}
              </section>

              {/* Attachments */}
              {data.attachments && data.attachments.length > 0 && (
                <section
                  style={{
                    marginTop: '1.5rem',
                    padding: '1.5rem',
                    borderRadius: radius.lg,
                    background: palette.backgroundSurface,
                    border: `1px solid ${palette.neutralBorderMuted}`,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      marginBottom: '1rem',
                      fontSize: typography.sizes.subheading,
                      fontWeight: typography.weights.semibold,
                      color: palette.textPrimary,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span>📎</span>
                    {isArabic ? 'المرفقات' : 'Attachments'}
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {data.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={attachment.downloadUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '1rem 1.25rem',
                          borderRadius: radius.md,
                          border: `1px solid ${palette.brandPrimary}30`,
                          background: `${palette.brandPrimary}08`,
                          color: palette.brandPrimaryStrong,
                          textDecoration: 'none',
                          fontSize: typography.sizes.body,
                          fontWeight: typography.weights.medium,
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = palette.brandPrimary;
                          e.currentTarget.style.background = `${palette.brandPrimary}15`;
                          e.currentTarget.style.transform = 'translateX(4px)';
                          e.currentTarget.style.boxShadow = shadow.subtle;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = `${palette.brandPrimary}30`;
                          e.currentTarget.style.background = `${palette.brandPrimary}08`;
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>
                          {attachment.type === 'image' ? '🖼️' : '📄'}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: typography.weights.semibold }}>
                            {attachment.name}
                          </div>
                          {attachment.size && (
                            <div
                              style={{
                                fontSize: typography.sizes.caption,
                                color: palette.textMuted,
                                marginTop: '0.25rem',
                              }}
                            >
                              {attachment.size > 1024 * 1024
                                ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`
                                : `${(attachment.size / 1024).toFixed(2)} KB`}
                            </div>
                          )}
                        </div>
                        <span style={{ fontSize: '1.25rem' }}>⬇️</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </article>
          )}
        </section>
      </div>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}


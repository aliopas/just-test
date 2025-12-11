import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorInternalNewsList } from '../hooks/useSupabaseNews';
import { tInvestorInternalNews } from '../locales/investorInternalNews';

export function InvestorInternalNewsPage() {
  const { language, direction } = useLanguage();
  const [page, setPage] = useState(1);
  const [showAll, setShowAll] = useState(true); // Show all news by default
  const { data, isLoading, isError, refetch } = useInvestorInternalNewsList({
    page,
    limit: 20, // Increase limit to show more news
    showAll, // Show all news from Supabase
  });

  const news = data?.news ?? [];
  const meta = data?.meta ?? {
    page,
    limit: 10,
    total: 0,
    pageCount: 0,
    hasNext: false,
  };

  const handleNext = () => {
    if (meta.hasNext) setPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (meta.page > 1) setPage(prev => prev - 1);
  };

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
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {tInvestorInternalNews('pageTitle', language)}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
              maxWidth: '640px',
            }}
          >
            {tInvestorInternalNews('pageSubtitle', language)}
          </p>
        </header>

        {/* Actions */}
        <section
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundBase,
                color: palette.textSecondary,
                fontSize: '0.9rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = palette.brandPrimary;
                  e.currentTarget.style.color = palette.brandPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = palette.neutralBorderMuted;
                  e.currentTarget.style.color = palette.textSecondary;
                }
              }}
            >
              {'\u21BB '}
              {tInvestorInternalNews('refresh', language)}
            </button>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                color: palette.textSecondary,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => {
                  setShowAll(e.target.checked);
                  setPage(1); // Reset to first page when toggling
                }}
                style={{
                  cursor: 'pointer',
                }}
              />
              <span>
                {language === 'ar' ? 'عرض جميع الأخبار' : 'Show All News'}
              </span>
            </label>
          </div>
          <span
            style={{
              fontSize: '0.85rem',
              color: palette.textSecondary,
              fontWeight: typography.weights.medium,
            }}
          >
            {meta.total > 0
              ? `${meta.page} / ${meta.pageCount} (${meta.total} ${language === 'ar' ? 'خبر' : 'news'})`
              : '0 / 0 (0)'}
          </span>
        </section>

        {/* List content */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          {isLoading && (
            <p
              style={{
                margin: 0,
                padding: '1.5rem 0.5rem',
                fontSize: '0.95rem',
                color: palette.textSecondary,
              }}
            >
              {tInvestorInternalNews('loading', language)}
            </p>
          )}

          {isError && !isLoading && (
            <p
              style={{
                margin: 0,
                padding: '1.5rem 0.5rem',
                fontSize: '0.95rem',
                color: palette.error,
              }}
            >
              {tInvestorInternalNews('error', language)}
            </p>
          )}

          {!isLoading && !isError && news.length === 0 && (
            <div
              style={{
                padding: '1.75rem 0.5rem',
                textAlign: 'center',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.05rem',
                  fontWeight: typography.weights.semibold,
                  color: palette.textPrimary,
                }}
              >
                {tInvestorInternalNews('emptyTitle', language)}
              </h2>
              <p
                style={{
                  marginTop: '0.4rem',
                  marginBottom: 0,
                  fontSize: '0.9rem',
                  color: palette.textSecondary,
                }}
              >
                {tInvestorInternalNews('emptySubtitle', language)}
              </p>
            </div>
          )}

          {!isLoading && !isError && news.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              {news.map(item => {
                return (
                  <article
                    key={item.id}
                    style={{
                      borderRadius: radius.lg,
                      border: `1px solid ${palette.neutralBorderMuted}`,
                      background: palette.backgroundBase,
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      transition: 'all 0.2s ease',
                      boxShadow: shadow.subtle,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = palette.brandPrimary;
                      e.currentTarget.style.boxShadow = shadow.medium;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = palette.neutralBorderMuted;
                      e.currentTarget.style.boxShadow = shadow.subtle;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <header>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '1rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1.1rem',
                            fontWeight: typography.weights.semibold,
                            color: palette.textPrimary,
                            flex: 1,
                          }}
                        >
                          {item.title}
                        </h3>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.85rem',
                            color: palette.textSecondary,
                          }}
                        >
                          {tInvestorInternalNews('card.publishedAt', language)}{' '}
                          {new Date(item.publishedAt).toLocaleDateString(
                            language === 'ar' ? 'ar-SA' : 'en-US',
                            { 
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }
                          )}
                        </p>
                        <span
                          style={{
                            padding: '0.125rem 0.5rem',
                            borderRadius: radius.pill,
                            background: palette.backgroundSurface,
                            color: palette.textSecondary,
                            fontSize: '0.75rem',
                            fontWeight: typography.weights.medium,
                            border: `1px solid ${palette.neutralBorderMuted}`,
                          }}
                        >
                          {language === 'ar' ? 'منشور' : 'Published'}
                        </span>
                      </div>
                    </header>

                    {item.excerpt && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          color: palette.textSecondary,
                          lineHeight: typography.lineHeights.relaxed,
                        }}
                      >
                        {item.excerpt}
                      </p>
                    )}

                    {item.attachments.length > 0 && (
                      <div
                        style={{
                          marginTop: '0.5rem',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        {item.attachments.map((attachment: { id: string; name?: string; downloadUrl: string | null }) => (
                          <a
                            key={attachment.id}
                            href={attachment.downloadUrl ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '0.4rem 0.875rem',
                              borderRadius: radius.md,
                              border: `1px solid ${palette.brandPrimary}`,
                              background: `${palette.brandPrimary}10`,
                              fontSize: '0.85rem',
                              color: palette.brandPrimaryStrong,
                              textDecoration: 'none',
                              fontWeight: typography.weights.medium,
                              transition: 'all 0.2s ease',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = palette.brandPrimary;
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = `${palette.brandPrimary}10`;
                              e.currentTarget.style.color = palette.brandPrimaryStrong;
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <span>📎</span>
                            {attachment.name || tInvestorInternalNews('attachments.download', language)}
                          </a>
                        ))}
                      </div>
                    )}
                    <a
                      href={`/internal-news/${item.id}`}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: radius.md,
                        background: `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`,
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: typography.weights.semibold,
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                        display: 'inline-block',
                        width: 'fit-content',
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
                      {language === 'ar' ? 'قراءة المزيد' : 'Read More'}
                    </a>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Pagination */}
        <section
          style={{
            padding: '0 0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: palette.textSecondary,
            fontSize: '0.9rem',
          }}
        >
          <span>
            {meta.total > 0
              ? `${meta.page} / ${meta.pageCount} (${meta.total})`
              : '0 / 0 (0)'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrev}
              disabled={meta.page <= 1}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background:
                  meta.page <= 1 ? palette.backgroundSurface : palette.backgroundBase,
                cursor: meta.page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!meta.hasNext}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background:
                  meta.hasNext ? palette.backgroundBase : palette.backgroundSurface,
                cursor: meta.hasNext ? 'pointer' : 'not-allowed',
              }}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


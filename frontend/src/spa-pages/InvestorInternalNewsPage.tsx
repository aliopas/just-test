import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorInternalNewsList } from '../hooks/useSupabaseNews';
import { tInvestorInternalNews } from '../locales/investorInternalNews';

export function InvestorInternalNewsPage() {
  const { language, direction } = useLanguage();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useInvestorInternalNewsList({
    page,
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
            }}
          >
            {'\u21BB '}
            {tInvestorInternalNews('refresh', language)}
          </button>
          <span
            style={{
              fontSize: '0.85rem',
              color: palette.textSecondary,
            }}
          >
            {meta.total > 0
              ? `${meta.page} / ${meta.pageCount} (${meta.total})`
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
              {news.map(item => (
                <article
                  key={item.id}
                  style={{
                    borderRadius: radius.lg,
                    border: `1px solid ${palette.neutralBorderMuted}`,
                    background: palette.backgroundSurface,
                    padding: '0.9rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <header>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: typography.weights.semibold,
                        color: palette.textPrimary,
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      style={{
                        marginTop: '0.35rem',
                        marginBottom: 0,
                        fontSize: '0.8rem',
                        color: palette.textSecondary,
                      }}
                    >
                      {tInvestorInternalNews('card.publishedAt', language)}{' '}
                      {new Date(item.publishedAt).toLocaleDateString(
                        language === 'ar' ? 'ar-SA' : 'en-US',
                        { dateStyle: 'medium' }
                      )}
                    </p>
                  </header>

                  {item.excerpt && (
                    <p
                      style={{
                        margin: 0,
                        marginTop: '0.3rem',
                        fontSize: '0.9rem',
                        color: palette.textSecondary,
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
                        gap: '0.45rem',
                      }}
                    >
                      {item.attachments.map((attachment: { id: string; downloadUrl: string | null }) => (
                        <a
                          key={attachment.id}
                          href={attachment.downloadUrl ?? '#'}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            padding: '0.3rem 0.7rem',
                            borderRadius: radius.md,
                            border: `1px solid ${palette.neutralBorderMuted}`,
                            background: palette.backgroundBase,
                            fontSize: '0.8rem',
                            color: palette.brandPrimaryStrong,
                            textDecoration: 'none',
                          }}
                        >
                          {tInvestorInternalNews('attachments.download', language)}
                        </a>
                      ))}
                    </div>
                  )}
                </article>
              ))}
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


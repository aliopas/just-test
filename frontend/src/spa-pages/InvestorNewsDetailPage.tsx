import React from 'react';
import { useParams } from 'next/navigation';
import { useNextNavigate } from '../utils/next-router';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorNewsDetail } from '../hooks/useInvestorNews';
import { tInvestorNews } from '../locales/investorNews';

export function InvestorNewsDetailPage() {
  const { language, direction } = useLanguage();
  const params = useParams();
  const navigate = useNextNavigate();
  const id = params?.id as string | undefined;

  const { data, isLoading, isError } = useInvestorNewsDetail(id);

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

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
          maxWidth: '800px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
            padding: '0.45rem 0.9rem',
            borderRadius: radius.md,
            border: `1px solid ${palette.neutralBorderMuted}`,
            background: palette.backgroundBase,
            color: palette.textSecondary,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {tInvestorNews('detail.back', language)}
        </button>

        <section
          style={{
            padding: '1.6rem 1.7rem',
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
                fontSize: '0.95rem',
                color: palette.textSecondary,
              }}
            >
              {tInvestorNews('detail.loading', language)}
            </p>
          )}

          {isError && !isLoading && (
            <p
              style={{
                margin: 0,
                fontSize: '0.95rem',
                color: palette.error,
              }}
            >
              {tInvestorNews('detail.error', language)}
            </p>
          )}

          {!isLoading && !isError && data && (
            <article
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
              }}
            >
              <header>
                <h1
                  style={{
                    margin: 0,
                    fontSize: '1.4rem',
                    fontWeight: typography.weights.bold,
                    color: palette.textPrimary,
                  }}
                >
                  {data.title}
                </h1>
                <div
                  style={{
                    marginTop: '0.5rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    fontSize: '0.85rem',
                    color: palette.textSecondary,
                  }}
                >
                  <span>
                    {tInvestorNews('detail.publishedAt', language)}:{' '}
                    {formatDateTime(data.publishedAt)}
                  </span>
                  <span>
                    {tInvestorNews('detail.updatedAt', language)}:{' '}
                    {formatDateTime(data.updatedAt)}
                  </span>
                </div>
              </header>

              {/* Body as simple pre-wrapped text */}
              <section
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.95rem',
                  color: palette.textPrimary,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {data.bodyMd}
              </section>

              {/* Attachments */}
              {data.attachments.length > 0 && (
                <section
                  style={{
                    marginTop: '1.1rem',
                    paddingTop: '1rem',
                    borderTop: `1px solid ${palette.neutralBorderMuted}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      fontWeight: typography.weights.semibold,
                      color: palette.textPrimary,
                    }}
                  >
                    {tInvestorNews('detail.attachments.title', language)}
                  </h2>
                  <ul
                    style={{
                      listStyle: 'none',
                      margin: 0,
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    {data.attachments.map(attachment => (
                      <li
                        key={attachment.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            color: palette.textSecondary,
                          }}
                        >
                          {attachment.name}
                        </span>
                        {attachment.downloadUrl && (
                          <a
                            href={attachment.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: '0.85rem',
                              color: palette.brandPrimaryStrong,
                              textDecoration: 'none',
                              fontWeight: 500,
                            }}
                          >
                            {tInvestorNews('detail.attachments.download', language)}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          )}
        </section>
      </div>
    </div>
  );
}


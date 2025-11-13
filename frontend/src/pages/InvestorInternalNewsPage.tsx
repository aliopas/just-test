import { useMemo, type CSSProperties } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette } from '../styles/theme';
import { tInvestorInternalNews } from '../locales/investorInternalNews';
import { useInvestorInternalNewsList } from '../hooks/useInvestorInternalNews';

function formatDate(value: string, locale: string) {
  try {
    return new Date(value).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return value;
  }
}

export function InvestorInternalNewsPage() {
  const { language, direction } = useLanguage();
  const locale = language === 'ar' ? 'ar-SA' : 'en-GB';
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useInvestorInternalNewsList({ page: 1, limit: 10 });

  const newsItems = useMemo(() => data?.news ?? [], [data]);
  const showEmptyState = !isLoading && !isError && newsItems.length === 0;

  return (
    <div
      style={{
        padding: '2.5rem 1.75rem 4rem',
        background: palette.backgroundBase,
        minHeight: '100vh',
        direction,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '2.1rem',
                fontWeight: 700,
                color: palette.textPrimary,
              }}
            >
              {tInvestorInternalNews('pageTitle', language)}
            </h1>
            <p
              style={{
                margin: '0.35rem 0 0',
                color: palette.textSecondary,
                maxWidth: '720px',
                lineHeight: 1.6,
              }}
            >
              {tInvestorInternalNews('pageSubtitle', language)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '0.85rem',
              border: `1px solid ${palette.brandSecondary}`,
              background: palette.brandSecondarySoft,
              color: palette.brandSecondary,
              fontWeight: 600,
              cursor: isFetching ? 'not-allowed' : 'pointer',
              opacity: isFetching ? 0.65 : 1,
            }}
          >
            {isFetching
              ? `${tInvestorInternalNews('refresh', language)}…`
              : tInvestorInternalNews('refresh', language)}
          </button>
        </div>
      </header>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {isLoading ? (
          <div style={stateCardStyle}>
            <span>{tInvestorInternalNews('loading', language)}</span>
          </div>
        ) : isError ? (
          <div style={stateCardStyle}>
            <span>{tInvestorInternalNews('error', language)}</span>
          </div>
        ) : showEmptyState ? (
          <div style={stateCardStyle}>
            <h3
              style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 700,
                color: palette.textPrimary,
              }}
            >
              {tInvestorInternalNews('emptyTitle', language)}
            </h3>
            <p
              style={{
                margin: '0.35rem 0 0',
                color: palette.textSecondary,
                fontSize: '0.95rem',
              }}
            >
              {tInvestorInternalNews('emptySubtitle', language)}
            </p>
          </div>
        ) : (
          newsItems.map(item => (
            <article key={item.id} style={newsCardStyle}>
              <header
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.45rem',
                    fontWeight: 700,
                    color: palette.textPrimary,
                  }}
                >
                  {item.title}
                </h2>
                <span
                  style={{
                    color: palette.textSecondary,
                    fontSize: '0.9rem',
                  }}
                >
                  {tInvestorInternalNews('card.publishedAt', language)}{' '}
                  {formatDate(item.publishedAt, locale)}
                </span>
              </header>
              {item.excerpt && (
                <p
                  style={{
                    margin: '0.8rem 0 0',
                    color: palette.textPrimary,
                    fontSize: '1rem',
                    lineHeight: 1.7,
                  }}
                >
                  {item.excerpt}
                </p>
              )}
              {item.attachments.length > 0 && (
                <section style={{ marginTop: '1.2rem' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: palette.textPrimary,
                    }}
                  >
                    {tInvestorInternalNews('attachments.title', language)}
                  </h3>
                  <ul style={attachmentListStyle}>
                    {item.attachments.map(attachment => (
                      <li key={attachment.id} style={attachmentItemStyle}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: palette.textPrimary,
                            }}
                          >
                            {attachment.name}
                          </span>
                          <span
                            style={{
                              color: palette.textSecondary,
                              fontSize: '0.85rem',
                            }}
                          >
                            {attachment.mimeType ?? '—'}
                          </span>
                        </div>
                        <a
                          href={attachment.downloadUrl ?? undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '0.55rem 1.2rem',
                            borderRadius: '0.75rem',
                            border: `1px solid ${palette.brandSecondary}`,
                            background: palette.brandSecondarySoft,
                            color: palette.brandSecondary,
                            fontWeight: 600,
                            textDecoration: 'none',
                            cursor: attachment.downloadUrl ? 'pointer' : 'not-allowed',
                            opacity: attachment.downloadUrl ? 1 : 0.6,
                          }}
                          aria-disabled={!attachment.downloadUrl}
                        >
                          {tInvestorInternalNews('attachments.download', language)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}

const stateCardStyle: CSSProperties = {
  padding: '2rem',
  borderRadius: '1rem',
  border: `1px dashed ${palette.brandSecondaryMuted}`,
  background: palette.backgroundSurface,
  color: palette.textSecondary,
  textAlign: 'center',
};

const newsCardStyle: CSSProperties = {
  border: `1px solid ${palette.neutralBorderSoft}`,
  borderRadius: '1.2rem',
  background: palette.backgroundSurface,
  padding: '1.75rem',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
};

const attachmentListStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: '0.85rem 0 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.7rem',
};

const attachmentItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.75rem',
  padding: '0.85rem 1rem',
  borderRadius: '0.85rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundBase,
};



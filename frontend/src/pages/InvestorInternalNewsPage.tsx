import { useMemo, type CSSProperties } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette } from '../styles/theme';
import { tInvestorInternalNews } from '../locales/investorInternalNews';
import { useInvestorInternalNewsList } from '../hooks/useInvestorInternalNews';
import type { InvestorInternalNewsAttachment } from '../types/news';
import { OptimizedImage } from '../components/OptimizedImage';
import { NEWS_IMAGES_BUCKET, resolveCoverUrl } from '../utils/supabase-storage';

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
        style={useMemo(() => ({
          display: newsItems.length === 0 ? 'flex' : 'grid',
          gridTemplateColumns: newsItems.length === 0 ? undefined : 'repeat(auto-fill, minmax(320px, 1fr))',
          flexDirection: newsItems.length === 0 ? 'column' : undefined,
          gap: '1.5rem',
        }), [newsItems.length])}
      >
        {isLoading ? (
          <div style={{ ...stateCardStyle, gridColumn: '1 / -1' } as CSSProperties}>
            <span>{tInvestorInternalNews('loading', language)}</span>
          </div>
        ) : isError ? (
          <div style={{ ...stateCardStyle, gridColumn: '1 / -1' } as CSSProperties}>
            <span>{tInvestorInternalNews('error', language)}</span>
          </div>
        ) : showEmptyState ? (
          <div style={{ ...stateCardStyle, gridColumn: '1 / -1' } as CSSProperties}>
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
          newsItems.map(item => {
            const coverUrl = resolveCoverUrl(item.coverKey, NEWS_IMAGES_BUCKET);
            const fallbackInitial =
              item.title?.trim().charAt(0).toUpperCase() || 'N';
            const imageAttachments = item.attachments.filter(
              (
                attachment
              ): attachment is InvestorInternalNewsAttachment & {
                downloadUrl: string;
              } =>
                attachment.type === 'image' && Boolean(attachment.downloadUrl)
            );
            const fileAttachments = item.attachments.filter(
              attachment => attachment.type !== 'image'
            );

            return (
              <article
                key={item.id}
                style={newsCardStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    '0 8px 20px rgba(15, 23, 42, 0.12)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 12px rgba(15, 23, 42, 0.08)';
                }}
              >
                <OptimizedImage
                  src={coverUrl}
                  alt={item.title}
                  aspectRatio={16 / 9}
                  fallbackText={fallbackInitial}
                  objectFit="cover"
                  style={{
                    borderRadius: '0.9rem',
                    background: palette.neutralBorderSoft,
                  }}
                />
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
                    fontSize: '1.35rem',
                    fontWeight: 700,
                    color: palette.textPrimary,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.title}
                </h2>
                <span
                  style={{
                    color: palette.textSecondary,
                    fontSize: '0.85rem',
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
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1,
                  }}
                >
                  {item.excerpt}
                </p>
              )}
              {imageAttachments.length > 0 && (
                <section style={{ marginTop: '0.5rem' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: palette.textPrimary,
                      marginBottom: '0.6rem',
                    }}
                  >
                    {tInvestorInternalNews(
                      'attachments.imagesTitle',
                      language
                    )}{' '}
                    ({imageAttachments.length})
                  </h3>
                  <div style={imageGalleryStyle}>
                    {imageAttachments.map(image => {
                      const imageFallback =
                        image.name?.trim().charAt(0).toUpperCase() ||
                        fallbackInitial;
                      return (
                        <OptimizedImage
                          key={image.id}
                          src={image.downloadUrl}
                          alt={image.name}
                          aspectRatio={4 / 3}
                          fallbackText={imageFallback}
                          objectFit="cover"
                          style={imageThumbnailStyle}
                        />
                      );
                    })}
                  </div>
                </section>
              )}
              {fileAttachments.length > 0 && (
                <section style={{ marginTop: '1rem' }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: palette.textPrimary,
                      marginBottom: '0.6rem',
                    }}
                  >
                    {tInvestorInternalNews(
                      'attachments.filesTitle',
                      language
                    )}{' '}
                    ({fileAttachments.length})
                  </h3>
                  <ul style={attachmentListStyle}>
                    {fileAttachments.map(attachment => (
                      <li key={attachment.id} style={attachmentItemStyle}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.2rem',
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 600,
                              color: palette.textPrimary,
                              fontSize: '0.9rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {attachment.name}
                          </span>
                          <span
                            style={{
                              color: palette.textSecondary,
                              fontSize: '0.8rem',
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
                            padding: '0.45rem 1rem',
                            borderRadius: '0.65rem',
                            border: `1px solid ${palette.brandSecondary}`,
                            background: palette.brandSecondarySoft,
                            color: palette.brandSecondary,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            cursor: attachment.downloadUrl ? 'pointer' : 'not-allowed',
                            opacity: attachment.downloadUrl ? 1 : 0.6,
                            whiteSpace: 'nowrap',
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
            );
          })
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
  padding: '1.5rem',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.9rem',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  cursor: 'pointer',
  height: '100%',
};

const imageGalleryStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
  gap: '0.8rem',
};

const imageThumbnailStyle: CSSProperties = {
  borderRadius: '0.75rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundBase,
};

const attachmentListStyle: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.6rem',
};

const attachmentItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.6rem',
  padding: '0.7rem 0.85rem',
  borderRadius: '0.75rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundBase,
};



import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams } from 'next/navigation';
import { useNextNavigate } from '../utils/next-router';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorNewsDetail, useInvestorRelatedNews } from '../hooks/useSupabaseNews';
import { tInvestorNews } from '../locales/investorNews';
import { formatInvestorDateTime } from '../utils/date';
import { analytics } from '../utils/analytics';
import { PageContainer } from '../components/ui/PageContainer';
import { Card } from '../components/ui/Card';
import { BackButton } from '../components/ui/BackButton';

export function InvestorNewsDetailPage() {
  const { language, direction } = useLanguage();
  const params = useParams<{ id?: string }>();
  const navigate = useNextNavigate();
  const id = params?.id;

  const { data, isLoading, isError, refetch } = useInvestorNewsDetail(id ?? null);
  const related = useInvestorRelatedNews({
    currentId: id ?? null,
    categoryId: data?.categoryId ?? null,
    limit: 3,
  });

  const [shareUrl, setShareUrl] = React.useState('');
  const [copyStatus, setCopyStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  React.useEffect(() => {
    if (data?.id) {
      analytics.track('investor_news_view', {
        id: data.id,
        title: data.title,
        language,
      });
    }
  }, [data?.id, data?.title, language]);

  const markdownComponents: Components = {
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      // نستخدم h2 بدل h1 داخل المتن للحفاظ على h1 واحد في الصفحة (عنوان الخبر)
      <h2
        style={{
          marginTop: '1.25rem',
          marginBottom: '0.5rem',
          fontWeight: typography.weights.bold,
          color: palette.textPrimary,
          fontSize: '1.4rem',
        }}
        {...props}
      />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h3
        style={{
          marginTop: '1.25rem',
          marginBottom: '0.5rem',
          fontWeight: typography.weights.bold,
          color: palette.textPrimary,
          fontSize: '1.25rem',
        }}
        {...props}
      />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h4
        style={{
          marginTop: '1.25rem',
          marginBottom: '0.5rem',
          fontWeight: typography.weights.bold,
          color: palette.textPrimary,
          fontSize: '1.1rem',
        }}
        {...props}
      />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p
        style={{
          margin: '0.45rem 0',
        }}
        {...props}
      />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul
        style={{
          margin: '0.5rem 1.25rem',
          paddingInlineStart: '1.75rem',
        }}
        {...props}
      />
    ),
    ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
      <ol
        style={{
          margin: '0.5rem 1.25rem',
          paddingInlineStart: '1.75rem',
        }}
        {...props}
      />
    ),
  };

  const formatDateTime = (value: string) => formatInvestorDateTime(value, language);

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopyStatus('success');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      window.setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <PageContainer direction={direction} maxWidth={800}>
      {/* Back link */}
      <BackButton
        direction={direction}
        onClick={() => {
          if (typeof window !== 'undefined' && window.history.length > 1) {
            navigate(-1);
          } else {
            navigate('/investor/news');
          }
        }}
      >
        {tInvestorNews('detail.back', language)}
      </BackButton>

      <Card>
          {/* حالة عدم وجود معرّف صالح في المسار */}
          {!id && !isLoading && !isError && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: palette.textSecondary,
                }}
              >
                {tInvestorNews('detail.missingId', language)}
              </p>
              <button
                type="button"
                onClick={() => navigate('/investor/news')}
                style={{
                  alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-start',
                  padding: '0.4rem 0.8rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: palette.backgroundBase,
                  color: palette.textSecondary,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {tInvestorNews('detail.back', language)}
              </button>
            </div>
          )}

          {isLoading && (
            <article
              aria-busy="true"
              aria-label={tInvestorNews('detail.loading', language)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
              }}
            >
              
              {/* Skeleton للعنوان والتواريخ - موحّد مع باقي الصفحات */}
              <header>
                <div
                  style={{
                    width: '70%',
                    height: '1.8rem',
                    borderRadius: radius.md,
                    background: palette.neutralBorderMuted,
                    marginBottom: '0.6rem',
                    animation: 'pulse 1.6s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      width: '9rem',
                      height: '0.9rem',
                      borderRadius: radius.md,
                      background: palette.neutralBorderMuted,
                      animation: 'pulse 1.6s ease-in-out infinite',
                      animationDelay: '0.05s',
                    }}
                  />
                  <div
                    style={{
                      width: '7rem',
                      height: '0.9rem',
                      borderRadius: radius.md,
                      background: palette.neutralBorderMuted,
                      animation: 'pulse 1.6s ease-in-out infinite',
                      animationDelay: '0.1s',
                    }}
                  />
                </div>
              </header>

              {/* Skeleton لمحتوى المقال */}
              <section
                style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                {[0, 1, 2, 3].map(i => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    style={{
                      width: i === 3 ? '60%' : '100%',
                      height: '1rem',
                      borderRadius: radius.md,
                      background: palette.neutralBorderMuted,
                      animation: 'pulse 1.6s ease-in-out infinite',
                      animationDelay: `${0.15 + i * 0.05}s`,
                    }}
                  />
                ))}
              </section>
            </article>
          )}

          {isError && !isLoading && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: palette.error,
                }}
              >
                {tInvestorNews('detail.error', language)}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                style={{
                  alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-start',
                  padding: '0.4rem 0.8rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.brandPrimaryStrong}`,
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                {tInvestorNews('detail.retry', language)}
              </button>
            </div>
          )}

          {/* حالة عدم وجود بيانات بعد الجلب */}
          {!isLoading && !isError && id && !data && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '0.95rem',
                  color: palette.textSecondary,
                }}
              >
                {tInvestorNews('detail.noData', language)}
              </p>
              <button
                type="button"
                onClick={() => navigate('/investor/news')}
                style={{
                  alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-start',
                  padding: '0.4rem 0.8rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: palette.backgroundBase,
                  color: palette.textSecondary,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {tInvestorNews('detail.back', language)}
              </button>
            </div>
          )}

          {!isLoading && !isError && data && (
            <article
              aria-labelledby="investor-news-detail-title"
              dir={direction}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.9rem',
              }}
            >
              <header>
                <h1
                  id="investor-news-detail-title"
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
                  {data.updatedAt && (
                    <span>
                      {tInvestorNews('detail.updatedAt', language)}:{' '}
                      {formatDateTime(data.updatedAt)}
                    </span>
                  )}
                </div>
              </header>

              {/* Body - Markdown render مع دعم GFM (عناوين، قوائم، إلخ) */}
              <section
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.95rem',
                  color: palette.textPrimary,
                  lineHeight: 1.7,
                  wordBreak: 'break-word',
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {data.bodyMd}
                </ReactMarkdown>
              </section>

              {/* Share section */}
              {shareUrl && (
                <section
                  style={{
                    marginTop: '1.25rem',
                    paddingTop: '0.75rem',
                    borderTop: `1px solid ${palette.neutralBorderMuted}`,
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: typography.weights.medium,
                      color: palette.textSecondary,
                    }}
                  >
                    {tInvestorNews('detail.share.title', language)}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    {(() => {
                      const baseUrl = shareUrl;
                      const buildShareLink = (source: string) => {
                        const separator = baseUrl.includes('?') ? '&' : '?';
                        return `${baseUrl}${separator}utm_source=${source}&utm_medium=share&utm_campaign=investor_news_detail`;
                      };

                      const encodedWhatsappUrl = encodeURIComponent(buildShareLink('whatsapp'));
                      const encodedTwitterUrl = encodeURIComponent(buildShareLink('twitter'));
                      const encodedLinkedinUrl = encodeURIComponent(buildShareLink('linkedin'));
                      const encodedTitle = encodeURIComponent(data.title);
                      return (
                        <>
                          <a
                            href={`https://wa.me/?text=${encodedTitle}%20-%20${encodedWhatsappUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: radius.md,
                              border: `1px solid #25D366`,
                              background: '#25D36610',
                              color: '#25D366',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            WhatsApp
                          </a>
                          <a
                            href={`https://twitter.com/intent/tweet?url=${encodedTwitterUrl}&text=${encodedTitle}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: radius.md,
                              border: `1px solid #1DA1F2`,
                              background: '#1DA1F210',
                              color: '#1DA1F2',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            X (Twitter)
                          </a>
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedLinkedinUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              padding: '0.4rem 0.8rem',
                              borderRadius: radius.md,
                              border: `1px solid #0A66C2`,
                              background: '#0A66C210',
                              color: '#0A66C2',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textDecoration: 'none',
                            }}
                          >
                            LinkedIn
                          </a>
                        </>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: radius.md,
                        border: `1px solid ${palette.neutralBorderMuted}`,
                        background: palette.backgroundBase,
                        color: palette.textSecondary,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                      }}
                    >
                      {tInvestorNews('detail.share.copy', language)}
                    </button>
                  </div>
                  {copyStatus === 'success' && (
                    <p
                      style={{
                        margin: '0.35rem 0 0',
                        fontSize: '0.8rem',
                        color: palette.textSecondary,
                      }}
                    >
                      {tInvestorNews('detail.share.copied', language)}
                    </p>
                  )}
                </section>
              )}

              {/* Note: Attachments are not included in this simplified response */}
              {/* Related news */}
              {related.data.length > 0 && (
                <section
                  style={{
                    marginTop: '1.75rem',
                    paddingTop: '1.25rem',
                    borderTop: `1px solid ${palette.neutralBorderMuted}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem',
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
                    {tInvestorNews('detail.related.title', language)}
                  </h2>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '0.9rem',
                    }}
                  >
                    {related.data.map(item => (
                      <article
                        key={item.id}
                        style={{
                          borderRadius: radius.md,
                          border: `1px solid ${palette.neutralBorderMuted}`,
                          background: palette.backgroundSurface,
                          padding: '0.8rem 0.9rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.4rem',
                        }}
                      >
                        <a
                          href={`/news/${item.slug || item.id}`}
                          style={{
                            textDecoration: 'none',
                            color: palette.textPrimary,
                            fontSize: '0.95rem',
                            fontWeight: typography.weights.medium,
                          }}
                        >
                          {item.title}
                        </a>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: palette.textSecondary,
                          }}
                        >
                          {formatDateTime(item.publishedAt)}
                        </span>
                        {item.excerpt && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: '0.85rem',
                              color: palette.textSecondary,
                            }}
                          >
                            {item.excerpt}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </article>
          )}
          <style>
            {`
              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.5;
                }
              }
            `}
          </style>
      </Card>
    </PageContainer>
  );
}


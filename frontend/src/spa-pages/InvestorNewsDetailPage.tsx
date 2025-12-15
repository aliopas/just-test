import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams } from 'next/navigation';
import { useNextNavigate } from '../utils/next-router';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorNewsDetail } from '../hooks/useSupabaseNews';
import { tInvestorNews } from '../locales/investorNews';

export function InvestorNewsDetailPage() {
  const { language, direction } = useLanguage();
  const params = useParams<{ id?: string }>();
  const navigate = useNextNavigate();
  const id = params?.id;

  const { data, isLoading, isError } = useInvestorNewsDetail(id ?? null);

  const markdownComponents: Components = {
    h1: ({ node, ...props }) => (
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
    h2: ({ node, ...props }) => (
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
    h3: ({ node, ...props }) => (
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
    p: ({ node, ...props }) => (
      <p
        style={{
          margin: '0.45rem 0',
        }}
        {...props}
      />
    ),
    ul: ({ node, ordered, ...props }) => (
      <ul
        style={{
          margin: '0.5rem 1.25rem',
          paddingInlineStart: '1.75rem',
        }}
        {...props}
      />
    ),
    ol: ({ node, ordered, ...props }) => (
      <ol
        style={{
          margin: '0.5rem 1.25rem',
          paddingInlineStart: '1.75rem',
        }}
        {...props}
      />
    ),
  };

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
          onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              navigate(-1);
            } else {
              navigate('/investor/news');
            }
          }}
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
              {/* Skeleton للعنوان والتواريخ */}
              <header>
                <div
                  style={{
                    width: '70%',
                    height: '1.6rem',
                    borderRadius: radius.sm,
                    background: palette.neutralBorderMuted,
                    marginBottom: '0.6rem',
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
                      borderRadius: radius.sm,
                      background: palette.neutralBorderMuted,
                    }}
                  />
                  <div
                    style={{
                      width: '7rem',
                      height: '0.9rem',
                      borderRadius: radius.sm,
                      background: palette.neutralBorderMuted,
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
                  gap: '0.5rem',
                }}
              >
                {[0, 1, 2, 3].map(i => (
                  <div
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    style={{
                      width: i === 3 ? '60%' : '100%',
                      height: '0.9rem',
                      borderRadius: radius.sm,
                      background: palette.neutralBorderMuted,
                    }}
                  />
                ))}
              </section>
            </article>
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

              {/* Note: Attachments are not included in this simplified response */}
            </article>
          )}
        </section>
      </div>
    </div>
  );
}


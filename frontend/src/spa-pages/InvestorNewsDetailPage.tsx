import React from 'react';
import { useParams } from 'next/navigation';
import { useNextNavigate } from '../utils/next-router';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorNewsDetail } from '../hooks/useSupabaseNews';
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
                  {data.updatedAt && (
                    <span>
                      {tInvestorNews('detail.updatedAt', language)}:{' '}
                      {formatDateTime(data.updatedAt)}
                    </span>
                  )}
                </div>
              </header>

              {/* Body - basic Markdown render (عناوين + فقرات + قوائم) */}
              <section
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.95rem',
                  color: palette.textPrimary,
                  lineHeight: 1.7,
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
                            paddingInlineStart: '1.75rem',
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
                      <p key={index} style={{ margin: '0.45rem 0' }}>
                        {text}
                      </p>
                    );
                  })}
              </section>

              {/* Note: Attachments are not included in this simplified response */}
            </article>
          )}
        </section>
      </div>
    </div>
  );
}


import { useEffect, useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useLanguage, LanguageProvider } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useInvestorNewsDetail } from '../hooks/useInvestorNews';
import { tInvestorNews } from '../locales/investorNews';

const queryClient = new QueryClient();

function resolveNewsId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const segments = window.location.pathname
    .split('/')
    .filter(Boolean);
  return segments[segments.length - 1] ?? null;
}

function formatDate(
  value: string | null,
  language: 'ar' | 'en'
): string | null {
  if (!value) {
    return null;
  }

  try {
    return new Date(value).toLocaleString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  } catch {
    return value;
  }
}

function resolveCoverUrl(coverKey: string | null): string | null {
  if (!coverKey) {
    return null;
  }

  const base =
    (typeof window !== 'undefined' &&
      window.__ENV__?.SUPABASE_STORAGE_URL) ??
    import.meta.env.VITE_SUPABASE_STORAGE_URL ??
    '';

  if (!base) {
    return null;
  }

  return `${base.replace(/\/$/, '')}/${coverKey}`;
}

function renderMarkdown(
  markdown: string,
  language: 'ar' | 'en'
) {
  const blocks = markdown.split(/\n{2,}/);

  return blocks
    .map(block => block.trim())
    .filter(Boolean)
    .map((block, index) => {
      const headingMatch = block.match(/^#{1,6}\s+/);
      if (headingMatch) {
        const level = Math.min(headingMatch[0].trim().length, 6);
        const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
        const text = block.slice(headingMatch[0].length).trim();
        return (
          <HeadingTag
            key={`heading-${index}`}
            style={{
              marginTop: index === 0 ? 0 : '1.75rem',
              color: 'var(--color-text-primary)',
              fontWeight: 700,
              lineHeight: 1.4,
              direction: language === 'ar' ? 'rtl' : 'ltr',
            }}
          >
            {text}
          </HeadingTag>
        );
      }

      if (/^[-*]\s+/m.test(block)) {
        const items = block
          .split('\n')
          .map(item => item.trim())
          .filter(line => /^[-*]\s+/.test(line))
          .map(line => line.replace(/^[-*]\s+/, '').trim());

        return (
          <ul
            key={`list-${index}`}
            style={{
              margin: '1rem 0',
              paddingInlineStart: language === 'ar' ? '1.5rem' : '2rem',
              lineHeight: 1.6,
            }}
          >
            {items.map((item, itemIndex) => (
              <li key={`list-item-${index}-${itemIndex}`}>{item}</li>
            ))}
          </ul>
        );
      }

      return (
        <p
          key={`paragraph-${index}`}
          style={{
            margin: '1rem 0',
            color: 'var(--color-text-primary)',
            fontSize: '1.05rem',
            lineHeight: 1.8,
            whiteSpace: 'pre-line',
            direction: language === 'ar' ? 'rtl' : 'ltr',
          }}
        >
          {block}
        </p>
      );
    });
}

function InvestorNewsDetailPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const newsId = useMemo(resolveNewsId, []);

  const { data, isLoading, isError } = useInvestorNewsDetail(newsId);

  useEffect(() => {
    if (!isError) {
      return;
    }

    pushToast({
      message: tInvestorNews('toast.detailError', language),
      variant: 'error',
    });
  }, [isError, pushToast, language]);

  const coverUrl = resolveCoverUrl(data?.coverKey ?? null);
  const publishedAt = formatDate(data?.publishedAt ?? null, language);
  const updatedAt =
    data?.updatedAt && data?.updatedAt !== data?.publishedAt
      ? formatDate(data.updatedAt, language)
      : null;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-background-surface)',
      }}
    >
      <header
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 1.5rem',
          direction,
        }}
      >
        <a
          href="/app/news"
          style={{
            display: 'inline-block',
            marginBottom: '1.5rem',
            color: 'var(--color-brand-primary-strong)',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {tInvestorNews('detail.back', language)}
        </a>

        {isLoading && (
          <p
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '1.05rem',
            }}
          >
            {tInvestorNews('detail.loading', language)}
          </p>
        )}

        {!isLoading && !data && (
          <p
            style={{
              color: '#DC2626',
              fontWeight: 600,
            }}
          >
            {tInvestorNews('detail.error', language)}
          </p>
        )}

        {data && (
          <>
            <h1
              style={{
                margin: 0,
                fontSize: '2.4rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                lineHeight: 1.3,
              }}
            >
              {data.title}
            </h1>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
              }}
            >
              {publishedAt && (
                <span>
                  {tInvestorNews('detail.publishedAt', language)}: {publishedAt}
                </span>
              )}
              {updatedAt && (
                <span>
                  {tInvestorNews('detail.updatedAt', language)}: {updatedAt}
                </span>
              )}
            </div>
          </>
        )}
      </header>

      {coverUrl && (
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0 1.5rem',
          }}
        >
          <img
            src={coverUrl}
            alt={data?.title ?? 'Cover image'}
            style={{
              width: '100%',
              borderRadius: '1.2rem',
              boxShadow: '0 25px 55px rgba(15, 23, 42, 0.18)',
              objectFit: 'cover',
            }}
          />
        </div>
      )}

      {data && (
        <article
          style={{
            maxWidth: '900px',
            margin: '2.5rem auto 4rem',
            padding: '0 1.5rem',
            color: 'var(--color-text-primary)',
            direction,
          }}
        >
          {renderMarkdown(data.bodyMd, language)}
        </article>
      )}
    </div>
  );
}

export function InvestorNewsDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <InvestorNewsDetailPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}



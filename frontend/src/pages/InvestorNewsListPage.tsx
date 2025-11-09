import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useLanguage, LanguageProvider } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useInvestorNewsList } from '../hooks/useInvestorNews';
import type { InvestorNewsItem } from '../types/news';
import { tInvestorNews } from '../locales/investorNews';
import { palette } from '../styles/theme';

const queryClient = new QueryClient();
const PAGE_LIMIT = 12;

function formatDate(value: string, language: 'ar' | 'en') {
  try {
    return new Date(value).toLocaleDateString(
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

function InvestorNewsListPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InvestorNewsItem[]>([]);

  const { data, isLoading, isFetching, isError } = useInvestorNewsList({
    page,
    limit: PAGE_LIMIT,
  });

  useEffect(() => {
    if (!isError) {
      return;
    }

    pushToast({
      message: tInvestorNews('toast.loadError', language),
      variant: 'error',
    });
  }, [isError, pushToast, language]);

  useEffect(() => {
    if (!data) {
      return;
    }

    setItems(prev => {
      if (page === 1) {
        return data.news;
      }

      const existing = new Set(prev.map(item => item.id));
      const merged = [...prev];
      data.news.forEach(item => {
        if (!existing.has(item.id)) {
          merged.push(item);
        }
      });
      return merged;
    });
  }, [data, page]);

  const hasMore = data?.meta.hasNext ?? false;
  const isEmpty = !isLoading && items.length === 0;

  const headingStyles = useMemo<CSSProperties>(
    () => ({
      direction,
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '2.5rem 1.5rem 1rem',
      textAlign: direction === 'rtl' ? 'right' : 'left',
    }),
    [direction]
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.backgroundBase,
      }}
    >
      <header style={headingStyles}>
        <h1
          style={{
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: 700,
            color: palette.textPrimary,
            letterSpacing: direction === 'rtl' ? 0 : '0.01em',
          }}
        >
          {tInvestorNews('pageTitle', language)}
        </h1>
        <p
          style={{
            marginTop: '0.75rem',
            fontSize: '1.05rem',
            color: palette.textSecondary,
            lineHeight: 1.6,
            maxWidth: '680px',
          }}
        >
          {tInvestorNews('pageSubtitle', language)}
        </p>
      </header>

      <main
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
          direction,
        }}
      >
        {isEmpty && (
          <div
            style={{
              borderRadius: '1.2rem',
              border: `1px dashed ${palette.brandSecondarySoft}`,
              background: palette.backgroundSurface,
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              color: palette.textSecondary,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: 700,
                color: palette.textPrimary,
              }}
            >
              {tInvestorNews('list.emptyTitle', language)}
            </h2>
            <p
              style={{
                marginTop: '0.75rem',
                fontSize: '1rem',
                lineHeight: 1.6,
              }}
            >
              {tInvestorNews('list.emptySubtitle', language)}
            </p>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {items.map(item => {
            const coverUrl = resolveCoverUrl(item.coverKey);
            return (
              <article
                key={item.id}
                style={{
                  background: palette.backgroundSurface,
                  borderRadius: '1.2rem',
                  boxShadow: '0 20px 50px rgba(4, 44, 84, 0.12)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100%',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    background: coverUrl ? palette.backgroundInverse : palette.neutralBorder,
                  }}
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={item.title}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: palette.brandSecondaryMuted,
                        background: `linear-gradient(135deg, ${palette.neutralBorder} 0%, ${palette.backgroundSurface} 100%)`,
                      }}
                    >
                      {item.title.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    flexGrow: 1,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: palette.textSecondary,
                    }}
                  >
                    {formatDate(item.publishedAt, language)}
                  </p>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: '1.35rem',
                      color: palette.textPrimary,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: palette.textSecondary,
                      lineHeight: 1.6,
                      fontSize: '0.98rem',
                      flexGrow: 1,
                    }}
                  >
                    {item.excerpt ?? ''}
                  </p>
                  <a
                    href={`/app/news/${item.id}`}
                    style={{
                      marginTop: 'auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
                      gap: '0.35rem',
                      fontWeight: 600,
                      color: palette.brandPrimaryStrong,
                      textDecoration: 'none',
                    }}
                  >
                    {tInvestorNews('card.readMore', language)}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {hasMore && (
          <div
            style={{
              marginTop: '2.5rem',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => setPage(current => current + 1)}
              disabled={isFetching}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '0.85rem 2.4rem',
                fontWeight: 600,
                fontSize: '1rem',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                boxShadow: '0 18px 35px rgba(44, 116, 204, 0.25)',
                cursor: isFetching ? 'not-allowed' : 'pointer',
                opacity: isFetching ? 0.6 : 1,
              }}
            >
              {isFetching
                ? `${tInvestorNews('list.loadMore', language)}â€¦`
                : tInvestorNews('list.loadMore', language)}
            </button>
          </div>
        )}

        {isLoading && items.length === 0 && (
          <div
            style={{
              marginTop: '2rem',
              color: palette.textSecondary,
              textAlign: 'center',
            }}
          >
            {tInvestorNews('detail.loading', language)}
          </div>
        )}
      </main>
    </div>
  );
}

export function InvestorNewsListPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <InvestorNewsListPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}



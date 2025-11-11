import { useEffect, useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { palette } from '../styles/theme';
import { tInvestorStocks } from '../locales/investorStocks';
import { useInvestorStockFeed } from '../hooks/useInvestorStockFeed';
import type {
  InvestorStockFeed,
  InvestorStockSnapshot,
} from '../types/stocks';
import type { InvestorLanguage } from '../types/investor';

const queryClient = new QueryClient();

function formatPrice(
  value: number,
  currency: string,
  language: InvestorLanguage
) {
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function formatVolume(value: number, language: InvestorLanguage) {
  const formatter = new Intl.NumberFormat(
    language === 'ar' ? 'ar-SA' : 'en-US',
    {
      maximumFractionDigits: 0,
    }
  );

  if (Math.abs(value) >= 1_000_000_000) {
    return `${formatter.format(value / 1_000_000_000)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${formatter.format(value / 1_000_000)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${formatter.format(value / 1_000)}K`;
  }
  return formatter.format(value);
}

function formatDate(value: string, language: InvestorLanguage) {
  try {
    return new Date(value).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  } catch {
    return value;
  }
}

function formatDateTime(value: string, language: InvestorLanguage) {
  try {
    return new Date(value).toLocaleString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    );
  } catch {
    return value;
  }
}

function PriceSparkline({
  data,
  color,
}: {
  data: InvestorStockSnapshot[];
  color: string;
}) {
  if (data.length === 0) {
    return null;
  }

  const closes = data.map(point => point.close);
  const max = Math.max(...closes, 1);
  const min = Math.min(...closes, 0);
  const range = max - min || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const normalized = (point.close - min) / range;
    const y = 100 - normalized * 100;
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '160px' }}
    >
      <defs>
        <linearGradient id="sparkline-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={`${color}55`} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <polygon
        fill="url(#sparkline-fill)"
        stroke="none"
        points={`0,100 ${points.join(' ')} 100,100`}
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points.join(' ')}
      />
    </svg>
  );
}

function SummaryTile({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div
      style={{
        background: palette.backgroundSurface,
        borderRadius: '1.2rem',
        border: `1px solid ${palette.neutralBorderSoft}`,
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        minHeight: '120px',
        boxShadow: '0 18px 42px rgba(15, 23, 42, 0.08)',
      }}
    >
      <span
        style={{
          color: palette.textSecondary,
          fontSize: '0.9rem',
        }}
      >
        {label}
      </span>
      <strong
        style={{
          color: palette.textPrimary,
          fontSize: '1.45rem',
          fontWeight: 700,
          letterSpacing: '0.01em',
        }}
      >
        {value}
      </strong>
      {helper && (
        <span
          style={{
            color: palette.textSecondary,
            fontSize: '0.8rem',
          }}
        >
          {helper}
        </span>
      )}
    </div>
  );
}

function InvestorStocksPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useInvestorStockFeed();

  useEffect(() => {
    if (!isError) {
      return;
    }
    console.error('Failed to load investor stock feed', error);
    pushToast({
      message: tInvestorStocks('toast.loadError', language),
      variant: 'error',
    });
  }, [isError, error, pushToast, language]);

  const feed: InvestorStockFeed | null = data ?? null;
  const timeline = feed?.timeline ?? [];

  const chartData = useMemo<InvestorStockSnapshot[]>(() => {
    if (!timeline.length) {
      return [];
    }
    return timeline.slice(-45);
  }, [timeline]);

  const recentSessions = useMemo<InvestorStockSnapshot[]>(() => {
    if (!timeline.length) {
      return [];
    }
    return [...timeline].slice(-10).reverse();
  }, [timeline]);

  const bestSession = useMemo<InvestorStockSnapshot | null>(() => {
    if (!timeline.length) {
      return null;
    }
    return timeline.reduce<InvestorStockSnapshot>((best, point) => {
      if (point.close > best.close) {
        return point;
      }
      return best;
    }, timeline[0]);
  }, [timeline]);

  const worstSession = useMemo<InvestorStockSnapshot | null>(() => {
    if (!timeline.length) {
      return null;
    }
    return timeline.reduce<InvestorStockSnapshot>((worst, point) => {
      if (point.close < worst.close) {
        return point;
      }
      return worst;
    }, timeline[0]);
  }, [timeline]);

  const changeColor = (() => {
    const change = feed?.latest.change ?? 0;
    if (change > 0) {
      return '#0F9D58';
    }
    if (change < 0) {
      return '#E11D48';
    }
    return palette.textSecondary;
  })();

  const trendLabel = tInvestorStocks(
    feed?.insights.trend === 'up'
      ? 'trend.up'
      : feed?.insights.trend === 'down'
        ? 'trend.down'
        : 'trend.flat',
    language
  );

  const currency = feed?.currency ?? 'SAR';

  const summaryTiles = feed
    ? [
        {
          label: tInvestorStocks('summary.rangeTitle', language),
          value: feed
            ? `${formatPrice(
                feed.insights.rangeLow30d,
                currency,
                language
              )} — ${formatPrice(feed.insights.rangeHigh30d, currency, language)}`
            : '—',
        },
        {
          label: tInvestorStocks('summary.volumeTitle', language),
          value: formatVolume(feed.insights.averageVolume30d, language),
        },
        {
          label: tInvestorStocks('summary.trendTitle', language),
          value: trendLabel,
        },
        {
          label: tInvestorStocks('summary.movingAverageTitle', language),
          value: `${formatPrice(
            feed.insights.movingAverage7d,
            currency,
            language
          )} · ${formatPrice(
            feed.insights.movingAverage30d,
            currency,
            language
          )}`,
          helper: tInvestorStocks('summary.movingAverageSubtitle', language),
        },
      ]
    : [];

  return (
    <main
      style={{
        direction,
        background: palette.backgroundBase,
        minHeight: 'calc(100vh - 180px)',
        padding: '2.5rem 2rem 4rem',
      }}
    >
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            textAlign: direction === 'rtl' ? 'right' : 'left',
          }}
        >
          <h1
            style={{
              margin: 0,
              color: palette.textPrimary,
              fontSize: '2.4rem',
              fontWeight: 700,
              letterSpacing: direction === 'rtl' ? 0 : '0.01em',
            }}
          >
            {tInvestorStocks('pageTitle', language)}
          </h1>
          <p
            style={{
              margin: 0,
              color: palette.textSecondary,
              fontSize: '1.05rem',
              lineHeight: 1.7,
              maxWidth: '720px',
            }}
          >
            {tInvestorStocks('pageSubtitle', language)}
          </p>
        </header>

        <article
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.5rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            padding: '2rem',
            display: 'flex',
            flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
            gap: '2rem',
            flexWrap: 'wrap',
            alignItems: 'stretch',
            boxShadow: '0 28px 60px rgba(4, 44, 84, 0.12)',
          }}
        >
          <div
            style={{
              flex: '1 1 280px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tInvestorStocks('hero.latestPrice', language)}
              </span>
              <strong
                style={{
                  color: palette.textPrimary,
                  fontSize: '3.4rem',
                  fontWeight: 700,
                  letterSpacing: direction === 'rtl' ? 0 : '0.015em',
                }}
              >
                {feed
                  ? formatPrice(feed.latest.price, currency, language)
                  : '—'}
              </strong>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.9rem',
                }}
              >
                {tInvestorStocks('hero.dailyChange', language)}
              </span>
              <strong
                style={{
                  color: changeColor,
                  fontSize: '1.4rem',
                  fontWeight: 700,
                }}
              >
                {feed
                  ? `${feed.latest.change > 0 ? '+' : ''}${formatPrice(
                      feed.latest.change,
                      currency,
                      language
                    )} (${feed.latest.changePercent > 0 ? '+' : ''}${feed.latest.changePercent.toFixed(2)}%)`
                  : '—'}
              </strong>
            </div>
            <div
              style={{
                display: 'grid',
                gap: '0.45rem',
                fontSize: '0.9rem',
                color: palette.textSecondary,
              }}
            >
              <span>
                {tInvestorStocks('hero.updatedAt', language)}:{' '}
                <strong style={{ color: palette.textPrimary }}>
                  {feed
                    ? formatDateTime(feed.latest.recordedAt, language)
                    : '—'}
                </strong>
              </span>
              <span>
                {tInvestorStocks('hero.previousClose', language)}:{' '}
                <strong style={{ color: palette.textPrimary }}>
                  {feed?.latest.previousClose != null
                    ? formatPrice(
                        feed.latest.previousClose,
                        currency,
                        language
                      )
                    : '—'}
                </strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              style={{
                alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-end',
                border: 'none',
                borderRadius: '999px',
                padding: '0.55rem 1.6rem',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isFetching ? 'progress' : 'pointer',
                boxShadow: '0 12px 24px rgba(37, 99, 235, 0.25)',
              }}
            >
              {isFetching
                ? language === 'ar'
                  ? 'جارٍ التحديث…'
                  : 'Refreshing…'
                : language === 'ar'
                  ? 'تحديث الآن'
                  : 'Refresh now'}
            </button>
          </div>
          <div
            style={{
              flex: '1 1 320px',
              minWidth: '260px',
              background: palette.backgroundAlt,
              borderRadius: '1.1rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
              padding: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isLoading ? (
              <div
                style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '1rem',
                  background: palette.neutralBorderSoft,
                  opacity: 0.6,
                  animation: 'pulse 1.2s ease-in-out infinite',
                }}
              />
            ) : (
              <PriceSparkline
                data={chartData}
                color={
                  feed?.insights.trend === 'down'
                    ? '#E11D48'
                    : feed?.insights.trend === 'flat'
                      ? palette.brandSecondary
                      : '#0F9D58'
                }
              />
            )}
          </div>
        </article>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`summary-skeleton-${index}`}
                  style={{
                    background: palette.backgroundSurface,
                    borderRadius: '1.2rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    padding: '1.4rem',
                    minHeight: '120px',
                    animation: 'pulse 1.2s ease-in-out infinite',
                  }}
                />
              ))
            : summaryTiles.map(tile => (
                <SummaryTile
                  key={tile.label}
                  label={tile.label}
                  value={tile.value}
                  helper={tile.helper}
                />
              ))}
        </section>

        <article
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.4rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            padding: '1.8rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
            boxShadow: '0 22px 48px rgba(4, 44, 84, 0.1)',
          }}
        >
          <header
            style={{
              display: 'flex',
              flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: palette.textPrimary,
                  fontSize: '1.5rem',
                  fontWeight: 700,
                }}
              >
                {tInvestorStocks('insights.title', language)}
              </h2>
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tInvestorStocks('summary.movingAverageSubtitle', language)}
              </span>
            </div>
          </header>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`insight-skeleton-${index}`}
                  style={{
                    background: palette.backgroundAlt,
                    borderRadius: '1.2rem',
                    height: '120px',
                    animation: 'pulse 1.2s ease-in-out infinite',
                  }}
                />
              ))
            ) : (
              <>
                <SummaryTile
                  label={tInvestorStocks('insights.volatility', language)}
                  value={`${feed?.insights.volatility30d.toFixed(2) ?? '0.00'}`}
                />
                <SummaryTile
                  label={tInvestorStocks('insights.bestDay', language)}
                  value={
                    feed?.insights.bestDay
                      ? formatDate(feed.insights.bestDay, language)
                      : '—'
                  }
                  helper={
                    bestSession
                      ? formatPrice(bestSession.close, currency, language)
                      : undefined
                  }
                />
                <SummaryTile
                  label={tInvestorStocks('insights.worstDay', language)}
                  value={
                    feed?.insights.worstDay
                      ? formatDate(feed.insights.worstDay, language)
                      : '—'
                  }
                  helper={
                    worstSession
                      ? formatPrice(worstSession.close, currency, language)
                      : undefined
                  }
                />
              </>
            )}
          </div>
        </article>

        <article
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.4rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            padding: '1.8rem',
            boxShadow: '0 22px 48px rgba(4, 44, 84, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem',
          }}
        >
          <header
            style={{
              display: 'flex',
              flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                color: palette.textPrimary,
                fontSize: '1.45rem',
                fontWeight: 700,
              }}
            >
              {tInvestorStocks('timeline.title', language)}
            </h2>
          </header>
          {isLoading ? (
            <div
              style={{
                height: '200px',
                borderRadius: '1.1rem',
                background: palette.backgroundAlt,
                animation: 'pulse 1.2s ease-in-out infinite',
              }}
            />
          ) : recentSessions.length === 0 ? (
            <div
              style={{
                borderRadius: '1.1rem',
                border: `1px dashed ${palette.brandSecondarySoft}`,
                background: palette.backgroundAlt,
                padding: '2.2rem 1.6rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: '0.95rem',
              }}
            >
              {tInvestorStocks('timeline.empty', language)}
            </div>
          ) : (
            <div
              style={{
                overflowX: 'auto',
              }}
            >
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  minWidth: '640px',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: palette.backgroundAlt,
                      color: palette.textSecondary,
                      textAlign: direction === 'rtl' ? 'right' : 'left',
                      fontSize: '0.85rem',
                    }}
                  >
                    <th
                      style={{
                        padding: '0.75rem 1rem',
                        borderTopLeftRadius: direction === 'rtl' ? 0 : '1rem',
                        borderTopRightRadius: direction === 'rtl' ? '1rem' : 0,
                        fontWeight: 600,
                      }}
                    >
                      {tInvestorStocks('hero.updatedAt', language)}
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      {tInvestorStocks('timeline.open', language)}
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      {tInvestorStocks('timeline.high', language)}
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      {tInvestorStocks('timeline.low', language)}
                    </th>
                    <th style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>
                      {tInvestorStocks('timeline.close', language)}
                    </th>
                    <th
                      style={{
                        padding: '0.75rem 1rem',
                        fontWeight: 600,
                        textAlign: direction === 'rtl' ? 'left' : 'right',
                      }}
                    >
                      {tInvestorStocks('timeline.volume', language)}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map(session => (
                    <tr
                      key={session.recordedAt}
                      style={{
                        borderBottom: `1px solid ${palette.neutralBorderSoft}`,
                        color: palette.textPrimary,
                        fontSize: '0.95rem',
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {formatDate(session.recordedAt, language)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {formatPrice(session.open, currency, language)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {formatPrice(session.high, currency, language)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {formatPrice(session.low, currency, language)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {formatPrice(session.close, currency, language)}
                      </td>
                      <td
                        style={{
                          padding: '0.85rem 1rem',
                          textAlign: direction === 'rtl' ? 'left' : 'right',
                        }}
                      >
                        {formatVolume(session.volume, language)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </main>
  );
}

export function InvestorStocksPage() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <InvestorStocksPageInner />
          <ToastStack />
        </QueryClientProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}


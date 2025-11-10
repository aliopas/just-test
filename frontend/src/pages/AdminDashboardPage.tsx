import { useEffect, useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useAdminDashboardStats } from '../hooks/useAdminDashboardStats';
import { tAdminDashboard } from '../locales/adminDashboard';
import { palette } from '../styles/theme';
import type { AdminDashboardTrendPoint } from '../types/admin-dashboard';

const queryClient = new QueryClient();

function formatHours(value: number | null, language: 'ar' | 'en') {
  if (value == null) {
    return language === 'ar' ? '—' : '–';
  }
  return value.toFixed(1);
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
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
        gap: '0.45rem',
        minHeight: '120px',
        boxShadow: '0 16px 32px rgba(15, 23, 42, 0.08)',
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
          fontSize: '2rem',
          fontWeight: 700,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function TrendSparkline({
  data,
  color,
}: {
  data: AdminDashboardTrendPoint[];
  color: string;
}) {
  if (data.length === 0) {
    return null;
  }

  const counts = data.map(point => point.count);
  const max = Math.max(...counts, 1);
  const min = Math.min(...counts, 0);
  const range = max - min || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const normalized = (point.count - min) / range;
    const y = 100 - normalized * 100;
    return `${x},${y}`;
  });

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ width: '100%', height: '140px' }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points.join(' ')}
      />
      {data.map((point, index) => {
        const x = (index / (data.length - 1 || 1)) * 100;
        const normalized = (point.count - min) / range;
        const y = 100 - normalized * 100;
        return (
          <circle
            key={point.day}
            cx={x}
            cy={y}
            r={1.5}
            fill={color}
          />
        );
      })}
    </svg>
  );
}

function AdminDashboardPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminDashboardStats();

  useEffect(() => {
    if (!isError) {
      return;
    }
    const message =
      error instanceof Error ? error.message : tAdminDashboard('toast.error', language);
    pushToast({ message, variant: 'error' });
  }, [isError, error, language, pushToast]);

  const statusBreakdown = useMemo(() => {
    if (!data) {
      return [];
    }
    return Object.entries(data.summary.byStatus)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [data]);

  const trendData = data?.trend ?? [];

  return (
    <main
      style={{
        direction,
        minHeight: 'calc(100vh - 180px)',
        padding: '2.25rem 2rem 4rem',
        background: palette.backgroundBase,
      }}
    >
      <section
        style={{
          maxWidth: '1200px',
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
            gap: '0.6rem',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '2.1rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            {tAdminDashboard('pageTitle', language)}
          </h1>
          <span
            style={{
              color: palette.textSecondary,
              fontSize: '0.85rem',
            }}
          >
            {tAdminDashboard('lastUpdated', language)}:{' '}
            {data
              ? new Date().toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : '—'}
          </span>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`summary-skeleton-${index}`}
                style={{
                  borderRadius: '1.2rem',
                  border: `1px solid ${palette.neutralBorderSoft}`,
                  background: palette.backgroundSurface,
                  minHeight: '120px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))
          ) : (
            <>
              <SummaryCard
                label={tAdminDashboard('summary.total', language)}
                value={data?.summary.totalRequests ?? 0}
              />
              <SummaryCard
                label={tAdminDashboard('summary.average', language)}
                value={formatHours(data?.summary.averageProcessingHours ?? null, language)}
              />
              <SummaryCard
                label={tAdminDashboard('summary.median', language)}
                value={formatHours(data?.summary.medianProcessingHours ?? null, language)}
              />
            </>
          )}
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <article
            style={{
              background: palette.backgroundSurface,
              borderRadius: '1.2rem',
              border: `1px solid ${palette.neutralBorder}`,
              padding: '1.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <header
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <strong
                style={{
                  fontSize: '1.25rem',
                  color: palette.textPrimary,
                }}
              >
                {tAdminDashboard('trend.title', language)}
              </strong>
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.9rem',
                }}
              >
                {tAdminDashboard('trend.subtitle', language)}
              </span>
            </header>
            {isLoading ? (
              <div
                style={{
                  height: '140px',
                  borderRadius: '1rem',
                  background: palette.neutralBorderSoft,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ) : (
              <TrendSparkline data={trendData} color={palette.brandPrimaryStrong} />
            )}
          </article>

          <article
            style={{
              background: palette.backgroundSurface,
              borderRadius: '1.2rem',
              border: `1px solid ${palette.neutralBorder}`,
              padding: '1.6rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <header
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.3rem',
              }}
            >
              <strong
                style={{
                  fontSize: '1.25rem',
                  color: palette.textPrimary,
                }}
              >
                {tAdminDashboard('summary.byStatus', language)}
              </strong>
            </header>
            {isLoading ? (
              <div
                style={{
                  height: '160px',
                  borderRadius: '1rem',
                  background: palette.neutralBorderSoft,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                {statusBreakdown.map(([status, count]) => (
                  <li
                    key={status}
                    style={{
                      display: 'flex',
                      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.85rem',
                      background: palette.backgroundAlt,
                    }}
                  >
                    <span
                      style={{
                        color: palette.textPrimary,
                        fontWeight: 600,
                      }}
                    >
                      {status}
                    </span>
                    <span
                      style={{
                        color: palette.textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      {count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <article
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.2rem',
            border: `1px solid ${palette.neutralBorder}`,
            padding: '1.6rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.1rem',
          }}
        >
          <header
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem',
            }}
          >
            <strong
              style={{
                fontSize: '1.25rem',
                color: palette.textPrimary,
              }}
            >
              {tAdminDashboard('stuck.title', language)}
            </strong>
            <span
              style={{
                color: palette.textSecondary,
                fontSize: '0.9rem',
              }}
            >
              {tAdminDashboard('stuck.subtitle', language)}
            </span>
          </header>
          {isLoading ? (
            <div
              style={{
                height: '180px',
                borderRadius: '1rem',
                background: palette.neutralBorderSoft,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ) : (data?.stuckRequests.length ?? 0) === 0 ? (
            <div
              style={{
                padding: '1.2rem',
                borderRadius: '1rem',
                background: palette.backgroundAlt,
                color: palette.textSecondary,
                fontSize: '0.95rem',
              }}
            >
              {tAdminDashboard('stuck.empty', language)}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}
              >
                <thead>
                  <tr
                    style={{
                      textAlign: direction === 'rtl' ? 'right' : 'left',
                      color: palette.textSecondary,
                      fontSize: '0.85rem',
                    }}
                  >
                    <th style={{ padding: '0.5rem 0.75rem' }}>
                      {tAdminDashboard('stuck.request', language)}
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>
                      {tAdminDashboard('stuck.status', language)}
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>
                      {tAdminDashboard('stuck.investor', language)}
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>
                      {tAdminDashboard('stuck.age', language)}
                    </th>
                    <th style={{ padding: '0.5rem 0.75rem' }} />
                  </tr>
                </thead>
                <tbody>
                  {data?.stuckRequests.map(item => (
                    <tr
                      key={item.id}
                      style={{
                        borderTop: `1px solid ${palette.neutralBorderSoft}`,
                      }}
                    >
                      <td style={{ padding: '0.75rem' }}>#{item.requestNumber}</td>
                      <td style={{ padding: '0.75rem' }}>{item.status}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {item.investorEmail ?? (language === 'ar' ? 'غير متوفر' : 'N/A')}
                      </td>
                      <td style={{ padding: '0.75rem' }}>{item.ageHours.toFixed(1)}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <Link
                          to={`/admin/requests/${item.id}`}
                          style={{
                            display: 'inline-flex',
                            padding: '0.45rem 1rem',
                            borderRadius: '999px',
                            background: palette.brandAccentDeep,
                            color: palette.textOnBrand,
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                          }}
                        >
                          {tAdminDashboard('stuck.view', language)}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        {isError && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.9rem',
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E',
              display: 'flex',
              flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <span>{tAdminDashboard('toast.error', language)}</span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              style={{
                border: 'none',
                background: palette.brandAccentDeep,
                color: palette.textOnBrand,
                borderRadius: '999px',
                padding: '0.5rem 1.1rem',
                cursor: isFetching ? 'progress' : 'pointer',
                fontWeight: 600,
              }}
            >
              {isFetching
                ? language === 'ar'
                  ? 'جارٍ التحديث…'
                  : 'Refreshing…'
                : language === 'ar'
                  ? 'إعادة المحاولة'
                  : 'Retry'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export function AdminDashboardPage() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AdminDashboardPageInner />
          <ToastStack />
        </QueryClientProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}


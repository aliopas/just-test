import { useEffect, useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import Link from 'next/link';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useAdminDashboardStats } from '../hooks/useAdminDashboardStats';
import { useAdminContentAnalytics } from '../hooks/useAdminContentAnalytics';
import { tAdminDashboard } from '../locales/adminDashboard';
import { tAdminContentAnalytics } from '../locales/adminContentAnalytics';
import { palette } from '../styles/theme';
import type { AdminDashboardTrendPoint } from '../types/admin-dashboard';
import type { AdminContentAnalyticsNewsRow } from '../types/admin-content-analytics';

const queryClient = new QueryClient();

function formatHours(value: number | null, language: 'ar' | 'en') {
  if (value == null) {
    return language === 'ar' ? '—' : '–';
  }
  return value.toFixed(1);
}

function formatNumber(value: number, language: 'ar' | 'en') {
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(
      value ?? 0
    );
  } catch {
    return `${value ?? 0}`;
  }
}

function formatPercentage(value: number, language: 'ar' | 'en') {
  if (!Number.isFinite(value)) {
    return language === 'ar' ? '—' : '–';
  }
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `${(value * 100).toFixed(1)}%`;
  }
}

function formatPercentOrFallback(
  value: number | null | undefined,
  language: 'ar' | 'en'
) {
  if (value == null || !Number.isFinite(value)) {
    return language === 'ar' ? '—' : '–';
  }
  return formatPercentage(value, language);
}

function formatDateTime(value: string | null, language: 'ar' | 'en') {
  if (!value) {
    return language === 'ar' ? '—' : '–';
  }
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
  const {
    data: contentData,
    isLoading: isContentLoading,
    isError: isContentError,
    refetch: refetchContent,
  } = useAdminContentAnalytics({ days: 30, limitTop: 5 });

  useEffect(() => {
    if (!isError) {
      return;
    }
    const message =
      error instanceof Error ? error.message : tAdminDashboard('toast.error', language);
    pushToast({ message, variant: 'error' });
  }, [isError, error, language, pushToast]);

  useEffect(() => {
    if (!isContentError) {
      return;
    }
    pushToast({
      message: tAdminContentAnalytics('toast.error', language),
      variant: 'error',
    });
  }, [isContentError, language, pushToast]);

  const statusBreakdown = useMemo(() => {
    if (!data) {
      return [];
    }
    return Object.entries(data.summary.byStatus)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [data]);

  const trendData = data?.trend ?? [];
  const contentTrend: AdminDashboardTrendPoint[] = useMemo(() => {
    if (!contentData) {
      return [];
    }
    return contentData.trend.map(point => ({
      day: point.day,
      count: point.views,
    }));
  }, [contentData]);

  const topNews: AdminContentAnalyticsNewsRow[] =
    contentData?.summary.topNews ?? [];
  const contentGeneratedAt = contentData
    ? formatDateTime(contentData.generatedAt, language)
    : null;
  const totalImpressions = contentData?.summary.totalImpressions ?? 0;
  const totalViews = contentData?.summary.totalViews ?? 0;
  const overallCtr = contentData?.summary.overallCtr ?? 0;

  const kpis = data?.kpis;
  const processingKpis = kpis?.processingHours;
  const pendingInfoKpi = kpis?.pendingInfoAging;
  const attachmentKpi = kpis?.attachmentSuccess;
  const notificationKpi = kpis?.notificationFailures;

  const kpiAlerts: string[] = [];
  if (pendingInfoKpi?.alert) {
    const message =
      language === 'ar'
        ? `نسبة طلبات Pending Info المتجاوزة لـ ${pendingInfoKpi.thresholdHours} ساعة بلغت ${formatPercentage(pendingInfoKpi.rate, language)}`
        : `Pending info > ${pendingInfoKpi.thresholdHours}h is ${formatPercentage(pendingInfoKpi.rate, language)}`;
    kpiAlerts.push(message);
  }
  if (attachmentKpi?.alert) {
    const rateLabel =
      attachmentKpi.rate == null
        ? language === 'ar'
          ? 'غير متوفر'
          : 'N/A'
        : formatPercentage(attachmentKpi.rate, language);
    const message =
      language === 'ar'
        ? `معدل نجاح رفع المرفقات منخفض (${rateLabel})`
        : `Attachment success rate is below target (${rateLabel})`;
    kpiAlerts.push(message);
  }
  if (notificationKpi?.alert) {
    const failureRate =
      notificationKpi.rate == null
        ? language === 'ar'
          ? 'غير متوفر'
          : 'N/A'
        : formatPercentage(notificationKpi.rate, language);
    const message =
      language === 'ar'
        ? `معدل فشل الإشعارات خلال آخر ${notificationKpi.windowDays} يوم مرتفع (${failureRate})`
        : `Notification failure rate over the last ${notificationKpi.windowDays} days is elevated (${failureRate})`;
    kpiAlerts.push(message);
  }
  const pendingInfoRateLabel = formatPercentOrFallback(
    pendingInfoKpi?.rate,
    language
  );
  const attachmentRateLabel = formatPercentOrFallback(
    attachmentKpi?.rate,
    language
  );
  const notificationFailureRateLabel = formatPercentOrFallback(
    notificationKpi?.rate,
    language
  );

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
            gap: '1.2rem',
          }}
        >
          <header
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <strong
              style={{
                fontSize: '1.35rem',
                color: palette.textPrimary,
              }}
            >
              {tAdminDashboard('kpis.title', language)}
            </strong>
            <span
              style={{
                color: palette.textSecondary,
                fontSize: '0.95rem',
              }}
            >
              {tAdminDashboard('kpis.subtitle', language)}
            </span>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
            }}
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`kpi-skeleton-${index}`}
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    minHeight: '140px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              ))
            ) : (
              <>
                <div
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      color: palette.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {tAdminDashboard('kpis.processing.title', language)}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      color: palette.textPrimary,
                      fontSize: '0.9rem',
                    }}
                  >
                    <span>
                      {tAdminDashboard('kpis.processing.average', language)}:{' '}
                      {formatHours(processingKpis?.average ?? null, language)}
                    </span>
                    <span>
                      {tAdminDashboard('kpis.processing.median', language)}:{' '}
                      {formatHours(processingKpis?.median ?? null, language)}
                    </span>
                    <span>
                      {tAdminDashboard('kpis.processing.p90', language)}:{' '}
                      {formatHours(processingKpis?.p90 ?? null, language)}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      color: palette.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {tAdminDashboard('kpis.pendingInfo.title', language)}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      color: palette.textPrimary,
                      fontSize: '0.9rem',
                    }}
                  >
                    <span>
                      {tAdminDashboard('kpis.pendingInfo.total', language)}:{' '}
                      {formatNumber(pendingInfoKpi?.total ?? 0, language)}
                    </span>
                    <span>
                      {tAdminDashboard('kpis.pendingInfo.overdue', language)}:{' '}
                      {formatNumber(pendingInfoKpi?.overdue ?? 0, language)}
                    </span>
                    <span>
                      {tAdminDashboard('kpis.pendingInfo.rate', language)}:{' '}
                      {pendingInfoRateLabel}
                    </span>
                    <span style={{ color: palette.textSecondary }}>
                      {tAdminDashboard('kpis.pendingInfo.threshold', language)}:{' '}
                      {pendingInfoKpi?.thresholdHours ?? 24}{' '}
                      {language === 'ar' ? 'ساعة' : 'hrs'}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      color: palette.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {tAdminDashboard('kpis.attachments.title', language)}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      color: palette.textPrimary,
                      fontSize: '0.9rem',
                    }}
                  >
                    <span>
                      {tAdminDashboard('kpis.attachments.completed', language)}:{' '}
                      {formatNumber(attachmentKpi?.withAttachments ?? 0, language)}
                    </span>
                    <span>
                      {tAdminDashboard('kpis.attachments.total', language)}:{' '}
                      {formatNumber(attachmentKpi?.totalRequests ?? 0, language)}
                    </span>
                    <span>
                      {tAdminDashboard('kpis.attachments.rate', language)}:{' '}
                      {attachmentRateLabel}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      color: palette.textSecondary,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {tAdminDashboard('kpis.notifications.title', language)}
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      color: palette.textPrimary,
                      fontSize: '0.9rem',
                    }}
                  >
                    <span>
                      {tAdminDashboard('kpis.notifications.failed', language)}:{' '}
                      {formatNumber(notificationKpi?.failed ?? 0, language)}
                    </span>
                    <span>
                      {tAdminDashboard('kpis.notifications.total', language)}:{' '}
                      {formatNumber(notificationKpi?.total ?? 0, language)}
                    </span>
                    <span>
                      {tAdminDashboard('kpis.notifications.rate', language)}:{' '}
                      {notificationFailureRateLabel}
                    </span>
                    <span style={{ color: palette.textSecondary }}>
                      {tAdminDashboard('kpis.notifications.window', language)}:{' '}
                      {notificationKpi?.windowDays ?? 30}{' '}
                      {language === 'ar' ? 'يوم' : 'days'}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {kpiAlerts.length > 0 && (
            <div
              style={{
                padding: '0.9rem 1.1rem',
                borderRadius: '0.9rem',
                background: '#FEF3C7',
                border: '1px solid #F59E0B',
                color: '#92400E',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <strong>
                {tAdminDashboard('kpis.alerts.title', language)}
              </strong>
              <ul
                style={{
                  margin: 0,
                  paddingInlineStart: direction === 'rtl' ? '1.2rem' : '1.4rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                }}
              >
                {kpiAlerts.map((alert, index) => (
                  <li key={`kpi-alert-${index}`}>{alert}</li>
                ))}
              </ul>
            </div>
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
            gap: '1.2rem',
          }}
        >
          <header
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <strong
              style={{
                fontSize: '1.3rem',
                color: palette.textPrimary,
              }}
            >
              {tAdminContentAnalytics('section.title', language)}
            </strong>
            <span
              style={{
                color: palette.textSecondary,
                fontSize: '0.95rem',
              }}
            >
              {tAdminContentAnalytics('section.subtitle', language)}
            </span>
            {contentGeneratedAt && (
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.8rem',
                }}
              >
                {tAdminContentAnalytics('meta.generatedAt', language)}: {contentGeneratedAt}
              </span>
            )}
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {isContentLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`content-metric-skeleton-${index}`}
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    minHeight: '96px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              ))
            ) : (
              <>
                <div
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      color: palette.textSecondary,
                      fontSize: '0.85rem',
                    }}
                  >
                    {tAdminContentAnalytics('metrics.impressions', language)}
                  </span>
                  <strong
                    style={{
                      color: palette.textPrimary,
                      fontSize: '1.6rem',
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(totalImpressions, language)}
                  </strong>
                </div>
                <div
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      color: palette.textSecondary,
                      fontSize: '0.85rem',
                    }}
                  >
                    {tAdminContentAnalytics('metrics.views', language)}
                  </span>
                  <strong
                    style={{
                      color: palette.textPrimary,
                      fontSize: '1.6rem',
                      fontWeight: 700,
                    }}
                  >
                    {formatNumber(totalViews, language)}
                  </strong>
                </div>
                <div
                  style={{
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    padding: '1.1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                  }}
                >
                  <span
                    style={{
                      color: palette.textSecondary,
                      fontSize: '0.85rem',
                    }}
                  >
                    {tAdminContentAnalytics('metrics.ctr', language)}
                  </span>
                  <strong
                    style={{
                      color: palette.textPrimary,
                      fontSize: '1.6rem',
                      fontWeight: 700,
                    }}
                  >
                    {formatPercentage(overallCtr, language)}
                  </strong>
                </div>
              </>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
              gap: '1.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.8rem',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <strong
                  style={{
                    color: palette.textPrimary,
                    fontSize: '1.1rem',
                  }}
                >
                  {tAdminContentAnalytics('top.title', language)}
                </strong>
                <span
                  style={{
                    color: palette.textSecondary,
                    fontSize: '0.85rem',
                  }}
                >
                  {tAdminContentAnalytics('top.subtitle', language)}
                </span>
              </header>

              {isContentLoading ? (
                <div
                  style={{
                    height: '160px',
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              ) : topNews.length === 0 ? (
                <div
                  style={{
                    padding: '1rem 1.2rem',
                    borderRadius: '0.9rem',
                    background: palette.backgroundAlt,
                    color: palette.textSecondary,
                    fontSize: '0.9rem',
                  }}
                >
                  {tAdminContentAnalytics('top.empty', language)}
                </div>
              ) : (
                <ul
                  style={{
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {topNews.map((item: AdminContentAnalyticsNewsRow) => (
                    <li
                      key={item.newsId}
                      style={{
                        display: 'flex',
                        flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        padding: '0.85rem 1.1rem',
                        borderRadius: '0.9rem',
                        background: palette.backgroundAlt,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          maxWidth: '60%',
                        }}
                      >
                        <strong
                          style={{
                            color: palette.textPrimary,
                            fontSize: '1rem',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.title ?? '—'}
                        </strong>
                        <span
                          style={{
                            color: palette.textSecondary,
                            fontSize: '0.8rem',
                          }}
                        >
                          {formatDateTime(item.publishedAt, language)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: direction === 'rtl' ? 'flex-start' : 'flex-end',
                          gap: '0.35rem',
                          minWidth: '140px',
                        }}
                      >
                        <span
                          style={{
                            color: palette.textSecondary,
                            fontSize: '0.8rem',
                          }}
                        >
                          {tAdminContentAnalytics('top.views', language)}:{' '}
                          {formatNumber(item.views, language)}
                        </span>
                        <span
                          style={{
                            color: palette.textSecondary,
                            fontSize: '0.8rem',
                          }}
                        >
                          {tAdminContentAnalytics('top.impressions', language)}:{' '}
                          {formatNumber(item.impressions, language)}
                        </span>
                        <span
                          style={{
                            color: palette.textPrimary,
                            fontWeight: 600,
                            fontSize: '0.85rem',
                          }}
                        >
                          {tAdminContentAnalytics('top.ctr', language)}:{' '}
                          {formatPercentage(item.ctr, language)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <header
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <strong
                  style={{
                    color: palette.textPrimary,
                    fontSize: '1.1rem',
                  }}
                >
                  {tAdminContentAnalytics('trend.title', language)}
                </strong>
                <span
                  style={{
                    color: palette.textSecondary,
                    fontSize: '0.85rem',
                  }}
                >
                  {tAdminContentAnalytics('trend.subtitle', language)}
                </span>
              </header>
              {isContentLoading ? (
                <div
                  style={{
                    height: '160px',
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundAlt,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              ) : contentTrend.length === 0 ? (
                <div
                  style={{
                    padding: '1rem 1.2rem',
                    borderRadius: '0.9rem',
                    background: palette.backgroundAlt,
                    color: palette.textSecondary,
                    fontSize: '0.9rem',
                  }}
                >
                  {tAdminContentAnalytics('trend.empty', language)}
                </div>
              ) : (
                <TrendSparkline
                  data={contentTrend}
                  color={palette.brandAccentDeep}
                />
              )}
              {!isContentLoading && contentTrend.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    color: palette.textSecondary,
                    fontSize: '0.8rem',
                  }}
                >
                  <span>
                    {tAdminContentAnalytics('metrics.views', language)}:{' '}
                    {formatNumber(totalViews, language)}
                  </span>
                  <span>
                    {tAdminContentAnalytics('metrics.impressions', language)}:{' '}
                    {formatNumber(totalImpressions, language)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isContentError && (
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '0.85rem',
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
              <span>{tAdminContentAnalytics('toast.error', language)}</span>
              <button
                type="button"
                onClick={() => refetchContent()}
                disabled={isContentLoading}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.5rem 1.1rem',
                  background: palette.brandAccentDeep,
                  color: palette.textOnBrand,
                  fontWeight: 600,
                  cursor: isContentLoading ? 'progress' : 'pointer',
                }}
              >
                {tAdminContentAnalytics('actions.retry', language)}
              </button>
            </div>
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
                          href={`/admin/requests/${item.id}`}
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

// Default export for Next.js page validation (not used, App Router uses named export)
export default AdminDashboardPage;

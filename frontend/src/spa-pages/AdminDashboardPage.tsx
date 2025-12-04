import React from 'react';
import { useAdminDashboardStats } from '../hooks/useAdminDashboardStats';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { tAdminDashboard } from '../locales/adminDashboard';

export function AdminDashboardPage() {
  const { language, direction } = useLanguage();
  const { data, isLoading, isError } = useAdminDashboardStats();

  const summary = data?.summary;

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
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <header>
          <h1
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {tAdminDashboard('pageTitle', language)}
          </h1>
          <p
            style={{
              marginTop: '0.35rem',
              marginBottom: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {language === 'ar'
              ? 'نظرة سريعة على أداء معالجة طلبات المستثمرين والمؤشرات التشغيلية.'
              : 'A quick view of investor request processing performance and key operational KPIs.'}
          </p>
        </header>

        {/* Error state */}
        {isError && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: radius.md,
              background: '#FEF2F2',
              color: palette.error,
              fontSize: typography.sizes.caption,
              border: `1px solid ${palette.error}33`,
            }}
          >
            {tAdminDashboard('toast.error', language)}
          </div>
        )}

        {/* Summary cards */}
        <section
          aria-label={tAdminDashboard('summary.byStatus', language)}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <SummaryCard
            label={tAdminDashboard('summary.total', language)}
            value={summary?.totalRequests ?? 0}
            isLoading={isLoading}
          />
          <SummaryCard
            label={tAdminDashboard('summary.average', language)}
            value={
              summary?.averageProcessingHours != null
                ? summary.averageProcessingHours.toFixed(1)
                : language === 'ar'
                  ? '—'
                  : '—'
            }
            isLoading={isLoading}
          />
          <SummaryCard
            label={tAdminDashboard('summary.median', language)}
            value={
              summary?.medianProcessingHours != null
                ? summary.medianProcessingHours.toFixed(1)
                : language === 'ar'
                  ? '—'
                  : '—'
            }
            isLoading={isLoading}
          />
        </section>

        {/* Placeholder sections for trend / KPIs */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.3fr)',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
              minHeight: 220,
            }}
          >
            <h2
              style={{
                margin: 0,
                marginBottom: '0.5rem',
                fontSize: typography.sizes.subheading,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {tAdminDashboard('trend.title', language)}
            </h2>
            <p
              style={{
                margin: 0,
                marginBottom: '1rem',
                fontSize: typography.sizes.caption,
                color: palette.textSecondary,
              }}
            >
              {tAdminDashboard('trend.subtitle', language)}
            </p>
            <div
              style={{
                borderRadius: radius.md,
                border: `1px dashed ${palette.neutralBorderMuted}`,
                padding: '1rem',
                fontSize: typography.sizes.caption,
                color: palette.textMuted,
                textAlign: 'center',
              }}
            >
              {language === 'ar'
                ? 'سيتم إضافة رسم بياني يوضح عدد الطلبات الجديدة في الأيام الأخيرة.'
                : 'A chart showing new requests over the last days will be added here.'}
            </div>
          </div>

          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
              minHeight: 220,
            }}
          >
            <h2
              style={{
                margin: 0,
                marginBottom: '0.5rem',
                fontSize: typography.sizes.subheading,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {tAdminDashboard('kpis.title', language)}
            </h2>
            <p
              style={{
                margin: 0,
                marginBottom: '1rem',
                fontSize: typography.sizes.caption,
                color: palette.textSecondary,
              }}
            >
              {tAdminDashboard('kpis.subtitle', language)}
            </p>
            <div
              style={{
                borderRadius: radius.md,
                border: `1px dashed ${palette.neutralBorderMuted}`,
                padding: '1rem',
                fontSize: typography.sizes.caption,
                color: palette.textMuted,
                textAlign: 'center',
              }}
            >
              {language === 'ar'
                ? 'ستظهر هنا مؤشرات إضافية مثل الطلبات المتعثرة ومعدلات الإشعارات.'
                : 'Additional indicators like stuck requests and notification failure rates will appear here.'}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: string | number;
  isLoading?: boolean;
}

function SummaryCard({ label, value, isLoading }: SummaryCardProps) {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        borderRadius: radius.lg,
        background: palette.backgroundBase,
        boxShadow: shadow.subtle,
        border: `1px solid ${palette.neutralBorderMuted}`,
        minHeight: 96,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <span
        style={{
          fontSize: typography.sizes.caption,
          color: palette.textSecondary,
          marginBottom: '0.35rem',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: '1.5rem',
          fontWeight: typography.weights.bold,
          color: palette.textPrimary,
        }}
      >
        {isLoading ? '…' : value}
      </span>
    </div>
  );
}


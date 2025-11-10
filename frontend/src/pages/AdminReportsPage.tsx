import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useAdminRequestReport } from '../hooks/useAdminRequestReport';
import { tAdminReports } from '../locales/adminReports';
import { REQUEST_STATUSES, getStatusLabel } from '../utils/requestStatus';
import type { RequestStatus } from '../types/request';
import type { AdminRequestReportFilters } from '../types/admin-reports';
import { palette } from '../styles/theme';
import { apiClient } from '../utils/api-client';

const queryClient = new QueryClient();

type UiFilters = {
  from: string;
  to: string;
  statuses: Set<string>;
  type: 'all' | 'buy' | 'sell';
  minAmount: string;
  maxAmount: string;
};

const createDefaultFilters = (): UiFilters => ({
  from: '',
  to: '',
  statuses: new Set<string>(),
  type: 'all',
  minAmount: '',
  maxAmount: '',
});

function formatDate(value: string, language: 'ar' | 'en') {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      { dateStyle: 'medium', timeStyle: 'short' }
    );
  } catch {
    return value;
  }
}

function formatCurrency(amount: number, currency: string, language: 'ar' | 'en') {
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function AdminReportsPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [uiFilters, setUiFilters] = useState<UiFilters>(() => createDefaultFilters());
  const [appliedFilters, setAppliedFilters] =
    useState<UiFilters>(() => createDefaultFilters());
  const [isDownloading, setIsDownloading] = useState(false);

  const queryFilters: AdminRequestReportFilters = useMemo(() => {
    const statuses =
      appliedFilters.statuses.size > 0
        ? Array.from(appliedFilters.statuses)
        : 'all';

    const fromIso = appliedFilters.from
      ? new Date(appliedFilters.from).toISOString()
      : undefined;
    const toIso = appliedFilters.to
      ? new Date(appliedFilters.to).toISOString()
      : undefined;

    return {
      from: fromIso,
      to: toIso,
      status: statuses as AdminRequestReportFilters['status'],
      type: appliedFilters.type,
      minAmount:
        appliedFilters.minAmount.trim().length > 0
          ? Number(appliedFilters.minAmount)
          : undefined,
      maxAmount:
        appliedFilters.maxAmount.trim().length > 0
          ? Number(appliedFilters.maxAmount)
          : undefined,
    };
  }, [appliedFilters]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminRequestReport(queryFilters);

  useEffect(() => {
    if (!isError) return;
    const message =
      error instanceof Error
        ? error.message
        : tAdminReports('toast.loadError', language);
    pushToast({ message, variant: 'error' });
  }, [isError, error, language, pushToast]);

  const requests = data?.requests ?? [];

  const cloneFilters = (filters: UiFilters): UiFilters => ({
    ...filters,
    statuses: new Set(filters.statuses),
  });

  const handleStatusToggle = (status: string) => {
    setUiFilters(current => {
      const next = new Set(current.statuses);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return { ...current, statuses: next };
    });
  };

  const handleDownloadCsv = async () => {
    try {
      setIsDownloading(true);
      const params = new URLSearchParams();
      if (queryFilters.from) params.set('from', queryFilters.from);
      if (queryFilters.to) params.set('to', queryFilters.to);
      if (Array.isArray(queryFilters.status)) {
        params.set('status', queryFilters.status.join(','));
      }
      if (queryFilters.type && queryFilters.type !== 'all') {
        params.set('type', queryFilters.type);
      }
      if (queryFilters.minAmount !== undefined) {
        params.set('minAmount', String(queryFilters.minAmount));
      }
      if (queryFilters.maxAmount !== undefined) {
        params.set('maxAmount', String(queryFilters.maxAmount));
      }
      params.set('format', 'csv');

      const url = `/admin/reports/requests?${params.toString()}`;
      const csv = await apiClient<string>(url, {
        headers: { Accept: 'text/csv' },
      });

      const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;',
      });
      const link = document.createElement('a');
      const href = URL.createObjectURL(blob);
      link.href = href;
      link.download = `requests-report-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      pushToast({
        message: tAdminReports('toast.downloadSuccess', language),
        variant: 'success',
      });
    } catch (downloadError) {
      const message =
        downloadError instanceof Error
          ? downloadError.message
          : tAdminReports('toast.downloadError', language);
      pushToast({
        message,
        variant: 'error',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    const reset = createDefaultFilters();
    setUiFilters(reset);
    setAppliedFilters(reset);
  };

  return (
    <div
      style={{
        direction,
        background: palette.backgroundBase,
        minHeight: '100vh',
        padding: '2.5rem 2rem 4rem',
      }}
    >
      <div
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
            gap: '0.75rem',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '2.25rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            {tAdminReports('pageTitle', language)}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '1rem',
              color: palette.textSecondary,
              maxWidth: '48rem',
            }}
          >
            {tAdminReports('pageSubtitle', language)}
          </p>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={isDownloading || isLoading}
              style={{
                border: 'none',
                borderRadius: '999px',
                padding: '0.65rem 1.5rem',
                background: palette.brandAccentDeep,
                color: palette.textOnBrand,
                fontWeight: 600,
                cursor: isDownloading ? 'progress' : 'pointer',
              }}
            >
              {isDownloading
                ? language === 'ar'
                  ? 'جاري التحميل…'
                  : 'Downloading…'
                : tAdminReports('actions.download', language)}
            </button>
            {data ? (
              <span
                style={{
                  fontSize: '0.9rem',
                  color: palette.textSecondary,
                }}
              >
                {tAdminReports('meta.generatedAt', language)}:{' '}
                {formatDate(data.generatedAt, language)}
              </span>
            ) : null}
          </div>
        </header>

        <section
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.5rem',
            padding: '1.75rem',
            boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <strong
              style={{
                fontSize: '1.1rem',
                color: palette.textPrimary,
              }}
            >
              {tAdminReports('filters.title', language)}
            </strong>
            <div
              style={{
                display: 'grid',
                gap: '1.25rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tAdminReports('filters.from', language)}
                <input
                  type="datetime-local"
                  value={uiFilters.from}
                  onChange={event =>
                    setUiFilters(current => ({
                      ...current,
                      from: event.target.value,
                    }))
                  }
                  style={{
                    padding: '0.65rem',
                    borderRadius: '0.65rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                  }}
                />
              </label>

              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tAdminReports('filters.to', language)}
                <input
                  type="datetime-local"
                  value={uiFilters.to}
                  onChange={event =>
                    setUiFilters(current => ({
                      ...current,
                      to: event.target.value,
                    }))
                  }
                  style={{
                    padding: '0.65rem',
                    borderRadius: '0.65rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                  }}
                />
              </label>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                <span>{tAdminReports('filters.type', language)}</span>
                <select
                  value={uiFilters.type}
                  onChange={event =>
                    setUiFilters(current => ({
                      ...current,
                      type: event.target.value as UiFilters['type'],
                    }))
                  }
                  style={{
                    padding: '0.65rem',
                    borderRadius: '0.65rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                  }}
                >
                  <option value="all">
                    {tAdminReports('filters.type.all', language)}
                  </option>
                  <option value="buy">
                    {tAdminReports('filters.type.buy', language)}
                  </option>
                  <option value="sell">
                    {tAdminReports('filters.type.sell', language)}
                  </option>
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                <span>{tAdminReports('filters.amount', language)}</span>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <input
                    type="number"
                    placeholder="Min"
                    value={uiFilters.minAmount}
                    onChange={event =>
                      setUiFilters(current => ({
                        ...current,
                        minAmount: event.target.value,
                      }))
                    }
                    style={{
                      flex: '1 1 140px',
                      padding: '0.65rem',
                      borderRadius: '0.65rem',
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      background: palette.backgroundBase,
                      color: palette.textPrimary,
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={uiFilters.maxAmount}
                    onChange={event =>
                      setUiFilters(current => ({
                        ...current,
                        maxAmount: event.target.value,
                      }))
                    }
                    style={{
                      flex: '1 1 140px',
                      padding: '0.65rem',
                      borderRadius: '0.65rem',
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      background: palette.backgroundBase,
                      color: palette.textPrimary,
                    }}
                  />
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tAdminReports('filters.status', language)}
              </span>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.6rem',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setUiFilters(current => ({
                      ...current,
                      statuses: new Set(),
                    }))
                  }
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '999px',
                    border: '1px solid transparent',
                    background:
                      uiFilters.statuses.size === 0
                        ? palette.brandSecondarySoft
                        : palette.backgroundSurface,
                    color:
                      uiFilters.statuses.size === 0
                        ? palette.textPrimary
                        : palette.textSecondary,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tAdminReports('filters.status.all', language)}
                </button>
                {REQUEST_STATUSES.map(status => {
                  const active = uiFilters.statuses.has(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusToggle(status)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '999px',
                        border: '1px solid transparent',
                        background: active
                          ? palette.brandSecondarySoft
                          : palette.backgroundSurface,
                        color: active
                          ? palette.textPrimary
                          : palette.textSecondary,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {getStatusLabel(status, language)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAppliedFilters(cloneFilters(uiFilters));
                  refetch();
                }}
                disabled={isFetching}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '0.85rem',
                  border: 'none',
                  background: palette.brandAccentDeep,
                  color: palette.textOnBrand,
                  fontWeight: 600,
                  cursor: isFetching ? 'progress' : 'pointer',
                }}
              >
                {isFetching
                  ? language === 'ar'
                    ? 'جارٍ التحديث…'
                    : 'Refreshing…'
                  : tAdminReports('filters.apply', language)}
              </button>
              <button
                type="button"
                onClick={handleReset}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '0.85rem',
                  border: `1px solid ${palette.neutralBorderSoft}`,
                  background: palette.backgroundSurface,
                  color: palette.textSecondary,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tAdminReports('filters.reset', language)}
              </button>
            </div>
          </div>

          <div
            style={{
              overflowX: 'auto',
              borderRadius: '1rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '720px',
              }}
            >
              <thead>
                <tr
                  style={{
                    background: palette.backgroundAlt,
                    color: palette.textSecondary,
                  }}
                >
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminReports('table.request', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminReports('table.status', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminReports('table.type', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminReports('table.amount', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminReports('table.investor', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminReports('table.created', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminReports('table.updated', language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '1rem 1.5rem' }}>
                      <div
                        style={{
                          height: '60px',
                          borderRadius: '0.85rem',
                          background: palette.neutralBorderSoft,
                          opacity: 0.4,
                          animation: 'pulse 1.6s ease-in-out infinite',
                        }}
                      />
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: '1.25rem 1.5rem',
                        textAlign: 'center',
                        color: palette.textSecondary,
                      }}
                    >
                      {tAdminReports('table.empty', language)}
                    </td>
                  </tr>
                ) : (
                  requests.map(request => (
                    <tr
                      key={request.id}
                      style={{
                        borderTop: `1px solid ${palette.neutralBorderSoft}`,
                        background: palette.backgroundSurface,
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', color: palette.textPrimary }}>
                        #{request.requestNumber}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {REQUEST_STATUSES.includes(request.status as RequestStatus)
                          ? getStatusLabel(request.status as RequestStatus, language)
                          : request.status}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {request.type === 'buy'
                          ? tAdminReports('filters.type.buy', language)
                          : tAdminReports('filters.type.sell', language)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {formatCurrency(request.amount, request.currency, language)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {request.investorName ?? request.investorEmail ?? '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {formatDate(request.createdAt, language)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {formatDate(request.updatedAt, language)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminReportsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AdminReportsPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}


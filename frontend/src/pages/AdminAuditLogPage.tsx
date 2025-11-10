import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useAdminAuditLogs } from '../hooks/useAdminAuditLogs';
import type {
  AdminAuditLogEntry,
  AdminAuditLogFilters,
  AdminAuditLogMeta,
} from '../types/admin-audit';
import { tAdminAudit } from '../locales/adminAudit';
import { palette } from '../styles/theme';

const queryClient = new QueryClient();

interface UiFilters {
  page: number;
  from: string;
  to: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
}

const defaultUiFilters: UiFilters = {
  page: 1,
  from: '',
  to: '',
  actorId: '',
  action: '',
  resourceType: '',
  resourceId: '',
};

function buildQueryFilters(filters: UiFilters): AdminAuditLogFilters {
  return {
    page: filters.page,
    from: filters.from ? new Date(filters.from).toISOString() : undefined,
    to: filters.to ? new Date(filters.to).toISOString() : undefined,
    actorId: filters.actorId.trim() || undefined,
    action: filters.action.trim() || undefined,
    resourceType: filters.resourceType.trim() || undefined,
    resourceId: filters.resourceId.trim() || undefined,
  };
}

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

function AdminAuditLogPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [uiFilters, setUiFilters] = useState<UiFilters>(defaultUiFilters);
  const [appliedFilters, setAppliedFilters] = useState<UiFilters>(defaultUiFilters);

  const queryFilters = useMemo(
    () => buildQueryFilters(appliedFilters),
    [appliedFilters]
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useAdminAuditLogs(queryFilters);

  useEffect(() => {
    if (!isError) return;
    const message =
      error instanceof Error
        ? error.message
        : tAdminAudit('toast.loadError', language);
    pushToast({ message, variant: 'error' });
  }, [isError, error, language, pushToast]);

  const logs: AdminAuditLogEntry[] = data?.logs ?? [];
  const meta: AdminAuditLogMeta = data?.meta ?? {
    page: appliedFilters.page,
    limit: 25,
    total: logs.length,
    pageCount: 1,
  };

  const applyFilters = () => {
    setUiFilters(current => ({ ...current, page: 1 }));
    setAppliedFilters({
      ...uiFilters,
      page: 1,
    });
  };

  const resetFilters = () => {
    setUiFilters(defaultUiFilters);
    setAppliedFilters(defaultUiFilters);
  };

  const displayedDiff = (diff: Record<string, unknown> | null) =>
    diff ? JSON.stringify(diff, null, 2) : '∅';

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
              fontSize: '2.2rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            {tAdminAudit('pageTitle', language)}
          </h1>
          <p
            style={{
              margin: 0,
              color: palette.textSecondary,
              fontSize: '1rem',
              maxWidth: '48rem',
            }}
          >
            {tAdminAudit('pageSubtitle', language)}
          </p>
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
              {tAdminAudit('filters.title', language)}
            </strong>

            <div
              style={{
                display: 'grid',
                gap: '1rem',
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
                {tAdminAudit('filters.dateFrom', language)}
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
                {tAdminAudit('filters.dateTo', language)}
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
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tAdminAudit('filters.actor', language)}
                <input
                  type="text"
                  value={uiFilters.actorId}
                  onChange={event =>
                    setUiFilters(current => ({
                      ...current,
                      actorId: event.target.value,
                    }))
                  }
                  placeholder="uuid"
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
                {tAdminAudit('filters.action', language)}
                <input
                  type="text"
                  value={uiFilters.action}
                  onChange={event =>
                    setUiFilters(current => ({
                      ...current,
                      action: event.target.value,
                    }))
                  }
                  placeholder="request.approved"
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
                {tAdminAudit('filters.resourceType', language)}
                <input
                  type="text"
                  value={uiFilters.resourceType}
                  onChange={event =>
                    setUiFilters(current => ({
                      ...current,
                      resourceType: event.target.value,
                    }))
                  }
                  placeholder="request"
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
                {tAdminAudit('filters.resourceId', language)}
                <input
                  type="text"
                  value={uiFilters.resourceId}
                  onChange={event =>
                    setUiFilters(current => ({
                      ...current,
                      resourceId: event.target.value,
                    }))
                  }
                  placeholder="uuid"
                  style={{
                    padding: '0.65rem',
                    borderRadius: '0.65rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                  }}
                />
              </label>
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
                onClick={applyFilters}
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
                  : tAdminAudit('filters.apply', language)}
              </button>
              <button
                type="button"
                onClick={resetFilters}
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
                {tAdminAudit('filters.reset', language)}
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
                minWidth: '900px',
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
                    {tAdminAudit('table.timestamp', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminAudit('table.actor', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminAudit('table.email', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminAudit('table.action', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminAudit('table.resource', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminAudit('table.diff', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminAudit('table.ip', language)}
                  </th>
                  <th style={{ textAlign: 'start', padding: '0.85rem 1rem' }}>
                    {tAdminAudit('table.userAgent', language)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td colSpan={8} style={{ padding: '0.85rem 1rem' }}>
                        <div
                          style={{
                            height: '48px',
                            borderRadius: '0.85rem',
                            background: palette.neutralBorderSoft,
                            opacity: 0.4,
                            animation: 'pulse 1.6s ease-in-out infinite',
                          }}
                        />
                      </td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: '1.25rem 1.5rem',
                        textAlign: 'center',
                        color: palette.textSecondary,
                      }}
                    >
                      {tAdminAudit('table.empty', language)}
                    </td>
                  </tr>
                ) : (
                  logs.map(log => (
                    <tr
                      key={log.id}
                      style={{
                        borderTop: `1px solid ${palette.neutralBorderSoft}`,
                        background: palette.backgroundSurface,
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {formatDate(log.createdAt, language)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textPrimary }}>
                        {log.actor.name ?? '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {log.actor.email ?? '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {log.action}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {log.targetType
                          ? `${log.targetType}${log.targetId ? ` · ${log.targetId}` : ''}`
                          : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        <details>
                          <summary style={{ cursor: 'pointer' }}>
                            {tAdminAudit('modal.diffTitle', language)}
                          </summary>
                          <pre
                            style={{
                              marginTop: '0.5rem',
                              maxHeight: '200px',
                              overflow: 'auto',
                              background: palette.backgroundAlt,
                              padding: '0.75rem',
                              borderRadius: '0.65rem',
                              fontSize: '0.85rem',
                            }}
                          >
                            {displayedDiff(log.diff)}
                          </pre>
                        </details>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        {log.ipAddress ?? '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: palette.textSecondary }}>
                        <span title={log.userAgent ?? undefined}>
                          {log.userAgent ? log.userAgent.slice(0, 40) + (log.userAgent.length > 40 ? '…' : '') : '—'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <span style={{ color: palette.textSecondary }}>
                {tAdminAudit('pagination.page', language)} {meta.page}{' '}
                {tAdminAudit('pagination.of', language)} {meta.pageCount}
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                }}
              >
                <button
                  type="button"
                onClick={() => {
                  const nextPage = Math.max(appliedFilters.page - 1, 1);
                  setUiFilters(current => ({
                    ...current,
                    page: nextPage,
                  }));
                  setAppliedFilters(current => ({
                    ...current,
                    page: nextPage,
                  }));
                }}
                  disabled={appliedFilters.page <= 1}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textSecondary,
                    cursor: appliedFilters.page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                onClick={() => {
                  const nextPage = Math.min(appliedFilters.page + 1, meta.pageCount);
                  setUiFilters(current => ({
                    ...current,
                    page: nextPage,
                  }));
                  setAppliedFilters(current => ({
                    ...current,
                    page: nextPage,
                  }));
                }}
                  disabled={appliedFilters.page >= meta.pageCount}
                  style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '0.75rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textSecondary,
                    cursor:
                      appliedFilters.page >= meta.pageCount
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  ›
                </button>
              </div>
            </div>
        </section>
      </div>
    </div>
  );
}

export function AdminAuditLogPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AdminAuditLogPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}


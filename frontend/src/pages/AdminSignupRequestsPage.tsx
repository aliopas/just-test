import { useMemo, useState, useEffect } from 'react';
import { useAdminAccountRequests, useApproveAccountRequestMutation, useRejectAccountRequestMutation, useMarkSignupRequestRead } from '../hooks/useAdminAccountRequests';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { tAdminSignupRequests } from '../locales/adminSignupRequests';
import type { AdminSignupRequestFilters, AdminSignupRequestStatus } from '../types/admin-account-request';

type StatusFilter = AdminSignupRequestFilters['status'];

function formatDateTime(value: string | null, language: 'ar' | 'en') {
  if (!value) {
    return language === 'ar' ? '—' : '–';
  }
  try {
    return new Date(value).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function getStatusBadgeStyle(status: AdminSignupRequestStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.3rem 0.8rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 600,
  };

  switch (status) {
    case 'pending':
      return { ...base, background: '#FEF3C7', color: '#92400E' };
    case 'approved':
      return { ...base, background: '#DCFCE7', color: '#166534' };
    case 'rejected':
      return { ...base, background: '#FEE2E2', color: '#B91C1C' };
    default:
      return base;
  }
}

export function AdminSignupRequestsPage() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [filters, setFilters] = useState<AdminSignupRequestFilters>({
    status: 'pending',
    page: 1,
  });

  const { data, isLoading, isError, refetch } = useAdminAccountRequests(filters);
  const approveMutation = useApproveAccountRequestMutation();
  const rejectMutation = useRejectAccountRequestMutation();
  const markReadMutation = useMarkSignupRequestRead();

  const requests = data?.requests ?? [];
  const meta = data?.meta;

  // Mark all visible unread requests as read when page loads or requests change
  useEffect(() => {
    if (requests.length > 0 && !isLoading) {
      const unreadRequests = requests.filter(r => !r.isRead && r.status === 'pending');
      // Use a small delay to batch the requests
      const timeoutId = setTimeout(() => {
        unreadRequests.forEach(request => {
          markReadMutation.mutate(request.id, { onError: () => {} });
        });
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [requests.map(r => r.id).join(','), isLoading, markReadMutation]); // Only run when request IDs change

  const statusOptions: Array<{ value: StatusFilter; label: string }> = useMemo(
    () => [
      { value: 'all', label: tAdminSignupRequests('filters.status.all', language) },
      { value: 'pending', label: tAdminSignupRequests('status.pending', language) },
      { value: 'approved', label: tAdminSignupRequests('status.approved', language) },
      { value: 'rejected', label: tAdminSignupRequests('status.rejected', language) },
    ],
    [language]
  );

  const handleApprove = async (id: string, locale: 'ar' | 'en') => {
    const note = window.prompt(
      tAdminSignupRequests('prompt.approveNote', language) ?? ''
    );
    const sendInvite = window.confirm(
      tAdminSignupRequests('prompt.sendInvite', language)
    );
    try {
      await approveMutation.mutateAsync({
        id,
        note: note ?? undefined,
        sendInvite,
        locale,
      });
      pushToast({
        variant: 'success',
        message: tAdminSignupRequests('toast.approved', language),
      });
      void refetch();
    } catch (error) {
      void error;
      pushToast({
        variant: 'error',
        message:
          language === 'ar'
            ? 'تعذر اعتماد الطلب، يرجى المحاولة مرة أخرى.'
            : 'Failed to approve the request. Please try again.',
      });
    }
  };

  const handleReject = async (id: string) => {
    const note = window.prompt(
      tAdminSignupRequests('prompt.rejectNote', language) ?? ''
    );
    try {
      await rejectMutation.mutateAsync({ id, note: note ?? undefined });
      pushToast({
        variant: 'success',
        message: tAdminSignupRequests('toast.rejected', language),
      });
      void refetch();
    } catch (error) {
      void error;
      pushToast({
        variant: 'error',
        message:
          language === 'ar'
            ? 'تعذر رفض الطلب، يرجى المحاولة مرة أخرى.'
            : 'Failed to reject the request. Please try again.',
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        direction,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      <header>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {tAdminSignupRequests('page.title', language)}
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--color-text-secondary)',
            fontSize: '1rem',
            maxWidth: '48rem',
          }}
        >
          {tAdminSignupRequests('page.subtitle', language)}
        </p>
      </header>

      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          <select
            value={filters.status ?? 'all'}
            onChange={event =>
              setFilters(current => ({
                ...current,
                status: event.target.value as StatusFilter,
                page: 1,
              }))
            }
            style={{
              minWidth: '220px',
              padding: '0.65rem 1rem',
              borderRadius: '0.85rem',
              border: '1px solid var(--color-brand-secondary-soft)',
              fontSize: '0.95rem',
              color: 'var(--color-text-primary)',
              background: 'var(--color-background-surface)',
            }}
          >
            {statusOptions.map(option => (
              <option key={option.value ?? 'all'} value={option.value ?? 'all'}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            type="search"
            value={filters.search ?? ''}
            onChange={event =>
              setFilters(current => ({
                ...current,
                search: event.target.value,
                page: 1,
              }))
            }
            placeholder={tAdminSignupRequests('filters.search.placeholder', language)}
            style={{
              minWidth: '240px',
              padding: '0.65rem 1rem',
              borderRadius: '0.85rem',
              border: '1px solid var(--color-brand-secondary-soft)',
              fontSize: '0.95rem',
              color: 'var(--color-text-primary)',
              background: 'var(--color-background-surface)',
            }}
          />
        </div>
      </section>

      <section
        style={{
          background: 'var(--color-background-surface)',
          borderRadius: '1.5rem',
          padding: '1.75rem',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {isLoading ? (
          <div
            style={{
              borderRadius: '1rem',
              border: '1px dashed var(--color-brand-secondary-soft)',
              padding: '2rem 1.2rem',
              textAlign: 'center',
              background: 'var(--color-background-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {tAdminSignupRequests('table.loading', language)}
          </div>
        ) : isError ? (
          <div
            style={{
              borderRadius: '1rem',
              border: '1px dashed var(--color-brand-secondary-soft)',
              padding: '2rem 1.2rem',
              textAlign: 'center',
              background: 'var(--color-background-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {tAdminSignupRequests('table.error', language)}
            <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => refetch()}
                style={{
                  border: 'none',
                  background: 'var(--color-brand-primary-strong)',
                  color: 'var(--color-text-on-brand)',
                  borderRadius: '0.75rem',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                }}
              >
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              borderRadius: '1rem',
              border: '1px dashed var(--color-brand-secondary-soft)',
              padding: '2rem 1.2rem',
              textAlign: 'center',
              background: 'var(--color-background-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            <h3
              style={{
                fontSize: '1.2rem',
                margin: 0,
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              {tAdminSignupRequests('table.emptyTitle', language)}
            </h3>
            <p
              style={{
                margin: '0.35rem 0 0',
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
              }}
            >
              {tAdminSignupRequests('table.emptySubtitle', language)}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '900px',
                direction,
                background: 'var(--color-background-surface)',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
              }}
            >
              <thead>
                <tr style={{ background: 'var(--color-background-surface)', color: 'var(--color-text-secondary)' }}>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.fullName', language)}</th>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.email', language)}</th>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.phone', language)}</th>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.company', language)}</th>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.message', language)}</th>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.status', language)}</th>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.createdAt', language)}</th>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.reviewedAt', language)}</th>
                  <th style={{ padding: '0.85rem 1.1rem', textAlign: 'left' }}>{tAdminSignupRequests('table.actions', language)}</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => {
                  const preferredLocale =
                    request.payload?.language === 'en' ? 'en' : 'ar';
                  return (
                    <tr
                      key={request.id}
                      style={{ borderTop: '1px solid var(--color-background-base)' }}
                    >
                      <td
                        style={{
                          padding: '0.9rem 1.1rem',
                          verticalAlign: 'top',
                          color: 'var(--color-text-primary)',
                          fontSize: '0.95rem',
                        }}
                      >
                        <div
                          style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}
                        >
                          <strong>{request.fullName ?? '—'}</strong>
                          <span
                            style={{
                              color: 'var(--color-text-secondary)',
                              fontSize: '0.85rem',
                            }}
                          >
                            {preferredLocale === 'en'
                              ? 'English'
                              : language === 'ar'
                                ? 'العربية'
                                : 'Arabic'}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: '0.9rem 1.1rem',
                          verticalAlign: 'top',
                          color: 'var(--color-text-primary)',
                          fontSize: '0.95rem',
                        }}
                      >
                        {request.email}
                      </td>
                      <td
                        style={{
                          padding: '0.9rem 1.1rem',
                          verticalAlign: 'top',
                          color: 'var(--color-text-primary)',
                          fontSize: '0.95rem',
                        }}
                      >
                        {request.phone ?? '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.9rem 1.1rem',
                          verticalAlign: 'top',
                          color: 'var(--color-text-primary)',
                          fontSize: '0.95rem',
                        }}
                      >
                        {request.company ?? '—'}
                      </td>
                      <td
                        style={{
                          padding: '0.9rem 1.1rem',
                          verticalAlign: 'top',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.9rem',
                          maxWidth: '240px',
                        }}
                      >
                        {request.message ? (
                          <span style={{ whiteSpace: 'pre-wrap' }}>{request.message}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td style={{ padding: '0.9rem 1.1rem', verticalAlign: 'top' }}>
                        <span style={getStatusBadgeStyle(request.status)}>
                          {tAdminSignupRequests(`status.${request.status}`, language)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: '0.9rem 1.1rem',
                          verticalAlign: 'top',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {formatDateTime(request.createdAt, language)}
                      </td>
                      <td
                        style={{
                          padding: '0.9rem 1.1rem',
                          verticalAlign: 'top',
                          color: 'var(--color-text-secondary)',
                          fontSize: '0.9rem',
                        }}
                      >
                        {formatDateTime(request.reviewedAt, language)}
                      </td>
                      <td
                        style={{
                          padding: '0.9rem 1.1rem',
                          verticalAlign: 'top',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {request.status === 'pending' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprove(request.id, preferredLocale)}
                                disabled={approveMutation.isPending}
                                style={{
                                  background: '#DCFCE7',
                                  color: '#166534',
                                  border: 'none',
                                  borderRadius: '0.7rem',
                                  padding: '0.45rem 0.9rem',
                                  cursor: approveMutation.isPending ? 'not-allowed' : 'pointer',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                }}
                              >
                                {tAdminSignupRequests('actions.approve', language)}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(request.id)}
                                disabled={rejectMutation.isPending}
                                style={{
                                  background: '#FEE2E2',
                                  color: '#B91C1C',
                                  border: 'none',
                                  borderRadius: '0.7rem',
                                  padding: '0.45rem 0.9rem',
                                  cursor: rejectMutation.isPending ? 'not-allowed' : 'pointer',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                }}
                              >
                                {tAdminSignupRequests('actions.reject', language)}
                              </button>
                            </>
                          ) : (
                            <span
                              style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.85rem',
                              }}
                            >
                              {request.decisionNote
                                ? request.decisionNote
                                : tAdminSignupRequests('actions.viewDetails', language)}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}


import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { AdminRequest } from '../../../types/admin';
import { useLanguage } from '../../../context/LanguageContext';
import { tAdminRequests } from '../../../locales/adminRequests';
import { RequestStatusBadge } from '../../request/RequestStatusBadge';
import { getStatusLabel } from '../../../utils/requestStatus';

interface Props {
  requests: AdminRequest[];
  isLoading: boolean;
  isFetching: boolean;
  error?: unknown;
  onRetry?: () => void;
}

// Helper to format amount/subject based on request type
function formatAmountOrSubject(
  request: AdminRequest,
  language: 'ar' | 'en'
): string {
  // For buy/sell, show formatted amount
  if (request.amount != null && request.currency) {
    try {
      return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: request.currency,
      }).format(request.amount);
    } catch {
      return `${request.amount} ${request.currency}`;
    }
  }

  return '—';
}

// Helper to get type label
function getTypeLabel(type: AdminRequest['type'], language: 'ar' | 'en'): string {
  return tAdminRequests(`type.${type}` as Parameters<typeof tAdminRequests>[0], language);
}

// Helper to check if request is stale (pending_info for more than 7 days)
function isStaleRequest(request: AdminRequest): boolean {
  if (request.status !== 'pending_info') {
    return false;
  }
  const updatedAt = new Date(request.updatedAt);
  const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > 7;
}

export function AdminRequestsTable({
  requests,
  isLoading,
  isFetching,
  error,
  onRetry,
}: Props) {
  const { language, direction } = useLanguage();

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div style={loadingContainerStyle}>
          {tAdminRequests('table.loading', language)}
        </div>
      );
    }

    if (error) {
      return (
        <div style={errorContainerStyle}>
          <span>{tAdminRequests('table.error', language)}</span>
          {onRetry && (
            <button type="button" onClick={onRetry} style={retryButtonStyle}>
              {'\u21BB'}
            </button>
          )}
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '1.4rem' }}>📬</div>
          <strong>{tAdminRequests('table.emptyTitle', language)}</strong>
          <span>{tAdminRequests('table.emptySubtitle', language)}</span>
        </div>
      );
    }

    return (
      <table style={{ ...tableStyle, direction }}>
        <thead>
          <tr>
            <th style={headerCellStyle}>
              {tAdminRequests('table.requestNumber', language)}
            </th>
            <th style={headerCellStyle}>
              {tAdminRequests('table.type', language)}
            </th>
            <th style={headerCellStyle}>
              {tAdminRequests('table.investor', language)}
            </th>
            <th style={headerCellStyle}>
              {tAdminRequests('table.amount', language)}
            </th>
            <th style={headerCellStyle}>
              {tAdminRequests('table.status', language)}
            </th>
            <th style={headerCellStyle}>
              {tAdminRequests('table.createdAt', language)}
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map(request => {
            const investorName =
              request.investor?.fullName ??
              request.investor?.preferredName ??
              request.investor?.email ??
              '—';
            const amountOrSubject = formatAmountOrSubject(request, language);
            const typeLabel = getTypeLabel(request.type, language);
            const createdAt = new Date(request.createdAt).toLocaleString(
              language === 'ar' ? 'ar-SA' : 'en-US',
              { dateStyle: 'medium', timeStyle: 'short' }
            );
            const isUnread = !request.isRead;
            const isStale = isStaleRequest(request);

            const rowStyle: React.CSSProperties = {
              ...rowBaseStyle,
              background: isUnread
                ? 'var(--color-background-highlight)'
                : 'var(--color-background-surface)',
              borderLeft: isUnread
                ? `4px solid var(--color-brand-primary-strong)`
                : '4px solid transparent',
              fontWeight: isUnread ? 600 : 400,
            };

            return (
              <tr key={request.id} style={rowStyle}>
                <td style={cellStyle}>
                  <Link
                    to={`/admin/requests/${request.id}`}
                    style={{
                      color: 'var(--color-brand-primary-strong)',
                      textDecoration: 'none',
                      fontWeight: isUnread ? 700 : 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {request.requestNumber}
                    {isUnread && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--color-brand-primary-strong)',
                          display: 'inline-block',
                        }}
                        title={language === 'ar' ? 'غير مقروء' : 'Unread'}
                      />
                    )}
                  </Link>
                </td>
                <td style={cellStyle}>
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: '0.5rem',
                      background:
                        request.type === 'buy'
                          ? 'var(--color-success)'
                          : request.type === 'sell'
                            ? 'var(--color-warning)'
                            : request.type === 'partnership'
                              ? '#3B82F6'
                              : request.type === 'board_nomination'
                                ? '#8B5CF6'
                                : '#EC4899',
                      color: '#FFFFFF',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'inline-block',
                    }}
                  >
                    {typeLabel}
                  </span>
                </td>
                <td style={cellStyle}>{investorName}</td>
                <td style={cellStyle}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <span>{amountOrSubject}</span>
                    {isStale && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-error)',
                          fontWeight: 600,
                        }}
                      >
                        {language === 'ar' ? '⚠️ متعثر' : '⚠️ Stale'}
                      </span>
                    )}
                  </div>
                </td>
                <td style={cellStyle}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <RequestStatusBadge status={request.status} />
                    <span
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.8rem',
                      }}
                    >
                      {getStatusLabel(request.status, language)}
                    </span>
                  </div>
                </td>
                <td style={cellStyle}>{createdAt}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }, [requests, isLoading, error, onRetry, language, direction]);

  return (
    <div style={{ position: 'relative' }}>
      {content}
      {isFetching && !isLoading && (
        <div style={loadingOverlayStyle}>
          <span>…</span>
        </div>
      )}
    </div>
  );
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  borderRadius: '1rem',
  overflow: 'hidden',
  boxShadow: '0 12px 32px rgba(15, 23, 42, 0.1)',
  background: 'var(--color-background-surface)',
};

const headerCellStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'start',
  background: 'var(--color-background-alt)',
  color: 'var(--color-text-primary)',
  fontWeight: 700,
  fontSize: '0.95rem',
  borderBottom: '2px solid var(--color-neutral-border)',
};

const rowBaseStyle: React.CSSProperties = {
  transition: 'background-color 0.2s ease',
};

const cellStyle: React.CSSProperties = {
  padding: '0.95rem 1rem',
  borderBottom: '1px solid var(--color-neutral-border-soft)',
  color: 'var(--color-text-primary)',
  fontSize: '0.9rem',
};

const loadingContainerStyle: React.CSSProperties = {
  padding: '1.5rem',
  textAlign: 'center',
  color: 'var(--color-text-secondary)',
};

const errorContainerStyle: React.CSSProperties = {
  padding: '1.5rem',
  background: '#FEF2F2',
  color: '#B91C1C',
  borderRadius: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
};

const retryButtonStyle: React.CSSProperties = {
  padding: '0.35rem 0.75rem',
  borderRadius: '0.65rem',
  border: 'none',
  background: '#B91C1C',
  color: 'var(--color-text-on-brand)',
  cursor: 'pointer',
  fontWeight: 700,
};

const emptyStateStyle: React.CSSProperties = {
  padding: '2.5rem 1.5rem',
  border: '1px dashed var(--color-brand-secondary-soft)',
  borderRadius: '1.5rem',
  background: 'var(--color-background-highlight)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
  color: 'var(--color-brand-accent-deep)',
  textAlign: 'center',
};

const loadingOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: 'rgba(248, 250, 252, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  color: 'var(--color-brand-primary-strong)',
};

import { useMemo } from 'react';
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
              âŸ³
            </button>
          )}
        </div>
      );
    }

    if (requests.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <div style={{ fontSize: '1.4rem' }}>ðŸ“­</div>
          <strong>{tAdminRequests('table.emptyTitle', language)}</strong>
          <span>{tAdminRequests('table.emptySubtitle', language)}</span>
        </div>
      );
    }

    return (
      <table style={{ ...tableStyle, direction }}>
        <thead>
          <tr>
            <th>{tAdminRequests('table.requestNumber', language)}</th>
            <th>{tAdminRequests('table.investor', language)}</th>
            <th>{tAdminRequests('table.amount', language)}</th>
            <th>{tAdminRequests('table.status', language)}</th>
            <th>{tAdminRequests('table.createdAt', language)}</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(request => {
            const investorName =
              request.investor?.fullName ??
              request.investor?.preferredName ??
              request.investor?.email ??
              'â€”';
            const amountFormatted = new Intl.NumberFormat(
              language === 'ar' ? 'ar-SA' : 'en-US',
              {
                style: 'currency',
                currency: request.currency,
              }
            ).format(request.amount);
            const createdAt = new Date(request.createdAt).toLocaleString(
              language === 'ar' ? 'ar-SA' : 'en-US',
              { dateStyle: 'medium', timeStyle: 'short' }
            );
            return (
              <tr key={request.id}>
                <td>
                  <a
                    href={`/app/admin/requests/${request.id}`}
                    style={{ color: 'var(--color-brand-primary-strong)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    {request.requestNumber}
                  </a>
                </td>
                <td>{investorName}</td>
                <td>{amountFormatted}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RequestStatusBadge status={request.status} />
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                      {getStatusLabel(request.status, language)}
                    </span>
                  </div>
                </td>
                <td>{createdAt}</td>
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
          <span>â€¦</span>
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




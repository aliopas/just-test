import type { AdminNewsItem, NewsStatus } from '../../../types/news';
import type { InvestorLanguage } from '../../../types/investor';
import { useLanguage } from '../../../context/LanguageContext';
import { tAdminNews } from '../../../locales/adminNews';

interface Props {
  items: AdminNewsItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (item: AdminNewsItem) => void;
  onDelete: (item: AdminNewsItem) => void;
  onApprove?: (item: AdminNewsItem) => void;
  onReject?: (item: AdminNewsItem) => void;
  isApprovePending?: boolean;
  isRejectPending?: boolean;
}

export function AdminNewsTable({
  items,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  isApprovePending = false,
  isRejectPending = false,
}: Props) {
  const { language, direction } = useLanguage();

  if (isLoading) {
    return (
      <div style={stateStyle}>
        <span>{tAdminNews('table.loading', language)}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={stateStyle}>
        <span>{tAdminNews('table.error', language)}</span>
        <button type="button" onClick={onRetry} style={retryButtonStyle}>
          {'\u21BB'}
        </button>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div style={stateStyle}>
        <h3
          style={{
            fontSize: '1.2rem',
            margin: 0,
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          {tAdminNews('list.emptyTitle', language)}
        </h3>
        <p
          style={{
            margin: '0.35rem 0 0',
            color: 'var(--color-text-secondary)',
            fontSize: '0.95rem',
          }}
        >
          {tAdminNews('list.emptySubtitle', language)}
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '840px',
          direction,
          background: 'var(--color-background-surface)',
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
        }}
      >
        <thead>
          <tr style={{ background: 'var(--color-background-surface)', color: 'var(--color-text-secondary)' }}>
            <th style={thStyle}>{tAdminNews('table.title', language)}</th>
            <th style={thStyle}>{tAdminNews('table.status', language)}</th>
            <th style={thStyle}>{tAdminNews('table.scheduledAt', language)}</th>
            <th style={thStyle}>{tAdminNews('table.publishedAt', language)}</th>
            <th style={thStyle}>{tAdminNews('table.updatedAt', language)}</th>
            <th style={thStyle}>{tAdminNews('table.actions', language)}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderTop: '1px solid var(--color-background-base)' }}>
              <td style={tdStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>{item.title}</strong>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>/{item.slug}</span>
                </div>
              </td>
              <td style={tdStyle}>
                <span style={getStatusBadgeStyle(item.status)}>
                  {statusLabel(item.status, language)}
                </span>
              </td>
              <td style={tdStyle}>{formatDate(item.scheduledAt, language)}</td>
              <td style={tdStyle}>{formatDate(item.publishedAt, language)}</td>
              <td style={tdStyle}>{formatDate(item.updatedAt, language)}</td>
              <td style={{ ...tdStyle, width: '160px' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.status === 'pending_review' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onApprove?.(item)}
                        disabled={!onApprove || isApprovePending || isRejectPending}
                        style={{
                          ...approveButtonStyle,
                          cursor:
                            !onApprove || isApprovePending || isRejectPending
                              ? 'not-allowed'
                              : 'pointer',
                          opacity:
                            !onApprove || isApprovePending || isRejectPending ? 0.65 : 1,
                        }}
                      >
                        {'\u2705'} {tAdminNews('table.approve', language)}
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject?.(item)}
                        disabled={!onReject || isApprovePending || isRejectPending}
                        style={{
                          ...rejectButtonStyle,
                          cursor:
                            !onReject || isApprovePending || isRejectPending
                              ? 'not-allowed'
                              : 'pointer',
                          opacity:
                            !onReject || isApprovePending || isRejectPending ? 0.65 : 1,
                        }}
                      >
                        {'\u{1F6AB}'} {tAdminNews('table.reject', language)}
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    style={actionButtonStyle}
                  >
                    {'\u270F\uFE0F'} {tAdminNews('table.edit', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    style={{ ...actionButtonStyle, color: '#DC2626' }}
                  >
                    {'\u{1F5D1}'} {tAdminNews('table.delete', language)}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string | null, language: InvestorLanguage) {
  if (!value) return '\u2014';
  try {
    return new Date(value).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function statusLabel(status: NewsStatus, language: InvestorLanguage) {
  switch (status) {
    case 'draft':
      return tAdminNews('list.status.draft', language);
    case 'pending_review':
      return tAdminNews('list.status.pending_review', language);
    case 'scheduled':
      return tAdminNews('list.status.scheduled', language);
    case 'published':
      return tAdminNews('list.status.published', language);
    case 'rejected':
      return tAdminNews('list.status.rejected', language);
    case 'archived':
      return tAdminNews('list.status.archived', language);
    default:
      return status;
  }
}

function getStatusBadgeStyle(status: NewsStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 600,
  };

  if (status === 'draft') {
    return { ...base, background: 'var(--color-background-surface)', color: 'var(--color-brand-accent-deep)' };
  }
  if (status === 'pending_review') {
    return { ...base, background: '#FEF9C3', color: '#92400E' };
  }
  if (status === 'scheduled') {
    return { ...base, background: '#FEF3C7', color: '#B45309' };
  }
  if (status === 'rejected') {
    return { ...base, background: '#FEE2E2', color: '#B91C1C' };
  }
  if (status === 'archived') {
    return { ...base, background: 'var(--color-border)', color: 'var(--color-text-secondary)' };
  }
  return { ...base, background: '#DCFCE7', color: '#166534' };
}

const thStyle: React.CSSProperties = {
  padding: '0.85rem 1.1rem',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.9rem',
};

const tdStyle: React.CSSProperties = {
  padding: '0.9rem 1.1rem',
  verticalAlign: 'top',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
};

const actionButtonStyle: React.CSSProperties = {
  background: 'var(--color-background-alt)',
  color: 'var(--color-brand-accent-deep)',
  border: 'none',
  borderRadius: '0.7rem',
  padding: '0.45rem 0.9rem',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem',
};

const approveButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  background: '#DCFCE7',
  color: '#166534',
};

const rejectButtonStyle: React.CSSProperties = {
  ...actionButtonStyle,
  background: '#FEE2E2',
  color: '#B91C1C',
};

const stateStyle: React.CSSProperties = {
  borderRadius: '1rem',
  border: '1px dashed var(--color-brand-secondary-soft)',
  padding: '2rem 1.2rem',
  textAlign: 'center' as const,
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.75rem',
};

const retryButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'var(--color-brand-primary-strong)',
  color: 'var(--color-text-on-brand)',
  borderRadius: '999px',
  padding: '0.4rem 0.9rem',
  cursor: 'pointer',
};




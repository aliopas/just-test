import { useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { tAdminUsers } from '../../../locales/adminUsers';
import type { AdminUser } from '../../../types/admin-users';

interface Props {
  users: AdminUser[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function AdminUsersTable({
  users,
  isLoading,
  isError,
  onRetry,
}: Props) {
  const { language, direction } = useLanguage();

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div style={infoStyle}>
          {tAdminUsers('table.loading', language)}
        </div>
      );
    }

    if (isError) {
      return (
        <div style={{ ...infoStyle, background: '#FEF2F2', color: '#B91C1C' }}>
          <span>{tAdminUsers('table.error', language)}</span>
          <button
            type="button"
            onClick={onRetry}
            style={{
              marginInlineStart: '0.75rem',
              padding: '0.45rem 1rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: '#B91C1C',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ↻
          </button>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div style={emptyStateStyle}>
          <strong>{tAdminUsers('table.emptyTitle', language)}</strong>
          <span>{tAdminUsers('table.emptySubtitle', language)}</span>
        </div>
      );
    }

    return (
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0,
            direction,
          }}
        >
          <thead>
            <tr>
              {[
                tAdminUsers('table.email', language),
                tAdminUsers('table.name', language),
                tAdminUsers('table.phone', language),
                tAdminUsers('table.status', language),
                tAdminUsers('table.kyc', language),
                tAdminUsers('table.role', language),
                tAdminUsers('table.createdAt', language),
              ].map(header => (
                <th key={header} style={headerCellStyle}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td style={cellStyle}>{user.email}</td>
                <td style={cellStyle}>{user.fullName ?? '—'}</td>
                <td style={cellStyle}>{user.phone ?? '—'}</td>
                <td style={cellStyle}>{formatStatus(user.status, language)}</td>
                <td style={cellStyle}>
                  {user.kycStatus
                    ? tAdminUsers(`kyc.${user.kycStatus}` as const, language)
                    : '—'}
                </td>
                <td style={cellStyle}>{user.role ?? '—'}</td>
                <td style={cellStyle}>{formatDate(user.createdAt, language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [isLoading, isError, users, language, direction, onRetry]);

  return <section style={tableSectionStyle}>{content}</section>;
}

function formatStatus(status: AdminUser['status'], language: Parameters<typeof tAdminUsers>[1]) {
  return tAdminUsers(`status.${status}` as const, language);
}

function formatDate(value: string, language: Parameters<typeof tAdminUsers>[1]) {
  try {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

const tableSectionStyle: React.CSSProperties = {
  borderRadius: '1rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  background: 'var(--color-background-surface)',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
};

const infoStyle: React.CSSProperties = {
  padding: '1rem 1.25rem',
  borderRadius: '1rem',
  background: 'var(--color-background-alt)',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.75rem',
};

const emptyStateStyle: React.CSSProperties = {
  padding: '2rem 1.5rem',
  borderRadius: '1rem',
  background: 'var(--color-background-alt)',
  color: 'var(--color-text-secondary)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  alignItems: 'center',
  textAlign: 'center',
};

const headerCellStyle: React.CSSProperties = {
  textAlign: 'start' as const,
  padding: '0.9rem 1rem',
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'var(--color-text-secondary)',
  borderBottom: '1px solid var(--color-brand-secondary-soft)',
  background: 'var(--color-background-surface)',
};

const cellStyle: React.CSSProperties = {
  padding: '0.9rem 1rem',
  fontSize: '0.95rem',
  color: 'var(--color-text-primary)',
  borderBottom: '1px solid var(--color-brand-secondary-soft)',
  whiteSpace: 'nowrap' as const,
};



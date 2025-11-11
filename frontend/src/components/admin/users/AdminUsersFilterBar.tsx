import { useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { tAdminUsers } from '../../../locales/adminUsers';
import type {
  AdminUserFilters,
  AdminUserStatus,
} from '../../../types/admin-users';

interface Props {
  filters: AdminUserFilters;
  onChange: (next: AdminUserFilters) => void;
  onReset: () => void;
}

const STATUS_VALUES: Array<AdminUserStatus | 'all'> = [
  'all',
  'pending',
  'active',
  'suspended',
  'deactivated',
];

const KYC_VALUES: Array<Exclude<NonNullable<AdminUserFilters['kycStatus']>, 'all'> | 'all'> =
  ['all', 'pending', 'in_review', 'approved', 'rejected'];

const selectStyle: React.CSSProperties = {
  padding: '0.65rem 0.85rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
  appearance: 'none',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: 'var(--color-text-secondary)',
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  padding: '0.65rem 0.85rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
};

export function AdminUsersFilterBar({ filters, onChange, onReset }: Props) {
  const { language, direction } = useLanguage();

  const statusOptions = useMemo(
    () =>
      STATUS_VALUES.map(value => ({
        value,
        label:
          value === 'all'
            ? tAdminUsers('filters.status.all', language)
            : tAdminUsers(`status.${value}` as const, language),
      })),
    [language]
  );

  const kycOptions = useMemo(
    () =>
      KYC_VALUES.map(value => ({
        value,
        label:
          value === 'all'
            ? tAdminUsers('filters.kyc.all', language)
            : tAdminUsers(`kyc.${value}` as const, language),
      })),
    [language]
  );

  const update = (delta: Partial<AdminUserFilters>) => {
    onChange({
      ...filters,
      page: 1,
      ...delta,
    });
  };

  return (
    <div
      style={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        direction,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>
          {tAdminUsers('filters.status.label', language)}
        </label>
        <select
          value={filters.status ?? 'all'}
          onChange={event =>
            update({
              status: event.target.value as AdminUserFilters['status'],
            })
          }
          style={selectStyle}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>
          {tAdminUsers('filters.kyc.label', language)}
        </label>
        <select
          value={filters.kycStatus ?? 'all'}
          onChange={event =>
            update({
              kycStatus: event.target.value as AdminUserFilters['kycStatus'],
            })
          }
          style={selectStyle}
        >
          {kycOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>
          {tAdminUsers('filters.search.placeholder', language)}
        </label>
        <input
          type="search"
          placeholder={tAdminUsers('filters.search.placeholder', language)}
          value={filters.search ?? ''}
          onChange={event =>
            update({
              search: event.target.value,
            })
          }
          style={{ ...inputStyle, paddingInlineStart: '0.75rem' }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
        }}
      >
        <button
          type='button'
          onClick={onReset}
          style={{
            padding: '0.65rem 1.5rem',
            borderRadius: '0.85rem',
            border: '1px solid var(--color-brand-secondary-soft)',
            background: 'var(--color-background-surface)',
            color: 'var(--color-brand-accent-deep)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {tAdminUsers('filters.reset', language)}
        </button>
      </div>
    </div>
  );
}



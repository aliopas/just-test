import { useMemo } from 'react';
import type { AdminRequestFilters, AdminRequestSortField } from '../../../types/admin';
import { tAdminRequests } from '../../../locales/adminRequests';
import { useLanguage } from '../../../context/LanguageContext';
import { REQUEST_STATUSES } from '../../../utils/requestStatus';

interface Props {
  filters: AdminRequestFilters;
  onChange: (next: AdminRequestFilters) => void;
  onReset: () => void;
}

export function AdminRequestsFilterBar({ filters, onChange, onReset }: Props) {
  const { language, direction } = useLanguage();

  const statusOptions = useMemo(() => {
    return [
      { value: 'all', label: tAdminRequests('status.all', language) },
      ...REQUEST_STATUSES.map(status => ({
        value: status,
        label: tAdminRequests(
          `status.${status}` as Parameters<typeof tAdminRequests>[0],
          language
        ),
      })),
    ];
  }, [language]);

  const typeOptions = useMemo(() => {
    return [
      { value: 'all', label: tAdminRequests('type.all', language) },
      { value: 'buy', label: tAdminRequests('type.buy', language) },
      { value: 'sell', label: tAdminRequests('type.sell', language) },
    ] as Array<{ value: AdminRequestFilters['type']; label: string }>;
  }, [language]);

  const sortOptions: Array<{ value: AdminRequestSortField; label: string }> = [
    { value: 'created_at', label: tAdminRequests('sort.created', language) },
    { value: 'amount', label: tAdminRequests('sort.amount', language) },
    { value: 'status', label: tAdminRequests('sort.status', language) },
  ];

  const update = (delta: Partial<AdminRequestFilters>) => {
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
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        direction,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>{tAdminRequests('filters.status', language)}</label>
        <select
          value={filters.status ?? 'all'}
          onChange={event =>
            update({
              status:
                event.target.value === 'all'
                  ? 'all'
                  : (event.target.value as AdminRequestFilters['status']),
            })
          }
          style={selectStyle}
        >
          {statusOptions.map(option => (
            <option key={option.value ?? 'all'} value={option.value ?? 'all'}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>{tAdminRequests('filters.type', language)}</label>
        <select
          value={filters.type ?? 'all'}
          onChange={event =>
            update({
              type:
                event.target.value === 'all'
                  ? 'all'
                  : (event.target.value as AdminRequestFilters['type']),
            })
          }
          style={selectStyle}
        >
          {typeOptions.map(option => (
            <option key={option.value ?? 'all'} value={option.value ?? 'all'}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>{tAdminRequests('filters.dateFrom', language)}</label>
        <input
          type="date"
          value={filters.createdFrom ?? ''}
          onChange={event =>
            update({
              createdFrom: event.target.value || undefined,
            })
          }
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>{tAdminRequests('filters.dateTo', language)}</label>
        <input
          type="date"
          value={filters.createdTo ?? ''}
          onChange={event =>
            update({
              createdTo: event.target.value || undefined,
            })
          }
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>{tAdminRequests('filters.minAmount', language)}</label>
        <input
          type="number"
          min={0}
          value={filters.minAmount ?? ''}
          onChange={event =>
            update({
              minAmount:
                event.target.value === '' ? undefined : Number(event.target.value),
            })
          }
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>{tAdminRequests('filters.maxAmount', language)}</label>
        <input
          type="number"
          min={0}
          value={filters.maxAmount ?? ''}
          onChange={event =>
            update({
              maxAmount:
                event.target.value === '' ? undefined : Number(event.target.value),
            })
          }
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>{tAdminRequests('sort.label', language)}</label>
        <select
          value={filters.sortBy ?? 'created_at'}
          onChange={event =>
            update({
              sortBy: event.target.value as AdminRequestSortField,
            })
          }
          style={selectStyle}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={labelStyle}>{tAdminRequests('filters.searchPlaceholder', language)}</label>
        <input
          type="search"
          placeholder={tAdminRequests('filters.searchPlaceholder', language)}
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
          gap: '0.75rem',
          justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
        }}
      >
        <button type="button" onClick={onReset} style={resetButtonStyle}>
          {tAdminRequests('filters.reset', language)}
        </button>
        <button
          type="button"
          onClick={() => update({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
          style={applyButtonStyle}
        >
          {filters.order === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#475569',
  fontWeight: 600,
};

const selectStyle: React.CSSProperties = {
  padding: '0.65rem 0.85rem',
  borderRadius: '0.85rem',
  border: '1px solid #CBD5F5',
  background: '#FFFFFF',
  color: '#0F172A',
  fontSize: '0.95rem',
  appearance: 'none',
};

const inputStyle: React.CSSProperties = {
  padding: '0.65rem 0.85rem',
  borderRadius: '0.85rem',
  border: '1px solid #CBD5F5',
  background: '#FFFFFF',
  color: '#0F172A',
  fontSize: '0.95rem',
};

const resetButtonStyle: React.CSSProperties = {
  padding: '0.65rem 1.5rem',
  borderRadius: '0.85rem',
  border: '1px solid #CBD5F5',
  background: '#FFFFFF',
  color: '#1E3A5F',
  fontWeight: 600,
  cursor: 'pointer',
};

const applyButtonStyle: React.CSSProperties = {
  padding: '0.65rem 1.5rem',
  borderRadius: '0.85rem',
  border: 'none',
  background: '#2563EB',
  color: '#FFFFFF',
  fontWeight: 700,
  cursor: 'pointer',
};

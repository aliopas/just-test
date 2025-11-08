import { useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import type { InvestorRequest } from '../../types/request';
import { RequestStatusBadge } from './RequestStatusBadge';
import { RequestProgressBar } from './RequestProgressBar';
import { tRequestList } from '../../locales/requestList';

const typeLabels = {
  buy: {
    en: 'Buy',
    ar: 'شراء',
  },
  sell: {
    en: 'Sell',
    ar: 'بيع',
  },
};

interface RequestListItemProps {
  request: InvestorRequest;
  onSelect: (request: InvestorRequest) => void;
  isSelected?: boolean;
}

export function RequestListItem({
  request,
  onSelect,
  isSelected = false,
}: RequestListItemProps) {
  const { language, direction } = useLanguage();
  const formattedAmount = useMemo(() => {
    try {
      return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: request.currency,
        maximumFractionDigits: 2,
      }).format(request.amount);
    } catch (error) {
      return `${request.amount.toFixed(2)} ${request.currency}`;
    }
  }, [language, request.amount, request.currency]);

  const typeLabel = typeLabels[request.type][language] ?? request.type;

  const updatedAt = useMemo(() => {
    const date = new Date(request.updatedAt);
    return date.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, [language, request.updatedAt]);

  return (
    <button
      type="button"
      onClick={() => onSelect(request)}
      style={{
        width: '100%',
        textAlign: 'start',
        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        background: isSelected ? '#F8FAFF' : '#FFFFFF',
        boxShadow: isSelected
          ? '0 16px 32px rgba(37, 99, 235, 0.15)'
          : '0 12px 30px rgba(15, 23, 42, 0.08)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.2s ease',
        direction,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.85rem',
              color: '#64748B',
              fontWeight: 600,
            }}
          >
            {tRequestList('table.requestNumber', language)}{' '}
            <span style={{ color: '#1E293B' }}>{request.requestNumber}</span>
          </div>
          <div
            style={{
              marginTop: '0.3rem',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: '#0F172A',
            }}
          >
            {formattedAmount}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: direction === 'rtl' ? 'flex-start' : 'flex-end',
            gap: '0.5rem',
          }}
        >
          <RequestStatusBadge status={request.status} />
          <span
            style={{
              fontSize: '0.85rem',
              color: '#475569',
            }}
          >
            {tRequestList('table.type', language)}: {typeLabel}
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              color: '#94A3B8',
            }}
          >
            {tRequestList('table.updatedAt', language)}: {updatedAt}
          </span>
        </div>
      </div>

      <RequestProgressBar status={request.status} />
    </button>
  );
}


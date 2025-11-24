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
  partnership: {
    en: 'Partnership',
    ar: 'شراكة',
  },
  board_nomination: {
    en: 'Board Nomination',
    ar: 'ترشيح مجلس',
  },
  feedback: {
    en: 'Feedback',
    ar: 'ملاحظات',
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
    if (request.amount == null || request.currency == null) {
      return '—';
    }
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
        border: isSelected ? '2px solid var(--color-brand-primary-strong)' : '1px solid var(--color-border)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        background: isSelected ? 'var(--color-background-highlight)' : '#FFFFFF',
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
              color: 'var(--color-text-secondary)',
              fontWeight: 600,
            }}
          >
            {tRequestList('table.requestNumber', language)}{' '}
            <span style={{ color: 'var(--color-brand-accent-deep)' }}>{request.requestNumber}</span>
          </div>
          <div
            style={{
              marginTop: '0.3rem',
              fontSize: '1.4rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
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
              color: 'var(--color-text-secondary)',
            }}
          >
            {tRequestList('table.type', language)}: {typeLabel}
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-brand-secondary-muted)',
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



import type { AdminRequestListMeta } from '../../../types/admin';
import { useLanguage } from '../../../context/LanguageContext';
import { tAdminRequests } from '../../../locales/adminRequests';

interface Props {
  meta: AdminRequestListMeta;
  onPageChange: (page: number) => void;
}

export function AdminRequestsPagination({ meta, onPageChange }: Props) {
  const { language, direction } = useLanguage();

  const handlePrevious = () => {
    if (meta.page > 1) {
      onPageChange(meta.page - 1);
    }
  };

  const handleNext = () => {
    if (meta.hasNext) {
      onPageChange(meta.page + 1);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        direction,
        color: 'var(--color-text-secondary)',
        fontSize: '0.9rem',
      }}
    >
      <span>
        {meta.total > 0
          ? `${meta.page} / ${meta.pageCount} (${meta.total})`
          : '0 / 0 (0)'}
      </span>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={handlePrevious}
          disabled={meta.page <= 1}
          style={{
            ...buttonStyle,
            cursor: meta.page <= 1 ? 'not-allowed' : 'pointer',
            background: meta.page <= 1 ? 'var(--color-background-surface)' : '#FFFFFF',
          }}
        >
          {tAdminRequests('pagination.previous', language)}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!meta.hasNext}
          style={{
            ...buttonStyle,
            cursor: meta.hasNext ? 'pointer' : 'not-allowed',
            background: meta.hasNext ? '#FFFFFF' : 'var(--color-background-surface)',
          }}
        >
          {tAdminRequests('pagination.next', language)}
        </button>
      </div>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: '0.6rem 1.4rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  color: 'var(--color-brand-accent-deep)',
  fontWeight: 600,
  background: 'var(--color-background-surface)',
};




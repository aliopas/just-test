import { useLanguage } from '../../context/LanguageContext';
import { tRequestList } from '../../locales/requestList';

interface RequestListEmptyProps {
  onCreateNew?: () => void;
}

export function RequestListEmpty({ onCreateNew }: RequestListEmptyProps) {
  const { language, direction } = useLanguage();

  return (
    <div
      style={{
        border: '1px dashed var(--color-brand-secondary-soft)',
        borderRadius: '1.5rem',
        padding: '2rem',
        background: 'var(--color-background-highlight)',
        textAlign: 'center',
        color: 'var(--color-brand-accent-deep)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        direction,
      }}
    >
      <div style={{ fontSize: '2rem' }}>ðŸ“„</div>
      <h3
        style={{
          margin: 0,
          fontSize: '1.5rem',
          fontWeight: 700,
        }}
      >
        {tRequestList('emptyState.title', language)}
      </h3>
      <p
        style={{
          margin: 0,
          maxWidth: '22rem',
          color: 'var(--color-text-secondary)',
        }}
      >
        {tRequestList('emptyState.subtitle', language)}
      </p>
      {onCreateNew && (
        <button
          type="button"
          onClick={onCreateNew}
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '999px',
            background: 'var(--color-brand-primary-strong)',
            color: 'var(--color-text-on-brand)',
            border: 'none',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {tRequestList('emptyState.cta', language)}
        </button>
      )}
    </div>
  );
}




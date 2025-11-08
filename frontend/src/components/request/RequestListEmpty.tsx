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
        border: '1px dashed #CBD5F5',
        borderRadius: '1.5rem',
        padding: '2rem',
        background: '#F8FBFF',
        textAlign: 'center',
        color: '#1E3A5F',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'center',
        direction,
      }}
    >
      <div style={{ fontSize: '2rem' }}>📄</div>
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
          color: '#475569',
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
            background: '#2563EB',
            color: '#FFFFFF',
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


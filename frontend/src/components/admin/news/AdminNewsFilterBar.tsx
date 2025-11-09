import { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { tAdminNews } from '../../../locales/adminNews';
import type { NewsStatus } from '../../../types/news';

interface Props {
  status: NewsStatus | 'all';
  onStatusChange: (status: NewsStatus | 'all') => void;
  search: string;
  onSearchChange: (term: string) => void;
  onCreate: () => void;
  onPublishScheduled: () => Promise<void>;
  isPublishPending: boolean;
}

export function AdminNewsFilterBar({
  status,
  onStatusChange,
  search,
  onSearchChange,
  onCreate,
  onPublishScheduled,
  isPublishPending,
}: Props) {
  const { language, direction } = useLanguage();
  const [isPublishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await onPublishScheduled();
    } catch (error) {
      console.error('Failed to publish scheduled news:', error);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <section
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'space-between',
        alignItems: 'center',
        direction,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <input
          type="search"
          placeholder={tAdminNews('list.searchPlaceholder', language)}
          value={search}
          onChange={event => onSearchChange(event.target.value)}
          style={searchInputStyle}
        />
        <select
          value={status}
          onChange={event => onStatusChange(event.target.value as NewsStatus | 'all')}
          style={selectStyle}
        >
          <option value="all">{tAdminNews('list.status.all', language)}</option>
          <option value="draft">{tAdminNews('list.status.draft', language)}</option>
          <option value="pending_review">
            {tAdminNews('list.status.pending_review', language)}
          </option>
          <option value="scheduled">{tAdminNews('list.status.scheduled', language)}</option>
          <option value="published">{tAdminNews('list.status.published', language)}</option>
          <option value="rejected">{tAdminNews('list.status.rejected', language)}</option>
          <option value="archived">{tAdminNews('list.status.archived', language)}</option>
        </select>
      </div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishPending || isPublishing}
          style={{
            ...secondaryButtonStyle,
            cursor: isPublishPending || isPublishing ? 'not-allowed' : 'pointer',
            opacity: isPublishPending || isPublishing ? 0.65 : 1,
          }}
        >
          {isPublishPending || isPublishing
            ? `${tAdminNews('list.actions.publishScheduled', language)}â€¦`
            : tAdminNews('list.actions.publishScheduled', language)}
        </button>
        <button type="button" onClick={onCreate} style={primaryButtonStyle}>
          {tAdminNews('list.actions.new', language)}
        </button>
      </div>
    </section>
  );
}

const searchInputStyle: React.CSSProperties = {
  minWidth: '220px',
  padding: '0.65rem 1rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  fontSize: '0.95rem',
  color: 'var(--color-text-primary)',
  background: 'var(--color-background-surface)',
};

const selectStyle: React.CSSProperties = {
  padding: '0.65rem 1rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  fontSize: '0.95rem',
  color: 'var(--color-text-primary)',
  background: 'var(--color-background-surface)',
  minWidth: '180px',
};

const primaryButtonStyle: React.CSSProperties = {
  background: 'var(--color-brand-primary-strong)',
  color: 'var(--color-text-on-brand)',
  border: 'none',
  borderRadius: '0.85rem',
  padding: '0.7rem 1.6rem',
  fontWeight: 600,
  fontSize: '0.95rem',
  cursor: 'pointer',
  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.18)',
};

const secondaryButtonStyle: React.CSSProperties = {
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-primary)',
  borderRadius: '0.85rem',
  padding: '0.7rem 1.4rem',
  fontWeight: 600,
  fontSize: '0.95rem',
  border: '1px solid var(--color-brand-secondary-soft)',
};




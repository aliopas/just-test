import { useLanguage } from '../../context/LanguageContext';
import { getMessage } from '../../locales/investorProfile';

interface ProfileEmptyStateProps {
  onCreate: () => void;
  isCreating: boolean;
}

export function ProfileEmptyState({
  onCreate,
  isCreating,
}: ProfileEmptyStateProps) {
  const { language } = useLanguage();

  return (
    <div
      style={{
        border: '2px dashed var(--color-brand-secondary-soft)',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        textAlign: 'center',
        background: 'var(--color-background-surface)',
      }}
    >
      <div
        style={{
          fontSize: '3rem',
        }}
      >
        🗂️
      </div>
      <h2
        style={{
          fontSize: '1.5rem',
          margin: '0.75rem 0 0.5rem',
          color: 'var(--color-text-primary)',
        }}
      >
        {getMessage('status.empty', language)}
      </h2>
      <p
        style={{
          color: 'var(--color-text-muted)',
          maxWidth: '32rem',
          margin: '0 auto 1.5rem',
        }}
      >
        {language === 'ar'
          ? 'ابدأ بإضافة بياناتك الشخصية لإكمال التحقق من الهوية والاستفادة من الخدمات الموجهة لك.'
          : 'Start by adding your personal details to complete verification and unlock tailored services.'}
      </p>
      <button
        type="button"
        onClick={onCreate}
        disabled={isCreating}
        style={{
          padding: '0.85rem 1.6rem',
          borderRadius: '0.9rem',
          border: 'none',
          background: 'var(--color-brand-primary)',
          color: 'var(--color-text-on-brand)',
          cursor: isCreating ? 'progress' : 'pointer',
          fontWeight: 700,
        }}
      >
        {isCreating
          ? getMessage('status.loading', language)
          : getMessage('actions.edit', language)}
      </button>
    </div>
  );
}




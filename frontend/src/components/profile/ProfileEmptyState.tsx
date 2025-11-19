import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { getMessage } from '../../locales/investorProfile';

interface ProfileEmptyStateProps {
  onCreate: () => void;
  isCreating: boolean;
}

function InfoPair({ label, value }: { label: string; value?: string | null }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.85rem',
        border: '1px solid var(--color-border-soft)',
        background: 'var(--color-background-surface)',
        textAlign: 'left',
      }}
    >
      <span
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          minHeight: '1.25rem',
        }}
      >
        {value || '\u2014'}
      </span>
    </div>
  );
}

export function ProfileEmptyState({
  onCreate,
  isCreating,
}: ProfileEmptyStateProps) {
  const { language, direction } = useLanguage();
  const { user } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      {/* User Basic Info Section */}
      {user && (
        <div
          style={{
            border: '1px solid var(--color-border-soft)',
            borderRadius: '1.25rem',
            padding: '1.75rem',
            background: 'var(--color-background-surface)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1.25rem',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            {language === 'ar' ? 'البيانات الأساسية' : 'Basic Information'}
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
              direction,
            }}
          >
            <InfoPair
              label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              value={user.email}
            />
            <InfoPair
              label={language === 'ar' ? 'معرف المستخدم' : 'User ID'}
              value={user.id}
            />
          </div>
        </div>
      )}

      {/* Empty Profile Message */}
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
    </div>
  );
}




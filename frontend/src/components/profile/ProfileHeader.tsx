import { getMessage } from '../../locales/investorProfile';
import type { InvestorProfile } from '../../types/investor';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface ProfileHeaderProps {
  profile: InvestorProfile | null;
  onEdit: () => void;
  isEditing: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLanguageChange?: (language: InvestorProfile['language']) => void;
}

export function ProfileHeader({
  profile,
  onEdit,
  isEditing,
  onRefresh,
  isRefreshing,
  onLanguageChange,
}: ProfileHeaderProps) {
  const { language } = useLanguage();
  const lastUpdated = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '1.5rem 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-text-primary)',
            }}
          >
            {getMessage('pageTitle', language)}
          </h1>
          {lastUpdated && (
            <p
              style={{
                margin: '0.35rem 0 0',
                color: 'var(--color-text-muted)',
                fontSize: '0.95rem',
              }}
            >
              {getMessage('lastUpdated', language)}: {lastUpdated}
            </p>
          )}
        </div>
        <LanguageSwitcher onChange={onLanguageChange} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onEdit}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.1rem',
            borderRadius: '0.75rem',
            border: '1px solid transparent',
            background: isEditing ? 'var(--color-brand-accent-deep)' : 'var(--color-brand-primary)',
            color: 'var(--color-text-on-brand)',
            cursor: 'pointer',
            fontWeight: 600,
            minWidth: '8rem',
          }}
        >
          {'\u270F\uFE0F'} {getMessage('actions.edit', language)}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.45rem',
            padding: '0.65rem 1.1rem',
            borderRadius: '0.75rem',
            border: '1px solid var(--color-brand-secondary-soft)',
            background: 'var(--color-background-surface)',
            color: 'var(--color-brand-accent-deep)',
            cursor: isRefreshing ? 'progress' : 'pointer',
            fontWeight: 600,
            opacity: isRefreshing ? 0.7 : 1,
            minWidth: '8rem',
          }}
        >
          {'\u21BB'} {isRefreshing
            ? `${getMessage('status.loading', language)}`
            : getMessage('actions.refresh', language)}
        </button>
      </div>
    </header>
  );
}




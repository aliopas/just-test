import { useLanguage } from '../../context/LanguageContext';
import { getMessage } from '../../locales/investorProfile';

export function ProfileSkeleton() {
  const { language, direction } = useLanguage();
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        direction,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          height: '2.5rem',
          borderRadius: '1.25rem',
          background:
            'linear-gradient(90deg, var(--color-background-base) 0%, var(--color-border-soft) 50%, var(--color-background-base) 100%)',
          animation: 'pulse 1.6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{
              borderRadius: '1rem',
              background:
                'linear-gradient(90deg, var(--color-background-surface) 0%, var(--color-background-base) 50%, var(--color-background-surface) 100%)',
              height: '5.5rem',
              animation: 'pulse 1.6s ease-in-out infinite',
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: '0.95rem',
          color: 'var(--color-text-muted)',
        }}
      >
        {getMessage('status.loading', language)}
      </span>
    </div>
  );
}



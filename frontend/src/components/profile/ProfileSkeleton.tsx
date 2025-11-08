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
            'linear-gradient(90deg, #F3F4F6 0%, #E5E7EB 50%, #F3F4F6 100%)',
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
                'linear-gradient(90deg, #F9FAFB 0%, #ECEFF3 50%, #F9FAFB 100%)',
              height: '5.5rem',
              animation: 'pulse 1.6s ease-in-out infinite',
            }}
          />
        ))}
      </div>
      <span
        style={{
          fontSize: '0.95rem',
          color: '#6B7280',
        }}
      >
        {getMessage('status.loading', language)}
      </span>
    </div>
  );
}


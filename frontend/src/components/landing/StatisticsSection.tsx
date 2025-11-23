import { memo } from 'react';
import { palette } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';

interface Statistic {
  value: string;
  label: string;
  icon: JSX.Element;
}

const statisticsEn: Statistic[] = [
  {
    value: '5+',
    label: 'Active Projects',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    value: '100+',
    label: 'Partners',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: '5+',
    label: 'Years Experience',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

const statisticsAr: Statistic[] = [
  {
    value: '5+',
    label: 'مشروع نشط',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    value: '100+',
    label: 'شريك',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    value: '5+',
    label: 'سنوات من الخبرة',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
];

export const StatisticsSection = memo(function StatisticsSection() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const statistics = isArabic ? statisticsAr : statisticsEn;
  const title = isArabic ? 'إنجازاتنا بالأرقام' : 'Our Achievements in Numbers';

  return (
    <section
      style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}08 0%, ${palette.brandSecondarySoft}12 100%)`,
        borderRadius: '2rem',
        marginTop: '2rem',
        marginBottom: '2rem',
      }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: '3rem',
          fontSize: '2.25rem',
          fontWeight: 700,
          color: palette.textPrimary,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondaryMuted})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
        }}
      >
        {statistics.map((stat, index) => (
          <div
            key={index}
            style={{
              padding: '2rem 1.5rem',
              borderRadius: '1.5rem',
              background: palette.backgroundSurface,
              border: `1.5px solid ${palette.neutralBorderSoft}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(15, 23, 42, 0.12)';
              e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.06)';
              e.currentTarget.style.borderColor = palette.neutralBorderSoft;
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '1rem',
                background: `linear-gradient(135deg, ${palette.brandSecondarySoft}30, ${palette.brandPrimaryStrong}20)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: palette.brandPrimaryStrong,
              }}
            >
              {stat.icon}
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: palette.brandPrimaryStrong,
                lineHeight: 1.2,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: palette.textSecondary,
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});


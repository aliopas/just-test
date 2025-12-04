'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Logo } from '@/components/Logo';
import { palette } from '@/styles/theme';
import { useCompanyLogoUrl } from '@/hooks/usePublicContent';

export function AppFooter() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const companyLogoUrl = useCompanyLogoUrl();
  
  return (
    <footer
      style={{
        textAlign: 'center',
        padding: '2.5rem 1rem 3.5rem',
        color: palette.textSecondary,
        background: palette.backgroundBase,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <Logo size={96} stacked tagline="Bacura · Empowering smart capital" logoUrl={companyLogoUrl} />
      <div
        style={{
          marginTop: '1.5rem',
          fontSize: '0.9rem',
          color: palette.textSecondary,
        }}
      >
        <p style={{ margin: 0 }}>
          {isArabic ? 'تم التطوير بواسطة حاضنة باكورة التقنيات الرقمية' : 'Developed by Bacura Technologies Team'}
        </p>
      </div>
    </footer>
  );
}


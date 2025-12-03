'use client';

import { InvestorSidebarNav } from '@/components/navigation/InvestorSidebarNav';
import { AppFooter } from '@/components/AppFooter';
import { useLanguage } from '@/context/LanguageContext';
import { palette } from '@/styles/theme';

export const dynamic = 'force-dynamic';

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language } = useLanguage();
  
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: palette.backgroundBase,
      }}
    >
      <a
        href="#main-content"
        className="skip-to-main"
        style={{
          position: 'absolute',
          top: '-40px',
          left: 0,
          background: palette.brandPrimaryStrong,
          color: palette.textOnBrand,
          padding: '0.5rem 1rem',
          textDecoration: 'none',
          zIndex: 10000,
          borderRadius: '0 0 0.5rem 0',
        }}
        onFocus={(e) => {
          e.currentTarget.style.top = '0';
        }}
        onBlur={(e) => {
          e.currentTarget.style.top = '-40px';
        }}
      >
        {language === 'ar' ? 'انتقل إلى المحتوى الرئيسي' : 'Skip to main content'}
      </a>
      <InvestorSidebarNav />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <main
          id="main-content"
          style={{
            flex: 1,
            padding: '2rem',
            minWidth: 0,
          }}
        >
          {children}
        </main>
        <AppFooter />
      </div>
    </div>
  );
}


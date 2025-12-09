'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLogout } from '@/hooks/useLogout';
import { Logo } from '@/components/Logo';
import { palette } from '@/styles/theme';
import { useCompanyLogoUrl } from '@/hooks/useSupabaseTables';

const navLinkStyle: React.CSSProperties = {
  borderRadius: '0.75rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  padding: '0.65rem 1.35rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  background: 'transparent',
  color: palette.textPrimary,
};

export function HeaderNav() {
  const { language, direction } = useLanguage();
  const logout = useLogout();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const companyLogoUrl = useCompanyLogoUrl();
  const portalName =
    language === 'ar' ? 'شركاء باكورة التقنيات' : 'Bacura Technologies Partners';
  const portalSubtitle =
    language === 'ar'
      ? 'تجربة موحدة لاستقبال المستثمرين.'
      : 'Investor onboarding, profiling, and request submission experiences.';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const navItems = [
    { to: '/dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard' },
    { to: '/requests', labelAr: 'طلباتي', labelEn: 'My Requests' },
    { to: '/requests/new', labelAr: 'طلب استثماري', labelEn: 'New Request' },
    {
      to: '/internal-news',
      labelAr: 'الأخبار الداخلية',
      labelEn: 'Internal News',
    },
    {
      to: '/profile',
      labelAr: 'الملف الاستثماري',
      labelEn: 'Investor Profile',
    },
  ];

  return (
    <>
      <header
        style={{
          background: palette.backgroundSurface,
          color: palette.textPrimary,
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          rowGap: '0.5rem',
          borderBottom: `1px solid ${palette.neutralBorderSoft}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.85rem',
          flexWrap: 'wrap',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '0.85rem',
            flexWrap: 'wrap',
            maxWidth: '100%',
          }}
        >
          <Logo size={56} showWordmark={false} aria-hidden logoUrl={companyLogoUrl} />
          <div
            style={{
              display: 'flex',
              flexDirection: language === 'ar' ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: palette.textPrimary,
                whiteSpace: 'nowrap',
              }}
            >
              {portalName}
            </span>
            <span
              style={{
                fontSize: '0.95rem',
                color: palette.textSecondary,
              }}
            >
              {portalSubtitle}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="mobile-menu-button"
          aria-label={language === 'ar' ? 'فتح القائمة' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          style={{
            display: 'none',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            color: palette.textPrimary,
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
      <nav
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.to || (item.to === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.to}
              href={item.to}
              style={{
                ...navLinkStyle,
                background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
                color: isActive ? palette.textPrimary : palette.textSecondary,
                minHeight: '44px',
                minWidth: '44px',
              }}
            >
              {language === 'ar' ? item.labelAr : item.labelEn}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => logout.mutate()}
          style={{
            ...navLinkStyle,
            borderColor: palette.brandPrimaryStrong,
            background: palette.brandPrimaryStrong,
            color: palette.textOnBrand,
            minHeight: '44px',
            minWidth: '44px',
          }}
          disabled={logout.isPending}
          aria-label={language === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
        >
          {logout.isPending
            ? language === 'ar'
              ? 'جارٍ تسجيل الخروج…'
              : 'Signing out…'
            : language === 'ar'
              ? 'تسجيل الخروج'
              : 'Sign out'}
        </button>
      </nav>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
        dir={direction}
        aria-label={language === 'ar' ? 'القائمة الرئيسية' : 'Main navigation'}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: `1px solid ${palette.neutralBorderSoft}`,
          }}
        >
          <Logo size={48} showWordmark={false} aria-hidden logoUrl={companyLogoUrl} />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
              background: palette.backgroundSurface,
              color: palette.textPrimary,
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.to || (item.to === '/dashboard' && pathname === '/');
            return (
              <Link
                key={item.to}
                href={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  ...navLinkStyle,
                  background: isActive ? palette.brandSecondarySoft : 'transparent',
                  color: isActive ? palette.textPrimary : palette.textSecondary,
                  padding: '1rem 1.25rem',
                  minHeight: '48px',
                  width: '100%',
                  textAlign: direction === 'rtl' ? 'right' : 'left',
                }}
              >
                {language === 'ar' ? item.labelAr : item.labelEn}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              logout.mutate();
            }}
            style={{
              ...navLinkStyle,
              borderColor: palette.brandPrimaryStrong,
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              padding: '1rem 1.25rem',
              minHeight: '48px',
              width: '100%',
              marginTop: '1rem',
            }}
            disabled={logout.isPending}
            aria-label={language === 'ar' ? 'تسجيل الخروج' : 'Sign out'}
          >
            {logout.isPending
              ? language === 'ar'
                ? 'جارٍ تسجيل الخروج…'
                : 'Signing out…'
              : language === 'ar'
                ? 'تسجيل الخروج'
                : 'Sign out'}
          </button>
        </div>
      </nav>
    </>
  );
}


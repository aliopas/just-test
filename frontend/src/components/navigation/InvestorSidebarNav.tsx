'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useLogout } from '@/hooks/useLogout';
import { Logo } from '@/components/Logo';
import { palette } from '@/styles/theme';
import { useCompanyLogoUrl } from '@/hooks/usePublicContent';

const adminSidebarLinkBase: React.CSSProperties = {
  borderRadius: '0.85rem',
  padding: '0.85rem 1rem',
  fontWeight: 600,
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.85rem',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: `1px solid ${palette.neutralBorderSoft}`,
};

export function InvestorSidebarNav() {
  const { language, direction } = useLanguage();
  const logout = useLogout();
  const pathname = usePathname();
  const companyLogoUrl = useCompanyLogoUrl();
  const portalName =
    language === 'ar' ? 'شركاء باكورة التقنيات' : 'Bacura Technologies Partners';
  const portalSubtitle =
    language === 'ar'
      ? 'تجربة موحدة لاستقبال المستثمرين.'
      : 'Investor onboarding, profiling, and request submission experiences.';
  const isArabic = language === 'ar';

  const navItems = [
    { to: '/home', labelAr: 'الرئيسية', labelEn: 'Home' },
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
    <aside
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        background: palette.backgroundSurface,
        color: palette.textPrimary,
        width: '280px',
        minHeight: '100vh',
        borderInlineEnd: `1px solid ${palette.neutralBorderSoft}`,
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: isArabic ? 'row-reverse' : 'row',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <Logo size={48} showWordmark={false} aria-hidden logoUrl={companyLogoUrl} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isArabic ? 'flex-end' : 'flex-start',
              gap: '0.35rem',
            }}
          >
            <span
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: palette.textPrimary,
              }}
            >
              {portalName}
            </span>
            <span
              style={{
                fontSize: '0.9rem',
                color: palette.textSecondary,
                lineHeight: 1.4,
              }}
            >
              {portalSubtitle}
            </span>
          </div>
        </div>
        <nav
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.to || (item.to === '/home' && pathname === '/');
            return (
              <Link
                key={item.to}
                href={item.to}
                style={{
                  ...adminSidebarLinkBase,
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  justifyContent: isArabic ? 'flex-end' : 'flex-start',
                  textAlign: isArabic ? 'right' : 'left',
                  background: isActive ? palette.brandSecondarySoft : 'transparent',
                  color: isActive ? palette.textPrimary : palette.textSecondary,
                  borderColor: isActive ? palette.brandSecondary : palette.neutralBorderSoft,
                  boxShadow: isActive ? '0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                }}
              >
                <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        type="button"
        onClick={() => logout.mutate()}
        style={{
          ...adminSidebarLinkBase,
          marginTop: 'auto',
          justifyContent: 'center',
          borderColor: palette.brandPrimaryStrong,
          background: palette.brandPrimaryStrong,
          color: palette.textOnBrand,
          position: 'sticky',
          bottom: '1.5rem',
        }}
        disabled={logout.isPending}
      >
        {logout.isPending
          ? language === 'ar'
            ? 'جارٍ تسجيل الخروج…'
            : 'Signing out…'
          : language === 'ar'
            ? 'تسجيل الخروج'
            : 'Sign out'}
      </button>
    </aside>
  );
}


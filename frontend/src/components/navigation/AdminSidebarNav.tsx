'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useLogout } from '@/hooks/useLogout';
import { Logo } from '@/components/Logo';
import { palette } from '@/styles/theme';
import { useCompanyLogoUrl } from '@/hooks/useSupabaseTables';
import { useNotifications } from '@/hooks/useNotifications';
import { useUnreadSignupRequestCount } from '@/hooks/useAdminAccountRequests';

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

const adminNavItems = [
  {
    to: '/admin/dashboard',
    labelAr: 'لوحة المتابعة',
    labelEn: 'Dashboard',
  },
  {
    to: '/admin/requests',
    labelAr: 'الطلبات الواردة',
    labelEn: 'Incoming requests',
  },
  {
    to: '/admin/news',
    labelAr: 'الأخبار والمحتوى',
    labelEn: 'News & content',
  },
  {
    to: '/admin/projects',
    labelAr: 'المشاريع الاستثمارية',
    labelEn: 'Investment Projects',
  },
  {
    to: '/admin/company-content',
    labelAr: 'إدارة المحتوى العام',
    labelEn: 'Company Content',
  },
  {
    to: '/admin/signup-requests',
    labelAr: 'طلب إنشاء حساب مستثمر جديد',
    labelEn: 'New investor signup request',
  },
  {
    to: '/admin/investors',
    labelAr: 'إدارة المستثمرين',
    labelEn: 'Investors',
  },
  {
    to: '/admin/reports',
    labelAr: 'التقارير',
    labelEn: 'Reports',
  },
  {
    to: '/admin/audit',
    labelAr: 'سجل التدقيق',
    labelEn: 'Audit log',
  },
];

export function AdminSidebarNav() {
  const { language, direction } = useLanguage();
  const logout = useLogout();
  const pathname = usePathname();
  const companyLogoUrl = useCompanyLogoUrl();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const portalName =
    language === 'ar' ? 'لوحة تحكم إدارة باكورة' : 'Bakurah Admin Console';
  const portalSubtitle =
    language === 'ar'
      ? 'إدارة الطلبات والأخبار والمحتوى التشغيلي لمنصة باكورة.'
      : 'Manage investor requests, news, and operational content for Bakurah.';
  const isArabic = language === 'ar';
  
  // Get unread notifications count
  const { meta: notificationsMeta } = useNotifications({ status: 'all', page: 1 });
  const unreadNotificationsCount = notificationsMeta.unreadCount ?? 0;
  
  // Get unread signup requests count
  const { data: signupRequestsData } = useUnreadSignupRequestCount();
  const unreadSignupRequestsCount = (signupRequestsData as { unreadCount?: number } | undefined)?.unreadCount ?? 0;

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isSidebarOpen]);

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setIsSidebarOpen(true)}
        className="mobile-menu-button"
        aria-label={language === 'ar' ? 'فتح القائمة' : 'Open menu'}
        aria-expanded={isSidebarOpen}
        style={{
          position: 'fixed',
          top: '1rem',
          left: direction === 'rtl' ? 'auto' : '1rem',
          right: direction === 'rtl' ? '1rem' : 'auto',
          zIndex: 1001,
          display: 'none',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: `1px solid ${palette.neutralBorderSoft}`,
          background: palette.backgroundSurface,
          color: palette.textPrimary,
          cursor: 'pointer',
          minWidth: '44px',
          minHeight: '44px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
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

      {/* Sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        dir={isArabic ? 'rtl' : 'ltr'}
        className={isSidebarOpen ? 'open' : ''}
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
        {/* Close button for mobile */}
        <button
          type="button"
          onClick={() => setIsSidebarOpen(false)}
          className="mobile-close-button"
          aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
          style={{
            display: 'none',
            alignSelf: isArabic ? 'flex-start' : 'flex-end',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            color: palette.textPrimary,
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
            marginBottom: '-1rem',
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
          {adminNavItems.map((item) => {
            const isRequestsItem = item.to === '/admin/requests';
            const isSignupRequestsItem = item.to === '/admin/signup-requests';
            
            let badgeCount = 0;
            if (isRequestsItem) {
              badgeCount = unreadNotificationsCount;
            } else if (isSignupRequestsItem) {
              badgeCount = unreadSignupRequestsCount;
            }
            
            const showBadge = badgeCount > 0;
            const isActive = pathname === item.to || (item.to === '/admin/dashboard' && pathname === '/admin');
            
            return (
              <Link
                key={item.to}
                href={item.to}
                style={{
                  ...adminSidebarLinkBase,
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  justifyContent: showBadge ? 'space-between' : (isArabic ? 'flex-end' : 'flex-start'),
                  textAlign: isArabic ? 'right' : 'left',
                  background: isActive ? palette.brandSecondarySoft : 'transparent',
                  color: isActive ? palette.textPrimary : palette.textSecondary,
                  borderColor: isActive ? palette.brandSecondary : palette.neutralBorderSoft,
                  boxShadow: isActive ? '0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                  position: 'relative',
                }}
              >
                <span>{language === 'ar' ? item.labelAr : item.labelEn}</span>
                {showBadge && (
                  <span
                    style={{
                      minWidth: '1.5rem',
                      height: '1.5rem',
                      borderRadius: '999px',
                      backgroundColor: palette.brandPrimaryStrong,
                      color: palette.textOnBrand,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                    aria-label={
                      isArabic
                        ? `${badgeCount} ${isRequestsItem ? 'إشعار غير مقروء' : 'طلب غير مقروء'}`
                        : `${badgeCount} unread ${isRequestsItem ? 'notification' : 'request'}${badgeCount > 1 ? 's' : ''}`
                    }
                  >
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
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
    </>
  );
}


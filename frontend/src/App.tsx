import { Fragment, useState, useEffect } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NewRequestPage } from './pages/NewRequestPage';
import { ProfilePage } from './pages/ProfilePage';
import { useLanguage } from './context/LanguageContext';
import { useLogout } from './hooks/useLogout';
import { Logo } from './components/Logo';
import './styles/global.css';
import './styles/responsive.css';
import { palette } from './styles/theme';
import { LoginPage } from './pages/LoginPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { useAuth } from './context/AuthContext';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { PublicLandingPage } from './pages/PublicLandingPage';
import { AdminRequestsInboxPage } from './pages/AdminRequestsInboxPage';
import { AdminRequestDetailPage } from './pages/AdminRequestDetailPage';
import { InvestorNewsListPage } from './pages/InvestorNewsListPage';
import { InvestorNewsDetailPage } from './pages/InvestorNewsDetailPage';
import { InvestorProjectDetailPage } from './pages/InvestorProjectDetailPage';
import { AdminNewsPage } from './pages/AdminNewsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminAuditLogPage } from './pages/AdminAuditLogPage';
import { AdminInvestorsPage } from './pages/AdminInvestorsPage';
import { InvestorDashboardPage } from './pages/InvestorDashboardPage';
import { MyRequestsPage } from './pages/MyRequestsPage';
import { AdminSignupRequestsPage } from './pages/AdminSignupRequestsPage';
import { InvestorInternalNewsPage } from './pages/InvestorInternalNewsPage';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { useNotifications } from './hooks/useNotifications';
import { useUnreadSignupRequestCount } from './hooks/useAdminAccountRequests';

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

const adminNavItems = [
  {
    to: '/admin/dashboard',
    labelAr: 'لوحة المتابعة',
    labelEn: 'Dashboard',
  },
  {
    to: '/admin/requests',
    labelAr: 'طلبات الاستثمار الواردة',
    labelEn: 'Incoming investment requests',
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

function HeaderNav(): JSX.Element {
  const { language, direction } = useLanguage();
  const logout = useLogout();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const portalName =
    language === 'ar' ? 'بوابة باكورة للمستثمرين' : 'Bakurah Investors Portal';
  const portalSubtitle =
    language === 'ar'
            ? 'تجربة موحدة لاستقبال المستثمرين.'
      : 'Investor onboarding, profiling, and request submission experiences.';

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
    { to: '/home', labelAr: 'الرئيسية', labelEn: 'Home' },
    { to: '/requests', labelAr: 'طلباتي', labelEn: 'My Requests' },
    { to: '/requests/new', labelAr: 'طلب استثماري', labelEn: 'New Request' },
    { to: '/internal-news', labelAr: 'الأخبار الداخلية', labelEn: 'Internal News' },
    { to: '/profile', labelAr: 'الملف الاستثماري', labelEn: 'Investor Profile' },
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
          <Logo size={56} showWordmark={false} aria-hidden />
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
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              ...navLinkStyle,
              background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
              color: isActive ? palette.textPrimary : palette.textSecondary,
              minHeight: '44px',
              minWidth: '44px',
            })}
            end={item.to === '/home'}
          >
            {language === 'ar' ? item.labelAr : item.labelEn}
          </NavLink>
        ))}
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
          <Logo size={48} showWordmark={false} aria-hidden />
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
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              style={({ isActive }) => ({
                ...navLinkStyle,
                background: isActive ? palette.brandSecondarySoft : 'transparent',
                color: isActive ? palette.textPrimary : palette.textSecondary,
                padding: '1rem 1.25rem',
                minHeight: '48px',
                width: '100%',
                textAlign: direction === 'rtl' ? 'right' : 'left',
              })}
              end={item.to === '/home'}
            >
              {language === 'ar' ? item.labelAr : item.labelEn}
            </NavLink>
          ))}
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

function AdminSidebarNav(): JSX.Element {
  const { language, direction } = useLanguage();
  const logout = useLogout();
  const location = useLocation();
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
  }, [location.pathname]);

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
          <Logo size={48} showWordmark={false} aria-hidden />
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
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin/dashboard'}
                style={({ isActive }) => ({
                  ...adminSidebarLinkBase,
                  flexDirection: isArabic ? 'row-reverse' : 'row',
                  justifyContent: showBadge ? 'space-between' : (isArabic ? 'flex-end' : 'flex-start'),
                  textAlign: isArabic ? 'right' : 'left',
                  background: isActive ? palette.brandSecondarySoft : 'transparent',
                  color: isActive ? palette.textPrimary : palette.textSecondary,
                  borderColor: isActive ? palette.brandSecondary : palette.neutralBorderSoft,
                  boxShadow: isActive ? '0 0 0 1px rgba(0,0,0,0.04)' : 'none',
                  position: 'relative',
                })}
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
              </NavLink>
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

function AppFooter(): JSX.Element {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  
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
      <Logo size={96} stacked tagline="Bacura · Empowering smart capital" />
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

function InvestorApp(): JSX.Element {
  const { language } = useLanguage();
  
  return (
    <Fragment>
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
      <HeaderNav />
      <main id="main-content">
        <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/dashboard" element={<InvestorDashboardPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/requests" element={<MyRequestsPage />} />
        <Route path="/requests/new" element={<NewRequestPage />} />
        <Route path="/internal-news" element={<InvestorInternalNewsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/news" element={<InvestorNewsListPage />} />
        <Route path="/news/:id" element={<InvestorNewsDetailPage />} />
        <Route path="/projects/:id" element={<InvestorProjectDetailPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
      <AppFooter />
    </Fragment>
  );
}

function AdminApp(): JSX.Element {
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
      <AdminSidebarNav />
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
          <Routes>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/requests" element={<AdminRequestsInboxPage />} />
            <Route path="/admin/requests/:id" element={<AdminRequestDetailPage />} />
            <Route path="/admin/news" element={<AdminNewsPage />} />
            <Route path="/admin/projects" element={<AdminProjectsPage />} />
            <Route path="/admin/signup-requests" element={<AdminSignupRequestsPage />} />
            <Route path="/admin/investors" element={<AdminInvestorsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/audit" element={<AdminAuditLogPage />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export function App() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify" element={<VerifyOtpPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (user?.role === 'admin') {
    return <AdminApp />;
  }

  return <InvestorApp />;
}

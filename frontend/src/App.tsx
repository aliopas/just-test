import { Fragment } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NewRequestPage } from './pages/NewRequestPage';
import { ProfilePage } from './pages/ProfilePage';
import { useLanguage } from './context/LanguageContext';
import { useLogout } from './hooks/useLogout';
import { Logo } from './components/Logo';
import './styles/global.css';
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
    labelAr: 'طلبات الاستثمار',
    labelEn: 'Requests inbox',
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

function HeaderNav() {
  const { language } = useLanguage();
  const logout = useLogout();
  const portalName =
    language === 'ar' ? 'بوابة باكورة للمستثمرين' : 'Bakurah Investors Portal';
  const portalSubtitle =
    language === 'ar'
            ? 'تجربة موحدة لاستقبال المستثمرين.'
      : 'Investor onboarding, profiling, and request submission experiences.';

  return (
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
      <nav
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <NavLink
          to="/home"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
            color: isActive ? palette.textPrimary : palette.textSecondary,
          })}
          end
        >
          {language === 'ar' ? 'الرئيسية' : 'Home'}
        </NavLink>
        <NavLink
          to="/dashboard"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
            color: isActive ? palette.textPrimary : palette.textSecondary,
          })}
          end
        >
          {language === 'ar' ? 'لوحة المتابعة' : 'Dashboard'}
        </NavLink>
        <NavLink
          to="/requests"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
            color: isActive ? palette.textPrimary : palette.textSecondary,
          })}
        >
          {language === 'ar' ? 'طلباتي' : 'My Requests'}
        </NavLink>
        <NavLink
          to="/requests/new"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
            color: isActive ? palette.textPrimary : palette.textSecondary,
          })}
        >
          {language === 'ar' ? 'طلب استثماري' : 'New Request'}
        </NavLink>
        <NavLink
          to="/internal-news"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
            color: isActive ? palette.textPrimary : palette.textSecondary,
          })}
        >
          {language === 'ar' ? 'الأخبار الداخلية' : 'Internal News'}
        </NavLink>
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
            color: isActive ? palette.textPrimary : palette.textSecondary,
          })}
        >
          {language === 'ar' ? 'الملف الاستثماري' : 'Investor Profile'}
        </NavLink>
        <button
          type="button"
          onClick={() => logout.mutate()}
          style={{
            ...navLinkStyle,
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
      </nav>
    </header>
  );
}

function AdminSidebarNav() {
  const { language } = useLanguage();
  const logout = useLogout();
  const portalName =
    language === 'ar' ? 'لوحة تحكم إدارة باكورة' : 'Bakurah Admin Console';
  const portalSubtitle =
    language === 'ar'
      ? 'إدارة الطلبات والأخبار والمحتوى التشغيلي لمنصة باكورة.'
      : 'Manage investor requests, news, and operational content for Bakurah.';
  const isArabic = language === 'ar';

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
        position: 'sticky',
        top: 0,
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
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              style={({ isActive }) => ({
                ...adminSidebarLinkBase,
                flexDirection: isArabic ? 'row-reverse' : 'row',
                justifyContent: isArabic ? 'flex-end' : 'flex-start',
                textAlign: isArabic ? 'right' : 'left',
                background: isActive ? palette.brandSecondarySoft : 'transparent',
                color: isActive ? palette.textPrimary : palette.textSecondary,
                borderColor: isActive ? palette.brandSecondary : palette.neutralBorderSoft,
                boxShadow: isActive ? '0 0 0 1px rgba(0,0,0,0.04)' : 'none',
              })}
            >
              {language === 'ar' ? item.labelAr : item.labelEn}
            </NavLink>
          ))}
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
  );
}

function AppFooter() {
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
          {isArabic ? 'تم التطوير بواسطة فريق باكورة التقنيات' : 'Developed by Bacura Technologies Team'}
        </p>
      </div>
    </footer>
  );
}

function InvestorApp() {
  return (
    <Fragment>
      <HeaderNav />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<InvestorDashboardPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/requests" element={<MyRequestsPage />} />
        <Route path="/requests/new" element={<NewRequestPage />} />
        <Route path="/internal-news" element={<InvestorInternalNewsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/news" element={<InvestorNewsListPage />} />
        <Route path="/news/:id" element={<InvestorNewsDetailPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <AppFooter />
    </Fragment>
  );
}

function AdminApp() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: palette.backgroundBase,
      }}
    >
      <AdminSidebarNav />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <div
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
        </div>
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

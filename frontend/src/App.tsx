import { Fragment } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NewRequestPage } from './pages/NewRequestPage';
import { ProfilePage } from './pages/ProfilePage';
import { useLanguage } from './context/LanguageContext';
import { useLogout } from './hooks/useLogout';
import { Logo } from './components/Logo';
import './styles/global.css';
import { palette } from './styles/theme';

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

function HeaderNav() {
  const { language } = useLanguage();
  const logout = useLogout();
  const portalName =
    language === 'ar' ? 'بوابة باكورة للمستثمرين' : 'Bakurah Investors Portal';
  const portalSubtitle =
    language === 'ar'
      ? 'تجربة موحدة لاستقبال المستثمرين، بناء الملفات، وتقديم الطلبات بسهولة.'
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
          to="/"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : palette.backgroundSurface,
            color: isActive ? palette.textPrimary : palette.textSecondary,
          })}
          end
        >
        {language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
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

function AppFooter() {
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
      <span style={{ fontSize: '0.95rem', color: palette.textSecondary }}>
        Powered by Supabase & Netlify – Bakurah Investors Portal
      </span>
    </footer>
  );
}

export function App() {
  return (
    <Fragment>
      <HeaderNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/requests/new" element={<NewRequestPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
      <AppFooter />
    </Fragment>
  );
}

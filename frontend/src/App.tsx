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
          gap: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <Logo size={72} stacked tagline={language === 'ar' ? 'منصة المستثمرين' : 'Investors Platform'} />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
            }}
          >
            Bakurah Investors Portal
          </h1>
          <p
            style={{
              margin: '0.35rem 0 0',
              color: `${palette.textSecondary}`,
              fontSize: '0.95rem',
            }}
          >
            Investor onboarding, profiling, and request submission experiences.
          </p>
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

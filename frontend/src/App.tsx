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
  border: `1px solid ${palette.brandSecondarySoft}`,
  padding: '0.75rem 1.5rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
  background: 'transparent',
  color: palette.textOnInverse,
};

function HeaderNav() {
  const { language } = useLanguage();
  const logout = useLogout();

  return (
    <header
      style={{
        background: palette.backgroundInverse,
        color: palette.textOnInverse,
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <Logo size={72} variant="inverse" showWordmark={false} />
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
              color: `${palette.textOnInverse}CC`,
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
            background: isActive ? palette.brandSecondarySoft : 'transparent',
            color: isActive ? palette.textPrimary : palette.textOnInverse,
          })}
          end
        >
          {language === 'ar' ? 'Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©' : 'Home'}
        </NavLink>
        <NavLink
          to="/requests/new"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : 'transparent',
            color: isActive ? palette.textPrimary : palette.textOnInverse,
          })}
        >
          {language === 'ar' ? 'Ø·Ù„Ø¨ Ø§Ø³ØªØ«Ù…Ø§Ø±ÙŠ' : 'New Request'}
        </NavLink>
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? palette.brandSecondarySoft : 'transparent',
            color: isActive ? palette.textPrimary : palette.textOnInverse,
          })}
        >
          {language === 'ar' ? 'Ø§Ù„Ù…Ù„Ù Ø§Ù„Ø§Ø³ØªØ«Ù…Ø§Ø±ÙŠ' : 'Investor Profile'}
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
              ? 'Ø¬Ø§Ø±Ù ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬â€¦'
              : 'Signing outâ€¦'
            : language === 'ar'
              ? 'ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø®Ø±ÙˆØ¬'
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
        padding: '2rem 1rem 3rem',
        color: palette.textSecondary,
        fontSize: '0.9rem',
        background: palette.backgroundBase,
      }}
    >
      Powered by Supabase & Netlify â€“ Bakurah Investors Portal
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

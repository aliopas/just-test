import { Fragment } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { NewRequestPage } from './pages/NewRequestPage';
import { ProfilePage } from './pages/ProfilePage';
import { useLanguage } from './context/LanguageContext';
import { useLogout } from './hooks/useLogout';
import './styles/global.css';

const navLinkStyle: React.CSSProperties = {
  borderRadius: '0.75rem',
  border: 'none',
  padding: '0.75rem 1.5rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textDecoration: 'none',
};

function HeaderNav() {
  const { language } = useLanguage();
  const logout = useLogout();

  return (
    <header
      style={{
        background: '#0F172A',
        color: '#FFFFFF',
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}
    >
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
            color: 'rgba(255, 255, 255, 0.76)',
            fontSize: '0.95rem',
          }}
        >
          Investor onboarding, profiling, and request submission experiences.
        </p>
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
            background: isActive ? '#38BDF8' : 'rgba(148, 163, 184, 0.25)',
            color: isActive ? '#0F172A' : '#E2E8F0',
          })}
          end
        >
          {language === 'ar' ? 'الصفحة الرئيسية' : 'Home'}
        </NavLink>
        <NavLink
          to="/requests/new"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? '#38BDF8' : 'rgba(148, 163, 184, 0.25)',
            color: isActive ? '#0F172A' : '#E2E8F0',
          })}
        >
          {language === 'ar' ? 'طلب استثماري' : 'New Request'}
        </NavLink>
        <NavLink
          to="/profile"
          style={({ isActive }) => ({
            ...navLinkStyle,
            background: isActive ? '#38BDF8' : 'rgba(148, 163, 184, 0.25)',
            color: isActive ? '#0F172A' : '#E2E8F0',
          })}
        >
          {language === 'ar' ? 'الملف الاستثماري' : 'Investor Profile'}
        </NavLink>
        <button
          type="button"
          onClick={() => logout.mutate()}
          style={{
            ...navLinkStyle,
            background: '#1E293B',
            color: '#F8FAFC',
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
        padding: '2rem 1rem 3rem',
        color: '#475569',
        fontSize: '0.9rem',
        background: '#F1F5F9',
      }}
    >
      Powered by Supabase & Netlify – Bakurah Investors Portal
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
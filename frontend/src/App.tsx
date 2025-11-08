import { useState } from 'react';
import { NewRequestPage } from './pages/NewRequestPage';
import { ProfilePage } from './pages/ProfilePage';
import './styles/global.css';

type AppView = 'request' | 'profile';

export function App() {
  const [view, setView] = useState<AppView>('request');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F1F5F9',
      }}
    >
      <header
        style={{
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
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
          }}
        >
          <button
            onClick={() => setView('request')}
            type="button"
            style={{
              borderRadius: '0.75rem',
              border: 'none',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: view === 'request' ? '#38BDF8' : 'rgba(148, 163, 184, 0.25)',
              color: view === 'request' ? '#0F172A' : '#E2E8F0',
              transition: 'all 0.2s ease',
            }}
          >
            New Request Flow
          </button>
          <button
            onClick={() => setView('profile')}
            type="button"
            style={{
              borderRadius: '0.75rem',
              border: 'none',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: view === 'profile' ? '#38BDF8' : 'rgba(148, 163, 184, 0.25)',
              color: view === 'profile' ? '#0F172A' : '#E2E8F0',
              transition: 'all 0.2s ease',
            }}
          >
            Investor Profile
          </button>
        </nav>
      </header>

      <main>
        {view === 'request' ? <NewRequestPage /> : <ProfilePage />}
        <footer
          style={{
            textAlign: 'center',
            padding: '2rem 1rem 3rem',
            color: '#475569',
            fontSize: '0.9rem',
          }}
        >
          Powered by Supabase & Netlify – Bakurah Investors Portal
        </footer>
      </main>
    </div>
  );
}


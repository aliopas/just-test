import { useLanguage } from '../context/LanguageContext';
import { NewRequestForm } from '../components/request/NewRequestForm';
import { tRequest } from '../locales/newRequest';

function NewRequestPageInner() {
  const { language, direction } = useLanguage();

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        minHeight: '100vh',
        background: '#F1F5F9',
        direction,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <header>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: '#111418',
            margin: 0,
          }}
        >
          {tRequest('pageTitle', language)}
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            color: '#475569',
            fontSize: '1rem',
            maxWidth: '38rem',
          }}
        >
          {tRequest('pageSubtitle', language)}
        </p>
      </header>

      <section
        style={{
          background: '#FFFFFF',
          borderRadius: '1.25rem',
          border: '1px solid #E2E8F0',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        <div
          style={{
            background: '#EFF6FF',
            borderRadius: '1rem',
            padding: '1.25rem',
            color: '#1E3A5F',
            fontSize: '0.95rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <strong>{tRequest('summary.title', language)}</strong>
          <span>{tRequest('summary.autoSubmit', language)}</span>
        </div>

        <NewRequestForm />
      </section>
    </div>
  );
}

export function NewRequestPage() {
  return <NewRequestPageInner />;
}


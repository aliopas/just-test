import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DynamicRequestForm } from '../components/request/DynamicRequestForm';
import { tRequest } from '../locales/newRequest';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';

function NewRequestPageInner() {
  const { language, direction } = useLanguage();
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
  } = useInvestorDashboard();

  const quickAmounts = useMemo(() => {
    if (!dashboard?.insights) {
      return [];
    }
    const candidates = [
      dashboard.insights.averageAmountByType.buy,
      dashboard.insights.averageAmountByType.sell,
    ];
    if (dashboard.insights.rolling30DayVolume > 0) {
      const averageVolume =
        dashboard.insights.rolling30DayVolume /
        Math.max(dashboard.requestSummary.total || 1, 1);
      candidates.push(averageVolume);
    }

    return Array.from(
      new Set(
        candidates
          .map(value => Math.round(Number(value ?? 0)))
          .filter(value => Number.isFinite(value) && value > 0)
      )
    )
      .sort((a, b) => b - a)
      .slice(0, 3);
  }, [dashboard]);


  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        minHeight: '100vh',
        background: 'var(--color-background-base)',
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
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {tRequest('pageTitle', language)}
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--color-text-secondary)',
            fontSize: '1rem',
            maxWidth: '38rem',
          }}
        >
          {tRequest('pageSubtitle', language)}
        </p>
      </header>

      <section
        style={{
          background: 'var(--color-background-surface)',
          borderRadius: '1.25rem',
          border: '1px solid var(--color-border)',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
        }}
      >
        <div
          style={{
            background: 'var(--color-background-alt)',
            borderRadius: '1rem',
            padding: '1.25rem',
            color: 'var(--color-brand-accent-deep)',
            fontSize: '0.95rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <strong>{tRequest('summary.title', language)}</strong>
          <span>{tRequest('summary.autoSubmit', language)}</span>
        </div>

        <DynamicRequestForm
          quickAmounts={quickAmounts}
          isQuickAmountsLoading={isDashboardLoading || isDashboardFetching}
        />
      </section>
    </div>
  );
}

export function NewRequestPage() {
  return <NewRequestPageInner />;
}

// Default export used only for legacy Next.js pages directory validation.
// We export a simple stub that does not rely on React Router, React Query, or
// any browser-only APIs so that static generation in Netlify succeeds.
export default function NewRequestPageStub() {
  return null;
}

// Prevent static generation - this page uses client-side hooks and state
// In Pages Router, we need to use getServerSideProps instead of export const dynamic
export async function getServerSideProps() {
  return {
    props: {},
  };
}


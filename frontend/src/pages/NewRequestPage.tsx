import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { NewRequestForm } from '../components/request/NewRequestForm';
import { tRequest } from '../locales/newRequest';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import type { RequestCurrency } from '../types/request';

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

  const suggestedCurrency = useMemo<RequestCurrency | undefined>(() => {
    const currency = dashboard?.insights?.lastRequest?.currency ?? null;
    if (!currency) {
      return undefined;
    }
    if (currency === 'SAR' || currency === 'USD' || currency === 'EUR') {
      return currency;
    }
    return undefined;
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

        <NewRequestForm
          quickAmounts={quickAmounts}
          isQuickAmountsLoading={isDashboardLoading || isDashboardFetching}
          suggestedCurrency={suggestedCurrency}
        />
      </section>
    </div>
  );
}

export function NewRequestPage() {
  return <NewRequestPageInner />;
}




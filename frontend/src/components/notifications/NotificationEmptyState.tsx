import type { InvestorLanguage } from '../../types/investor';
import { tNotifications } from '../../locales/notifications';

type NotificationEmptyStateProps = {
  language: InvestorLanguage;
};

export function NotificationEmptyState({ language }: NotificationEmptyStateProps) {
  return (
    <div
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        background: 'var(--color-background-soft)',
        borderRadius: '1.5rem',
        border: '1px dashed var(--color-border)',
        color: 'var(--color-text-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '999px',
          background: 'var(--color-brand-primary-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-brand-primary-strong)',
          fontWeight: 700,
          fontSize: '1.1rem',
        }}
      >
        ☺
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: '1.25rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
        }}
      >
        {tNotifications('empty.title', language)}
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: '0.95rem',
          maxWidth: '26rem',
          lineHeight: 1.6,
        }}
      >
        {tNotifications('empty.subtitle', language)}
      </p>
    </div>
  );
}


import type { InvestorLanguage } from '../../types/investor';
import { tNotifications } from '../../locales/notifications';

type NotificationBadgeProps = {
  count: number;
  language: InvestorLanguage;
  onClick?: () => void;
  isActive?: boolean;
};

export function NotificationBadge({
  count,
  language,
  onClick,
  isActive = false,
}: NotificationBadgeProps) {
  const hasUnread = count > 0;
  const label = tNotifications('badge.label', language);

  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.85rem',
        borderRadius: '999px',
        border: isActive
          ? '1px solid var(--color-brand-primary-strong)'
          : '1px solid var(--color-border)',
        backgroundColor: isActive
          ? 'var(--color-brand-primary-soft)'
          : 'var(--color-background-surface)',
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '0.95rem',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
      aria-label={
        hasUnread ? `${label} (${count} unread)` : `${label} (no unread notifications)`
      }
    >
      <span>{label}</span>
      <span
        style={{
          minWidth: '1.8rem',
          height: '1.8rem',
          borderRadius: '999px',
          backgroundColor: hasUnread
            ? 'var(--color-brand-primary-strong)'
            : 'var(--color-border-strong)',
          color: hasUnread ? '#ffffff' : 'var(--color-text-tertiary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.85rem',
          fontWeight: 700,
        }}
      >
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
}


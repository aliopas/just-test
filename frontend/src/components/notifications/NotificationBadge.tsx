import type { InvestorLanguage } from '../../types/investor';
import { tNotifications } from '../../locales/notifications';
import { palette, radius, shadow, typography } from '../../styles/theme';

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
        gap: '0.75rem',
        padding: '0.65rem 1.25rem',
        borderRadius: radius.pill,
        border: isActive
          ? `2px solid ${palette.brandPrimaryStrong}`
          : hasUnread
            ? `2px solid ${palette.brandPrimary}`
            : `1px solid ${palette.neutralBorderMuted}`,
        backgroundColor: isActive
          ? palette.backgroundHighlight
          : hasUnread
            ? `${palette.brandPrimary}08`
            : palette.backgroundBase,
        color: palette.textPrimary,
        cursor: 'pointer',
        fontWeight: typography.weights.semibold,
        fontSize: typography.sizes.body,
        transition: 'all 0.2s ease',
        boxShadow: hasUnread && !isActive ? shadow.subtle : 'none',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = palette.brandPrimaryStrong;
          e.currentTarget.style.backgroundColor = palette.backgroundHighlight;
          e.currentTarget.style.boxShadow = shadow.medium;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.borderColor = hasUnread
            ? palette.brandPrimary
            : palette.neutralBorderMuted;
          e.currentTarget.style.backgroundColor = hasUnread
            ? `${palette.brandPrimary}08`
            : palette.backgroundBase;
          e.currentTarget.style.boxShadow = hasUnread ? shadow.subtle : 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      aria-label={
        hasUnread ? `${label} (${count} unread)` : `${label} (no unread notifications)`
      }
    >
      <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🔔</span>
      <span style={{ fontWeight: typography.weights.semibold }}>{label}</span>
      {hasUnread && (
        <span
          style={{
            minWidth: '1.75rem',
            height: '1.75rem',
            borderRadius: radius.pill,
            backgroundColor: palette.brandPrimaryStrong,
            color: palette.textOnBrand,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: typography.weights.bold,
            boxShadow: shadow.subtle,
            animation: hasUnread ? 'pulse 2s ease-in-out infinite' : 'none',
          }}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
      {hasUnread && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: language === 'ar' ? '-4px' : 'auto',
            left: language === 'ar' ? 'auto' : '-4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: palette.error,
            border: `2px solid ${palette.backgroundBase}`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.05);
            }
          }
        `}
      </style>
    </button>
  );
}


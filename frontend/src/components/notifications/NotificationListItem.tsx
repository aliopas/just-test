import type { InvestorLanguage } from '../../types/investor';
import type { NotificationItem } from '../../types/notification';
import { tNotifications } from '../../locales/notifications';
import { palette, radius, shadow, typography } from '../../styles/theme';

type NotificationListItemProps = {
  notification: NotificationItem;
  language: InvestorLanguage;
  direction: 'ltr' | 'rtl';
  onMarkRead?: (notificationId: string) => void;
  isMarking?: boolean;
};

function formatTimestamp(timestamp: string, language: InvestorLanguage) {
  try {
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  } catch {
    return timestamp;
  }
}

function applyTemplate(template: string, payload: Record<string, unknown>) {
  return template.replace(/\{([^}]+)\}/g, (_match, key) => {
    const value = payload[key.trim()];
    return typeof value === 'string' || typeof value === 'number' ? String(value) : '—';
  });
}

export function resolveNotificationCopy(
  notification: NotificationItem,
  language: InvestorLanguage
) {
  const payload = notification.payload ?? {};
  const requestNumber =
    typeof payload.requestNumber === 'string'
      ? payload.requestNumber
      : typeof payload.request_number === 'string'
        ? payload.request_number
        : '—';

  const templatePayload = {
    ...payload,
    requestNumber,
  };

  const titleKey = `type.${notification.type}.title` as const;
  const bodyKey = `type.${notification.type}.body` as const;

  const title = applyTemplate(tNotifications(titleKey, language), templatePayload);
  const description = applyTemplate(
    tNotifications(bodyKey, language),
    templatePayload
  );

  return { title, description };
}

export function NotificationListItem({
  notification,
  language,
  direction,
  onMarkRead,
  isMarking,
}: NotificationListItemProps) {
  const { title, description } = resolveNotificationCopy(notification, language);
  const createdAtLabel = formatTimestamp(notification.createdAt, language);
  const isUnread = notification.stateRead === false;
  const payload = notification.payload ?? {};

  const infoMessage =
    notification.type === 'request_pending_info' &&
    typeof payload.message === 'string'
      ? payload.message
      : null;
  const decisionNote =
    typeof payload.note === 'string' && payload.note.trim().length > 0
      ? payload.note
      : null;

  // Get icon based on notification type
  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      request_pending: '📋',
      request_approved: '✅',
      request_rejected: '❌',
      request_pending_info: 'ℹ️',
      request_status_changed: '🔄',
      chat_message: '💬',
      system: '⚙️',
    };
    return icons[type] || '🔔';
  };

  return (
    <article
      style={{
        borderRadius: radius.lg,
        border: isUnread
          ? `2px solid ${palette.brandPrimary}`
          : `1px solid ${palette.neutralBorderMuted}`,
        backgroundColor: isUnread
          ? `${palette.brandPrimary}08`
          : palette.backgroundBase,
        padding: '1.5rem 1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.2s ease',
        boxShadow: isUnread ? shadow.medium : shadow.subtle,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.brandPrimaryStrong;
        e.currentTarget.style.boxShadow = shadow.medium;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.backgroundColor = isUnread
          ? `${palette.brandPrimary}12`
          : palette.backgroundSurface;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isUnread
          ? palette.brandPrimary
          : palette.neutralBorderMuted;
        e.currentTarget.style.boxShadow = isUnread ? shadow.medium : shadow.subtle;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.backgroundColor = isUnread
          ? `${palette.brandPrimary}08`
          : palette.backgroundBase;
      }}
    >
      {isUnread && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            [direction === 'rtl' ? 'right' : 'left']: '1rem',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: palette.brandPrimaryStrong,
            boxShadow: `0 0 0 4px ${palette.brandPrimary}20`,
            animation: 'pulse-dot 2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
      )}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              lineHeight: 1,
              flexShrink: 0,
              marginTop: '0.25rem',
            }}
            aria-hidden="true"
          >
            {getNotificationIcon(notification.type)}
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: typography.sizes.caption,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: isUnread
                    ? palette.brandPrimaryStrong
                    : palette.textMuted,
                  fontWeight: typography.weights.bold,
                }}
              >
                {createdAtLabel}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: radius.pill,
                  fontSize: typography.sizes.caption,
                  fontWeight: typography.weights.semibold,
                  backgroundColor: isUnread
                    ? `${palette.brandPrimary}15`
                    : `${palette.success}15`,
                  color: isUnread
                    ? palette.brandPrimaryStrong
                    : palette.success,
                  border: `1px solid ${isUnread ? palette.brandPrimary : palette.success}30`,
                  width: 'fit-content',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isUnread
                      ? palette.brandPrimaryStrong
                      : palette.success,
                  }}
                />
                {isUnread
                  ? language === 'ar'
                    ? 'غير مقروء'
                    : 'Unread'
                  : language === 'ar'
                    ? 'مقروء'
                    : 'Read'}
              </span>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: typography.sizes.subheading,
                color: palette.textPrimary,
                fontWeight: typography.weights.bold,
                lineHeight: typography.lineHeights.tight,
              }}
            >
              {title}
            </h3>
          </div>
        </div>

        {onMarkRead && isUnread && (
          <button
            type='button'
            onClick={() => onMarkRead(notification.id)}
            disabled={isMarking}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: radius.md,
              border: `1px solid ${palette.brandPrimaryStrong}`,
              backgroundColor: isMarking
                ? palette.backgroundHighlight
                : palette.backgroundBase,
              color: palette.brandPrimaryStrong,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              cursor: isMarking ? 'not-allowed' : 'pointer',
              direction,
              transition: 'all 0.2s ease',
              boxShadow: shadow.subtle,
              opacity: isMarking ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isMarking) {
                e.currentTarget.style.backgroundColor = palette.brandPrimaryStrong;
                e.currentTarget.style.color = palette.textOnBrand;
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = shadow.medium;
              }
            }}
            onMouseLeave={(e) => {
              if (!isMarking) {
                e.currentTarget.style.backgroundColor = palette.backgroundBase;
                e.currentTarget.style.color = palette.brandPrimaryStrong;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = shadow.subtle;
              }
            }}
          >
            {isMarking
              ? language === 'ar'
                ? 'جاري...'
                : 'Marking...'
              : language === 'ar'
                ? 'تحديد كمقروء'
                : 'Mark as read'}
          </button>
        )}
      </header>

      <p
        style={{
          margin: 0,
          color: palette.textSecondary,
          fontSize: typography.sizes.body,
          lineHeight: typography.lineHeights.relaxed,
        }}
      >
        {description}
      </p>

      {infoMessage ? (
        <blockquote
          style={{
            margin: 0,
            padding: '1rem 1.25rem',
            borderRadius: radius.md,
            backgroundColor: `${palette.brandPrimary}08`,
            border: `1px solid ${palette.brandPrimary}30`,
            color: palette.textSecondary,
            fontSize: typography.sizes.body,
            direction,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>ℹ️</span>
          <span style={{ flex: 1 }}>{infoMessage}</span>
        </blockquote>
      ) : null}

      {decisionNote ? (
        <blockquote
          style={{
            margin: 0,
            padding: '1rem 1.25rem',
            borderRadius: radius.md,
            backgroundColor: `${palette.success}08`,
            border: `1px solid ${palette.success}30`,
            color: palette.textSecondary,
            fontSize: typography.sizes.body,
            direction,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.25rem', lineHeight: 1, flexShrink: 0 }}>📝</span>
          <span style={{ flex: 1 }}>{decisionNote}</span>
        </blockquote>
      ) : null}
      <style>
        {`
          @keyframes pulse-dot {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.2);
            }
          }
        `}
      </style>
    </article>
  );
}


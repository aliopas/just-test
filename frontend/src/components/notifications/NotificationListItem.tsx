import type { InvestorLanguage } from '../../types/investor';
import type { NotificationItem } from '../../types/notification';
import { tNotifications } from '../../locales/notifications';

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

function resolveCopy(
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
  const { title, description } = resolveCopy(notification, language);
  const createdAtLabel = formatTimestamp(notification.createdAt, language);
  const isUnread = !notification.readAt;
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

  return (
    <article
      style={{
        borderRadius: '1.25rem',
        border: isUnread
          ? '1px solid var(--color-brand-primary-soft)'
          : '1px solid var(--color-border)',
        backgroundColor: isUnread
          ? 'rgba(37, 99, 235, 0.06)'
          : 'var(--color-background-surface)',
        padding: '1.35rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        transition: 'background-color 0.2s ease, border-color 0.2s ease',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            maxWidth: '80%',
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isUnread
                ? 'var(--color-brand-primary-strong)'
                : 'var(--color-text-tertiary)',
              fontWeight: 700,
            }}
          >
            {createdAtLabel}
          </span>
          <h3
            style={{
              margin: 0,
              fontSize: '1.05rem',
              color: 'var(--color-text-primary)',
              fontWeight: 700,
            }}
          >
            {title}
          </h3>
        </div>

        {onMarkRead && isUnread && (
          <button
            type='button'
            onClick={() => onMarkRead(notification.id)}
            disabled={isMarking}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '999px',
              border: '1px solid var(--color-brand-primary-strong)',
              backgroundColor: isMarking
                ? 'var(--color-brand-primary-soft)'
                : '#ffffff',
              color: 'var(--color-brand-primary-strong)',
              fontWeight: 600,
              cursor: isMarking ? 'progress' : 'pointer',
              direction,
            }}
          >
            {language === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
          </button>
        )}
      </header>

      <p
        style={{
          margin: 0,
          color: 'var(--color-text-secondary)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>

      {infoMessage ? (
        <blockquote
          style={{
            margin: 0,
            padding: '0.9rem 1rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
            direction,
          }}
        >
          {infoMessage}
        </blockquote>
      ) : null}

      {decisionNote ? (
        <blockquote
          style={{
            margin: 0,
            padding: '0.85rem 1rem',
            borderRadius: '1rem',
            backgroundColor: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(21, 128, 61, 0.2)',
            color: 'var(--color-text-secondary)',
            fontSize: '0.88rem',
            direction,
          }}
        >
          {decisionNote}
        </blockquote>
      ) : null}
    </article>
  );
}


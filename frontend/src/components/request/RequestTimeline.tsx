import type { InvestorLanguage } from '../../types/investor';
import type { RequestTimelineEntry, RequestStatus } from '../../types/request';
import { resolveNotificationCopy } from '../notifications/NotificationListItem';
import { getStatusLabel, REQUEST_STATUSES } from '../../utils/requestStatus';

type RequestTimelineProps = {
  entries: RequestTimelineEntry[];
  language: InvestorLanguage;
  direction: 'ltr' | 'rtl';
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

function resolveActorLabel(
  language: InvestorLanguage,
  actor: RequestTimelineEntry['actor']
) {
  if (!actor) {
    return language === 'ar' ? 'النظام' : 'System';
  }

  if (actor.name) {
    return actor.name;
  }

  if (actor.email) {
    return actor.email;
  }

  return language === 'ar' ? 'مستخدم غير معروف' : 'Unknown user';
}

const channelLabels: Record<string, { en: string; ar: string }> = {
  email: { en: 'Email', ar: 'البريد الإلكتروني' },
  in_app: { en: 'In-app', ar: 'داخل المنصة' },
  sms: { en: 'SMS', ar: 'رسائل SMS' },
};

function isRequestStatus(status: string): status is RequestStatus {
  return REQUEST_STATUSES.includes(status as RequestStatus);
}

export function RequestTimeline({
  entries,
  language,
  direction,
}: RequestTimelineProps) {
  if (!entries.length) {
    return (
      <div
        style={{
          padding: '1.5rem',
          border: '1px dashed var(--color-border)',
          borderRadius: '1.25rem',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          fontSize: '0.95rem',
        }}
      >
        {language === 'ar'
          ? 'لا يوجد سجل تواصل بعد.'
          : 'No communication history yet.'}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {entries.map(entry => {
        const timestamp = formatTimestamp(entry.createdAt, language);
        const actorLabel = resolveActorLabel(language, entry.actor);
        const visibilityLabel =
          entry.visibility === 'investor'
            ? language === 'ar'
              ? 'مرئي للمستثمر'
              : 'Visible to investor'
            : language === 'ar'
              ? 'مرئي للمشرفين فقط'
              : 'Admin only';
        const isNotificationEntry =
          entry.entryType === 'notification' && Boolean(entry.notification);
        const isUnreadNotification =
          isNotificationEntry && entry.notification?.stateRead === false;

        let title = '';
        let body: string | null = null;
        let highlight: { label: string; value: string } | null = null;

        if (entry.entryType === 'notification' && entry.notification) {
          const { title: notifTitle, description } = resolveNotificationCopy(
            {
              id: entry.id,
              type: entry.notification.type,
              channel: entry.notification.channel,
              payload: entry.notification.payload,
              readAt: entry.notification.readAt,
              stateRead: entry.notification.stateRead,
              createdAt: entry.createdAt,
            },
            language
          );
          title = notifTitle;
          body = description;
          const channelText =
            channelLabels[entry.notification.channel]?.[language] ??
            entry.notification.channel;
          highlight = {
            label: language === 'ar' ? 'القناة' : 'Channel',
            value: channelText,
          };
        } else if (entry.entryType === 'status_change' && entry.event) {
          const toStatus = entry.event.toStatus;
          const toLabel = toStatus
            ? isRequestStatus(toStatus)
              ? getStatusLabel(toStatus, language)
              : toStatus
            : null;
          title =
            language === 'ar'
              ? 'تحديث حالة الطلب'
              : 'Request status update';
          body = entry.event.note ?? null;
          if (toLabel) {
            highlight = {
              label: language === 'ar' ? 'الحالة الجديدة' : 'New status',
              value: toLabel,
            };
          }
        } else if (entry.entryType === 'comment' && entry.comment) {
          title =
            language === 'ar'
              ? 'تعليق داخلي'
              : 'Internal comment';
          body = entry.comment.comment;
        }

        return (
          <article
            key={entry.id}
            style={{
              border: isUnreadNotification
                ? '1px solid var(--color-brand-primary-soft)'
                : '1px solid var(--color-border)',
              borderRadius: '1.25rem',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              backgroundColor: isUnreadNotification
                ? 'rgba(37, 99, 235, 0.06)'
                : 'var(--color-background-soft)',
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
                  gap: '0.4rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 700,
                  }}
                >
                  {timestamp}
                </span>
                {isNotificationEntry ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      backgroundColor: isUnreadNotification
                        ? 'rgba(37, 99, 235, 0.12)'
                        : 'rgba(34, 197, 94, 0.12)',
                      color: isUnreadNotification
                        ? 'var(--color-brand-primary-strong)'
                        : 'var(--color-success-strong, #166534)',
                      width: 'fit-content',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: '0.45rem',
                        height: '0.45rem',
                        borderRadius: '50%',
                        backgroundColor: isUnreadNotification
                          ? 'var(--color-brand-primary-strong)'
                          : 'var(--color-success-strong, #166534)',
                      }}
                    />
                    {isUnreadNotification
                      ? language === 'ar'
                        ? 'غير مقروء'
                        : 'Unread'
                      : language === 'ar'
                        ? 'مقروء'
                        : 'Read'}
                  </span>
                ) : null}
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
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: direction === 'rtl' ? 'flex-start' : 'flex-end',
                  gap: '0.3rem',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <span>{actorLabel}</span>
                <span>{visibilityLabel}</span>
              </div>
            </header>

            {highlight ? (
              <div
                style={{
                  display: 'inline-flex',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  background: 'var(--color-background-base)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.85rem',
                  width: 'fit-content',
                }}
              >
                <strong>{highlight.label}:</strong>
                <span>{highlight.value}</span>
              </div>
            ) : null}
            {body ? (
              <p
                style={{
                  margin: 0,
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                {body}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}


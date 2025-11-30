import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { NotificationBadge } from '../components/notifications/NotificationBadge';
import { NotificationEmptyState } from '../components/notifications/NotificationEmptyState';
import { NotificationListItem } from '../components/notifications/NotificationListItem';
import { NotificationSkeleton } from '../components/notifications/NotificationSkeleton';
import type {
  NotificationItem,
  NotificationListFilters,
  NotificationStatusFilter,
  NotificationPreference,
} from '../types/notification';
import { tNotifications } from '../locales/notifications';

const queryClient = new QueryClient();

const statusFilters: Array<{
  key: NotificationStatusFilter;
  label: Parameters<typeof tNotifications>[0];
}> = [
  { key: 'all', label: 'filters.all' },
  { key: 'unread', label: 'filters.unread' },
  { key: 'read', label: 'filters.read' },
];

function NotificationsPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [filters, setFilters] = useState<NotificationListFilters>({
    page: 1,
    status: 'all',
  });
  const [feed, setFeed] = useState<NotificationItem[]>([]);

  const {
    notifications,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isPlaceholderData,
  } = useNotifications(filters);

  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const {
    preferences: preferenceDraft,
    setPreferences: setPreferenceDraft,
    savePreferences: savePreferencesMutation,
    query: preferenceQuery,
    mutation: preferenceMutation,
    status: preferenceStatus,
  } = useNotificationPreferences();

  useEffect(() => {
    if (isError) {
      const message =
        error instanceof Error
          ? error.message
          : tNotifications('toast.loadError', language);
      pushToast({ message, variant: 'error' });
    }
  }, [isError, error, language, pushToast]);

  useEffect(() => {
    if (markReadMutation.isError) {
      pushToast({
        message: tNotifications('toast.markReadError', language),
        variant: 'error',
      });
    }
  }, [markReadMutation.isError, language, pushToast]);

  useEffect(() => {
    if (markAllMutation.isSuccess) {
      setFeed(current =>
        current.map(item => ({
          ...item,
          readAt: item.readAt ?? new Date().toISOString(),
          stateRead: true,
        }))
      );
      pushToast({
        message: tNotifications('toast.markAllSuccess', language),
        variant: 'success',
      });
    }
    if (markAllMutation.isError) {
      pushToast({
        message: tNotifications('toast.markAllError', language),
        variant: 'error',
      });
    }
  }, [
    markAllMutation.isSuccess,
    markAllMutation.isError,
    language,
    pushToast,
  ]);

  useEffect(() => {
    if (preferenceQuery.isError) {
      pushToast({
        message: tNotifications('toast.preferencesLoadError', language),
        variant: 'error',
      });
    }
  }, [preferenceQuery.isError, language, pushToast]);

  useEffect(() => {
    if (preferenceMutation.isSuccess) {
      pushToast({
        message: tNotifications('toast.preferencesSaveSuccess', language),
        variant: 'success',
      });
    }
    if (preferenceMutation.isError) {
      pushToast({
        message: tNotifications('toast.preferencesSaveError', language),
        variant: 'error',
      });
    }
  }, [
    preferenceMutation.isSuccess,
    preferenceMutation.isError,
    language,
    pushToast,
  ]);

  useEffect(() => {
    if (isPlaceholderData) {
      return;
    }

    if (notifications.length === 0) {
      if (filters.page === 1) {
        setFeed([]);
      }
      return;
    }

    setFeed(current => {
      if (filters.page && filters.page > 1) {
        const existing = new Set(current.map(item => item.id));
        const merged = [...current];
        notifications.forEach(item => {
          if (!existing.has(item.id)) {
            merged.push(item);
          }
        });
        return merged;
      }
      return notifications;
    });
  }, [notifications, filters.page, isPlaceholderData]);

  const sortedOriginalPreferences = useMemo(() => {
    const original = preferenceQuery.data?.preferences ?? [];
    return [...original].sort((a, b) =>
      a.type === b.type
        ? a.channel.localeCompare(b.channel)
        : a.type.localeCompare(b.type)
    );
  }, [preferenceQuery.data?.preferences]);

  const sortedDraftPreferences = useMemo(
    () =>
      [...preferenceDraft].sort((a, b) =>
        a.type === b.type
          ? a.channel.localeCompare(b.channel)
          : a.type.localeCompare(b.type)
      ),
    [preferenceDraft]
  );

  const preferencesDirty =
    JSON.stringify(sortedDraftPreferences) !==
    JSON.stringify(sortedOriginalPreferences);

  const groupedPreferences = useMemo(() => {
    const groups = new Map<
      NotificationPreference['type'],
      NotificationPreference[]
    >();
    preferenceDraft.forEach(pref => {
      const entry = groups.get(pref.type) ?? [];
      entry.push(pref);
      groups.set(pref.type, entry);
    });
    return Array.from(groups.entries()).map(([type, prefs]) => ({
      type,
      preferences: prefs.sort((a, b) => a.channel.localeCompare(b.channel)),
    }));
  }, [preferenceDraft]);

  const handlePreferenceToggle = (
    type: NotificationPreference['type'],
    channel: NotificationPreference['channel']
  ) => {
    setPreferenceDraft(current => {
      const index = current.findIndex(
        pref => pref.type === type && pref.channel === channel
      );
      if (index === -1) {
        return [...current, { type, channel, enabled: true }];
      }
      const next = [...current];
      next[index] = {
        ...next[index],
        enabled: !next[index].enabled,
      };
      return next;
    });
  };

  const handlePreferencesReset = () => {
    setPreferenceDraft(preferenceQuery.data?.preferences ?? []);
  };

  const handlePreferencesSave = () => {
    if (preferenceMutation.isPending) return;
    savePreferencesMutation(preferenceDraft);
  };

  const handleFilterChange = (status: NotificationStatusFilter) => {
    setFilters({
      status,
      page: 1,
    });
    setFeed([]);
  };

  const handleLoadMore = () => {
    if (!meta.hasNext || isFetching) {
      return;
    }
    setFilters(current => ({
      ...current,
      page: (current.page ?? 1) + 1,
    }));
  };

  const handleMarkRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId, {
      onSuccess: () => {
        setFeed(current =>
          current.map(item =>
            item.id === notificationId
              ? {
                  ...item,
                  readAt: new Date().toISOString(),
                  stateRead: true,
                }
              : item
          )
        );
      },
    });
  };

  const handleMarkAll = () => {
    if (meta.unreadCount === 0 || markAllMutation.isPending) {
      return;
    }
    markAllMutation.mutate();
  };

  const hasNotifications = feed.length > 0;

  const headerActions = useMemo(
    () => ({
      markAllDisabled:
        meta.unreadCount === 0 || markAllMutation.isPending || isLoading,
      preferencesDisabled:
        !preferencesDirty ||
        preferenceMutation.isPending ||
        preferenceStatus.isLoading,
    }),
    [
      meta.unreadCount,
      markAllMutation.isPending,
      isLoading,
      preferencesDirty,
      preferenceMutation.isPending,
      preferenceStatus.isLoading,
    ]
  );

  return (
    <div
      style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem 4rem',
        minHeight: '100vh',
        background: 'var(--color-background-base)',
        direction,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'relative',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <h1
              style={{
                fontSize: '2.15rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {tNotifications('pageTitle', language)}
            </h1>
            <p
              style={{
                margin: 0,
                color: 'var(--color-text-secondary)',
                maxWidth: '40rem',
                lineHeight: 1.6,
              }}
            >
              {tNotifications('pageSubtitle', language)}
            </p>
          </div>

          <NotificationBadge
            count={meta.unreadCount}
            language={language}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {statusFilters.map(option => (
            <button
              key={option.key}
              type='button'
              onClick={() => handleFilterChange(option.key)}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '999px',
                border:
                  filters.status === option.key
                    ? '1px solid var(--color-brand-primary-strong)'
                    : '1px solid var(--color-border)',
                background:
                  filters.status === option.key
                    ? 'var(--color-brand-primary-strong)'
                    : '#ffffff',
                color:
                  filters.status === option.key
                    ? '#ffffff'
                    : 'var(--color-text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
              }}
            >
              {tNotifications(option.label, language)}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: '0.85rem',
            }}
          >
            {meta.total > 0
              ? `${meta.total} ${language === 'ar' ? 'إشعارًا' : 'notifications'}`
              : language === 'ar'
                ? 'لا توجد إشعارات'
                : 'No notifications'}
          </span>
          <button
            type='button'
            onClick={handleMarkAll}
            disabled={headerActions.markAllDisabled}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: '999px',
              border: '1px solid var(--color-brand-primary-strong)',
              backgroundColor: headerActions.markAllDisabled
                ? 'rgba(37, 99, 235, 0.08)'
                : 'var(--color-brand-primary-soft)',
              color: 'var(--color-brand-primary-strong)',
              fontWeight: 600,
              cursor: headerActions.markAllDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {markAllMutation.isPending
              ? tNotifications('list.loading', language)
              : tNotifications('actions.markAll', language)}
          </button>
        </div>
      </header>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {isLoading ? (
          <NotificationSkeleton count={4} />
        ) : hasNotifications ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {feed.map(notification => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                language={language}
                direction={direction}
                onMarkRead={handleMarkRead}
                isMarking={markReadMutation.isPending}
              />
            ))}

            {meta.hasNext ? (
              <button
                type='button'
                onClick={handleLoadMore}
                disabled={isFetching}
                style={{
                  alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-end',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '1rem',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#ffffff',
                  color: 'var(--color-text-primary)',
                  fontWeight: 600,
                  cursor: isFetching ? 'progress' : 'pointer',
                }}
              >
                {isFetching
                  ? tNotifications('list.loading', language)
                  : tNotifications('list.loadMore', language)}
              </button>
            ) : null}
          </div>
        ) : (
          <NotificationEmptyState language={language} />
        )}
      </section>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          backgroundColor: 'var(--color-background-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '1.5rem',
          padding: '1.75rem',
        }}
      >
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            {tNotifications('preferences.title', language)}
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: '0.95rem',
              color: 'var(--color-text-secondary)',
              maxWidth: '40rem',
              lineHeight: 1.6,
            }}
          >
            {tNotifications('preferences.subtitle', language)}
          </p>
          {preferencesDirty ? (
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--color-brand-primary-strong)',
                fontWeight: 600,
              }}
            >
              {tNotifications('preferences.changedNotice', language)}
            </span>
          ) : null}
        </header>

        {preferenceStatus.isLoading ? (
          <NotificationSkeleton count={3} />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {groupedPreferences.map(group => (
              <div
                key={group.type}
                style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '1.25rem',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {tNotifications(
                    `type.${group.type}.title` as Parameters<typeof tNotifications>[0],
                    language
                  )}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  {group.preferences.map(pref => {
                    const labelKey =
                      pref.channel === 'email'
                        ? 'preferences.channel.email'
                        : pref.channel === 'in_app'
                          ? 'preferences.channel.in_app'
                          : 'preferences.channel.sms';
                    const isSupported =
                      pref.channel === 'email' || pref.channel === 'in_app';
                    return (
                      <button
                        key={`${pref.type}-${pref.channel}`}
                        type='button'
                        onClick={() =>
                          isSupported &&
                          handlePreferenceToggle(pref.type, pref.channel)
                        }
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '999px',
                          border: pref.enabled
                            ? '1px solid var(--color-brand-primary-strong)'
                            : '1px solid var(--color-border)',
                          backgroundColor: pref.enabled
                            ? 'var(--color-brand-primary-soft)'
                            : '#ffffff',
                          color: pref.enabled
                            ? 'var(--color-brand-primary-strong)'
                            : 'var(--color-text-secondary)',
                          fontWeight: 600,
                          cursor: isSupported ? 'pointer' : 'not-allowed',
                          opacity: isSupported ? 1 : 0.4,
                        }}
                        disabled={!isSupported}
                      >
                        {tNotifications(labelKey, language)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type='button'
            onClick={handlePreferencesReset}
            disabled={!preferencesDirty || preferenceMutation.isPending}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '0.85rem',
              border: '1px solid var(--color-border)',
              backgroundColor: '#ffffff',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              cursor:
                !preferencesDirty || preferenceMutation.isPending
                  ? 'not-allowed'
                  : 'pointer',
            }}
          >
            {tNotifications('preferences.reset', language)}
          </button>
          <button
            type='button'
            onClick={handlePreferencesSave}
            disabled={headerActions.preferencesDisabled}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '0.85rem',
              border: 'none',
              backgroundColor: headerActions.preferencesDisabled
                ? 'rgba(37, 99, 235, 0.35)'
                : 'var(--color-brand-primary-strong)',
              color: '#ffffff',
              fontWeight: 600,
              cursor: headerActions.preferencesDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {preferenceMutation.isPending
              ? tNotifications('list.loading', language)
              : tNotifications('preferences.save', language)}
          </button>
        </div>
      </section>

      <footer
        style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.85rem',
          color: 'var(--color-text-tertiary)',
        }}
      >
        <span>
          {language === 'ar'
            ? 'آخر تحديث'
            : 'Last refreshed'}:{' '}
          {new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US')}
        </span>
        <button
          type='button'
          onClick={() => refetch()}
          style={{
            border: 'none',
            background: 'none',
            color: 'var(--color-brand-primary-strong)',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {language === 'ar' ? 'تحديث الآن' : 'Refresh'}
        </button>
      </footer>
    </div>
  );
}

export function NotificationsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <NotificationsPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// Default export for Next.js page validation (not used, App Router uses named export)
export default NotificationsPage;

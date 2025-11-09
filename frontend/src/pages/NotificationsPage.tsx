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
import { NotificationBadge } from '../components/notifications/NotificationBadge';
import { NotificationEmptyState } from '../components/notifications/NotificationEmptyState';
import { NotificationListItem } from '../components/notifications/NotificationListItem';
import { NotificationSkeleton } from '../components/notifications/NotificationSkeleton';
import type {
  NotificationItem,
  NotificationListFilters,
  NotificationStatusFilter,
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
              ? { ...item, readAt: new Date().toISOString() }
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
    }),
    [meta.unreadCount, markAllMutation.isPending, isLoading]
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


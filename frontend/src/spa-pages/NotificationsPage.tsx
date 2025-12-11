import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '../hooks/useNotifications';
import { NotificationListItem } from '../components/notifications/NotificationListItem';
import { NotificationEmptyState } from '../components/notifications/NotificationEmptyState';
import { NotificationSkeleton } from '../components/notifications/NotificationSkeleton';
import type { NotificationStatusFilter } from '../types/notification';

export function NotificationsPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const [statusFilter, setStatusFilter] = useState<NotificationStatusFilter>('all');
  const [page, setPage] = useState(1);

  const { notifications, meta, isLoading, isError, refetch } = useNotifications({
    status: statusFilter,
    page,
  });

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const handleMarkRead = async (notificationId: string) => {
    try {
      await markReadMutation.mutateAsync(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 'clamp(1rem, 4vw, 2rem)',
        background: palette.backgroundSurface,
        direction,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: typography.weights.bold,
                color: palette.textPrimary,
                marginBottom: '0.5rem',
              }}
            >
              {isArabic ? 'الإشعارات' : 'Notifications'}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: typography.sizes.body,
                color: palette.textSecondary,
              }}
            >
              {isArabic
                ? 'عرض جميع الإشعارات والتنبيهات الخاصة بك'
                : 'View all your notifications and alerts'}
            </p>
          </div>
          {meta.unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.brandPrimaryStrong}`,
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                cursor: markAllReadMutation.isPending ? 'not-allowed' : 'pointer',
                opacity: markAllReadMutation.isPending ? 0.7 : 1,
              }}
            >
              {markAllReadMutation.isPending
                ? (isArabic ? 'جاري...' : 'Marking...')
                : isArabic
                  ? 'تحديد الكل كمقروء'
                  : 'Mark All as Read'}
            </button>
          )}
        </header>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: radius.md,
              border: `1px solid ${statusFilter === 'all' ? palette.brandPrimaryStrong : palette.neutralBorderMuted}`,
              background: statusFilter === 'all' ? palette.backgroundHighlight : palette.backgroundBase,
              color: statusFilter === 'all' ? palette.brandPrimaryStrong : palette.textSecondary,
              fontSize: typography.sizes.body,
              fontWeight: statusFilter === 'all' ? typography.weights.semibold : typography.weights.regular,
              cursor: 'pointer',
            }}
          >
            {isArabic ? 'الكل' : 'All'} ({meta.total})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('unread')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: radius.md,
              border: `1px solid ${statusFilter === 'unread' ? palette.brandPrimaryStrong : palette.neutralBorderMuted}`,
              background: statusFilter === 'unread' ? palette.backgroundHighlight : palette.backgroundBase,
              color: statusFilter === 'unread' ? palette.brandPrimaryStrong : palette.textSecondary,
              fontSize: typography.sizes.body,
              fontWeight: statusFilter === 'unread' ? typography.weights.semibold : typography.weights.regular,
              cursor: 'pointer',
            }}
          >
            {isArabic ? 'غير مقروء' : 'Unread'} ({meta.unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('read')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: radius.md,
              border: `1px solid ${statusFilter === 'read' ? palette.brandPrimaryStrong : palette.neutralBorderMuted}`,
              background: statusFilter === 'read' ? palette.backgroundHighlight : palette.backgroundBase,
              color: statusFilter === 'read' ? palette.brandPrimaryStrong : palette.textSecondary,
              fontSize: typography.sizes.body,
              fontWeight: statusFilter === 'read' ? typography.weights.semibold : typography.weights.regular,
              cursor: 'pointer',
            }}
          >
            {isArabic ? 'مقروء' : 'Read'} ({meta.total - meta.unreadCount})
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {[1, 2, 3, 4, 5].map(i => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              background: palette.backgroundBase,
              borderRadius: radius.lg,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <p style={{ margin: 0, color: palette.error }}>
              {isArabic ? 'حدث خطأ في تحميل الإشعارات' : 'Failed to load notifications'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.brandPrimaryStrong}`,
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontSize: typography.sizes.body,
                fontWeight: typography.weights.semibold,
                cursor: 'pointer',
              }}
            >
              {isArabic ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState language={language} />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {notifications.map(notification => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                language={language}
                direction={direction}
                onMarkRead={handleMarkRead}
                isMarking={markReadMutation.isPending && markReadMutation.variables === notification.id}
              />
            ))}

            {/* Pagination */}
            {meta.pageCount > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '2rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!meta.hasPrevious || page === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: radius.md,
                    border: `1px solid ${palette.neutralBorderMuted}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                    fontSize: typography.sizes.body,
                    cursor: meta.hasPrevious && page > 1 ? 'pointer' : 'not-allowed',
                    opacity: meta.hasPrevious && page > 1 ? 1 : 0.5,
                  }}
                >
                  {isArabic ? 'السابق' : 'Previous'}
                </button>
                <span
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: typography.sizes.body,
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic
                    ? `صفحة ${page} من ${meta.pageCount}`
                    : `Page ${page} of ${meta.pageCount}`}
                </span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(meta.pageCount, p + 1))}
                  disabled={!meta.hasNext || page === meta.pageCount}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: radius.md,
                    border: `1px solid ${palette.neutralBorderMuted}`,
                    background: palette.backgroundBase,
                    color: palette.textPrimary,
                    fontSize: typography.sizes.body,
                    cursor: meta.hasNext && page < meta.pageCount ? 'pointer' : 'not-allowed',
                    opacity: meta.hasNext && page < meta.pageCount ? 1 : 0.5,
                  }}
                >
                  {isArabic ? 'التالي' : 'Next'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


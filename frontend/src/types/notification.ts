export type NotificationChannel = 'email' | 'sms' | 'in_app';

export type NotificationType =
  | 'request_submitted'
  | 'request_pending_info'
  | 'request_approved'
  | 'request_rejected'
  | 'request_settling'
  | 'request_completed';

export type NotificationStatusFilter = 'all' | 'unread' | 'read';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
  readAt: string | null;
  stateRead: boolean;
  createdAt: string;
}

export interface NotificationListMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
  unreadCount: number;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  meta: NotificationListMeta;
}

export interface NotificationListFilters {
  page?: number;
  status?: NotificationStatusFilter;
}

export interface NotificationPreference {
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
}

export interface NotificationPreferenceResponse {
  preferences: NotificationPreference[];
}


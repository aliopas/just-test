import { requireSupabaseAdmin } from '../lib/supabase';
import type {
  NotificationChannel,
  NotificationType,
} from '../schemas/notification.schema';

type TimelineVisibility = 'investor' | 'admin';
type TimelineEntryType = 'notification' | 'status_change' | 'comment';

export interface TimelineActor {
  id: string | null;
  email: string | null;
  name: string | null;
}

export interface TimelineNotificationData {
  type: NotificationType;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
  readAt: string | null;
  stateRead: boolean;
  userId: string;
}

export interface TimelineEventData {
  fromStatus: string | null;
  toStatus: string | null;
  note: string | null;
}

export interface TimelineCommentData {
  comment: string;
}

export interface RequestTimelineItem {
  id: string;
  entryType: TimelineEntryType;
  createdAt: string;
  visibility: TimelineVisibility;
  actor: TimelineActor | null;
  notification?: TimelineNotificationData;
  event?: TimelineEventData;
  comment?: TimelineCommentData;
}

export interface RequestTimelineResult {
  requestId: string;
  requestNumber: string;
  items: RequestTimelineItem[];
}

type RequestRow = {
  id: string;
  user_id: string;
  request_number: string;
};

type NotificationRow = {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
  user_id: string;
};

type RequestEventRow = {
  id: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  note: string | null;
  created_at: string;
  actor?: Array<{
    id: string | null;
    email: string | null;
    profile?: Array<{
      full_name: string | null;
      preferred_name: string | null;
    } | null> | null;
  }> | null;
};

type RequestCommentRow = {
  id: string;
  comment: string;
  actor_id: string;
  created_at: string;
  actor?: Array<{
    id: string | null;
    email: string | null;
    profile?: Array<{
      full_name: string | null;
      preferred_name: string | null;
    } | null> | null;
  }> | null;
};

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value.length > 0 ? (value[0] ?? null) : null;
  }
  return value ?? null;
}

function mapActor(
  row: {
    id: string | null;
    email: string | null;
    profile?: Array<{
      full_name: string | null;
      preferred_name: string | null;
    } | null> | null;
  } | null
): TimelineActor | null {
  if (!row) {
    return null;
  }

  const profile = firstOrNull(row.profile ?? null);
  const name =
    profile?.preferred_name ?? profile?.full_name ?? row.email ?? null;

  return {
    id: row.id ?? null,
    email: row.email ?? null,
    name,
  };
}

function buildNotificationItem(
  row: NotificationRow,
  visibility: TimelineVisibility
): RequestTimelineItem {
  return {
    id: `notification:${row.id}`,
    entryType: 'notification',
    createdAt: row.created_at,
    visibility,
    actor: null,
    notification: {
      type: row.type,
      channel: row.channel,
      payload: row.payload ?? {},
      readAt: row.read_at ?? null,
      stateRead: row.read_at != null,
      userId: row.user_id,
    },
  };
}

function buildEventItem(row: RequestEventRow): RequestTimelineItem {
  const actor = mapActor(firstOrNull(row.actor ?? null));
  return {
    id: `event:${row.id}`,
    entryType: 'status_change',
    createdAt: row.created_at,
    visibility: 'investor',
    actor,
    event: {
      fromStatus: row.from_status ?? null,
      toStatus: row.to_status ?? null,
      note: row.note ?? null,
    },
  };
}

function buildCommentItem(row: RequestCommentRow): RequestTimelineItem {
  const actor = mapActor(firstOrNull(row.actor ?? null));
  return {
    id: `comment:${row.id}`,
    entryType: 'comment',
    createdAt: row.created_at,
    visibility: 'admin',
    actor,
    comment: {
      comment: row.comment,
    },
  };
}

async function fetchRequest(requestId: string): Promise<RequestRow> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('requests')
    .select('id, user_id, request_number')
    .eq('id', requestId)
    .maybeSingle<RequestRow>();

  if (error) {
    throw new Error(`FAILED_REQUEST_LOOKUP:${error.message ?? 'unknown'}`);
  }

  if (!data) {
    throw new Error('REQUEST_NOT_FOUND');
  }

  return data;
}

export async function getInvestorRequestTimeline(params: {
  userId: string;
  requestId: string;
}): Promise<RequestTimelineResult> {
  const adminClient = requireSupabaseAdmin();
  const requestRow = await fetchRequest(params.requestId);

  if (requestRow.user_id !== params.userId) {
    throw new Error('REQUEST_NOT_OWNED');
  }

  const [notificationsResult, eventsResult] = await Promise.all([
    adminClient
      .from('notifications')
      .select('id, type, channel, payload, read_at, created_at, user_id')
      .eq('payload->>requestId', params.requestId)
      .order('created_at', { ascending: true }),
    adminClient
      .from('request_events')
      .select(
        `
          id,
          from_status,
          to_status,
          actor_id,
          note,
          created_at,
          actor:users!request_events_actor_id_fkey (
            id,
            email,
            profile:investor_profiles (
              full_name,
              preferred_name
            )
          )
        `
      )
      .eq('request_id', params.requestId)
      .order('created_at', { ascending: true }),
  ]);

  if (notificationsResult.error) {
    throw new Error(
      `FAILED_NOTIFICATIONS:${notificationsResult.error.message ?? 'unknown'}`
    );
  }

  if (eventsResult.error) {
    throw new Error(`FAILED_EVENTS:${eventsResult.error.message ?? 'unknown'}`);
  }

  const items: RequestTimelineItem[] = [];

  for (const rawNotification of (notificationsResult.data ??
    []) as NotificationRow[]) {
    if (rawNotification.user_id !== requestRow.user_id) {
      continue;
    }
    items.push(buildNotificationItem(rawNotification, 'investor'));
  }

  for (const rawEvent of (eventsResult.data ?? []) as RequestEventRow[]) {
    items.push(buildEventItem(rawEvent));
  }

  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    requestId: requestRow.id,
    requestNumber: requestRow.request_number,
    items,
  };
}

export async function getAdminRequestTimeline(params: {
  requestId: string;
}): Promise<RequestTimelineResult> {
  const adminClient = requireSupabaseAdmin();
  const requestRow = await fetchRequest(params.requestId);

  const [notificationsResult, eventsResult, commentsResult] = await Promise.all(
    [
      adminClient
        .from('notifications')
        .select('id, type, channel, payload, read_at, created_at, user_id')
        .eq('payload->>requestId', params.requestId)
        .order('created_at', { ascending: true }),
      adminClient
        .from('request_events')
        .select(
          `
            id,
            from_status,
            to_status,
            actor_id,
            note,
            created_at,
            actor:users!request_events_actor_id_fkey (
              id,
              email,
              profile:investor_profiles (
                full_name,
                preferred_name
              )
            )
          `
        )
        .eq('request_id', params.requestId)
        .order('created_at', { ascending: true }),
      adminClient
        .from('request_comments')
        .select(
          `
            id,
            comment,
            actor_id,
            created_at,
            actor:users!request_comments_actor_id_fkey (
              id,
              email,
              profile:investor_profiles (
                full_name,
                preferred_name
              )
            )
          `
        )
        .eq('request_id', params.requestId)
        .order('created_at', { ascending: true }),
    ]
  );

  if (notificationsResult.error) {
    throw new Error(
      `FAILED_NOTIFICATIONS:${notificationsResult.error.message ?? 'unknown'}`
    );
  }

  if (eventsResult.error) {
    throw new Error(`FAILED_EVENTS:${eventsResult.error.message ?? 'unknown'}`);
  }

  if (commentsResult?.error) {
    throw new Error(
      `FAILED_COMMENTS:${commentsResult.error.message ?? 'unknown'}`
    );
  }

  const items: RequestTimelineItem[] = [];

  for (const rawNotification of (notificationsResult.data ??
    []) as NotificationRow[]) {
    const visibility =
      rawNotification.user_id === requestRow.user_id ? 'investor' : 'admin';
    items.push(buildNotificationItem(rawNotification, visibility));
  }

  for (const rawEvent of (eventsResult.data ?? []) as RequestEventRow[]) {
    items.push(buildEventItem(rawEvent));
  }

  for (const rawComment of (commentsResult?.data ??
    []) as RequestCommentRow[]) {
    items.push(buildCommentItem(rawComment));
  }

  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    requestId: requestRow.id,
    requestNumber: requestRow.request_number,
    items,
  };
}

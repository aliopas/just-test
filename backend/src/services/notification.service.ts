import type { User } from '@supabase/supabase-js';
import type { EmailLanguage, TemplateContext } from '../email/templates/types';
import { enqueueEmailNotification } from './email-dispatch.service';
import { requireSupabaseAdmin } from '../lib/supabase';
import type {
  NotificationType,
  NotificationStatusFilter,
  NotificationChannel,
  NotificationPreferenceInput,
  NotificationPreferenceListInput,
} from '../schemas/notification.schema';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_TYPES,
} from '../schemas/notification.schema';
import type { NewsStatus } from '../schemas/news.schema';

const ADMIN_DEFAULT_LANGUAGE =
  process.env.ADMIN_NOTIFICATION_DEFAULT_LANGUAGE === 'ar' ||
  process.env.ADMIN_NOTIFICATION_DEFAULT_LANGUAGE === 'en'
    ? (process.env.ADMIN_NOTIFICATION_DEFAULT_LANGUAGE as EmailLanguage)
    : undefined;

const DEFAULT_NOTIFICATION_CHANNELS = NOTIFICATION_CHANNELS.filter(
  (channel): channel is Extract<NotificationChannel, 'email' | 'in_app'> =>
    channel === 'email' || channel === 'in_app'
);

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferenceInput[] =
  NOTIFICATION_TYPES.flatMap(notificationType =>
  DEFAULT_NOTIFICATION_CHANNELS.map(channel => ({
    channel,
    type: notificationType,
    enabled: true,
    }))
  );

const INVESTOR_PORTAL_URL = (
  process.env.INVESTOR_PORTAL_URL ?? 'https://app.bakurah.com'
).replace(/\/$/, '');
const ADMIN_PORTAL_URL = (
  process.env.ADMIN_PORTAL_URL ?? `${INVESTOR_PORTAL_URL}/admin`
).replace(/\/$/, '');
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? 'support@bakurah.com';
type InvestorSubmissionNotification = {
  userId: string;
  requestId: string;
  requestNumber: string;
};

type AdminSubmissionNotification = {
  requestId: string;
  requestNumber: string;
};

type InvestorDecisionNotification = InvestorSubmissionNotification & {
  decision: 'approved' | 'rejected';
  note?: string | null;
  approvedAmount?: number | null;
  currency?: string | null;
  settlementEta?: string | null;
  actorId?: string;
};

type InvestorInfoRequestNotification = InvestorSubmissionNotification & {
  message: string;
  previousStatus: string;
  actorId?: string;
};

type InvestorSettlementNotification = InvestorSubmissionNotification & {
  stage: 'started' | 'completed';
  reference?: string | null;
  actorId?: string;
};

type NewsPublishNotification = {
  newsId: string;
  title: string;
  slug: string;
  publishedAt: string;
};

type NewsAuthorApprovalNotification = {
  newsId: string;
  authorId: string;
  reviewerId: string;
  title: string;
  status: NewsStatus;
  comment: string | null;
};

type NewsAuthorRejectionNotification = {
  newsId: string;
  authorId: string;
  reviewerId: string;
  title: string;
  comment: string | null;
};

interface NotificationRecipient {
  email: string;
  name: string;
  language: EmailLanguage;
}

interface AdminRecipient extends NotificationRecipient {
  userId: string;
}

interface RequestSummary {
  id: string;
  number: string;
  type: string;
  amount: number | null;
  currency: string | null;
  status: string;
  createdAt: string;
  investorName: string;
}

type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  channel: NotificationChannel;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export type NotificationListMeta = {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

export type NotificationListResult = {
  notifications: NotificationListItem[];
  meta: NotificationListMeta;
};

function sanitizePreferenceList(
  preferences: NotificationPreferenceListInput
): NotificationPreferenceInput[] {
  const allowedChannels = new Set<NotificationChannel>(NOTIFICATION_CHANNELS);
  const allowedTypes = new Set<NotificationType>(NOTIFICATION_TYPES);

  const preferenceMap = new Map<string, NotificationPreferenceInput>();

  preferences.forEach(pref => {
    if (!allowedChannels.has(pref.channel) || !allowedTypes.has(pref.type)) {
      return;
    }
    const key = `${pref.channel}:${pref.type}`;
    preferenceMap.set(key, {
      channel: pref.channel,
      type: pref.type,
      enabled: Boolean(pref.enabled),
    });
  });

  return Array.from(preferenceMap.values());
}

function coerceLanguage(value: unknown): EmailLanguage {
  return value === 'ar' ? 'ar' : 'en';
}

function getMetadataString(
  meta: Record<string, unknown> | undefined,
  key: string
) {
  const raw = meta?.[key];
  return typeof raw === 'string' ? raw : undefined;
}

async function resolveNotificationRecipient(
  userId: string
): Promise<NotificationRecipient> {
  const adminClient = requireSupabaseAdmin();
  const { data: userResult, error: userError } =
    await adminClient.auth.admin.getUserById(userId);

  if (userError || !userResult?.user) {
    throw new Error(`NOTIFICATION_USER_NOT_FOUND:${userId}`);
  }

  const user: User = userResult.user;
  const email =
    user.email ??
    getMetadataString(user.user_metadata as Record<string, unknown>, 'email');

  if (!email) {
    throw new Error(`NOTIFICATION_USER_EMAIL_MISSING:${userId}`);
  }

  const { data: profile } = await adminClient
    .from('investor_profiles')
    .select('full_name, preferred_name, language')
    .eq('user_id', userId)
    .maybeSingle();

  const language = coerceLanguage(
    profile?.language ??
      getMetadataString(
        user.user_metadata as Record<string, unknown>,
        'language'
      )
  );

  const name =
    profile?.preferred_name ??
    profile?.full_name ??
    getMetadataString(
      user.user_metadata as Record<string, unknown>,
      'full_name'
    ) ??
    email.split('@')[0];

  return {
    email,
    name,
    language,
  };
}

async function createNotificationRecord(params: {
  userId: string;
  type: NotificationType;
  payload: Record<string, unknown>;
}) {
  try {
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        channel: 'email',
        payload: params.payload,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create notification record', error);
      return null;
    }

    return data?.id as string | null;
  } catch (err) {
    console.error('Unexpected error while creating notification record', err);
    return null;
  }
}

function buildRequestLink(requestNumber: string) {
  return `${INVESTOR_PORTAL_URL}/requests/${encodeURIComponent(requestNumber)}`;
}

function buildAdminRequestLink(requestId: string) {
  return `${ADMIN_PORTAL_URL}/requests/${encodeURIComponent(requestId)}`;
}

function parseAdminNotificationEmails(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS;
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
}

const adminRecipientCache = new Map<string, AdminRecipient>();

async function resolveAdminRecipientByEmail(email: string) {
  if (adminRecipientCache.has(email)) {
    return adminRecipientCache.get(email)!;
  }

  const adminClient = requireSupabaseAdmin();
  try {
    const { data: userRow, error } = await adminClient
      .from('users')
      .select('id, email')
      .ilike('email', email)
      .maybeSingle();
    if (error || !userRow) {
      console.warn(
        `Admin notification email ${email} is not linked to a Supabase user`
      );
      return null;
    }

    const baseRecipient = await resolveNotificationRecipient(userRow.id);
    const recipient: AdminRecipient = {
      userId: userRow.id,
      email: baseRecipient.email,
      name: baseRecipient.name,
      language: ADMIN_DEFAULT_LANGUAGE ?? baseRecipient.language,
    };
    adminRecipientCache.set(email, recipient);
    return recipient;
  } catch (err) {
    console.error(`Failed to resolve admin recipient ${email}`, err);
    return null;
  }
}

async function resolveAdminRecipients(): Promise<AdminRecipient[]> {
  const emails = parseAdminNotificationEmails();
  if (emails.length === 0) {
    return [];
  }

  const recipients: AdminRecipient[] = [];
  for (const email of emails) {
    const recipient = await resolveAdminRecipientByEmail(email);
    if (recipient) {
      recipients.push(recipient);
    }
  }
  return recipients;
}

async function loadRequestSummary(
  requestId: string
): Promise<RequestSummary | null> {
  const adminClient = requireSupabaseAdmin();
  const { data: requestRow, error: requestError } = await adminClient
    .from('requests')
    .select(
      'id, request_number, type, amount, currency, status, created_at, user_id'
    )
    .eq('id', requestId)
    .maybeSingle();

  if (requestError || !requestRow) {
    console.error('Failed to load request summary', requestError);
    return null;
  }

  const { data: profile } = await adminClient
    .from('investor_profiles')
    .select('preferred_name, full_name')
    .eq('user_id', requestRow.user_id)
    .maybeSingle();

  const rawAmount =
    typeof requestRow.amount === 'number'
      ? requestRow.amount
      : requestRow.amount != null
        ? Number(requestRow.amount)
        : null;

  const amountValue =
    rawAmount !== null && Number.isFinite(rawAmount)
      ? (rawAmount as number)
      : null;

  return {
    id: requestRow.id,
    number: requestRow.request_number,
    type: requestRow.type ?? 'unknown',
    amount: amountValue,
    currency: requestRow.currency ?? null,
    status: requestRow.status ?? 'unknown',
    createdAt: requestRow.created_at ?? new Date().toISOString(),
    investorName: profile?.preferred_name ?? profile?.full_name ?? 'Investor',
  };
}

async function resolveUserDisplayName(userId: string | undefined) {
  if (!userId) {
    return undefined;
  }

  try {
    const recipient = await resolveNotificationRecipient(userId);
    return recipient.name;
  } catch {
    return undefined;
  }
}

function mapNotificationRow(row: NotificationRow): NotificationListItem {
  return {
    id: row.id,
    type: row.type,
    channel: row.channel,
    payload: row.payload ?? {},
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export async function listUserNotifications(params: {
  userId: string;
  page: number;
  limit: number;
  status: NotificationStatusFilter;
}): Promise<NotificationListResult> {
  const adminClient = requireSupabaseAdmin();
  const offset = (params.page - 1) * params.limit;
  const end = offset + params.limit - 1;

  let query = adminClient
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', params.userId);

  if (params.status === 'unread') {
    query = query.is('read_at', null);
  } else if (params.status === 'read') {
    query = query.not('read_at', 'is', null);
  }

  query = query.order('created_at', { ascending: false }).range(offset, end);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  const total = count ?? 0;
  const pageCount = params.limit > 0 ? Math.ceil(total / params.limit) : 0;
  const notifications = (data ?? []).map(row =>
    mapNotificationRow(row as NotificationRow)
  );

  return {
    notifications,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      pageCount,
      hasNext: offset + params.limit < total,
      hasPrevious: params.page > 1,
    },
  };
}

export async function getUnreadNotificationCount(userId: string) {
  const adminClient = requireSupabaseAdmin();
  const { count, error } = await adminClient
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    throw new Error(`Failed to count unread notifications: ${error.message}`);
  }

  return count ?? 0;
}

export async function markNotificationRead(params: {
  userId: string;
  notificationId: string;
}) {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('notifications')
    .update({
      read_at: new Date().toISOString(),
    })
    .eq('id', params.notificationId)
    .eq('user_id', params.userId)
    .select('id, read_at')
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }

  return data
    ? {
        updated: true,
        readAt: data.read_at as string,
      }
    : {
        updated: false,
      };
}

export async function markAllNotificationsRead(userId: string) {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('notifications')
    .update({
      read_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .is('read_at', null)
    .select('id');

  if (error) {
    throw new Error(`Failed to mark notifications as read: ${error.message}`);
  }

  return {
    updated: data?.length ?? 0,
  };
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferenceInput[]> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('notification_preferences')
    .select('type, channel, enabled')
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      `Failed to load notification preferences: ${error.message}`
    );
  }

  const existing = new Map<string, NotificationPreferenceInput>();
  for (const pref of data ?? []) {
    if (
      typeof pref.type === 'string' &&
      typeof pref.channel === 'string' &&
      typeof pref.enabled === 'boolean'
    ) {
      existing.set(`${pref.channel}:${pref.type}`, {
        type: pref.type as NotificationType,
        channel: pref.channel as NotificationChannel,
        enabled: pref.enabled,
      });
    }
  }

  const merged: NotificationPreferenceInput[] = [];
  for (const defaultPref of DEFAULT_NOTIFICATION_PREFERENCES) {
    const key = `${defaultPref.channel}:${defaultPref.type}`;
    merged.push(existing.get(key) ?? defaultPref);
    existing.delete(key);
  }

  if (existing.size > 0) {
    merged.push(...existing.values());
  }

  return merged;
}

export async function updateNotificationPreferences(params: {
  userId: string;
  preferences: NotificationPreferenceListInput;
}): Promise<NotificationPreferenceInput[]> {
  const sanitized = sanitizePreferenceList(params.preferences);
  const adminClient = requireSupabaseAdmin();

  const { error: deleteError } = await adminClient
    .from('notification_preferences')
    .delete()
    .eq('user_id', params.userId);

  if (deleteError) {
    throw new Error(
      `Failed to reset notification preferences: ${deleteError.message}`
    );
  }

  if (sanitized.length > 0) {
    const insertPayload = sanitized.map(pref => ({
      user_id: params.userId,
      type: pref.type,
      channel: pref.channel,
      enabled: pref.enabled,
    }));

    const { error: insertError } = await adminClient
      .from('notification_preferences')
      .insert(insertPayload);

    if (insertError) {
      throw new Error(
        `Failed to update notification preferences: ${insertError.message}`
      );
    }
  }

  return getNotificationPreferences(params.userId);
}

async function notifyAdminRequestEvent<
  TTemplate extends
    | 'admin_request_submitted'
    | 'admin_request_pending_info'
    | 'admin_request_decision'
    | 'admin_request_settling'
    | 'admin_request_completed',
>(
  templateId: TTemplate,
  notificationType: NotificationType,
  requestId: string,
  buildContext: (
    recipient: AdminRecipient,
    summary: RequestSummary
  ) => TemplateContext<TTemplate>,
  metadata?: Record<string, unknown>
) {
  const recipients = await resolveAdminRecipients();
  if (recipients.length === 0) {
    return;
  }

  const summary = await loadRequestSummary(requestId);
  if (!summary) {
    return;
  }

  for (const recipient of recipients) {
    try {
      const context = buildContext(recipient, summary);
      const notificationId = await createNotificationRecord({
        userId: recipient.userId,
        type: notificationType,
        payload: {
          requestId: summary.id,
          requestNumber: summary.number,
          channel: 'admin_email',
        },
      });

      await enqueueEmailNotification({
        userId: recipient.userId,
        templateId,
        language: recipient.language,
        recipientEmail: recipient.email,
        context,
        metadata: {
          requestId: summary.id,
          requestNumber: summary.number,
          notificationId,
          ...metadata,
        },
      });
    } catch (err) {
      console.error(`Failed to queue admin notification (${templateId})`, err);
    }
  }
}

export async function notifyInvestorOfSubmission(
  payload: InvestorSubmissionNotification
) {
  try {
    const recipient = await resolveNotificationRecipient(payload.userId);
    const notificationId = await createNotificationRecord({
      userId: payload.userId,
      type: 'request_submitted',
      payload: {
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
      },
    });

    await enqueueEmailNotification({
      userId: payload.userId,
      templateId: 'request_submitted',
      language: recipient.language,
      recipientEmail: recipient.email,
      context: {
        userName: recipient.name,
        requestNumber: payload.requestNumber,
        requestLink: buildRequestLink(payload.requestNumber),
        supportEmail: SUPPORT_EMAIL,
        submittedAt: new Date().toISOString(),
      },
      metadata: {
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
        notificationId,
      },
    });
  } catch (error) {
    console.error('Failed to queue submission notification email', error);
  }
}

export async function notifyAdminsOfSubmission(
  payload: AdminSubmissionNotification
) {
  try {
    await notifyAdminRequestEvent(
      'admin_request_submitted',
      'request_submitted',
      payload.requestId,
      (recipient, summary) => ({
        recipientName: recipient.name,
        requestNumber: summary.number,
        investorName: summary.investorName,
        requestType: summary.type,
        amount: summary.amount ?? undefined,
        currency: summary.currency ?? undefined,
        requestLink: buildAdminRequestLink(summary.id),
        supportEmail: SUPPORT_EMAIL,
        submittedAt: summary.createdAt,
      })
    );
  } catch (error) {
    console.error('Failed to queue admin submission notification', error);
  }
}

export async function notifyInvestorOfDecision(
  payload: InvestorDecisionNotification
) {
  try {
    const recipient = await resolveNotificationRecipient(payload.userId);
    const notificationType =
      payload.decision === 'approved' ? 'request_approved' : 'request_rejected';

    const notificationId = await createNotificationRecord({
      userId: payload.userId,
      type: notificationType,
      payload: {
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
        decision: payload.decision,
        note: payload.note ?? null,
      },
    });

    const baseContext = {
      userName: recipient.name,
      requestNumber: payload.requestNumber,
      requestLink: buildRequestLink(payload.requestNumber),
      supportEmail: SUPPORT_EMAIL,
    };

    if (payload.decision === 'approved') {
      await enqueueEmailNotification({
        userId: payload.userId,
        templateId: 'request_approved',
        language: recipient.language,
        recipientEmail: recipient.email,
        context: {
          ...baseContext,
          approvedAmount:
            typeof payload.approvedAmount === 'number'
              ? payload.approvedAmount
              : undefined,
          currency: payload.currency ?? undefined,
          settlementEta: payload.settlementEta ?? undefined,
        },
        metadata: {
          requestId: payload.requestId,
          notificationId,
        },
      });
    } else {
      await enqueueEmailNotification({
        userId: payload.userId,
        templateId: 'request_rejected',
        language: recipient.language,
        recipientEmail: recipient.email,
        context: {
          ...baseContext,
          rejectionReason: payload.note ?? undefined,
        },
        metadata: {
          requestId: payload.requestId,
          notificationId,
        },
      });
    }
  } catch (error) {
    console.error('Failed to queue decision notification email', error);
  }

  try {
    const actorName = payload.actorId
      ? await resolveUserDisplayName(payload.actorId)
      : undefined;

    await notifyAdminRequestEvent(
      'admin_request_decision',
      payload.decision === 'approved' ? 'request_approved' : 'request_rejected',
      payload.requestId,
      (recipient, summary) => ({
        recipientName: recipient.name,
        requestNumber: summary.number,
        investorName: summary.investorName,
        requestType: summary.type,
        amount: summary.amount ?? undefined,
        currency: summary.currency ?? undefined,
        requestLink: buildAdminRequestLink(summary.id),
        supportEmail: SUPPORT_EMAIL,
        decision: payload.decision,
        note: payload.note ?? null,
        actorName,
      })
    );
  } catch (error) {
    console.error('Failed to queue admin decision notification', error);
  }
}

export async function notifyInvestorOfInfoRequest(
  payload: InvestorInfoRequestNotification
) {
  try {
    const recipient = await resolveNotificationRecipient(payload.userId);
    const notificationId = await createNotificationRecord({
      userId: payload.userId,
      type: 'request_pending_info',
      payload: {
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
        message: payload.message,
      },
    });

    await enqueueEmailNotification({
      userId: payload.userId,
      templateId: 'request_pending_info',
      language: recipient.language,
      recipientEmail: recipient.email,
      context: {
        userName: recipient.name,
        requestNumber: payload.requestNumber,
        requestLink: buildRequestLink(payload.requestNumber),
        supportEmail: SUPPORT_EMAIL,
        infoMessage: payload.message,
      },
      metadata: {
        requestId: payload.requestId,
        notificationId,
      },
    });
  } catch (error) {
    console.error('Failed to queue info request email', error);
  }

  try {
    const actorName = payload.actorId
      ? await resolveUserDisplayName(payload.actorId)
      : undefined;

    await notifyAdminRequestEvent(
      'admin_request_pending_info',
      'request_pending_info',
      payload.requestId,
      (recipient, summary) => ({
        recipientName: recipient.name,
        requestNumber: summary.number,
        investorName: summary.investorName,
        requestType: summary.type,
        amount: summary.amount ?? undefined,
        currency: summary.currency ?? undefined,
        requestLink: buildAdminRequestLink(summary.id),
        supportEmail: SUPPORT_EMAIL,
        infoMessage: payload.message,
        previousStatus: payload.previousStatus,
      }),
      {
        actorName,
      }
    );
  } catch (error) {
    console.error('Failed to queue admin pending info notification', error);
  }
}

export async function notifyInvestorOfSettlement(
  payload: InvestorSettlementNotification
) {
  try {
    const recipient = await resolveNotificationRecipient(payload.userId);
    const notificationType =
      payload.stage === 'completed' ? 'request_completed' : 'request_settling';

    const notificationId = await createNotificationRecord({
      userId: payload.userId,
      type: notificationType,
      payload: {
        requestId: payload.requestId,
        requestNumber: payload.requestNumber,
        stage: payload.stage,
        reference: payload.reference ?? null,
      },
    });

    if (payload.stage === 'started') {
      await enqueueEmailNotification({
        userId: payload.userId,
        templateId: 'request_settling',
        language: recipient.language,
        recipientEmail: recipient.email,
        context: {
          userName: recipient.name,
          requestNumber: payload.requestNumber,
          requestLink: buildRequestLink(payload.requestNumber),
          supportEmail: SUPPORT_EMAIL,
          settlementReference: payload.reference ?? undefined,
        },
        metadata: {
          requestId: payload.requestId,
          notificationId,
        },
      });
    } else {
      await enqueueEmailNotification({
        userId: payload.userId,
        templateId: 'request_completed',
        language: recipient.language,
        recipientEmail: recipient.email,
        context: {
          userName: recipient.name,
          requestNumber: payload.requestNumber,
          requestLink: buildRequestLink(payload.requestNumber),
          supportEmail: SUPPORT_EMAIL,
          settlementReference: payload.reference ?? undefined,
          completedAt: new Date().toISOString(),
        },
        metadata: {
          requestId: payload.requestId,
          notificationId,
        },
      });
    }
  } catch (error) {
    console.error('Failed to queue settlement notification email', error);
  }

  try {
    const actorName = payload.actorId
      ? await resolveUserDisplayName(payload.actorId)
      : undefined;

    if (payload.stage === 'started') {
      await notifyAdminRequestEvent(
        'admin_request_settling',
        'request_settling',
        payload.requestId,
        (recipient, summary) => ({
          recipientName: recipient.name,
          requestNumber: summary.number,
          investorName: summary.investorName,
          requestType: summary.type,
          amount: summary.amount ?? undefined,
          currency: summary.currency ?? undefined,
          requestLink: buildAdminRequestLink(summary.id),
          supportEmail: SUPPORT_EMAIL,
          settlementReference: payload.reference ?? null,
          startedAt: new Date().toISOString(),
        }),
        { actorName }
      );
    } else {
      await notifyAdminRequestEvent(
        'admin_request_completed',
        'request_completed',
        payload.requestId,
        (recipient, summary) => ({
          recipientName: recipient.name,
          requestNumber: summary.number,
          investorName: summary.investorName,
          requestType: summary.type,
          amount: summary.amount ?? undefined,
          currency: summary.currency ?? undefined,
          requestLink: buildAdminRequestLink(summary.id),
          supportEmail: SUPPORT_EMAIL,
          settlementReference: payload.reference ?? null,
          completedAt: new Date().toISOString(),
        }),
        { actorName }
      );
    }
  } catch (error) {
    console.error('Failed to queue admin settlement notification', error);
  }
}

export async function notifyInvestorsOfPublishedNews(
  payload: NewsPublishNotification
) {
  void payload;
  return Promise.resolve();
}

export async function notifyAuthorOfNewsApproval(
  payload: NewsAuthorApprovalNotification
) {
  void payload;
  return Promise.resolve();
}

export async function notifyAuthorOfNewsRejection(
  payload: NewsAuthorRejectionNotification
) {
  void payload;
  return Promise.resolve();
}

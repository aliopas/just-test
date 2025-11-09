import type { User } from '@supabase/supabase-js';
import type { EmailLanguage } from '../email/templates/types';
import { enqueueEmailNotification } from './email-dispatch.service';
import { requireSupabaseAdmin } from '../lib/supabase';
import type { NotificationType } from '../schemas/notification.schema';
import type { NewsStatus } from '../schemas/news.schema';

const INVESTOR_PORTAL_URL = (
  process.env.INVESTOR_PORTAL_URL ?? 'https://app.bakurah.com'
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
};

type InvestorInfoRequestNotification = InvestorSubmissionNotification & {
  message: string;
};

type InvestorSettlementNotification = InvestorSubmissionNotification & {
  stage: 'started' | 'completed';
  reference?: string | null;
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
  void payload;
  return Promise.resolve();
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

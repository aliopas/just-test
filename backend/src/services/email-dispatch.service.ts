import {
  type EmailLanguage,
  type NotificationEmailTemplateId,
  type TemplateContext,
} from '../email/templates/types';
import { renderNotificationEmailTemplate } from '../email/templates';
import { requireSupabaseAdmin } from '../lib/supabase';

const DISPATCH_FUNCTION =
  process.env.NOTIFICATION_DISPATCH_FUNCTION ?? 'notification-dispatch';

type EmailNotificationMetadata = Record<string, unknown>;

interface EnqueueEmailNotificationInput<
  TTemplate extends NotificationEmailTemplateId,
> {
  userId: string;
  templateId: TTemplate;
  language: EmailLanguage;
  recipientEmail: string;
  context: TemplateContext<TTemplate>;
  metadata?: EmailNotificationMetadata;
  scheduleAt?: string | Date;
}

export async function enqueueEmailNotification<
  TTemplate extends NotificationEmailTemplateId,
>(input: EnqueueEmailNotificationInput<TTemplate>) {
  const adminClient = requireSupabaseAdmin();

  const rendered = renderNotificationEmailTemplate(
    input.templateId,
    input.language,
    input.context
  );

  const payload = {
    templateId: input.templateId,
    language: input.language,
    context: input.context,
    email: rendered,
    recipient: {
      email: input.recipientEmail,
    },
    metadata: input.metadata ?? {},
  };

  const scheduleAtIso =
    typeof input.scheduleAt === 'string'
      ? input.scheduleAt
      : input.scheduleAt instanceof Date
        ? input.scheduleAt.toISOString()
        : new Date().toISOString();

  const insertChain = adminClient
    .from('notification_jobs')
    .insert({
      user_id: input.userId,
      template_id: input.templateId,
      channel: 'email',
      language: input.language,
      payload,
      scheduled_at: scheduleAtIso,
    })
    .select('*')
    .single();

  const { data: job, error } = await insertChain;

  if (error || !job) {
    throw new Error(
      `Failed to queue email notification: ${error?.message ?? 'Unknown error'}`
    );
  }

  try {
    await adminClient.functions.invoke(DISPATCH_FUNCTION, {
      body: {
        jobId: job.id,
      },
    });
  } catch (invokeError) {
    const errorMessage =
      invokeError instanceof Error
        ? invokeError.message
        : typeof invokeError === 'string'
          ? invokeError
          : 'Dispatch invocation failed';

    await adminClient
      .from('notification_jobs')
      .update({
        last_error: errorMessage,
      })
      .eq('id', job.id);

    throw new Error(
      `Failed to invoke notification dispatcher: ${errorMessage}`
    );
  }

  return {
    jobId: job.id as string,
  };
}

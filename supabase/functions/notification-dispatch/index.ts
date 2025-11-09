import { createClient } from 'npm:@supabase/supabase-js@2.43.5';
import { Resend } from 'npm:resend@2.1.0';

type NotificationJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

interface NotificationJobRow {
  id: string;
  user_id: string;
  template_id: string;
  channel: string;
  language: string;
  payload: {
    recipient: { email: string };
    email: { subject: string; html: string; text: string };
    metadata?: Record<string, unknown>;
  };
  status: NotificationJobStatus;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const fromEmail =
  Deno.env.get('NOTIFICATIONS_FROM_EMAIL') ?? 'Bakurah <notifications@bakurah.com>';

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials for notification dispatcher.');
}

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const supabaseAdmin = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

async function updateJobStatus(
  jobId: string,
  changes: Partial<Pick<NotificationJobRow, 'status' | 'attempts' | 'last_error'>> & {
    dispatched_at?: string | null;
    completed_at?: string | null;
    scheduled_at?: string | null;
  },
) {
  if (!supabaseAdmin) {
    return;
  }

  const { error } = await supabaseAdmin
    .from('notification_jobs')
    .update({
      ...changes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId);

  if (error) {
    console.error('Failed to update notification job', error);
  }
}

async function fetchJob(jobId: string): Promise<NotificationJobRow | null> {
  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('notification_jobs')
    .select('*')
    .eq('id', jobId)
    .single<NotificationJobRow>();

  if (error) {
    console.error('Failed to fetch notification job', error);
    return null;
  }

  return data ?? null;
}

async function handleJob(job: NotificationJobRow) {
  if (!resend) {
    await updateJobStatus(job.id, {
      status: 'failed',
      last_error: 'Resend API key not configured',
      attempts: job.attempts + 1,
    });
    throw new Error('Resend API key not configured');
  }

  if (job.status === 'completed') {
    return;
  }

  if (job.attempts >= job.max_attempts) {
    await updateJobStatus(job.id, {
      status: 'failed',
      last_error: 'Maximum retry attempts reached',
      attempts: job.attempts,
    });
    return;
  }

  const nextAttempt = job.attempts + 1;

  await updateJobStatus(job.id, {
    status: 'processing',
    attempts: nextAttempt,
    dispatched_at: new Date().toISOString(),
    last_error: null,
  });

  try {
    await resend.emails.send({
      from: fromEmail,
      to: [job.payload.recipient.email],
      subject: job.payload.email.subject,
      html: job.payload.email.html,
      text: job.payload.email.text,
      headers: {
        'X-Bakurah-Template': job.template_id,
      },
    });

    await updateJobStatus(job.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      last_error: null,
    });
  } catch (error) {
    console.error('Failed to send notification email', error);
    const retryDelayMinutes = Math.min(30, Math.pow(2, nextAttempt));
    const scheduledAt = new Date(Date.now() + retryDelayMinutes * 60_000).toISOString();

    await updateJobStatus(job.id, {
      status: 'failed',
      last_error: error instanceof Error ? error.message : 'Unknown error while sending email',
      scheduled_at: scheduledAt,
    });

    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  if (!supabaseAdmin) {
    return new Response('Supabase client not configured', { status: 500 });
  }

  let body: { jobId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  if (!body.jobId) {
    return new Response('jobId is required', { status: 400 });
  }

  const job = await fetchJob(body.jobId);
  if (!job) {
    return new Response('Job not found', { status: 404 });
  }

  try {
    await handleJob(job);
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});


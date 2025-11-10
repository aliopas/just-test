import { requireSupabaseAdmin } from '../lib/supabase';
import { z } from 'zod';

export const adminAuditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  actorId: z.string().uuid().optional(),
  action: z.string().max(100).optional(),
  resourceType: z.string().max(50).optional(),
  resourceId: z.string().uuid().optional(),
});

export type AdminAuditLogQuery = z.infer<typeof adminAuditLogQuerySchema>;

type ActorProfileRow = {
  full_name: string | null;
  preferred_name: string | null;
};

type ActorRow = {
  id: string | null;
  email: string | null;
  profile: ActorProfileRow[] | null;
};

type RawAuditLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  diff: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  actor: ActorRow | ActorRow[] | null;
};

export interface AdminAuditLogEntry {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  diff: Record<string, unknown> | null;
  actor: {
    id: string | null;
    email: string | null;
    name: string | null;
  };
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AdminAuditLogResponse {
  logs: AdminAuditLogEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
  };
}

function mapActor(
  actorRow: ActorRow | ActorRow[] | null
): AdminAuditLogEntry['actor'] {
  if (!actorRow) {
    return {
      id: null,
      email: null,
      name: null,
    };
  }

  const actor = Array.isArray(actorRow) ? (actorRow[0] ?? null) : actorRow;
  if (!actor) {
    return {
      id: null,
      email: null,
      name: null,
    };
  }

  const profile = Array.isArray(actor.profile)
    ? (actor.profile[0] ?? null)
    : (actor.profile ?? null);
  const name =
    profile?.preferred_name ?? profile?.full_name ?? actor.email ?? null;

  return {
    id: actor.id ?? null,
    email: actor.email ?? null,
    name,
  };
}

function mapRow(row: RawAuditLogRow): AdminAuditLogEntry {
  return {
    id: row.id,
    action: row.action,
    targetType: row.target_type ?? null,
    targetId: row.target_id ?? null,
    diff: row.diff ?? null,
    actor: mapActor(row.actor ?? null),
    ipAddress: row.ip_address ?? null,
    userAgent: row.user_agent ?? null,
    createdAt: row.created_at,
  };
}

export async function listAdminAuditLogs(
  query: AdminAuditLogQuery
): Promise<AdminAuditLogResponse> {
  const adminClient = requireSupabaseAdmin();
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(query.limit ?? 25, 100);
  const offset = (page - 1) * limit;

  const selectQuery = adminClient.from('audit_logs').select(
    `
        id,
        actor_id,
        action,
        target_type,
        target_id,
        diff,
        ip_address,
        user_agent,
        created_at,
        actor:users!audit_logs_actor_id_fkey (
          id,
          email,
          profile:investor_profiles (
            full_name,
            preferred_name
          )
        )
      `,
    { count: 'exact' }
  );

  let builder = selectQuery;

  if (query.from) {
    builder = builder.gte('created_at', query.from);
  }

  if (query.to) {
    builder = builder.lte('created_at', query.to);
  }

  if (query.actorId) {
    builder = builder.eq('actor_id', query.actorId);
  }

  if (query.action) {
    builder = builder.eq('action', query.action);
  }

  if (query.resourceType) {
    builder = builder.eq('target_type', query.resourceType);
  }

  if (query.resourceId) {
    builder = builder.eq('target_id', query.resourceId);
  }

  const { data, error, count } = await builder
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`FAILED_AUDIT_LOG_QUERY:${error.message ?? 'unknown'}`);
  }

  const rows = (data ?? []) as RawAuditLogRow[];
  const logs = rows.map(mapRow);
  const total = count ?? logs.length;
  const pageCount = total === 0 ? 1 : Math.max(Math.ceil(total / limit), 1);

  return {
    logs,
    meta: {
      page,
      limit,
      total,
      pageCount,
    },
  };
}

/**
 * Hook لجلب سجل التدقيق (Audit Logs) للإدارة مباشرة من Supabase
 * بديل لـ useAdminAuditLogs الذي يستخدم API backend
 */

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  AdminAuditLogFilters,
  AdminAuditLogResponse,
  AdminAuditLogEntry,
  AdminAuditLogActor,
} from '../types/admin-audit';

type AuditLogRow = {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  diff: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type ActorRow = {
  id: string;
  email: string | null;
  full_name: string | null;
};

async function fetchAdminAuditLogsDirect(
  filters: AdminAuditLogFilters
): Promise<AdminAuditLogResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const page = filters.page ?? 1;
  const limit = 25;
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from('audit_logs')
    .select(
      `
      id,
      actor_id,
      action,
      target_type,
      target_id,
      diff,
      ip_address,
      user_agent,
      created_at
    `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.from) {
    query = query.gte('created_at', filters.from);
  }

  if (filters.to) {
    query = query.lte('created_at', filters.to);
  }

  if (filters.actorId) {
    query = query.eq('actor_id', filters.actorId);
  }

  if (filters.action) {
    query = query.eq('action', filters.action);
  }

  if (filters.resourceType) {
    query = query.eq('target_type', filters.resourceType);
  }

  if (filters.resourceId) {
    query = query.eq('target_id', filters.resourceId);
  }

  // Apply pagination
  const { data: logs, error: logsError, count } = await query
    .range(offset, offset + limit - 1);

  if (logsError) {
    throw new Error(`خطأ في جلب سجل التدقيق: ${logsError.message}`);
  }

  const logRows = (logs as AuditLogRow[] | null) ?? [];

  // Fetch actor information
  const actorIds = logRows
    .map((log) => log.actor_id)
    .filter((id): id is string => id !== null);

  let actors: ActorRow[] = [];
  let profiles: { user_id: string; full_name: string | null }[] = [];

  if (actorIds.length > 0) {
    const actorsResult = await supabase
      .from('users')
      .select('id, email')
      .in('id', actorIds);
    actors = (actorsResult.data as ActorRow[] | null) ?? [];

    const profilesResult = await supabase
      .from('investor_profiles')
      .select('user_id, full_name')
      .in('user_id', actorIds);
    profiles = (profilesResult.data as { user_id: string; full_name: string | null }[] | null) ?? [];
  }

  const actorsMap = actors;
  const profilesMap = profiles;

  const actorsById = actorsMap.reduce(
    (acc, actor) => {
      acc[actor.id] = actor;
      return acc;
    },
    {} as Record<string, ActorRow>
  );

  const profilesByUserId = profilesMap.reduce(
    (acc, profile) => {
      acc[profile.user_id] = profile.full_name;
      return acc;
    },
    {} as Record<string, string | null>
  );

  // Transform to AdminAuditLogEntry format
  const entries: AdminAuditLogEntry[] = logRows.map((log) => {
    const actor = log.actor_id ? actorsById[log.actor_id] : null;
    const actorName = log.actor_id ? profilesByUserId[log.actor_id] : null;

    return {
      id: log.id,
      action: log.action,
      targetType: log.target_type,
      targetId: log.target_id,
      diff: log.diff as Record<string, unknown> | null,
      actor: {
        id: actor?.id ?? null,
        email: actor?.email ?? null,
        name: actorName ?? null,
      },
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      createdAt: log.created_at,
    };
  });

  const total = count ?? 0;
  const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    logs: entries,
    meta: {
      page,
      limit,
      total,
      pageCount,
    },
  };
}

export function useAdminAuditLogsDirect(filters: AdminAuditLogFilters) {
  const queryKey = [
    'adminAuditLogsDirect',
    filters.page ?? 1,
    filters.from ?? '',
    filters.to ?? '',
    filters.actorId ?? '',
    filters.action ?? '',
    filters.resourceType ?? '',
    filters.resourceId ?? '',
  ] as const;

  return useQuery<AdminAuditLogResponse>({
    queryKey,
    queryFn: () => fetchAdminAuditLogsDirect(filters),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    retry: 1,
    // Removed refetchInterval to prevent automatic page refreshes
    enabled: typeof window !== 'undefined', // Only on client
  });
}

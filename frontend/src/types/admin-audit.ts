export interface AdminAuditLogFilters {
  page?: number;
  from?: string;
  to?: string;
  actorId?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
}

export interface AdminAuditLogActor {
  id: string | null;
  email: string | null;
  name: string | null;
}

export interface AdminAuditLogEntry {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  diff: Record<string, unknown> | null;
  actor: AdminAuditLogActor;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AdminAuditLogMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
}

export interface AdminAuditLogResponse {
  logs: AdminAuditLogEntry[];
  meta: AdminAuditLogMeta;
}


import { requireSupabaseAdmin } from '../lib/supabase';

export interface Role {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  is_system: boolean;
  created_at: string;
}

export interface Permission {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  created_at: string;
}

type UserPermissionRow = {
  role_slug: string;
  permission_slug: string;
  grant_type: 'allow' | 'deny';
};

type UserRoleRow = {
  roles?: Array<{
    slug: string;
  }> | null;
};

type CachedRbacContext = {
  roles: Set<string>;
  permissions: Set<string>;
  expiresAt: number;
};

const RBAC_CACHE_TTL_MS =
  Number.parseInt(process.env.RBAC_CACHE_TTL_MS ?? '300000', 10) || 300000;

const contextCache = new Map<string, CachedRbacContext>();

async function fetchUserRoles(userId: string): Promise<Set<string>> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('user_roles')
    .select(
      `
      roles:role_id (
        slug
      )
    `
    )
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch user roles: ${error.message}`);
  }

  const rows = (data as UserRoleRow[] | null) ?? [];
  const roleSlugs = new Set<string>();
  rows.forEach(row => {
    const slug = row.roles?.[0]?.slug;
    if (slug) {
      roleSlugs.add(slug);
    }
  });

  return roleSlugs;
}

async function fetchUserPermissions(userId: string): Promise<Set<string>> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('v_user_permissions')
    .select('role_slug, permission_slug, grant_type')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to fetch user permissions: ${error.message}`);
  }

  const rows = (data as UserPermissionRow[] | null) ?? [];
  const allowed = new Set<string>();
  const denied = new Set<string>();

  rows.forEach(row => {
    if (!row.permission_slug) {
      return;
    }

    if (row.grant_type === 'deny') {
      denied.add(row.permission_slug);
      return;
    }

    allowed.add(row.permission_slug);
  });

  if (denied.size === 0) {
    return allowed;
  }

  const effective = new Set<string>();
  allowed.forEach(slug => {
    if (!denied.has(slug)) {
      effective.add(slug);
    }
  });

  return effective;
}

async function loadUserContext(userId: string): Promise<CachedRbacContext> {
  const [roles, permissions] = await Promise.all([
    fetchUserRoles(userId),
    fetchUserPermissions(userId),
  ]);

  return {
    roles,
    permissions,
    expiresAt: Date.now() + RBAC_CACHE_TTL_MS,
  };
}

async function getUserContext(
  userId: string
): Promise<{ roles: Set<string>; permissions: Set<string> }> {
  const cached = contextCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      roles: new Set(cached.roles),
      permissions: new Set(cached.permissions),
    };
  }

  const fresh = await loadUserContext(userId);
  contextCache.set(userId, fresh);
  return {
    roles: new Set(fresh.roles),
    permissions: new Set(fresh.permissions),
  };
}

export const rbacService = {
  /**
   * Get user role slugs (cached)
   */
  async getUserRoleSlugs(userId: string): Promise<Set<string>> {
    const context = await getUserContext(userId);
    return context.roles;
  },

  /**
   * Get user permission slugs (cached)
   */
  async getUserPermissionSlugs(userId: string): Promise<Set<string>> {
    const context = await getUserContext(userId);
    return context.permissions;
  },

  /**
   * Check if user has a specific permission slug
   */
  async hasPermission(userId: string, permissionSlug: string): Promise<boolean> {
    const permissions = await this.getUserPermissionSlugs(userId);
    return permissions.has(permissionSlug);
  },

  /**
   * Check if user has at least one of the provided permission slugs
   */
  async hasAnyPermission(
    userId: string,
    permissionSlugs: string[]
  ): Promise<boolean> {
    const permissions = await this.getUserPermissionSlugs(userId);
    return permissionSlugs.some(slug => permissions.has(slug));
  },

  /**
   * Check if user has a specific role slug
   */
  async hasRole(userId: string, roleSlug: string): Promise<boolean> {
    const roles = await this.getUserRoleSlugs(userId);
    return roles.has(roleSlug);
  },

  /**
   * Assign role to user by slug
   */
  async assignRole(
    userId: string,
    roleSlug: string,
    assignedBy?: string
  ): Promise<void> {
    const adminClient = requireSupabaseAdmin();
    const { data: roleData, error: roleError } = await adminClient
      .from('roles')
      .select('id')
      .eq('slug', roleSlug)
      .single();

    if (roleError || !roleData) {
      throw new Error(`Role not found: ${roleSlug}`);
    }

    const { error } = await adminClient.from('user_roles').insert({
      user_id: userId,
      role_id: roleData.id,
      assigned_by: assignedBy ?? null,
    });

    if (error) {
      if (error.code === '23505') {
        // Role already assigned
        return;
      }
      throw new Error(`Failed to assign role: ${error.message}`);
    }

    this.invalidateUser(userId);
  },

  /**
   * Remove role from user by slug
   */
  async removeRole(
    userId: string,
    roleSlug: string
  ): Promise<void> {
    const adminClient = requireSupabaseAdmin();
    const { data: roleData, error: roleError } = await adminClient
      .from('roles')
      .select('id')
      .eq('slug', roleSlug)
      .single();

    if (roleError || !roleData) {
      throw new Error(`Role not found: ${roleSlug}`);
    }

    const { error } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleData.id);

    if (error) {
      throw new Error(`Failed to remove role: ${error.message}`);
    }

    this.invalidateUser(userId);
  },

  /**
   * Manually invalidate cache for a user (e.g., after role updates)
   */
  invalidateUser(userId: string) {
    contextCache.delete(userId);
  },

  /**
   * Clear entire RBAC cache (useful for tests)
   */
  clearCache() {
    contextCache.clear();
  },
};

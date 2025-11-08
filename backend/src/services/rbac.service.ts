import { requireSupabaseAdmin } from '../lib/supabase';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  created_at: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  role: Role;
  created_at: string;
}

type RolesJoinRow = {
  roles?: Role[];
};

type RolePermissionsJoinRow = {
  roles?: Array<{
    role_permissions?: Array<{
      permissions?: Permission[];
    }>;
  }>;
};

export const rbacService = {
  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('user_roles')
      .select(
        `
        role_id,
        roles:role_id (
          id,
          name,
          description,
          created_at
        )
      `
      )
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user roles: ${error.message}`);
    }

    const rows = (data as RolesJoinRow[] | null) ?? [];
    return rows
      .map(row => row.roles?.[0] ?? null)
      .filter((role): role is Role => Boolean(role));
  },

  /**
   * Get user permissions (via roles)
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('user_roles')
      .select(
        `
        role_id,
        roles:role_id (
          role_permissions:role_permissions (
            permissions:permission_id (
              id,
              name,
              resource,
              action,
              created_at
            )
          )
        )
      `
      )
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user permissions: ${error.message}`);
    }

    const permissions: Permission[] = [];
    const rows = (data as RolePermissionsJoinRow[] | null) ?? [];
    rows.forEach(row => {
      const rolePermissions = row.roles?.[0]?.role_permissions ?? [];
      rolePermissions.forEach(rp => {
        (rp.permissions ?? []).forEach(permission => {
          permissions.push(permission);
        });
      });
    });

    // Remove duplicates
    const uniquePermissions = permissions.filter(
      (perm, index, self) => index === self.findIndex(p => p.id === perm.id)
    );

    return uniquePermissions;
  },

  /**
   * Check if user has a specific permission
   */
  async hasPermission(
    userId: string,
    permissionName: string
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.some(perm => perm.name === permissionName);
  },

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(role => role.name === roleName);
  },

  /**
   * Assign role to user
   */
  async assignRole(userId: string, roleName: string): Promise<void> {
    const adminClient = requireSupabaseAdmin();
    // Get role ID
    const { data: roleData, error: roleError } = await adminClient
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      throw new Error(`Role not found: ${roleName}`);
    }

    // Assign role
    const { error } = await adminClient.from('user_roles').insert({
      user_id: userId,
      role_id: roleData.id,
    });

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - role already assigned
        return;
      }
      throw new Error(`Failed to assign role: ${error.message}`);
    }
  },

  /**
   * Remove role from user
   */
  async removeRole(userId: string, roleName: string): Promise<void> {
    const adminClient = requireSupabaseAdmin();
    // Get role ID
    const { data: roleData, error: roleError } = await adminClient
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError || !roleData) {
      throw new Error(`Role not found: ${roleName}`);
    }

    // Remove role
    const { error } = await adminClient
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role_id', roleData.id);

    if (error) {
      throw new Error(`Failed to remove role: ${error.message}`);
    }
  },
};

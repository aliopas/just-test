import { randomBytes } from 'crypto';
import type { User } from '@supabase/supabase-js';
import { requireSupabaseAdmin } from '../lib/supabase';
import { diffObjects } from '../utils/diff.util';
import { DEFAULT_COMMUNICATION_PREFERENCES } from './investor-profile.service';
import { rbacService } from './rbac.service';
import type { AdminUserListQuery } from '../schemas/admin-users.schema';

type UserStatus = 'pending' | 'active' | 'suspended' | 'deactivated';

const DEFAULT_SORT_FIELD = 'created_at';
const DEFAULT_SORT_DIRECTION = 'desc';

const escapeLike = (value: string) => value.replace(/[%_]/g, '\\$&');

const asArray = <T>(value: T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : [];

function generateSecurePassword(): string {
  const base = randomBytes(12).toString('base64url');
  // Ensure presence of uppercase, lowercase, digit
  return `${base}Aa1`;
}

async function fetchUserFromView(userId: string) {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('v_admin_users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    throw new Error(`Failed to load user ${userId}: ${error.message}`);
  }

  return data;
}

type AdminUserRow = {
  id: string;
  email: string;
  phone: string | null;
  phone_cc: string | null;
  role: string | null;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  role_slugs: string[] | null;
  role_names: string[] | null;
  full_name: string | null;
  kyc_status: 'pending' | 'in_review' | 'approved' | 'rejected' | null;
  language: 'ar' | 'en' | null;
  risk_profile: 'conservative' | 'balanced' | 'aggressive' | null;
  city: string | null;
  kyc_updated_at: string | null;
  profile_updated_at: string | null;
  communication_preferences: Record<string, boolean> | null;
  id_type: string | null;
  nationality: string | null;
  residency_country: string | null;
};

function mapAdminUser(row: AdminUserRow) {
  return {
    id: row.id,
    email: row.email,
    phone: row.phone,
    phoneCountryCode: row.phone_cc,
    role: row.role,
    status: row.status as UserStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    roles: asArray<string>(row.role_slugs),
    roleNames: asArray<string>(row.role_names),
    fullName: row.full_name,
    kycStatus: row.kyc_status,
    profileLanguage: row.language,
    riskProfile: row.risk_profile,
    city: row.city,
    kycUpdatedAt: row.kyc_updated_at,
    profileUpdatedAt: row.profile_updated_at,
    idType: row.id_type,
    nationality: row.nationality,
    residencyCountry: row.residency_country,
    communicationPreferences: row.communication_preferences ?? {
      ...DEFAULT_COMMUNICATION_PREFERENCES,
    },
  };
}

async function logAudit(params: {
  actorId: string;
  action: string;
  targetId: string;
  diff: Record<string, { before: unknown; after: unknown }>;
  ipAddress?: string | null;
  userAgent?: string | null;
  targetType?: string;
}) {
  const adminClient = requireSupabaseAdmin();
  const { error } = await adminClient.from('audit_logs').insert({
    actor_id: params.actorId,
    action: params.action,
    target_type: params.targetType ?? 'user',
    target_id: params.targetId,
    diff: params.diff,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  });

  if (error) {
    console.error('Failed to write audit log:', error);
  }
}

export const adminUserService = {
  async listUsers(params: AdminUserListQuery) {
    const adminClient = requireSupabaseAdmin();
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;
    const offset = (page - 1) * limit;

    let query = adminClient
      .from('v_admin_users')
      .select('*', { count: 'exact' })
      .order(params.sortBy ?? DEFAULT_SORT_FIELD, {
        ascending: (params.order ?? DEFAULT_SORT_DIRECTION) === 'asc',
      })
      .range(offset, offset + limit - 1);

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.role) {
      query = query.contains('role_slugs', [params.role]);
    }

    if (params.kycStatus) {
      query = query.eq('kyc_status', params.kycStatus);
    }

    if (params.createdFrom) {
      query = query.gte('created_at', params.createdFrom);
    }

    if (params.createdTo) {
      query = query.lte('created_at', params.createdTo);
    }

    if (params.search) {
      const pattern = `%${escapeLike(params.search.trim())}%`;
      query = query.or(
        `email.ilike.${pattern},phone.ilike.${pattern},full_name.ilike.${pattern}`,
        { foreignTable: undefined }
      );
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Failed to list users: ${error.message}`);
    }

    const users = ((data as AdminUserRow[] | null) ?? []).map(mapAdminUser);
    const total = count ?? 0;
    const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        pageCount,
        hasNext: pageCount > 0 && page < pageCount,
      },
    };
  },

  async updateUserStatus(params: {
    userId: string;
    status: UserStatus;
    actorId: string;
    reason?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const adminClient = requireSupabaseAdmin();

    const { data: before, error: beforeError } = await adminClient
      .from('users')
      .select('id,status')
      .eq('id', params.userId)
      .single();

    if (beforeError || !before) {
      throw new Error(`User ${params.userId} not found`);
    }

    if (before.status === params.status) {
      const current = await fetchUserFromView(params.userId);
      return mapAdminUser(current);
    }

    const { error: updateError } = await adminClient
      .from('users')
      .update({
        status: params.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.userId);

    if (updateError) {
      throw new Error(`Failed to update status: ${updateError.message}`);
    }

    if (params.status !== 'active') {
      try {
        await adminClient.auth.admin.signOut(params.userId);
      } catch (signOutError) {
        console.error('Failed to revoke sessions:', signOutError);
      }
    }

    const diff = diffObjects(
      { status: before.status },
      { status: params.status }
    );

    if (params.reason) {
      diff.reason = { before: null, after: params.reason };
    }

    await logAudit({
      actorId: params.actorId,
      action: 'admin.users.status_change',
      targetId: params.userId,
      diff,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    const current = await fetchUserFromView(params.userId);
    return mapAdminUser(current);
  },

  async resetPassword(params: {
    userId: string;
    actorId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const adminClient = requireSupabaseAdmin();

    const { data: userRecord, error } = await adminClient
      .from('users')
      .select('id,email')
      .eq('id', params.userId)
      .single();

    if (error || !userRecord) {
      throw new Error('User not found');
    }

    const { data: linkData, error: linkError } =
      await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email: userRecord.email,
      });

    if (linkError) {
      throw new Error(`Failed to generate recovery link: ${linkError.message}`);
    }

    const resetLink =
      linkData?.properties?.action_link ??
      linkData?.properties?.redirect_to ??
      null;

    await logAudit({
      actorId: params.actorId,
      action: 'admin.users.reset_password',
      targetId: params.userId,
      diff: {
        resetPassword: {
          before: null,
          after: resetLink ? 'link_generated' : 'triggered',
        },
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    return { email: userRecord.email, resetLink };
  },

  async createUser(params: {
    actorId: string;
    email: string;
    phone?: string | null;
    fullName?: string | null;
    role: string;
    status: UserStatus;
    locale: 'ar' | 'en';
    sendInvite: boolean;
    temporaryPassword?: string;
    investorProfile?: {
      language?: 'ar' | 'en';
      idType?: string;
      idNumber?: string;
      nationality?: string;
      residencyCountry?: string;
      city?: string;
      kycStatus?: 'pending' | 'in_review' | 'approved' | 'rejected';
      riskProfile?: 'conservative' | 'balanced' | 'aggressive' | null;
    };
    ipAddress?: string | null;
    userAgent?: string | null;
  }) {
    const adminClient = requireSupabaseAdmin();
    const shouldSendInvite = params.sendInvite ?? false;

    let createdUser: User | null = null;

    try {
      if (shouldSendInvite) {
        const { data: inviteData, error: inviteError } =
          await adminClient.auth.admin.inviteUserByEmail(params.email, {
            data: {
              locale: params.locale,
              full_name: params.fullName ?? undefined,
            },
          });

        if (inviteError || !inviteData?.user) {
          throw new Error(
            `Failed to invite user: ${inviteError?.message ?? 'Unknown error'}`
          );
        }

        createdUser = inviteData.user;

        const { error: updateError } =
          await adminClient.auth.admin.updateUserById(createdUser.id, {
            phone: params.phone ?? undefined,
            user_metadata: {
              locale: params.locale,
              full_name: params.fullName ?? null,
            },
          });

        if (updateError) {
          throw new Error(
            `Failed to update invited user: ${updateError.message}`
          );
        }
      } else {
        const password = params.temporaryPassword ?? generateSecurePassword();

        const { data: created, error: createError } =
          await adminClient.auth.admin.createUser({
            email: params.email,
            phone: params.phone ?? undefined,
            password,
            email_confirm: true,
            user_metadata: {
              locale: params.locale,
              full_name: params.fullName,
            },
          });

        if (createError || !created?.user) {
          throw new Error(
            `Failed to create auth user: ${createError?.message ?? 'Unknown error'}`
          );
        }

        createdUser = created.user;
      }

      if (!createdUser) {
        throw new Error('Failed to create auth user');
      }

      const { error: insertError } = await adminClient
        .from('users')
        .insert({
          id: createdUser.id,
          email: params.email,
          phone: params.phone ?? null,
          role: params.role,
          status: params.status,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      if (params.role) {
        await rbacService.assignRole(
          createdUser.id,
          params.role.toLowerCase(),
          params.actorId
        );
      }

      if (params.investorProfile || params.fullName) {
        await adminClient
          .from('investor_profiles')
          .upsert({
            user_id: createdUser.id,
            full_name: params.fullName ?? null,
            language: params.investorProfile?.language ?? params.locale ?? 'ar',
            communication_preferences: {
              ...DEFAULT_COMMUNICATION_PREFERENCES,
            },
            id_type: params.investorProfile?.idType ?? null,
            id_number: params.investorProfile?.idNumber ?? null,
            nationality: params.investorProfile?.nationality ?? null,
            residency_country: params.investorProfile?.residencyCountry ?? null,
            city: params.investorProfile?.city ?? null,
            kyc_status: params.investorProfile?.kycStatus ?? 'pending',
            risk_profile: params.investorProfile?.riskProfile ?? null,
          })
          .select()
          .maybeSingle();
      }

      await logAudit({
        actorId: params.actorId,
        action: 'admin.users.create',
        targetId: createdUser.id,
        diff: diffObjects(null, {
          email: params.email,
          phone: params.phone ?? null,
          role: params.role,
          status: params.status,
        }),
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      const current = await fetchUserFromView(createdUser.id);
      return mapAdminUser(current);
    } catch (error) {
      if (createdUser) {
        try {
          await adminClient.auth.admin.deleteUser(createdUser.id);
        } catch (cleanupError) {
          console.error(
            'Failed to clean up auth user after create failure:',
            cleanupError
          );
        }
      }

      throw error;
    }
  },
};

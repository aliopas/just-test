import { requireSupabaseAdmin } from '../lib/supabase';
import type {
  InvestorSignupRequestInput,
  InvestorSignupDecisionInput,
} from '../schemas/account-request.schema';
import { adminUserService } from './admin-user.service';

const TABLE_NAME = 'investor_signup_requests';

type SignupRequestStatus = 'pending' | 'approved' | 'rejected';

type SignupRequestRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  requested_role: string | null;
  status: SignupRequestStatus;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  reviewer_id: string | null;
  reviewed_at: string | null;
  decision_note: string | null;
  approved_user_id: string | null;
};

type ListParams = {
  status?: SignupRequestStatus;
  search?: string;
  page?: number;
  limit?: number;
};

type ApproveParams = {
  requestId: string;
  actorId: string;
  decision: InvestorSignupDecisionInput;
};

type RejectParams = {
  requestId: string;
  actorId: string;
  note?: string;
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Mark a signup request as read by an admin user
 */
async function markSignupRequestAsRead(params: {
  signupRequestId: string;
  adminId: string;
}): Promise<{ viewedAt: string }> {
  const adminClient = requireSupabaseAdmin();

  const { data, error } = await adminClient
    .from('admin_signup_request_views')
    .upsert(
      {
        signup_request_id: params.signupRequestId,
        admin_id: params.adminId,
        viewed_at: new Date().toISOString(),
      },
      {
        onConflict: 'signup_request_id,admin_id',
      }
    )
    .select('viewed_at')
    .single();

  if (error) {
    throw new Error(`Failed to mark signup request as read: ${error.message}`);
  }

  return {
    viewedAt: data.viewed_at as string,
  };
}

/**
 * Get count of unread signup requests for an admin
 */
async function getUnreadSignupRequestCount(adminId: string): Promise<number> {
  const adminClient = requireSupabaseAdmin();

  // Get all pending signup requests
  const { data: allPending, error: pendingError } = await adminClient
    .from('investor_signup_requests')
    .select('id')
    .eq('status', 'pending');

  if (pendingError || !allPending) {
    return 0;
  }

  if (allPending.length === 0) {
    return 0;
  }

  // Get read signup requests by this admin
  const { data: readRequests, error: readError } = await adminClient
    .from('admin_signup_request_views')
    .select('signup_request_id')
    .eq('admin_id', adminId)
    .in(
      'signup_request_id',
      allPending.map(r => r.id)
    );

  if (readError) {
    return 0;
  }

  const readIds = new Set(
    (readRequests ?? []).map(r => r.signup_request_id as string)
  );
  return allPending.filter(r => !readIds.has(r.id)).length;
}

export const investorSignupRequestService = {
  getUnreadCount: getUnreadSignupRequestCount,
  markAsRead: markSignupRequestAsRead,
  async createRequest(
    input: InvestorSignupRequestInput
  ): Promise<SignupRequestRow> {
    try {
      console.log('[InvestorSignupRequestService] Creating request for:', {
        email: input.email,
        fullName: input.fullName,
      });

      const adminClient = requireSupabaseAdmin();
      const email = normaliseEmail(input.email);

      // Check if user already exists
      const { data: existingUser, error: userCheckError } = await adminClient
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userCheckError) {
        console.error('[InvestorSignupRequestService] Error checking existing user:', userCheckError);
        throw new Error(`Database error while checking user: ${userCheckError.message}`);
      }

      if (existingUser) {
        const error = new Error('USER_ALREADY_EXISTS');
        (error as Error & { status?: number }).status = 409;
        throw error;
      }

      // Check if pending request already exists
      const { data: existingPending, error: pendingCheckError } = await adminClient
        .from(TABLE_NAME)
        .select('id, status, created_at')
        .eq('email', email)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingCheckError) {
        console.error('[InvestorSignupRequestService] Error checking pending request:', pendingCheckError);
        throw new Error(`Database error while checking pending request: ${pendingCheckError.message}`);
      }

      if (existingPending) {
        const error = new Error('REQUEST_ALREADY_PENDING');
        (error as Error & { status?: number }).status = 409;
        throw error;
      }

      // Create new signup request
      const insertPayload = {
        email,
        full_name: input.fullName,
        phone: input.phone ?? null,
        company: input.company ?? null,
        message: input.message ?? null,
        requested_role: 'investor',
        status: 'pending' as const,
        payload: {
          language: input.language ?? 'ar',
        },
      };

      console.log('[InvestorSignupRequestService] Inserting request:', {
        email,
        fullName: input.fullName,
        hasPhone: !!input.phone,
        hasCompany: !!input.company,
        hasMessage: !!input.message,
      });

      const { data, error } = await adminClient
        .from(TABLE_NAME)
        .insert(insertPayload)
        .select('*')
        .single<SignupRequestRow>();

      if (error) {
        console.error('[InvestorSignupRequestService] Insert error:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(
          `Failed to create signup request: ${error.message}${error.code ? ` (code: ${error.code})` : ''}`
        );
      }

      if (!data) {
        console.error('[InvestorSignupRequestService] Insert succeeded but no data returned');
        throw new Error('Failed to create signup request: No data returned from database');
      }

      console.log('[InvestorSignupRequestService] Request created successfully:', {
        id: data.id,
        status: data.status,
      });

      return data;
    } catch (error) {
      // Re-throw known errors (USER_ALREADY_EXISTS, REQUEST_ALREADY_PENDING)
      if (error instanceof Error && 
          (error.message === 'USER_ALREADY_EXISTS' || error.message === 'REQUEST_ALREADY_PENDING')) {
        throw error;
      }
      
      // Wrap unknown errors with more context
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[InvestorSignupRequestService] Unexpected error:', {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      
      throw new Error(`Failed to create signup request: ${errorMessage}`);
    }
  },

  async listRequests(params: ListParams & { actorId?: string }) {
    const adminClient = requireSupabaseAdmin();

    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(
      Math.max(1, params.limit ?? DEFAULT_LIMIT),
      MAX_LIMIT
    );
    const offset = (page - 1) * limit;

    let query = adminClient
      .from(TABLE_NAME)
      .select(
        `
          id,
          email,
          full_name,
          phone,
          company,
          message,
          requested_role,
          status,
          payload,
          created_at,
          updated_at,
          reviewer_id,
          reviewed_at,
          decision_note,
          approved_user_id
        `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params.status) {
      query = query.eq('status', params.status);
    }

    if (params.search) {
      const pattern = `%${params.search.trim().toLowerCase()}%`;
      query = query.or(
        `email.ilike.${pattern},full_name.ilike.${pattern},company.ilike.${pattern}`
      );
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Failed to list signup requests: ${error.message}`);
    }

    const rows = (data as SignupRequestRow[] | null) ?? [];

    // Get read status for all requests by this admin
    let readStatusMap: Record<string, boolean> = {};
    if (params.actorId && rows.length > 0) {
      const requestIds = rows.map(row => row.id);
      const { data: readViews, error: readError } = await adminClient
        .from('admin_signup_request_views')
        .select('signup_request_id')
        .eq('admin_id', params.actorId)
        .in('signup_request_id', requestIds);

      if (!readError && readViews) {
        readStatusMap = readViews.reduce(
          (acc, view) => {
            acc[view.signup_request_id as string] = true;
            return acc;
          },
          {} as Record<string, boolean>
        );
      }
    }

    const requests = rows.map(row => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      phone: row.phone,
      company: row.company,
      message: row.message,
      requestedRole: row.requested_role ?? 'investor',
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reviewerId: row.reviewer_id,
      reviewedAt: row.reviewed_at,
      decisionNote: row.decision_note,
      approvedUserId: row.approved_user_id,
      payload: row.payload ?? {},
      isRead: readStatusMap[row.id] ?? false,
    }));

    const total = count ?? 0;
    const pageCount = total === 0 ? 0 : Math.ceil(total / limit);

    return {
      requests,
      meta: {
        page,
        limit,
        total,
        pageCount,
        hasNext: page < pageCount,
      },
    };
  },

  async approveRequest(params: ApproveParams) {
    const adminClient = requireSupabaseAdmin();

    const { data: requestRow, error: fetchError } = await adminClient
      .from(TABLE_NAME)
      .select('*')
      .eq('id', params.requestId)
      .single<SignupRequestRow>();

    if (fetchError || !requestRow) {
      const error = new Error('REQUEST_NOT_FOUND');
      (error as Error & { status?: number }).status = 404;
      throw error;
    }

    if (requestRow.status !== 'pending') {
      const error = new Error('REQUEST_ALREADY_REVIEWED');
      (error as Error & { status?: number }).status = 409;
      throw error;
    }

    const decision = params.decision ?? {
      note: undefined,
      sendInvite: true,
      locale: 'ar',
    };

    const createdUser = await adminUserService.createUser({
      actorId: params.actorId,
      email: requestRow.email,
      phone: requestRow.phone,
      fullName: requestRow.full_name ?? undefined,
      role: (requestRow.requested_role ?? 'investor').toLowerCase(),
      status: 'active',
      locale: decision.locale ?? 'ar',
      sendInvite: decision.sendInvite ?? true,
    });

    const { data: updated, error: updateError } = await adminClient
      .from(TABLE_NAME)
      .update({
        status: 'approved',
        reviewer_id: params.actorId,
        reviewed_at: new Date().toISOString(),
        decision_note: decision.note ?? null,
        approved_user_id: createdUser.id,
      })
      .eq('id', params.requestId)
      .eq('status', 'pending')
      .select('*')
      .single<SignupRequestRow>();

    if (updateError || !updated) {
      throw new Error(
        `Failed to update signup request: ${updateError?.message ?? 'unknown'}`
      );
    }

    return {
      request: updated,
      user: createdUser,
    };
  },

  async rejectRequest(params: RejectParams) {
    const adminClient = requireSupabaseAdmin();

    const { data: updated, error: updateError } = await adminClient
      .from(TABLE_NAME)
      .update({
        status: 'rejected',
        reviewer_id: params.actorId,
        reviewed_at: new Date().toISOString(),
        decision_note: params.note ?? null,
      })
      .eq('id', params.requestId)
      .eq('status', 'pending')
      .select('*')
      .single<SignupRequestRow>();

    if (updateError) {
      throw new Error(
        `Failed to reject signup request: ${updateError.message}`
      );
    }

    if (!updated) {
      const error = new Error('REQUEST_NOT_FOUND');
      (error as Error & { status?: number }).status = 404;
      throw error;
    }

    return updated;
  },
};

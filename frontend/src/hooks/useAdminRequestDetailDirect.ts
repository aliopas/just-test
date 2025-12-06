/**
 * Hook لجلب تفاصيل طلب للإدارة مباشرة من Supabase
 * بديل لـ useAdminRequestDetail الذي يستخدم API backend
 */

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { AdminRequestDetail } from '../types/admin';
import type { RequestStatus, RequestType, RequestCurrency } from '../types/request';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RequestRow = {
  id: string;
  request_number: string;
  status: string;
  type: string;
  amount: number | string | null;
  currency: string | null;
  target_price: number | string | null;
  expiry_at: string | null;
  metadata: unknown;
  notes: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  settlement_started_at: string | null;
  settlement_completed_at: string | null;
  settlement_reference: string | null;
  settlement_notes: string | null;
};

type AttachmentRow = {
  id: string;
  request_id: string;
  filename: string;
  mime_type: string | null;
  size: number | null;
  storage_key: string;
  category: string | null;
  metadata: unknown;
  created_at: string;
};

type EventRow = {
  id: string;
  request_id: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  note: string | null;
  created_at: string;
};

type CommentRow = {
  id: string;
  request_id: string;
  actor_id: string;
  comment: string;
  created_at: string;
};

type UserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  phone_cc: string | null;
  status: string | null;
  created_at: string | null;
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  preferred_name: string | null;
  language: string | null;
  id_type: string | null;
  id_number: string | null;
  id_expiry: string | null;
  nationality: string | null;
  residency_country: string | null;
  city: string | null;
  kyc_status: string | null;
  kyc_updated_at: string | null;
  risk_profile: string | null;
  communication_preferences: unknown;
  kyc_documents: unknown;
  created_at: string | null;
  updated_at: string | null;
};

type AdminRequestViewRow = {
  request_id: string;
  admin_id: string;
  viewed_at: string;
};

function toRequestStatus(value: string): RequestStatus {
  const validStatuses: RequestStatus[] = [
    'draft',
    'submitted',
    'screening',
    'pending_info',
    'compliance_review',
    'approved',
    'rejected',
    'settling',
    'completed',
  ];
  return validStatuses.includes(value as RequestStatus) ? (value as RequestStatus) : 'draft';
}

function toRequestType(value: string): RequestType {
  const validTypes: RequestType[] = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'];
  return validTypes.includes(value as RequestType) ? (value as RequestType) : 'buy';
}

function toRequestCurrency(value: string | null): RequestCurrency | null {
  if (!value) return null;
  const validCurrencies: RequestCurrency[] = ['SAR', 'USD', 'EUR'];
  return validCurrencies.includes(value as RequestCurrency) ? (value as RequestCurrency) : null;
}

async function fetchAdminRequestDetailDirect(requestId: string): Promise<AdminRequestDetail> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current admin user
  const { data: authData } = await supabase.auth.getUser();
  const adminId = authData.user?.id;

  // Fetch request
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .select('*')
    .eq('id', requestId)
    .single<RequestRow>();

  if (requestError) {
    throw new Error(`خطأ في جلب الطلب: ${requestError.message}`);
  }

  if (!request) {
    throw new Error('الطلب غير موجود');
  }

  // Step 1: جلب بيانات المستخدم أولاً (قبل باقي البيانات)
  // Use RPC function to get user data with fallback to auth.users
  console.log('[useAdminRequestDetailDirect] Step 1: Fetching user data for user_id:', request.user_id);
  
  // First try direct query to users table
  const userResult = await supabase
    .from('users')
    .select('id, email, phone, phone_cc, status, created_at')
    .eq('id', request.user_id)
    .maybeSingle<UserRow>();

  let user: UserRow | null = userResult.data;

  // If not found in users table, try RPC function to get from auth.users
  if (!user && request.user_id) {
    console.log('[useAdminRequestDetailDirect] User not found in users table, trying RPC function');
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_user_with_auth_fallback', { p_user_id: request.user_id });
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        user = rpcData[0] as UserRow;
        console.log('[useAdminRequestDetailDirect] Got user from RPC function:', user);
      } else {
        console.warn('[useAdminRequestDetailDirect] RPC function also returned no data:', rpcError);
      }
    } catch (error) {
      console.warn('[useAdminRequestDetailDirect] RPC function error (may not exist yet):', error);
    }
  }

  console.log('[useAdminRequestDetailDirect] Step 1 Result:', {
    hasUser: !!user,
    userEmail: user?.email,
    userPhone: user?.phone,
    userPhoneCc: user?.phone_cc,
    userError: userResult.error,
  });

  // Step 2: جلب الملف الشخصي
  console.log('[useAdminRequestDetailDirect] Step 2: Fetching profile data for user_id:', request.user_id);
  
  const profileResult = await supabase
    .from('investor_profiles')
    .select('*')
    .eq('user_id', request.user_id)
    .maybeSingle<ProfileRow>();

  console.log('[useAdminRequestDetailDirect] Step 2 Result:', {
    hasProfile: !!profileResult.data,
    profileFullName: profileResult.data?.full_name,
    profileError: profileResult.error,
  });

  // Step 3: جلب باقي البيانات (attachments, events, comments, view)
  const [attachmentsResult, eventsResult, commentsResult, viewResult] =
    await Promise.all([
      supabase
        .from('attachments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false }),
      supabase
        .from('request_events')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false }),
      supabase
        .from('request_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false }),
      adminId
        ? supabase
            .from('admin_request_views')
            .select('viewed_at')
            .eq('request_id', requestId)
            .eq('admin_id', adminId)
            .maybeSingle<AdminRequestViewRow>()
        : Promise.resolve({ data: null }),
    ]);

  const attachments = (attachmentsResult.data as AttachmentRow[] | null) ?? [];
  const events = (eventsResult.data as EventRow[] | null) ?? [];
  const comments = (commentsResult.data as CommentRow[] | null) ?? [];
  // user is already set above (with fallback via RPC if needed)
  const profile = profileResult.data;
  const view = viewResult.data;

  // Log for debugging
  console.log('[useAdminRequestDetailDirect] Fetched data:', {
    requestId,
    requestUserId: request.user_id,
    hasUser: !!user,
    hasProfile: !!profile,
    userEmail: user?.email,
    userPhone: user?.phone,
    userPhoneCc: user?.phone_cc,
    profileFullName: profile?.full_name,
    profilePreferredName: profile?.preferred_name,
    profileResidencyCountry: profile?.residency_country,
    userError: userResult.error,
    profileError: profileResult.error,
    userResultData: userResult.data,
    profileResultData: profileResult.data,
  });

  // Log errors if any
  if (userResult.error) {
    console.error('[useAdminRequestDetailDirect] User fetch error:', userResult.error);
  }
  if (profileResult.error) {
    console.error('[useAdminRequestDetailDirect] Profile fetch error:', profileResult.error);
  }

  // Fetch comment actors
  const commentActorIds = [...new Set(comments.map((c) => c.actor_id))];
  let commentActors: UserRow[] = [];
  let commentProfiles: ProfileRow[] = [];

  if (commentActorIds.length > 0) {
    const [actorsResult, profilesResult] = await Promise.all([
      supabase
        .from('users')
        .select('id, email')
        .in('id', commentActorIds),
      supabase
        .from('investor_profiles')
        .select('user_id, full_name, preferred_name, language')
        .in('user_id', commentActorIds),
    ]);

    commentActors = (actorsResult.data as UserRow[] | null) ?? [];
    commentProfiles = (profilesResult.data as ProfileRow[] | null) ?? [];
  }

  const actorsById = commentActors;
  const profilesByUserId = commentProfiles;

  const actorsMap = actorsById.reduce(
    (acc, actor) => {
      acc[actor.id] = actor;
      return acc;
    },
    {} as Record<string, UserRow>
  );

  const profilesMap = profilesByUserId.reduce(
    (acc, profile) => {
      acc[profile.user_id] = profile;
      return acc;
    },
    {} as Record<string, ProfileRow>
  );

  // Transform to AdminRequestDetail format
  return {
    request: {
      id: request.id,
      requestNumber: request.request_number,
      status: toRequestStatus(request.status),
      type: toRequestType(request.type),
      amount: typeof request.amount === 'string' ? Number(request.amount) : request.amount,
      currency: toRequestCurrency(request.currency),
      targetPrice:
        typeof request.target_price === 'string'
          ? Number.parseFloat(request.target_price)
          : request.target_price,
      expiryAt: request.expiry_at,
      metadata: (request.metadata as Record<string, unknown>) ?? null,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      isRead: view !== null,
      userId: request.user_id,
      notes: request.notes,
      settlement: {
        startedAt: request.settlement_started_at,
        completedAt: request.settlement_completed_at,
        reference: request.settlement_reference,
        notes: request.settlement_notes,
      },
      investor: {
        id: user?.id ?? null,
        email: user?.email ?? null,
        phone: user?.phone ?? null,
        phoneCc: user?.phone_cc ?? null,
        fullName: profile?.full_name ?? null,
        preferredName: profile?.preferred_name ?? null,
        language: (profile?.language as 'ar' | 'en') ?? null,
        idType: profile?.id_type ?? null,
        idNumber: profile?.id_number ?? null,
        idExpiry: profile?.id_expiry ?? null,
        nationality: profile?.nationality ?? null,
        residencyCountry: profile?.residency_country ?? null,
        city: profile?.city ?? null,
        kycStatus: profile?.kyc_status ?? null,
        kycUpdatedAt: profile?.kyc_updated_at ?? null,
        riskProfile: profile?.risk_profile ?? null,
        communicationPreferences: (profile?.communication_preferences as Record<string, boolean>) ?? null,
        kycDocuments: profile?.kyc_documents ?? null,
        profileCreatedAt: profile?.created_at ?? null,
        profileUpdatedAt: profile?.updated_at ?? null,
        userStatus: user?.status ?? null,
        userCreatedAt: user?.created_at ?? null,
      },
    },
    attachments: attachments.map((att) => ({
      id: att.id,
      filename: att.filename,
      mimeType: att.mime_type,
      size: att.size,
      storageKey: att.storage_key,
      createdAt: att.created_at,
      category: att.category ?? 'general',
      metadata: (att.metadata as Record<string, unknown>) ?? {},
      downloadUrl: null, // Will be generated on demand
    })),
    events: events.map((evt) => ({
      id: evt.id,
      fromStatus: evt.from_status,
      toStatus: evt.to_status,
      actorId: evt.actor_id,
      note: evt.note,
      createdAt: evt.created_at,
    })),
    comments: comments.map((comm) => {
      const actor = actorsMap[comm.actor_id];
      const actorProfile = profilesMap[comm.actor_id];
      return {
        id: comm.id,
        note: comm.comment,
        createdAt: comm.created_at,
        actor: actor
          ? {
              id: actor.id,
              email: actor.email,
              fullName: actorProfile?.full_name ?? null,
              preferredName: actorProfile?.preferred_name ?? null,
              language: (actorProfile?.language as 'ar' | 'en') ?? null,
            }
          : null,
      };
    }),
  };
}

export function useAdminRequestDetailDirect(requestId?: string | null) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  const query = useQuery({
    queryKey: ['adminRequestDetailDirect', requestId],
    queryFn: () => {
      if (!requestId) {
        throw new Error('requestId is required');
      }
      return fetchAdminRequestDetailDirect(requestId);
    },
    enabled: Boolean(requestId),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!requestId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    // Create a channel for this request
    const channel = supabase
      .channel(`admin-request-direct-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `id=eq.${requestId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['adminRequestDetailDirect', requestId],
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_events',
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['adminRequestDetailDirect', requestId],
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'request_comments',
          filter: `request_id=eq.${requestId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['adminRequestDetailDirect', requestId],
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [requestId, queryClient]);

  return query;
}

import type { PostgrestError } from '@supabase/supabase-js';
import { requireSupabaseAdmin } from '../lib/supabase';
import type { DiffResult } from '../utils/diff.util';

export type InvestorProfileRecord = {
  user_id: string;
  full_name: string | null;
  preferred_name: string | null;
  id_type: string | null;
  id_number: string | null;
  id_expiry: string | null;
  nationality: string | null;
  residency_country: string | null;
  city: string | null;
  kyc_status: string;
  kyc_updated_at: string | null;
  language: string;
  communication_preferences: Record<string, boolean> | null;
  risk_profile: string | null;
  kyc_documents: unknown;
  created_at: string;
  updated_at: string;
};

export type InvestorProfileView = InvestorProfileRecord & {
  email: string | null;
  phone: string | null;
  user_status: string | null;
  user_created_at: string | null;
};

type UpsertPayload = Partial<
  Omit<
    InvestorProfileRecord,
    'user_id' | 'created_at' | 'updated_at' | 'communication_preferences'
  >
> & {
  communication_preferences?: Record<string, boolean> | null;
};

export type InvestorProfileUpsertPayload = UpsertPayload & {
  user_id: string;
};

type CommunicationPreferenceKey = 'email' | 'sms' | 'push';

export const DEFAULT_COMMUNICATION_PREFERENCES: Record<
  CommunicationPreferenceKey,
  boolean
> = {
  email: true,
  sms: false,
  push: true,
};

const PROFILE_CACHE_TTL_MS =
  Number.parseInt(process.env.INVESTOR_PROFILE_CACHE_MS ?? '60000', 10) ||
  60000;

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const profileViewCache = new Map<
  string,
  CacheEntry<InvestorProfileView | null>
>();
const profileRecordCache = new Map<
  string,
  CacheEntry<InvestorProfileRecord | null>
>();

type CacheRead<T> =
  | {
      hit: true;
      value: T;
    }
  | { hit: false };

function readCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): CacheRead<T> {
  const entry = cache.get(key);
  if (!entry) {
    return { hit: false };
  }
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return { hit: false };
  }
  return { hit: true, value: entry.value };
}

function writeCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T
): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + PROFILE_CACHE_TTL_MS,
  });
}

function isNotFound(error: PostgrestError | null): boolean {
  return Boolean(error && error.code === 'PGRST116');
}

function normalizeCommunicationPreferences(
  value: Record<string, boolean> | null | undefined
): Record<CommunicationPreferenceKey, boolean> {
  const base: Record<CommunicationPreferenceKey, boolean> = {
    ...DEFAULT_COMMUNICATION_PREFERENCES,
  };

  if (value) {
    Object.entries(value).forEach(([key, preferenceValue]) => {
      if (key === 'email' || key === 'sms' || key === 'push') {
        base[key] = Boolean(preferenceValue);
      }
    });
  }

  return base;
}

export const investorProfileService = {
  async getProfile(userId: string): Promise<InvestorProfileView | null> {
    const cached = readCache(profileViewCache, userId);
    if (cached.hit) {
      return cached.value;
    }

    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('v_investor_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && !isNotFound(error)) {
      throw new Error(`Failed to fetch investor profile: ${error.message}`);
    }

    if (!data) {
      writeCache(profileViewCache, userId, null);
      return null;
    }

    const view = {
      ...(data as InvestorProfileView),
      communication_preferences: normalizeCommunicationPreferences(
        (data as InvestorProfileView).communication_preferences
      ),
    };
    writeCache(profileViewCache, userId, view);
    return view;
  },

  async getProfileRecord(
    userId: string
  ): Promise<InvestorProfileRecord | null> {
    const cached = readCache(profileRecordCache, userId);
    if (cached.hit) {
      return cached.value;
    }

    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('investor_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && !isNotFound(error)) {
      throw new Error(
        `Failed to fetch investor profile record: ${error.message}`
      );
    }

    if (!data) {
      writeCache(profileRecordCache, userId, null);
      return null;
    }

    const record = {
      ...(data as InvestorProfileRecord),
      communication_preferences: normalizeCommunicationPreferences(
        (data as InvestorProfileRecord).communication_preferences
      ),
    };
    writeCache(profileRecordCache, userId, record);
    return record;
  },

  async upsertProfile(
    payload: InvestorProfileUpsertPayload
  ): Promise<{ record: InvestorProfileRecord; view: InvestorProfileView }> {
    const adminClient = requireSupabaseAdmin();

    const { data: upserted, error: upsertError } = await adminClient
      .from('investor_profiles')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertError || !upserted) {
      throw new Error(
        `Failed to upsert investor profile: ${upsertError?.message ?? 'Unknown error'}`
      );
    }

    const record = {
      ...(upserted as InvestorProfileRecord),
      communication_preferences: normalizeCommunicationPreferences(
        (upserted as InvestorProfileRecord).communication_preferences
      ),
    };

    const { data: viewData, error: viewError } = await adminClient
      .from('v_investor_profiles')
      .select('*')
      .eq('user_id', payload.user_id)
      .single();

    if (viewError || !viewData) {
      throw new Error(
        `Failed to refresh investor profile view: ${viewError?.message ?? 'Unknown error'}`
      );
    }

    const view = {
      ...(viewData as InvestorProfileView),
      communication_preferences: normalizeCommunicationPreferences(
        (viewData as InvestorProfileView).communication_preferences
      ),
    };

    writeCache(profileRecordCache, payload.user_id, record);
    writeCache(profileViewCache, payload.user_id, view);

    return { record, view };
  },

  async logAudit(params: {
    actorId: string;
    targetId: string;
    diff: DiffResult;
    action?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<void> {
    if (!params.diff || Object.keys(params.diff).length === 0) {
      return;
    }

    const adminClient = requireSupabaseAdmin();
    const { error } = await adminClient.from('audit_logs').insert({
      actor_id: params.actorId,
      action: params.action ?? 'investor_profile.update',
      target_type: 'investor_profile',
      target_id: params.targetId,
      diff: params.diff,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
    });

    if (error) {
      throw new Error(`Failed to write audit log: ${error.message}`);
    }
  },
};

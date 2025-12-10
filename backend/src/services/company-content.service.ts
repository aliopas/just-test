import { requireSupabaseAdmin } from '../lib/supabase';
import type {
  CompanyProfileCreateInput,
  CompanyProfileUpdateInput,
  CompanyPartnersCreateInput,
  CompanyPartnersUpdateInput,
  CompanyClientsCreateInput,
  CompanyClientsUpdateInput,
  CompanyResourcesCreateInput,
  CompanyResourcesUpdateInput,
  CompanyStrengthsCreateInput,
  CompanyStrengthsUpdateInput,
  PartnershipInfoCreateInput,
  PartnershipInfoUpdateInput,
  MarketValueCreateInput,
  MarketValueUpdateInput,
  CompanyGoalsCreateInput,
  CompanyGoalsUpdateInput,
} from '../schemas/company-content.schema';

// ============================================================================
// Type definitions
// ============================================================================

export type CompanyProfile = {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  iconKey: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CompanyPartner = {
  id: string;
  nameAr: string;
  nameEn: string;
  logoKey: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  websiteUrl: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CompanyClient = {
  id: string;
  nameAr: string;
  nameEn: string;
  logoKey: string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CompanyResource = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  iconKey: string | null;
  value: number | null;
  currency: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CompanyStrength = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  iconKey: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PartnershipInfo = {
  id: string;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  stepsAr: string[] | null;
  stepsEn: string[] | null;
  iconKey: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type MarketValue = {
  id: string;
  value: number;
  currency: string;
  valuationDate: string;
  source: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CompanyGoal = {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  targetDate: string | null;
  iconKey: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

// ============================================================================
// Row type definitions (for Supabase responses)
// ============================================================================

type CompanyProfileRow = {
  id: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  icon_key: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CompanyPartnerRow = {
  id: string;
  name_ar: string;
  name_en: string;
  logo_key: string | null;
  description_ar: string | null;
  description_en: string | null;
  website_url: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type CompanyClientRow = {
  id: string;
  name_ar: string;
  name_en: string;
  logo_key: string | null;
  description_ar: string | null;
  description_en: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type CompanyResourceRow = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  icon_key: string | null;
  value: number | string | null;
  currency: string;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type CompanyStrengthRow = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  icon_key: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type PartnershipInfoRow = {
  id: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  steps_ar: unknown;
  steps_en: unknown;
  icon_key: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

type MarketValueRow = {
  id: string;
  value: number | string;
  currency: string;
  valuation_date: string;
  source: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type CompanyGoalRow = {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  target_date: string | null;
  icon_key: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// Mapping functions
// ============================================================================

function mapCompanyProfile(row: CompanyProfileRow): CompanyProfile {
  return {
    id: row.id,
    titleAr: row.title_ar,
    titleEn: row.title_en,
    contentAr: row.content_ar,
    contentEn: row.content_en,
    iconKey: row.icon_key,
    displayOrder: row.display_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompanyPartner(row: CompanyPartnerRow): CompanyPartner {
  return {
    id: row.id,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    logoKey: row.logo_key,
    descriptionAr: row.description_ar,
    descriptionEn: row.description_en,
    websiteUrl: row.website_url,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompanyClient(row: CompanyClientRow): CompanyClient {
  return {
    id: row.id,
    nameAr: row.name_ar,
    nameEn: row.name_en,
    logoKey: row.logo_key,
    descriptionAr: row.description_ar,
    descriptionEn: row.description_en,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompanyResource(row: CompanyResourceRow): CompanyResource {
  return {
    id: row.id,
    titleAr: row.title_ar,
    titleEn: row.title_en,
    descriptionAr: row.description_ar,
    descriptionEn: row.description_en,
    iconKey: row.icon_key,
    value:
      typeof row.value === 'string' ? Number.parseFloat(row.value) : row.value,
    currency: row.currency,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompanyStrength(row: CompanyStrengthRow): CompanyStrength {
  return {
    id: row.id,
    titleAr: row.title_ar,
    titleEn: row.title_en,
    descriptionAr: row.description_ar,
    descriptionEn: row.description_en,
    iconKey: row.icon_key,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPartnershipInfo(row: PartnershipInfoRow): PartnershipInfo {
  return {
    id: row.id,
    titleAr: row.title_ar,
    titleEn: row.title_en,
    contentAr: row.content_ar,
    contentEn: row.content_en,
    stepsAr: Array.isArray(row.steps_ar) ? row.steps_ar : null,
    stepsEn: Array.isArray(row.steps_en) ? row.steps_en : null,
    iconKey: row.icon_key,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMarketValue(row: MarketValueRow): MarketValue {
  return {
    id: row.id,
    value:
      typeof row.value === 'string' ? Number.parseFloat(row.value) : row.value,
    currency: row.currency,
    valuationDate: row.valuation_date,
    source: row.source,
    isVerified: row.is_verified,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCompanyGoal(row: CompanyGoalRow): CompanyGoal {
  return {
    id: row.id,
    titleAr: row.title_ar,
    titleEn: row.title_en,
    descriptionAr: row.description_ar,
    descriptionEn: row.description_en,
    targetDate: row.target_date,
    iconKey: row.icon_key,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================================================
// Company Profile Service
// ============================================================================

export async function listCompanyProfiles(
  includeInactive = false
): Promise<CompanyProfile[]> {
  try {
    const adminClient = requireSupabaseAdmin();
    let query = adminClient
      .from('company_profile')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Company Content Service] Failed to list company profiles:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to list company profiles: ${error.message} (code: ${error.code || 'unknown'})`);
    }

    console.log(`[Company Content Service] Retrieved ${data?.length || 0} company profiles (includeInactive: ${includeInactive})`);
    return (data ?? []).map(mapCompanyProfile);
  } catch (error) {
    // Re-throw with more context if it's a Supabase admin client error
    if (error instanceof Error && error.message.includes('service role key')) {
      console.error('[Company Content Service] Supabase Admin Client Error:', error.message);
      throw new Error('Database access error: Service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in Netlify Dashboard.');
    }
    throw error;
  }
}

export async function getCompanyProfileById(
  id: string
): Promise<CompanyProfile | null> {
  try {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid profile ID: ID is required and must be a non-empty string');
    }

    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('company_profile')
      .select('*')
      .eq('id', id.trim())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      
      // Log detailed error information for debugging
      console.error('[Company Content Service] Failed to get company profile:', {
        id,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
      });
      
      throw new Error(`Failed to get company profile: ${error.message} (code: ${error.code || 'unknown'})`);
    }

    return data ? mapCompanyProfile(data) : null;
  } catch (error) {
    // Re-throw with more context if it's a Supabase admin client error
    if (error instanceof Error && error.message.includes('service role key')) {
      console.error('[Company Content Service] Supabase Admin Client Error:', error.message);
      throw new Error('Database access error: Service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.');
    }
    throw error;
  }
}

export async function createCompanyProfile(
  input: CompanyProfileCreateInput
): Promise<CompanyProfile> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_profile')
    .insert({
      title_ar: input.titleAr,
      title_en: input.titleEn,
      content_ar: input.contentAr,
      content_en: input.contentEn,
      icon_key: input.iconKey ?? null,
      display_order: input.displayOrder,
      is_active: input.isActive,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create company profile: no data returned');
  }

  return mapCompanyProfile(data);
}

export async function updateCompanyProfile(
  id: string,
  input: CompanyProfileUpdateInput
): Promise<CompanyProfile> {
  try {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.titleAr !== undefined) updateData.title_ar = input.titleAr;
  if (input.titleEn !== undefined) updateData.title_en = input.titleEn;
  if (input.contentAr !== undefined) updateData.content_ar = input.contentAr;
  if (input.contentEn !== undefined) updateData.content_en = input.contentEn;
  if (input.iconKey !== undefined) updateData.icon_key = input.iconKey;
  if (input.displayOrder !== undefined)
    updateData.display_order = input.displayOrder;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  const { data, error } = await adminClient
    .from('company_profile')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_PROFILE_NOT_FOUND');
    }
      // Handle connection errors
      if (error.message?.toLowerCase().includes('connection') || 
          error.message?.toLowerCase().includes('network') ||
          error.message?.toLowerCase().includes('fetch')) {
        throw new Error(`Database connection error: ${error.message}`);
      }
    throw new Error(`Failed to update company profile: ${error.message}`);
  }

  if (!data) {
      throw new Error('COMPANY_PROFILE_NOT_FOUND');
  }

  return mapCompanyProfile(data);
  } catch (error) {
    // Re-throw known errors as-is
    if (error instanceof Error && error.message === 'COMPANY_PROFILE_NOT_FOUND') {
      throw error;
    }
    // Wrap other errors to ensure they're Error instances
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update company profile: ${String(error)}`);
  }
}

export async function deleteCompanyProfile(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_profile')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_PROFILE_NOT_FOUND');
    }
    throw new Error(`Failed to delete company profile: ${error.message}`);
  }

  if (!data) {
    throw new Error('COMPANY_PROFILE_NOT_FOUND');
  }
}

// ============================================================================
// Company Partners Service
// ============================================================================

export async function listCompanyPartners(): Promise<CompanyPartner[]> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_partners')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to list company partners: ${error.message}`);
  }

  return (data ?? []).map(mapCompanyPartner);
}

export async function getCompanyPartnerById(
  id: string
): Promise<CompanyPartner | null> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_partners')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get company partner: ${error.message}`);
  }

  return data ? mapCompanyPartner(data) : null;
}

export async function createCompanyPartner(
  input: CompanyPartnersCreateInput
): Promise<CompanyPartner> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_partners')
    .insert({
      name_ar: input.nameAr,
      name_en: input.nameEn,
      logo_key: input.logoKey ?? null,
      description_ar: input.descriptionAr ?? null,
      description_en: input.descriptionEn ?? null,
      website_url: input.websiteUrl ?? null,
      display_order: input.displayOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company partner: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create company partner: no data returned');
  }

  return mapCompanyPartner(data);
}

export async function updateCompanyPartner(
  id: string,
  input: CompanyPartnersUpdateInput
): Promise<CompanyPartner> {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.nameAr !== undefined) updateData.name_ar = input.nameAr;
  if (input.nameEn !== undefined) updateData.name_en = input.nameEn;
  if (input.logoKey !== undefined) updateData.logo_key = input.logoKey;
  if (input.descriptionAr !== undefined)
    updateData.description_ar = input.descriptionAr;
  if (input.descriptionEn !== undefined)
    updateData.description_en = input.descriptionEn;
  if (input.websiteUrl !== undefined) updateData.website_url = input.websiteUrl;
  if (input.displayOrder !== undefined)
    updateData.display_order = input.displayOrder;

  const { data, error } = await adminClient
    .from('company_partners')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_PARTNER_NOT_FOUND');
    }
    throw new Error(`Failed to update company partner: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update company partner: no data returned');
  }

  return mapCompanyPartner(data);
}

export async function deleteCompanyPartner(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_partners')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_PARTNER_NOT_FOUND');
    }
    throw new Error(`Failed to delete company partner: ${error.message}`);
  }

  if (!data) {
    throw new Error('COMPANY_PARTNER_NOT_FOUND');
  }
}

// ============================================================================
// Company Clients Service
// ============================================================================

export async function listCompanyClients(): Promise<CompanyClient[]> {
  try {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_clients')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
      console.error('[Company Content Service] Failed to list company clients:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to list company clients: ${error.message} (code: ${error.code || 'unknown'})`);
  }

    console.log(`[Company Content Service] Retrieved ${data?.length || 0} company clients`);
  return (data ?? []).map(mapCompanyClient);
  } catch (error) {
    // Re-throw with more context if it's a Supabase admin client error
    if (error instanceof Error && error.message.includes('service role key')) {
      console.error('[Company Content Service] Supabase Admin Client Error:', error.message);
      throw new Error('Database access error: Service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in Netlify Dashboard.');
    }
    throw error;
  }
}

export async function getCompanyClientById(
  id: string
): Promise<CompanyClient | null> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get company client: ${error.message}`);
  }

  return data ? mapCompanyClient(data) : null;
}

export async function createCompanyClient(
  input: CompanyClientsCreateInput
): Promise<CompanyClient> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_clients')
    .insert({
      name_ar: input.nameAr,
      name_en: input.nameEn,
      logo_key: input.logoKey ?? null,
      description_ar: input.descriptionAr ?? null,
      description_en: input.descriptionEn ?? null,
      display_order: input.displayOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company client: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create company client: no data returned');
  }

  return mapCompanyClient(data);
}

export async function updateCompanyClient(
  id: string,
  input: CompanyClientsUpdateInput
): Promise<CompanyClient> {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.nameAr !== undefined) updateData.name_ar = input.nameAr;
  if (input.nameEn !== undefined) updateData.name_en = input.nameEn;
  if (input.logoKey !== undefined) updateData.logo_key = input.logoKey;
  if (input.descriptionAr !== undefined)
    updateData.description_ar = input.descriptionAr;
  if (input.descriptionEn !== undefined)
    updateData.description_en = input.descriptionEn;
  if (input.displayOrder !== undefined)
    updateData.display_order = input.displayOrder;

  const { data, error } = await adminClient
    .from('company_clients')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_CLIENT_NOT_FOUND');
    }
    throw new Error(`Failed to update company client: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update company client: no data returned');
  }

  return mapCompanyClient(data);
}

export async function deleteCompanyClient(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_clients')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_CLIENT_NOT_FOUND');
    }
    throw new Error(`Failed to delete company client: ${error.message}`);
  }

  if (!data) {
    throw new Error('COMPANY_CLIENT_NOT_FOUND');
  }
}

// ============================================================================
// Company Resources Service
// ============================================================================

export async function listCompanyResources(): Promise<CompanyResource[]> {
  try {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_resources')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
      console.error('[Company Content Service] Failed to list company resources:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to list company resources: ${error.message} (code: ${error.code || 'unknown'})`);
  }

    console.log(`[Company Content Service] Retrieved ${data?.length || 0} company resources`);
  return (data ?? []).map(mapCompanyResource);
  } catch (error) {
    // Re-throw with more context if it's a Supabase admin client error
    if (error instanceof Error && error.message.includes('service role key')) {
      console.error('[Company Content Service] Supabase Admin Client Error:', error.message);
      throw new Error('Database access error: Service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in Netlify Dashboard.');
    }
    throw error;
  }
}

export async function getCompanyResourceById(
  id: string
): Promise<CompanyResource | null> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_resources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get company resource: ${error.message}`);
  }

  return data ? mapCompanyResource(data) : null;
}

export async function createCompanyResource(
  input: CompanyResourcesCreateInput
): Promise<CompanyResource> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_resources')
    .insert({
      title_ar: input.titleAr,
      title_en: input.titleEn,
      description_ar: input.descriptionAr ?? null,
      description_en: input.descriptionEn ?? null,
      icon_key: input.iconKey ?? null,
      value: input.value ?? null,
      currency: input.currency,
      display_order: input.displayOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company resource: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create company resource: no data returned');
  }

  return mapCompanyResource(data);
}

export async function updateCompanyResource(
  id: string,
  input: CompanyResourcesUpdateInput
): Promise<CompanyResource> {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.titleAr !== undefined) updateData.title_ar = input.titleAr;
  if (input.titleEn !== undefined) updateData.title_en = input.titleEn;
  if (input.descriptionAr !== undefined)
    updateData.description_ar = input.descriptionAr;
  if (input.descriptionEn !== undefined)
    updateData.description_en = input.descriptionEn;
  if (input.iconKey !== undefined) updateData.icon_key = input.iconKey;
  if (input.value !== undefined) updateData.value = input.value;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.displayOrder !== undefined)
    updateData.display_order = input.displayOrder;

  const { data, error } = await adminClient
    .from('company_resources')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_RESOURCE_NOT_FOUND');
    }
    throw new Error(`Failed to update company resource: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update company resource: no data returned');
  }

  return mapCompanyResource(data);
}

export async function deleteCompanyResource(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_resources')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_RESOURCE_NOT_FOUND');
    }
    throw new Error(`Failed to delete company resource: ${error.message}`);
  }

  if (!data) {
    throw new Error('COMPANY_RESOURCE_NOT_FOUND');
  }
}

// ============================================================================
// Company Strengths Service
// ============================================================================

export async function listCompanyStrengths(): Promise<CompanyStrength[]> {
  try {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_strengths')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
      console.error('[Company Content Service] Failed to list company strengths:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to list company strengths: ${error.message} (code: ${error.code || 'unknown'})`);
  }

    console.log(`[Company Content Service] Retrieved ${data?.length || 0} company strengths`);
  return (data ?? []).map(mapCompanyStrength);
  } catch (error) {
    // Re-throw with more context if it's a Supabase admin client error
    if (error instanceof Error && error.message.includes('service role key')) {
      console.error('[Company Content Service] Supabase Admin Client Error:', error.message);
      throw new Error('Database access error: Service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in Netlify Dashboard.');
    }
    throw error;
  }
}

export async function getCompanyStrengthById(
  id: string
): Promise<CompanyStrength | null> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_strengths')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get company strength: ${error.message}`);
  }

  return data ? mapCompanyStrength(data) : null;
}

export async function createCompanyStrength(
  input: CompanyStrengthsCreateInput
): Promise<CompanyStrength> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_strengths')
    .insert({
      title_ar: input.titleAr,
      title_en: input.titleEn,
      description_ar: input.descriptionAr ?? null,
      description_en: input.descriptionEn ?? null,
      icon_key: input.iconKey ?? null,
      display_order: input.displayOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company strength: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create company strength: no data returned');
  }

  return mapCompanyStrength(data);
}

export async function updateCompanyStrength(
  id: string,
  input: CompanyStrengthsUpdateInput
): Promise<CompanyStrength> {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.titleAr !== undefined) updateData.title_ar = input.titleAr;
  if (input.titleEn !== undefined) updateData.title_en = input.titleEn;
  if (input.descriptionAr !== undefined)
    updateData.description_ar = input.descriptionAr;
  if (input.descriptionEn !== undefined)
    updateData.description_en = input.descriptionEn;
  if (input.iconKey !== undefined) updateData.icon_key = input.iconKey;
  if (input.displayOrder !== undefined)
    updateData.display_order = input.displayOrder;

  const { data, error } = await adminClient
    .from('company_strengths')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_STRENGTH_NOT_FOUND');
    }
    throw new Error(`Failed to update company strength: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update company strength: no data returned');
  }

  return mapCompanyStrength(data);
}

export async function deleteCompanyStrength(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_strengths')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_STRENGTH_NOT_FOUND');
    }
    throw new Error(`Failed to delete company strength: ${error.message}`);
  }

  if (!data) {
    throw new Error('COMPANY_STRENGTH_NOT_FOUND');
  }
}

// ============================================================================
// Partnership Info Service
// ============================================================================

export async function listPartnershipInfo(): Promise<PartnershipInfo[]> {
  try {
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('partnership_info')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Company Content Service] Failed to list partnership info:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to list partnership info: ${error.message} (code: ${error.code || 'unknown'})`);
    }

    const mapped = (data ?? []).map(mapPartnershipInfo);
    console.log(`[Company Content Service] Retrieved ${mapped.length} partnership info items`);
    return mapped;
  } catch (error) {
    // Re-throw with more context if it's a Supabase admin client error
    if (error instanceof Error && error.message.includes('service role key')) {
      console.error('[Company Content Service] Supabase Admin Client Error:', error.message);
      throw new Error('Database access error: Service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.');
    }
    throw error;
  }
}

export async function getPartnershipInfoById(
  id: string
): Promise<PartnershipInfo | null> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('partnership_info')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get partnership info: ${error.message}`);
  }

  return data ? mapPartnershipInfo(data) : null;
}

export async function createPartnershipInfo(
  input: PartnershipInfoCreateInput
): Promise<PartnershipInfo> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('partnership_info')
    .insert({
      title_ar: input.titleAr,
      title_en: input.titleEn,
      content_ar: input.contentAr,
      content_en: input.contentEn,
      steps_ar: input.stepsAr ?? null,
      steps_en: input.stepsEn ?? null,
      icon_key: input.iconKey ?? null,
      display_order: input.displayOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create partnership info: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create partnership info: no data returned');
  }

  return mapPartnershipInfo(data);
}

export async function updatePartnershipInfo(
  id: string,
  input: PartnershipInfoUpdateInput
): Promise<PartnershipInfo> {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.titleAr !== undefined) updateData.title_ar = input.titleAr;
  if (input.titleEn !== undefined) updateData.title_en = input.titleEn;
  if (input.contentAr !== undefined) updateData.content_ar = input.contentAr;
  if (input.contentEn !== undefined) updateData.content_en = input.contentEn;
  if (input.stepsAr !== undefined) updateData.steps_ar = input.stepsAr;
  if (input.stepsEn !== undefined) updateData.steps_en = input.stepsEn;
  if (input.iconKey !== undefined) updateData.icon_key = input.iconKey;
  if (input.displayOrder !== undefined)
    updateData.display_order = input.displayOrder;

  const { data, error } = await adminClient
    .from('partnership_info')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('PARTNERSHIP_INFO_NOT_FOUND');
    }
    throw new Error(`Failed to update partnership info: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update partnership info: no data returned');
  }

  return mapPartnershipInfo(data);
}

export async function deletePartnershipInfo(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('partnership_info')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('PARTNERSHIP_INFO_NOT_FOUND');
    }
    throw new Error(`Failed to delete partnership info: ${error.message}`);
  }

  if (!data) {
    throw new Error('PARTNERSHIP_INFO_NOT_FOUND');
  }
}

// ============================================================================
// Market Value Service
// ============================================================================

export async function listMarketValues(
  includeUnverified = false
): Promise<MarketValue[]> {
  try {
    const adminClient = requireSupabaseAdmin();
    let query = adminClient
      .from('market_value')
      .select('*')
      .order('valuation_date', { ascending: false });

    if (!includeUnverified) {
      query = query.eq('is_verified', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Company Content Service] Failed to list market values:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        includeUnverified,
      });
      throw new Error(`Failed to list market values: ${error.message} (code: ${error.code || 'unknown'})`);
    }

    const mapped = (data ?? []).map(mapMarketValue);
    console.log(`[Company Content Service] Retrieved ${mapped.length} market values (includeUnverified: ${includeUnverified})`);
    return mapped;
  } catch (error) {
    // Re-throw with more context if it's a Supabase admin client error
    if (error instanceof Error && error.message.includes('service role key')) {
      console.error('[Company Content Service] Supabase Admin Client Error:', error.message);
      throw new Error('Database access error: Service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.');
    }
    throw error;
  }
}

export async function getMarketValueById(
  id: string
): Promise<MarketValue | null> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('market_value')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get market value: ${error.message}`);
  }

  return data ? mapMarketValue(data) : null;
}

export async function createMarketValue(
  input: MarketValueCreateInput
): Promise<MarketValue> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('market_value')
    .insert({
      value: input.value,
      currency: input.currency,
      valuation_date: input.valuationDate,
      source: input.source ?? null,
      is_verified: input.isVerified,
      verified_at: input.verifiedAt ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create market value: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create market value: no data returned');
  }

  return mapMarketValue(data);
}

export async function updateMarketValue(
  id: string,
  input: MarketValueUpdateInput
): Promise<MarketValue> {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.value !== undefined) updateData.value = input.value;
  if (input.currency !== undefined) updateData.currency = input.currency;
  if (input.valuationDate !== undefined)
    updateData.valuation_date = input.valuationDate;
  if (input.source !== undefined) updateData.source = input.source;
  if (input.isVerified !== undefined) updateData.is_verified = input.isVerified;
  if (input.verifiedAt !== undefined) {
    updateData.verified_at = input.verifiedAt;
    // Auto-set verified_at when isVerified is set to true
    if (input.isVerified === true && !input.verifiedAt) {
      updateData.verified_at = new Date().toISOString();
    }
    // Clear verified_at when isVerified is set to false
    if (input.isVerified === false) {
      updateData.verified_at = null;
    }
  }

  const { data, error } = await adminClient
    .from('market_value')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('MARKET_VALUE_NOT_FOUND');
    }
    throw new Error(`Failed to update market value: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update market value: no data returned');
  }

  return mapMarketValue(data);
}

export async function deleteMarketValue(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('market_value')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('MARKET_VALUE_NOT_FOUND');
    }
    throw new Error(`Failed to delete market value: ${error.message}`);
  }

  if (!data) {
    throw new Error('MARKET_VALUE_NOT_FOUND');
  }
}

// ============================================================================
// Company Goals Service
// ============================================================================

export async function listCompanyGoals(): Promise<CompanyGoal[]> {
  try {
    const adminClient = requireSupabaseAdmin();
    const { data, error } = await adminClient
      .from('company_goals')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[Company Content Service] Failed to list company goals:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error(`Failed to list company goals: ${error.message} (code: ${error.code || 'unknown'})`);
    }

    const mapped = (data ?? []).map(mapCompanyGoal);
    console.log(`[Company Content Service] Retrieved ${mapped.length} company goals`);
    return mapped;
  } catch (error) {
    // Re-throw with more context if it's a Supabase admin client error
    if (error instanceof Error && error.message.includes('service role key')) {
      console.error('[Company Content Service] Supabase Admin Client Error:', error.message);
      throw new Error('Database access error: Service role key is required. Please set SUPABASE_SERVICE_ROLE_KEY in environment variables.');
    }
    throw error;
  }
}

export async function getCompanyGoalById(
  id: string
): Promise<CompanyGoal | null> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_goals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get company goal: ${error.message}`);
  }

  return data ? mapCompanyGoal(data) : null;
}

export async function createCompanyGoal(
  input: CompanyGoalsCreateInput
): Promise<CompanyGoal> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_goals')
    .insert({
      title_ar: input.titleAr,
      title_en: input.titleEn,
      description_ar: input.descriptionAr ?? null,
      description_en: input.descriptionEn ?? null,
      target_date: input.targetDate ?? null,
      icon_key: input.iconKey ?? null,
      display_order: input.displayOrder,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company goal: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create company goal: no data returned');
  }

  return mapCompanyGoal(data);
}

export async function updateCompanyGoal(
  id: string,
  input: CompanyGoalsUpdateInput
): Promise<CompanyGoal> {
  const adminClient = requireSupabaseAdmin();
  const updateData: Record<string, unknown> = {};

  if (input.titleAr !== undefined) updateData.title_ar = input.titleAr;
  if (input.titleEn !== undefined) updateData.title_en = input.titleEn;
  if (input.descriptionAr !== undefined)
    updateData.description_ar = input.descriptionAr;
  if (input.descriptionEn !== undefined)
    updateData.description_en = input.descriptionEn;
  if (input.targetDate !== undefined) updateData.target_date = input.targetDate;
  if (input.iconKey !== undefined) updateData.icon_key = input.iconKey;
  if (input.displayOrder !== undefined)
    updateData.display_order = input.displayOrder;

  const { data, error } = await adminClient
    .from('company_goals')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_GOAL_NOT_FOUND');
    }
    throw new Error(`Failed to update company goal: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to update company goal: no data returned');
  }

  return mapCompanyGoal(data);
}

export async function deleteCompanyGoal(id: string): Promise<void> {
  const adminClient = requireSupabaseAdmin();
  const { data, error } = await adminClient
    .from('company_goals')
    .delete()
    .eq('id', id)
    .select('id')
    .single<{ id: string }>();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('COMPANY_GOAL_NOT_FOUND');
    }
    throw new Error(`Failed to delete company goal: ${error.message}`);
  }

  if (!data) {
    throw new Error('COMPANY_GOAL_NOT_FOUND');
  }
}

// ============================================================================
// Presigned URL Service for Icons and Images
// ============================================================================

const COMPANY_CONTENT_IMAGES_BUCKET =
  process.env.COMPANY_CONTENT_IMAGES_BUCKET?.trim() || 'company-content-images';

export type CompanyContentImagePresignResult = {
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  token: string | null;
  path: string;
  headers: {
    'Content-Type': string;
    'x-upsert': 'false';
  };
};

function resolveCompanyContentImagePath(
  fileName: string,
  purpose: 'icon' | 'logo',
  now: Date = new Date()
): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime();
  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase()
    .slice(0, 100);

  return `${purpose}/${year}/${month}/${timestamp}-${sanitizedFileName}`;
}

export async function createCompanyContentImageUploadUrl(params: {
  fileName: string;
  fileType: string;
  purpose: 'icon' | 'logo';
}): Promise<CompanyContentImagePresignResult> {
  const adminClient = requireSupabaseAdmin();
  const objectPath = resolveCompanyContentImagePath(
    params.fileName,
    params.purpose
  );

  const { data, error } = await adminClient.storage
    .from(COMPANY_CONTENT_IMAGES_BUCKET)
    .createSignedUploadUrl(objectPath);

  if (error || !data) {
    throw new Error(
      `Failed to create signed upload url: ${error?.message ?? 'unknown error'}`
    );
  }

  return {
    bucket: COMPANY_CONTENT_IMAGES_BUCKET,
    storageKey: objectPath,
    uploadUrl: data.signedUrl,
    token: data.token ?? null,
    path: data.path ?? objectPath,
    headers: {
      'Content-Type': params.fileType,
      'x-upsert': 'false',
    },
  };
}

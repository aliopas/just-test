/**
 * Hooks مخصصة للجداول الشائعة في Supabase
 * 
 * هذه الـ hooks توفر واجهة سهلة للجداول المستخدمة بكثرة في المشروع
 */

import { useSupabaseData, useSupabaseSingle, useSupabaseCount } from './useSupabaseData';
import { useLanguage } from '../context/LanguageContext';
import type { NewsStatus, NewsAudience } from '../types/news';
// Import camelCase types from useAdminCompanyContent for compatibility
import type {
  CompanyProfile as CompanyProfileCamel,
  CompanyPartner as CompanyPartnerCamel,
  CompanyClient as CompanyClientCamel,
  CompanyResource as CompanyResourceCamel,
  CompanyStrength as CompanyStrengthCamel,
  PartnershipInfo as PartnershipInfoCamel,
  MarketValue as MarketValueCamel,
  CompanyGoal as CompanyGoalCamel,
} from './useAdminCompanyContent';

// ========== Utility Functions for Data Transformation ==========

/**
 * Convert snake_case object to camelCase
 */
function snakeToCamel(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(snakeToCamel);
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = snakeToCamel(value);
  }
  return result;
}

/**
 * Convert camelCase object to snake_case
 */
function camelToSnake(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(camelToSnake);
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = camelToSnake(value);
  }
  return result;
}

// ========== News (الأخبار) ==========

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  body_md: string;
  cover_key: string | null;
  category_id: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'pending_review' | 'rejected' | 'archived';
  scheduled_at: string | null;
  published_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  audience: 'public' | 'investor_internal';
  attachments: unknown;
}

/**
 * Hook لجلب الأخبار مع دعم pagination
 * 
 * بشكل افتراضي يجلب الأخبار ذات الحالة "published" فقط.
 * يمكن تمرير status = 'all' لإلغاء قيد الحالة وجلب جميع الحالات.
 */
export function useNews(options?: {
  page?: number;
  limit?: number;
  audience?: NewsAudience;
  status?: NewsStatus | 'all';
  enableRealtime?: boolean;
  /** فلترة حسب التصنيف لاستخدامها في "أخبار ذات صلة" وغيرها */
  categoryId?: string | null;
  /** استثناء خبر معيّن (مثلاً الخبر الحالي في صفحة التفاصيل) */
  excludeId?: string | null;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 12;
  const offset = (page - 1) * limit;

  const filters = [
    // إذا لم يحدد status نستخدم published كقيمة افتراضية
    ...(options?.status === 'all'
      ? []
      : [{ column: 'status', value: options?.status ?? 'published' }]),
    ...(options?.audience ? [{ column: 'audience', value: options.audience }] : []),
    ...(options?.categoryId
      ? [{ column: 'category_id', value: options.categoryId }]
      : []),
    ...(options?.excludeId
      ? [{ column: 'id', operator: 'neq', value: options.excludeId }]
      : []),
  ];

  return useSupabaseData<NewsItem>({
    table: 'news',
    filters,
    orderBy: { column: 'published_at', ascending: false },
    limit,
    offset,
    enableRealtime: options?.enableRealtime || false,
  });
}

/**
 * Hook لجلب خبر واحد بالـ slug
 */
export function useNewsBySlug(slug: string) {
  return useSupabaseSingle<NewsItem>({
    table: 'news',
    filters: [
      { column: 'slug', value: slug },
      { column: 'status', value: 'published' },
    ],
  });
}

/**
 * Hook لجلب خبر واحد بالـ ID
 *
 * افتراضيًا يجلب الأخبار ذات الحالة "published" فقط.
 * يمكن تمرير status = 'all' لإلغاء قيد الحالة (مفيد للأخبار الداخلية).
 */
export function useNewsById(
  id: string,
  options?: {
    status?: NewsStatus | 'all';
  },
) {
  const filters = [
    { column: 'id', value: id },
    ...(options?.status === 'all'
      ? []
      : [{ column: 'status', value: options?.status ?? 'published' }]),
  ];

  return useSupabaseSingle<NewsItem>({
    table: 'news',
    filters,
  });
}

// ========== Projects (المشاريع) ==========

export interface Project {
  id: string;
  name: string;
  name_ar: string | null;
  description: string | null;
  description_ar: string | null;
  cover_key: string | null;
  operating_costs: number;
  annual_benefits: number;
  total_shares: number;
  share_price: number;
  status: 'active' | 'inactive' | 'archived';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Hook لجلب المشاريع النشطة
 */
export function useProjects(options?: {
  limit?: number;
  enableRealtime?: boolean;
}) {
  return useSupabaseData<Project>({
    table: 'projects',
    filters: [{ column: 'status', value: 'active' }],
    orderBy: { column: 'created_at', ascending: false },
    limit: options?.limit,
    enableRealtime: options?.enableRealtime || false,
  });
}

/**
 * Hook لجلب مشروع واحد بالـ ID
 */
export function useProjectById(id: string) {
  return useSupabaseSingle<Project>({
    table: 'projects',
    filters: [{ column: 'id', value: id }],
  });
}

/**
 * Hook لجلب عدد الأخبار (للـ pagination)
 * 
 * بشكل افتراضي يحسب الأخبار ذات الحالة "published" فقط.
 * يمكن تمرير status = 'all' لإلغاء قيد الحالة وحساب جميع الحالات.
 */
export function useNewsCount(
  audience?: NewsAudience,
  status?: NewsStatus | 'all',
) {
  const filters = [
    ...(status === 'all'
      ? []
      : [{ column: 'status', value: status ?? 'published' }]),
    ...(audience ? [{ column: 'audience', value: audience }] : []),
  ];

  return useSupabaseCount({
    table: 'news',
    filters,
  });
}

// ========== Company Content (محتوى الشركة) ==========

export interface CompanyProfile {
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
}

export interface CompanyPartner {
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
}

export interface CompanyClient {
  id: string;
  name_ar: string;
  name_en: string;
  logo_key: string | null;
  description_ar: string | null;
  description_en: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyResource {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  icon_key: string | null;
  value: number | null;
  currency: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyStrength {
  id: string;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  icon_key: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PartnershipInfo {
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
}

export interface MarketValue {
  id: string;
  value: number;
  currency: string;
  valuation_date: string;
  source: string | null;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyGoal {
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
}

// مستندات المستثمر الداخلية (ملفات وتقارير)
export interface InvestorDocument {
  id: string;
  category: 'company_static' | 'financial_report' | 'external_resource';
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  storage_url: string;
  icon_emoji: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// شكل البيانات بعد التحويل إلى camelCase للاستخدام في الواجهات
export interface InvestorDocumentCamel {
  id: string;
  category: 'company_static' | 'financial_report' | 'external_resource';
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  descriptionEn: string | null;
  storageUrl: string;
  iconEmoji: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook لجلب ملفات الشركة (Company Profiles)
 * يحول البيانات من snake_case إلى camelCase تلقائياً
 */
export function useCompanyProfiles(includeInactive = false) {
  const filters = includeInactive ? [] : [{ column: 'is_active', value: true }];
  const query = useSupabaseData<CompanyProfile>({
    table: 'company_profile',
    filters,
    orderBy: { column: 'display_order', ascending: true },
  });
  
  // Convert snake_case to camelCase
  return {
    ...query,
    data: query.data ? query.data.map(snakeToCamel) as CompanyProfileCamel[] : [],
  };
}

/**
 * Hook لجلب شركاء الشركة
 * يحول البيانات من snake_case إلى camelCase تلقائياً
 */
export function useCompanyPartners() {
  const query = useSupabaseData<CompanyPartner>({
    table: 'company_partners',
    orderBy: { column: 'display_order', ascending: true },
  });
  
  return {
    ...query,
    data: query.data ? query.data.map(snakeToCamel) as CompanyPartnerCamel[] : [],
  };
}

/**
 * Hook لجلب عملاء الشركة
 * يحول البيانات من snake_case إلى camelCase تلقائياً
 */
export function useCompanyClients() {
  const query = useSupabaseData<CompanyClient>({
    table: 'company_clients',
    orderBy: { column: 'display_order', ascending: true },
  });
  
  return {
    ...query,
    data: query.data ? query.data.map(snakeToCamel) as CompanyClientCamel[] : [],
  };
}

/**
 * Hook لجلب موارد الشركة
 * يحول البيانات من snake_case إلى camelCase تلقائياً
 */
export function useCompanyResources() {
  const query = useSupabaseData<CompanyResource>({
    table: 'company_resources',
    orderBy: { column: 'display_order', ascending: true },
  });
  
  return {
    ...query,
    data: query.data ? query.data.map(snakeToCamel) as CompanyResourceCamel[] : [],
  };
}

/**
 * Hook لجلب نقاط قوة الشركة
 * يحول البيانات من snake_case إلى camelCase تلقائياً
 */
export function useCompanyStrengths() {
  const query = useSupabaseData<CompanyStrength>({
    table: 'company_strengths',
    orderBy: { column: 'display_order', ascending: true },
  });
  
  return {
    ...query,
    data: query.data ? query.data.map(snakeToCamel) as CompanyStrengthCamel[] : [],
  };
}

/**
 * Hook لجلب معلومات الشراكة
 * يحول البيانات من snake_case إلى camelCase تلقائياً
 */
export function usePartnershipInfo() {
  const query = useSupabaseData<PartnershipInfo>({
    table: 'partnership_info',
    orderBy: { column: 'display_order', ascending: true },
  });
  
  return {
    ...query,
    data: query.data ? query.data.map(snakeToCamel) as PartnershipInfoCamel[] : [],
  };
}

/**
 * Hook لجلب القيمة السوقية
 * يحول البيانات من snake_case إلى camelCase تلقائياً
 */
export function useMarketValue() {
  const { data, ...rest } = useSupabaseData<MarketValue>({
    table: 'market_value',
    filters: [{ column: 'is_verified', value: true }],
    orderBy: { column: 'valuation_date', ascending: false },
    limit: 1,
  });

  return {
    ...rest,
    data: (data && data.length > 0 ? snakeToCamel(data[0]) : null) as MarketValueCamel | null,
  };
}

/**
 * Hook لجلب أهداف الشركة
 * يحول البيانات من snake_case إلى camelCase تلقائياً
 */
export function useCompanyGoals() {
  const query = useSupabaseData<CompanyGoal>({
    table: 'company_goals',
    orderBy: { column: 'display_order', ascending: true },
  });
  
  return {
    ...query,
    data: query.data ? query.data.map(snakeToCamel) as CompanyGoalCamel[] : [],
  };
}

/**
 * Hook لجلب مستندات المستثمر الداخلية (ملفات الشركة والتقارير)
 * يمكن التصفية حسب الفئة (category)، مع إمكانية تضمين/استثناء العناصر غير المفعلة.
 */
export function useInvestorDocuments(options?: {
  category?: InvestorDocument['category'];
  includeInactive?: boolean;
}) {
  const filters = [
    ...(options?.category ? [{ column: 'category', value: options.category }] : []),
    ...(options?.includeInactive ? [] : [{ column: 'is_active', value: true }]),
  ];

  const query = useSupabaseData<InvestorDocument>({
    table: 'investor_documents',
    filters,
    orderBy: { column: 'display_order', ascending: true },
  });

  return {
    ...query,
    data: query.data ? query.data.map(snakeToCamel) as InvestorDocumentCamel[] : [],
  };
}

// ========== Users (المستخدمون) ==========

export interface User {
  id: string;
  email: string;
  phone: string | null;
  phone_cc: string | null;
  role: string;
  status: string;
  mfa_enabled: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Hook لجلب المستخدمين (للمسؤولين فقط)
 */
export function useUsers(options?: {
  role?: string;
  status?: string;
  limit?: number;
}) {
  const filters = [
    ...(options?.role ? [{ column: 'role', value: options.role }] : []),
    ...(options?.status ? [{ column: 'status', value: options.status }] : []),
  ];

  return useSupabaseData<User>({
    table: 'users',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: options?.limit,
  });
}

// ========== Requests (الطلبات) ==========

export interface Request {
  id: string;
  request_number: string;
  user_id: string | null;
  type: 'buy' | 'sell' | 'partnership' | 'board_nomination' | 'feedback';
  amount: number;
  currency: string;
  target_price: number | null;
  expiry_at: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  settlement_started_at: string | null;
  settlement_completed_at: string | null;
  settlement_reference: string | null;
  settlement_notes: string | null;
  metadata: unknown;
  title: string | null;
  description: string | null;
}

/**
 * Hook لجلب الطلبات
 */
export function useRequests(options?: {
  userId?: string;
  status?: string;
  type?: string;
  limit?: number;
  enableRealtime?: boolean;
}) {
  const filters = [
    ...(options?.userId ? [{ column: 'user_id', value: options.userId }] : []),
    ...(options?.status ? [{ column: 'status', value: options.status }] : []),
    ...(options?.type ? [{ column: 'type', value: options.type }] : []),
  ];

  return useSupabaseData<Request>({
    table: 'requests',
    filters,
    orderBy: { column: 'created_at', ascending: false },
    limit: options?.limit,
    enableRealtime: options?.enableRealtime || false,
  });
}

/**
 * Hook للحصول على رابط شعار الشركة من أول ملف شركة
 * 
 * @example
 * ```tsx
 * const logoUrl = useCompanyLogoUrl();
 * ```
 */
export function useCompanyLogoUrl(): string | null {
  const { data: profiles } = useCompanyProfiles();
  const { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } = require('../utils/supabase-storage');
  
  if (!profiles || profiles.length === 0) {
    return null;
  }
  
  // Get the first profile with an iconKey, sorted by displayOrder
  const profileWithLogo = profiles
    .filter(p => p.iconKey)
    .sort((a, b) => a.displayOrder - b.displayOrder)[0];
  
  if (!profileWithLogo?.iconKey) {
    return null;
  }
  
  return getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, profileWithLogo.iconKey);
}

// ========== Mutations Hooks (للتعامل المباشر مع Supabase) ==========

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

/**
 * Hook لإنشاء ملف شركة جديد
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreateCompanyProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      // Convert camelCase to snake_case
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_profile')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      // Convert snake_case back to camelCase
      return snakeToCamel(data) as CompanyProfileCamel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_profile'] });
    },
  });
}

/**
 * Hook لتحديث ملف شركة
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdateCompanyProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      // Convert camelCase to snake_case
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_profile')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      // Convert snake_case back to camelCase
      return snakeToCamel(data) as CompanyProfileCamel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_profile'] });
    },
  });
}

/**
 * Hook لحذف ملف شركة
 */
export function useDeleteCompanyProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('company_profile')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_profile'] });
    },
  });
}

/**
 * Hook لإنشاء شريك جديد
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreateCompanyPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_partners')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as CompanyPartnerCamel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_partners'] });
    },
  });
}

/**
 * Hook لتحديث شريك
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdateCompanyPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_partners')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as CompanyPartnerCamel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_partners'] });
    },
  });
}

/**
 * Hook لحذف شريك
 */
export function useDeleteCompanyPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('company_partners')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_partners'] });
    },
  });
}

/**
 * Hook لإنشاء عميل جديد
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreateCompanyClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_clients')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_clients'] });
    },
  });
}

/**
 * Hook لتحديث عميل
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdateCompanyClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_clients')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_clients'] });
    },
  });
}

/**
 * Hook لحذف عميل
 */
export function useDeleteCompanyClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('company_clients')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_clients'] });
    },
  });
}

/**
 * Hook لإنشاء مورد جديد
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreateCompanyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_resources')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_resources'] });
    },
  });
}

/**
 * Hook لتحديث مورد
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdateCompanyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_resources')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_resources'] });
    },
  });
}

/**
 * Hook لحذف مورد
 */
export function useDeleteCompanyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('company_resources')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_resources'] });
    },
  });
}

/**
 * Hook لإنشاء قوة جديدة
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreateCompanyStrengthMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_strengths')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_strengths'] });
    },
  });
}

/**
 * Hook لتحديث قوة
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdateCompanyStrengthMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_strengths')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_strengths'] });
    },
  });
}

/**
 * Hook لحذف قوة
 */
export function useDeleteCompanyStrengthMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('company_strengths')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_strengths'] });
    },
  });
}

/**
 * Hook لإنشاء معلومات شراكة جديدة
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreatePartnershipInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('partnership_info')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'partnership_info'] });
    },
  });
}

/**
 * Hook لتحديث معلومات شراكة
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdatePartnershipInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('partnership_info')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'partnership_info'] });
    },
  });
}

/**
 * Hook لحذف معلومات شراكة
 */
export function useDeletePartnershipInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('partnership_info')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'partnership_info'] });
    },
  });
}

/**
 * Hook لإنشاء قيمة سوقية جديدة
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreateMarketValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('market_value')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'market_value'] });
    },
  });
}

/**
 * Hook لتحديث قيمة سوقية
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdateMarketValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('market_value')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'market_value'] });
    },
  });
}

/**
 * Hook لحذف قيمة سوقية
 */
export function useDeleteMarketValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('market_value')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'market_value'] });
    },
  });
}

/**
 * Hook لإنشاء هدف جديد
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreateCompanyGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_goals')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_goals'] });
    },
  });
}

/**
 * Hook لتحديث هدف
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdateCompanyGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('company_goals')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as any;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_goals'] });
    },
  });
}

/**
 * Hook لحذف هدف
 */
export function useDeleteCompanyGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('company_goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'company_goals'] });
    },
  });
}

// ========== Investor Documents (مستندات المستثمر) ==========

/**
 * Hook لإنشاء مستند مستثمر جديد
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useCreateInvestorDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('investor_documents')
        .insert(snakePayload)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as InvestorDocumentCamel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'investor_documents'] });
    },
  });
}

/**
 * Hook لتحديث مستند مستثمر
 * يقبل بيانات camelCase ويحولها إلى snake_case تلقائياً
 */
export function useUpdateInvestorDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const snakePayload = camelToSnake(payload);
      const { data, error } = await supabase
        .from('investor_documents')
        .update(snakePayload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return snakeToCamel(data) as InvestorDocumentCamel;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'investor_documents'] });
      queryClient.invalidateQueries({ queryKey: ['supabase', 'investor_documents', variables.id] });
    },
  });
}

/**
 * Hook لحذف مستند مستثمر
 */
export function useDeleteInvestorDocumentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
      }
      const { error } = await supabase
        .from('investor_documents')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supabase', 'investor_documents'] });
    },
  });
}


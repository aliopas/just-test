/**
 * Hooks مخصصة للجداول الشائعة في Supabase
 * 
 * هذه الـ hooks توفر واجهة سهلة للجداول المستخدمة بكثرة في المشروع
 */

import { useSupabaseData, useSupabaseSingle, useSupabaseCount } from './useSupabaseData';
import { useLanguage } from '../context/LanguageContext';

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
 * Hook لجلب الأخبار المنشورة مع دعم pagination
 */
export function useNews(options?: {
  page?: number;
  limit?: number;
  audience?: 'public' | 'investor_internal';
  enableRealtime?: boolean;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 12;
  const offset = (page - 1) * limit;

  return useSupabaseData<NewsItem>({
    table: 'news',
    filters: [
      { column: 'status', value: 'published' },
      ...(options?.audience ? [{ column: 'audience', value: options.audience }] : []),
    ],
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
 */
export function useNewsById(id: string) {
  return useSupabaseSingle<NewsItem>({
    table: 'news',
    filters: [
      { column: 'id', value: id },
      { column: 'status', value: 'published' },
    ],
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
 */
export function useNewsCount(audience?: 'public' | 'investor_internal') {
  const filters = [
    { column: 'status', value: 'published' },
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

/**
 * Hook لجلب ملفات الشركة (Company Profiles)
 */
export function useCompanyProfiles() {
  return useSupabaseData<CompanyProfile>({
    table: 'company_profile',
    filters: [{ column: 'is_active', value: true }],
    orderBy: { column: 'display_order', ascending: true },
  });
}

/**
 * Hook لجلب شركاء الشركة
 */
export function useCompanyPartners() {
  return useSupabaseData<CompanyPartner>({
    table: 'company_partners',
    orderBy: { column: 'display_order', ascending: true },
  });
}

/**
 * Hook لجلب عملاء الشركة
 */
export function useCompanyClients() {
  return useSupabaseData<CompanyClient>({
    table: 'company_clients',
    orderBy: { column: 'display_order', ascending: true },
  });
}

/**
 * Hook لجلب موارد الشركة
 */
export function useCompanyResources() {
  return useSupabaseData<CompanyResource>({
    table: 'company_resources',
    orderBy: { column: 'display_order', ascending: true },
  });
}

/**
 * Hook لجلب نقاط قوة الشركة
 */
export function useCompanyStrengths() {
  return useSupabaseData<CompanyStrength>({
    table: 'company_strengths',
    orderBy: { column: 'display_order', ascending: true },
  });
}

/**
 * Hook لجلب معلومات الشراكة
 */
export function usePartnershipInfo() {
  return useSupabaseData<PartnershipInfo>({
    table: 'partnership_info',
    orderBy: { column: 'display_order', ascending: true },
  });
}

/**
 * Hook لجلب القيمة السوقية
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
    data: (data && data.length > 0 ? data[0] : null) as MarketValue | null,
  };
}

/**
 * Hook لجلب أهداف الشركة
 */
export function useCompanyGoals() {
  return useSupabaseData<CompanyGoal>({
    table: 'company_goals',
    orderBy: { column: 'display_order', ascending: true },
  });
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
  
  // Get the first profile with an icon_key, sorted by display_order
  const profileWithLogo = profiles
    .filter(p => p.icon_key)
    .sort((a, b) => a.display_order - b.display_order)[0];
  
  if (!profileWithLogo?.icon_key) {
    return null;
  }
  
  return getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, profileWithLogo.icon_key);
}


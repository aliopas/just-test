import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import { useLanguage } from '../context/LanguageContext';
import { useMemo } from 'react';
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '../utils/supabase-storage';

// Types
export interface PublicCompanyProfile {
  id: string;
  title: string;
  content: string;
  iconKey: string | null;
  displayOrder: number;
}

export interface PublicCompanyPartner {
  id: string;
  name: string;
  logoKey: string | null;
  description: string | null;
  websiteUrl: string | null;
  displayOrder: number;
}

export interface PublicCompanyClient {
  id: string;
  name: string;
  logoKey: string | null;
  description: string | null;
  displayOrder: number;
}

export interface PublicCompanyResource {
  id: string;
  title: string;
  description: string | null;
  iconKey: string | null;
  value: number | null;
  currency: string;
  displayOrder: number;
}

export interface PublicCompanyStrength {
  id: string;
  title: string;
  description: string | null;
  iconKey: string | null;
  displayOrder: number;
}

export interface PublicPartnershipInfo {
  id: string;
  title: string;
  content: string;
  steps: string[] | null;
  iconKey: string | null;
  displayOrder: number;
}

export interface PublicMarketValue {
  id: string;
  value: number;
  currency: string;
  valuationDate: string;
  source: string | null;
  isVerified: boolean;
  verifiedAt: string | null;
}

export interface PublicCompanyGoal {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  iconKey: string | null;
  displayOrder: number;
}

// Response Types
interface CompanyProfileResponse {
  profiles: PublicCompanyProfile[];
  language: string;
}

interface CompanyPartnersResponse {
  partners: PublicCompanyPartner[];
  language: string;
}

interface CompanyClientsResponse {
  clients: PublicCompanyClient[];
  language: string;
}

interface CompanyResourcesResponse {
  resources: PublicCompanyResource[];
  language: string;
}

interface CompanyStrengthsResponse {
  strengths: PublicCompanyStrength[];
  language: string;
}

interface PartnershipInfoResponse {
  partnershipInfo: PublicPartnershipInfo[];
  language: string;
}

interface MarketValueResponse {
  marketValue: PublicMarketValue | null;
}

interface CompanyGoalsResponse {
  goals: PublicCompanyGoal[];
  language: string;
}

// Hooks
export function usePublicCompanyProfiles() {
  const { language } = useLanguage();

  return useQuery<CompanyProfileResponse>({
    queryKey: ['publicCompanyProfiles', language],
    queryFn: () =>
      apiClient<CompanyProfileResponse>(`/api/v1/public/company-profile?lang=${language}`, {
        auth: false,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePublicCompanyPartners() {
  const { language } = useLanguage();

  return useQuery<CompanyPartnersResponse>({
    queryKey: ['publicCompanyPartners', language],
    queryFn: () =>
      apiClient<CompanyPartnersResponse>(`/api/v1/public/company-partners?lang=${language}`, {
        auth: false,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicCompanyClients() {
  const { language } = useLanguage();

  return useQuery<CompanyClientsResponse>({
    queryKey: ['publicCompanyClients', language],
    queryFn: () =>
      apiClient<CompanyClientsResponse>(`/api/v1/public/company-clients?lang=${language}`, {
        auth: false,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicCompanyResources() {
  const { language } = useLanguage();

  return useQuery<CompanyResourcesResponse>({
    queryKey: ['publicCompanyResources', language],
    queryFn: () =>
      apiClient<CompanyResourcesResponse>(`/api/v1/public/company-resources?lang=${language}`, {
        auth: false,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicCompanyStrengths() {
  const { language } = useLanguage();

  return useQuery<CompanyStrengthsResponse>({
    queryKey: ['publicCompanyStrengths', language],
    queryFn: () =>
      apiClient<CompanyStrengthsResponse>(`/api/v1/public/company-strengths?lang=${language}`, {
        auth: false,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicPartnershipInfo() {
  const { language } = useLanguage();

  return useQuery<PartnershipInfoResponse>({
    queryKey: ['publicPartnershipInfo', language],
    queryFn: () =>
      apiClient<PartnershipInfoResponse>(`/api/v1/public/partnership-info?lang=${language}`, {
        auth: false,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicMarketValue() {
  return useQuery<MarketValueResponse>({
    queryKey: ['publicMarketValue'],
    queryFn: () =>
      apiClient<MarketValueResponse>('/api/v1/public/market-value', {
        auth: false,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublicCompanyGoals() {
  const { language } = useLanguage();

  return useQuery<CompanyGoalsResponse>({
    queryKey: ['publicCompanyGoals', language],
    queryFn: () =>
      apiClient<CompanyGoalsResponse>(`/api/v1/public/company-goals?lang=${language}`, {
        auth: false,
      }),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get the company logo URL from the first company profile
 * Returns null if no profile with iconKey exists
 */
export function useCompanyLogoUrl(): string | null {
  const { data: profilesData } = usePublicCompanyProfiles();
  
  return useMemo(() => {
    const profiles = profilesData?.profiles ?? [];
    // Get the first profile with an iconKey, sorted by displayOrder
    const profileWithLogo = profiles
      .filter(p => p.iconKey)
      .sort((a, b) => a.displayOrder - b.displayOrder)[0];
    
    if (!profileWithLogo?.iconKey) {
      return null;
    }
    
    return getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, profileWithLogo.iconKey);
  }, [profilesData]);
}


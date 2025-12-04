import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { apiClient, ApiError } from '../utils/api-client';
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

// Common query options for public content
const commonPublicContentOptions: Partial<Omit<UseQueryOptions<any, ApiError>, 'queryFn' | 'queryKey'>> = {
  enabled: typeof window !== 'undefined', // Only run queries on the client, not during SSR
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: (failureCount, error) => {
    // Don't retry on 4xx errors (client errors) or 5xx errors (server errors)
    // Public content is not critical, so we fail fast to avoid blocking the UI
    if (error?.status >= 400) {
      return false;
    }
    // Only retry network errors (no status code)
    return failureCount < 1; // Reduced retries for faster failure
  },
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s
  refetchOnWindowFocus: false, // Don't refetch when window regains focus for public content
  refetchOnReconnect: true, // Refetch when network reconnects
  // Don't throw errors - let components handle error states gracefully
  throwOnError: false,
};

// Hooks
export function usePublicCompanyProfiles() {
  const { language } = useLanguage();

  return useQuery<CompanyProfileResponse, ApiError>({
    queryKey: ['publicCompanyProfiles', language],
    queryFn: async () => {
      try {
        const response = await apiClient<CompanyProfileResponse>(`/public/company-profile?lang=${language}`, {
          auth: false,
        });
        console.log(`[usePublicCompanyProfiles] Successfully fetched ${response.profiles?.length || 0} profiles (lang: ${language})`);
        return response;
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as ApiError;
          if (apiError.status && apiError.status >= 500) {
            console.error('[usePublicCompanyProfiles] Server error:', {
              status: apiError.status,
              message: apiError.message,
              payload: apiError.payload,
            });
          } else if (apiError.status === 404) {
            console.warn('[usePublicCompanyProfiles] Endpoint not found - check API route configuration');
          } else {
            console.warn('[usePublicCompanyProfiles] Client error:', {
              status: apiError.status,
              message: apiError.message,
            });
          }
        } else {
          console.error('[usePublicCompanyProfiles] Network or unknown error:', error);
        }
        // Return empty data structure instead of throwing to prevent page crashes
        return { profiles: [], language } as CompanyProfileResponse;
      }
    },
    ...commonPublicContentOptions,
  });
}

export function usePublicCompanyPartners() {
  const { language } = useLanguage();

  return useQuery<CompanyPartnersResponse, ApiError>({
    queryKey: ['publicCompanyPartners', language],
    queryFn: async () => {
      try {
        return await apiClient<CompanyPartnersResponse>(`/public/company-partners?lang=${language}`, {
          auth: false,
        });
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as { status?: number };
          if (apiError.status && apiError.status >= 500) {
            console.warn('[usePublicCompanyPartners] Server error (non-critical):', error);
          } else {
            console.warn('[usePublicCompanyPartners] Failed to fetch:', error);
          }
        } else {
          console.warn('[usePublicCompanyPartners] Failed to fetch:', error);
        }
        return { partners: [], language } as CompanyPartnersResponse;
      }
    },
    ...commonPublicContentOptions,
  });
}

export function usePublicCompanyClients() {
  const { language } = useLanguage();

  return useQuery<CompanyClientsResponse, ApiError>({
    queryKey: ['publicCompanyClients', language],
    queryFn: async () => {
      try {
        const response = await apiClient<CompanyClientsResponse>(`/public/company-clients?lang=${language}`, {
          auth: false,
        });
        console.log(`[usePublicCompanyClients] Successfully fetched ${response.clients?.length || 0} clients (lang: ${language})`);
        return response;
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as ApiError;
          if (apiError.status && apiError.status >= 500) {
            console.error('[usePublicCompanyClients] Server error:', {
              status: apiError.status,
              message: apiError.message,
              payload: apiError.payload,
            });
          } else if (apiError.status === 404) {
            console.warn('[usePublicCompanyClients] Endpoint not found - check API route configuration');
          } else {
            console.warn('[usePublicCompanyClients] Client error:', {
              status: apiError.status,
              message: apiError.message,
            });
          }
        } else {
          console.error('[usePublicCompanyClients] Network or unknown error:', error);
        }
        return { clients: [], language } as CompanyClientsResponse;
      }
    },
    ...commonPublicContentOptions,
  });
}

export function usePublicCompanyResources() {
  const { language } = useLanguage();

  return useQuery<CompanyResourcesResponse, ApiError>({
    queryKey: ['publicCompanyResources', language],
    queryFn: async () => {
      try {
        const response = await apiClient<CompanyResourcesResponse>(`/public/company-resources?lang=${language}`, {
          auth: false,
        });
        console.log(`[usePublicCompanyResources] Successfully fetched ${response.resources?.length || 0} resources (lang: ${language})`);
        return response;
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as ApiError;
          if (apiError.status && apiError.status >= 500) {
            console.error('[usePublicCompanyResources] Server error:', {
              status: apiError.status,
              message: apiError.message,
              payload: apiError.payload,
            });
          } else if (apiError.status === 404) {
            console.warn('[usePublicCompanyResources] Endpoint not found - check API route configuration');
          } else {
            console.warn('[usePublicCompanyResources] Client error:', {
              status: apiError.status,
              message: apiError.message,
            });
          }
        } else {
          console.error('[usePublicCompanyResources] Network or unknown error:', error);
        }
        return { resources: [], language } as CompanyResourcesResponse;
      }
    },
    ...commonPublicContentOptions,
  });
}

export function usePublicCompanyStrengths() {
  const { language } = useLanguage();

  return useQuery<CompanyStrengthsResponse, ApiError>({
    queryKey: ['publicCompanyStrengths', language],
    queryFn: async () => {
      try {
        const response = await apiClient<CompanyStrengthsResponse>(`/public/company-strengths?lang=${language}`, {
          auth: false,
        });
        console.log(`[usePublicCompanyStrengths] Successfully fetched ${response.strengths?.length || 0} strengths (lang: ${language})`);
        return response;
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as ApiError;
          if (apiError.status && apiError.status >= 500) {
            console.error('[usePublicCompanyStrengths] Server error:', {
              status: apiError.status,
              message: apiError.message,
              payload: apiError.payload,
            });
          } else if (apiError.status === 404) {
            console.warn('[usePublicCompanyStrengths] Endpoint not found - check API route configuration');
          } else {
            console.warn('[usePublicCompanyStrengths] Client error:', {
              status: apiError.status,
              message: apiError.message,
            });
          }
        } else {
          console.error('[usePublicCompanyStrengths] Network or unknown error:', error);
        }
        return { strengths: [], language } as CompanyStrengthsResponse;
      }
    },
    ...commonPublicContentOptions,
  });
}

export function usePublicPartnershipInfo() {
  const { language } = useLanguage();

  return useQuery<PartnershipInfoResponse, ApiError>({
    queryKey: ['publicPartnershipInfo', language],
    queryFn: async () => {
      try {
        const response = await apiClient<PartnershipInfoResponse>(`/public/partnership-info?lang=${language}`, {
          auth: false,
        });
        console.log(`[usePublicPartnershipInfo] Successfully fetched ${response.partnershipInfo?.length || 0} partnership info items (lang: ${language})`);
        return response;
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as ApiError;
          if (apiError.status && apiError.status >= 500) {
            console.error('[usePublicPartnershipInfo] Server error:', {
              status: apiError.status,
              message: apiError.message,
              payload: apiError.payload,
            });
          } else if (apiError.status === 404) {
            console.warn('[usePublicPartnershipInfo] Endpoint not found - check API route configuration');
          } else {
            console.warn('[usePublicPartnershipInfo] Client error:', {
              status: apiError.status,
              message: apiError.message,
            });
          }
        } else {
          console.error('[usePublicPartnershipInfo] Network or unknown error:', error);
        }
        return { partnershipInfo: [], language } as PartnershipInfoResponse;
      }
    },
    ...commonPublicContentOptions,
  });
}

export function usePublicMarketValue() {
  return useQuery<MarketValueResponse, ApiError>({
    queryKey: ['publicMarketValue'],
    queryFn: async () => {
      try {
        const response = await apiClient<MarketValueResponse>('/public/market-value', {
          auth: false,
        });
        console.log(`[usePublicMarketValue] Successfully fetched market value:`, response.marketValue ? `${response.marketValue.value} ${response.marketValue.currency}` : 'null');
        return response;
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as ApiError;
          if (apiError.status && apiError.status >= 500) {
            console.error('[usePublicMarketValue] Server error:', {
              status: apiError.status,
              message: apiError.message,
              payload: apiError.payload,
            });
          } else if (apiError.status === 404) {
            console.warn('[usePublicMarketValue] Endpoint not found - check API route configuration');
          } else {
            console.warn('[usePublicMarketValue] Client error:', {
              status: apiError.status,
              message: apiError.message,
            });
          }
        } else {
          console.error('[usePublicMarketValue] Network or unknown error:', error);
        }
        return { marketValue: null } as MarketValueResponse;
      }
    },
    ...commonPublicContentOptions,
  });
}

export function usePublicCompanyGoals() {
  const { language } = useLanguage();

  return useQuery<CompanyGoalsResponse, ApiError>({
    queryKey: ['publicCompanyGoals', language],
    queryFn: async () => {
      try {
        const response = await apiClient<CompanyGoalsResponse>(`/public/company-goals?lang=${language}`, {
          auth: false,
        });
        console.log(`[usePublicCompanyGoals] Successfully fetched ${response.goals?.length || 0} goals (lang: ${language})`);
        return response;
      } catch (error) {
        if (error instanceof Error && 'status' in error) {
          const apiError = error as ApiError;
          if (apiError.status && apiError.status >= 500) {
            console.error('[usePublicCompanyGoals] Server error:', {
              status: apiError.status,
              message: apiError.message,
              payload: apiError.payload,
            });
          } else if (apiError.status === 404) {
            console.warn('[usePublicCompanyGoals] Endpoint not found - check API route configuration');
          } else {
            console.warn('[usePublicCompanyGoals] Client error:', {
              status: apiError.status,
              message: apiError.message,
            });
          }
        } else {
          console.error('[usePublicCompanyGoals] Network or unknown error:', error);
        }
        return { goals: [], language } as CompanyGoalsResponse;
      }
    },
    ...commonPublicContentOptions,
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


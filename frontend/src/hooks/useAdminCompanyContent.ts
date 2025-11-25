import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

// ============================================================================
// Type Definitions (matching backend)
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

// Response types
export type CompanyProfileListResponse = { profiles: CompanyProfile[] };
export type CompanyPartnerListResponse = { partners: CompanyPartner[] };
export type CompanyClientListResponse = { clients: CompanyClient[] };
export type CompanyResourceListResponse = { resources: CompanyResource[] };
export type CompanyStrengthListResponse = { strengths: CompanyStrength[] };
export type PartnershipInfoListResponse = { partnershipInfo: PartnershipInfo[] };
export type MarketValueResponse = { marketValue: MarketValue | null };
export type CompanyGoalListResponse = { goals: CompanyGoal[] };

// Presign response
export type ImagePresignResponse = {
  uploadUrl: string;
  storageKey: string;
};

// ============================================================================
// Query Keys
// ============================================================================

const COMPANY_CONTENT_ROOT = ['adminCompanyContent'] as const;

const contentKeys = {
  profiles: {
    list: (includeInactive?: boolean) =>
      [...COMPANY_CONTENT_ROOT, 'profiles', 'list', includeInactive] as const,
    detail: (id: string) => [...COMPANY_CONTENT_ROOT, 'profiles', 'detail', id] as const,
  },
  partners: {
    list: () => [...COMPANY_CONTENT_ROOT, 'partners', 'list'] as const,
    detail: (id: string) => [...COMPANY_CONTENT_ROOT, 'partners', 'detail', id] as const,
  },
  clients: {
    list: () => [...COMPANY_CONTENT_ROOT, 'clients', 'list'] as const,
    detail: (id: string) => [...COMPANY_CONTENT_ROOT, 'clients', 'detail', id] as const,
  },
  resources: {
    list: () => [...COMPANY_CONTENT_ROOT, 'resources', 'list'] as const,
    detail: (id: string) => [...COMPANY_CONTENT_ROOT, 'resources', 'detail', id] as const,
  },
  strengths: {
    list: () => [...COMPANY_CONTENT_ROOT, 'strengths', 'list'] as const,
    detail: (id: string) => [...COMPANY_CONTENT_ROOT, 'strengths', 'detail', id] as const,
  },
  partnership: {
    list: () => [...COMPANY_CONTENT_ROOT, 'partnership', 'list'] as const,
    detail: (id: string) => [...COMPANY_CONTENT_ROOT, 'partnership', 'detail', id] as const,
  },
  marketValue: {
    current: () => [...COMPANY_CONTENT_ROOT, 'marketValue', 'current'] as const,
    detail: (id: string) => [...COMPANY_CONTENT_ROOT, 'marketValue', 'detail', id] as const,
  },
  goals: {
    list: () => [...COMPANY_CONTENT_ROOT, 'goals', 'list'] as const,
    detail: (id: string) => [...COMPANY_CONTENT_ROOT, 'goals', 'detail', id] as const,
  },
  imagePresign: () => [...COMPANY_CONTENT_ROOT, 'imagePresign'] as const,
};

// ============================================================================
// Company Profiles Hooks
// ============================================================================

export function useAdminCompanyProfiles(includeInactive = false) {
  return useQuery<CompanyProfileListResponse>({
    queryKey: contentKeys.profiles.list(includeInactive),
    queryFn: () => {
      const params = includeInactive ? '?includeInactive=true' : '';
      return apiClient<CompanyProfileListResponse>(`/admin/company-profile${params}`);
    },
    placeholderData: keepPreviousData,
  });
}

export function useAdminCompanyProfileDetail(id?: string | null) {
  return useQuery<CompanyProfile>({
    queryKey: id ? contentKeys.profiles.detail(id) : [...COMPANY_CONTENT_ROOT, 'profiles', 'detail', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Profile ID is required');
      return apiClient<CompanyProfile>(`/admin/company-profile/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateCompanyProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      apiClient<CompanyProfile>('/admin/company-profile', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.profiles.list() });
    },
  });
}

export function useUpdateCompanyProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      apiClient<CompanyProfile>(`/admin/company-profile/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.profiles.list() });
      queryClient.invalidateQueries({ queryKey: contentKeys.profiles.detail(variables.id) });
    },
  });
}

export function useDeleteCompanyProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/company-profile/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.profiles.list() });
    },
  });
}

// ============================================================================
// Company Partners Hooks
// ============================================================================

export function useAdminCompanyPartners() {
  return useQuery<CompanyPartnerListResponse>({
    queryKey: contentKeys.partners.list(),
    queryFn: () => apiClient<CompanyPartnerListResponse>('/admin/company-partners'),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCompanyPartnerDetail(id?: string | null) {
  return useQuery<CompanyPartner>({
    queryKey: id ? contentKeys.partners.detail(id) : [...COMPANY_CONTENT_ROOT, 'partners', 'detail', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Partner ID is required');
      return apiClient<CompanyPartner>(`/admin/company-partners/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateCompanyPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      apiClient<CompanyPartner>('/admin/company-partners', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.partners.list() });
    },
  });
}

export function useUpdateCompanyPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      apiClient<CompanyPartner>(`/admin/company-partners/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.partners.list() });
      queryClient.invalidateQueries({ queryKey: contentKeys.partners.detail(variables.id) });
    },
  });
}

export function useDeleteCompanyPartnerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/company-partners/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.partners.list() });
    },
  });
}

// ============================================================================
// Company Clients Hooks
// ============================================================================

export function useAdminCompanyClients() {
  return useQuery<CompanyClientListResponse>({
    queryKey: contentKeys.clients.list(),
    queryFn: () => apiClient<CompanyClientListResponse>('/admin/company-clients'),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCompanyClientDetail(id?: string | null) {
  return useQuery<CompanyClient>({
    queryKey: id ? contentKeys.clients.detail(id) : [...COMPANY_CONTENT_ROOT, 'clients', 'detail', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Client ID is required');
      return apiClient<CompanyClient>(`/admin/company-clients/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateCompanyClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      apiClient<CompanyClient>('/admin/company-clients', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.clients.list() });
    },
  });
}

export function useUpdateCompanyClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      apiClient<CompanyClient>(`/admin/company-clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.clients.list() });
      queryClient.invalidateQueries({ queryKey: contentKeys.clients.detail(variables.id) });
    },
  });
}

export function useDeleteCompanyClientMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/company-clients/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.clients.list() });
    },
  });
}

// ============================================================================
// Company Resources Hooks
// ============================================================================

export function useAdminCompanyResources() {
  return useQuery<CompanyResourceListResponse>({
    queryKey: contentKeys.resources.list(),
    queryFn: () => apiClient<CompanyResourceListResponse>('/admin/company-resources'),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCompanyResourceDetail(id?: string | null) {
  return useQuery<CompanyResource>({
    queryKey: id ? contentKeys.resources.detail(id) : [...COMPANY_CONTENT_ROOT, 'resources', 'detail', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Resource ID is required');
      return apiClient<CompanyResource>(`/admin/company-resources/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateCompanyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      apiClient<CompanyResource>('/admin/company-resources', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.resources.list() });
    },
  });
}

export function useUpdateCompanyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      apiClient<CompanyResource>(`/admin/company-resources/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.resources.list() });
      queryClient.invalidateQueries({ queryKey: contentKeys.resources.detail(variables.id) });
    },
  });
}

export function useDeleteCompanyResourceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/company-resources/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.resources.list() });
    },
  });
}

// ============================================================================
// Company Strengths Hooks
// ============================================================================

export function useAdminCompanyStrengths() {
  return useQuery<CompanyStrengthListResponse>({
    queryKey: contentKeys.strengths.list(),
    queryFn: () => apiClient<CompanyStrengthListResponse>('/admin/company-strengths'),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCompanyStrengthDetail(id?: string | null) {
  return useQuery<CompanyStrength>({
    queryKey: id ? contentKeys.strengths.detail(id) : [...COMPANY_CONTENT_ROOT, 'strengths', 'detail', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Strength ID is required');
      return apiClient<CompanyStrength>(`/admin/company-strengths/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateCompanyStrengthMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      apiClient<CompanyStrength>('/admin/company-strengths', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.strengths.list() });
    },
  });
}

export function useUpdateCompanyStrengthMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      apiClient<CompanyStrength>(`/admin/company-strengths/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.strengths.list() });
      queryClient.invalidateQueries({ queryKey: contentKeys.strengths.detail(variables.id) });
    },
  });
}

export function useDeleteCompanyStrengthMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/company-strengths/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.strengths.list() });
    },
  });
}

// ============================================================================
// Partnership Info Hooks
// ============================================================================

export function useAdminPartnershipInfo() {
  return useQuery<PartnershipInfoListResponse>({
    queryKey: contentKeys.partnership.list(),
    queryFn: () => apiClient<PartnershipInfoListResponse>('/admin/partnership-info'),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPartnershipInfoDetail(id?: string | null) {
  return useQuery<PartnershipInfo>({
    queryKey: id ? contentKeys.partnership.detail(id) : [...COMPANY_CONTENT_ROOT, 'partnership', 'detail', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Partnership Info ID is required');
      return apiClient<PartnershipInfo>(`/admin/partnership-info/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreatePartnershipInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      apiClient<PartnershipInfo>('/admin/partnership-info', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.partnership.list() });
    },
  });
}

export function useUpdatePartnershipInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      apiClient<PartnershipInfo>(`/admin/partnership-info/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.partnership.list() });
      queryClient.invalidateQueries({ queryKey: contentKeys.partnership.detail(variables.id) });
    },
  });
}

export function useDeletePartnershipInfoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/partnership-info/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.partnership.list() });
    },
  });
}

// ============================================================================
// Market Value Hooks
// ============================================================================

export function useAdminMarketValue() {
  return useQuery<MarketValueResponse>({
    queryKey: contentKeys.marketValue.current(),
    queryFn: () => apiClient<MarketValueResponse>('/admin/market-value'),
    placeholderData: keepPreviousData,
  });
}

export function useAdminMarketValueDetail(id?: string | null) {
  return useQuery<MarketValue>({
    queryKey: id ? contentKeys.marketValue.detail(id) : [...COMPANY_CONTENT_ROOT, 'marketValue', 'detail', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Market Value ID is required');
      return apiClient<MarketValue>(`/admin/market-value/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateMarketValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      apiClient<MarketValue>('/admin/market-value', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.marketValue.current() });
    },
  });
}

export function useUpdateMarketValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      apiClient<MarketValue>(`/admin/market-value/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.marketValue.current() });
      queryClient.invalidateQueries({ queryKey: contentKeys.marketValue.detail(variables.id) });
    },
  });
}

export function useDeleteMarketValueMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/market-value/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.marketValue.current() });
    },
  });
}

// ============================================================================
// Company Goals Hooks
// ============================================================================

export function useAdminCompanyGoals() {
  return useQuery<CompanyGoalListResponse>({
    queryKey: contentKeys.goals.list(),
    queryFn: () => apiClient<CompanyGoalListResponse>('/admin/company-goals'),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCompanyGoalDetail(id?: string | null) {
  return useQuery<CompanyGoal>({
    queryKey: id ? contentKeys.goals.detail(id) : [...COMPANY_CONTENT_ROOT, 'goals', 'detail', 'empty'],
    queryFn: () => {
      if (!id) throw new Error('Goal ID is required');
      return apiClient<CompanyGoal>(`/admin/company-goals/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useCreateCompanyGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) =>
      apiClient<CompanyGoal>('/admin/company-goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.goals.list() });
    },
  });
}

export function useUpdateCompanyGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) =>
      apiClient<CompanyGoal>(`/admin/company-goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: contentKeys.goals.list() });
      queryClient.invalidateQueries({ queryKey: contentKeys.goals.detail(variables.id) });
    },
  });
}

export function useDeleteCompanyGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/company-goals/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentKeys.goals.list() });
    },
  });
}

// ============================================================================
// Image Presign Hook (Shared)
// ============================================================================

export function useCompanyContentImagePresignMutation() {
  return useMutation({
    mutationFn: (payload: { fileName: string; fileType: string; fileSize: number; purpose?: 'icon' | 'logo' }) =>
      apiClient<ImagePresignResponse>('/admin/company-content/images/presign', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  });
}


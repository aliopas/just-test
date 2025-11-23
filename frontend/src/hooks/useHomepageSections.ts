import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

export type HomepageSectionType =
  | 'company_profile'
  | 'business_model'
  | 'financial_resources'
  | 'company_strengths'
  | 'become_partner'
  | 'market_value'
  | 'company_goals';

export type HomepageSection = {
  id: string;
  type: HomepageSectionType;
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  iconSvg: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HomepageSectionsResponse = {
  sections: HomepageSection[];
};

const HOMEPAGE_SECTIONS_ROOT = ['homepageSections'] as const;

export function useHomepageSections() {
  return useQuery<HomepageSectionsResponse>({
    queryKey: [...HOMEPAGE_SECTIONS_ROOT, 'list'],
    queryFn: () => {
      return apiClient<HomepageSectionsResponse>('/public/homepage-sections', {
        auth: false,
      });
    },
  });
}


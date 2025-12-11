import type {
  InvestorLanguage,
  InvestorRiskProfile,
} from './investor';

export type AdminUserStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'deactivated';

export type AdminUserKycStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | null;

export interface AdminUser {
  id: string;
  email: string;
  phone: string | null;
  phoneCountryCode: string | null;
  role: string | null;
  status: AdminUserStatus;
  createdAt: string;
  updatedAt: string;
  roles: string[];
  roleNames: string[];
  fullName: string | null;
  kycStatus: AdminUserKycStatus;
  profileLanguage: InvestorLanguage | null;
  riskProfile: InvestorRiskProfile;
  city: string | null;
  kycUpdatedAt: string | null;
  profileUpdatedAt: string | null;
  idType: string | null;
  nationality: string | null;
  residencyCountry: string | null;
  communicationPreferences: Record<string, boolean>;
}

export interface AdminUserListMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  meta: AdminUserListMeta;
}

export interface AdminUserFilters {
  page?: number;
  status?: AdminUserStatus | 'all';
  kycStatus?: Exclude<AdminUserKycStatus, null> | 'all';
  search?: string;
}

export interface AdminCreateUserPayload {
  email: string;
  phone?: string | null;
  fullName?: string | null;
  role: string;
  status: AdminUserStatus;
  locale: InvestorLanguage;
  sendInvite: boolean;
  temporaryPassword: string;
  investorProfile?: {
    language?: InvestorLanguage;
    idType?: string;
    idNumber?: string;
    nationality?: string;
    residencyCountry?: string;
    city?: string;
    kycStatus?: Exclude<AdminUserKycStatus, null>;
    riskProfile?: InvestorRiskProfile;
  };
}

export interface AdminUpdateUserPayload {
  email?: string;
  phone?: string | null;
  fullName?: string | null;
  role?: string;
  status?: AdminUserStatus;
  locale?: InvestorLanguage;
  investorProfile?: {
    language?: InvestorLanguage;
    idType?: string;
    idNumber?: string;
    nationality?: string;
    residencyCountry?: string;
    city?: string;
    kycStatus?: Exclude<AdminUserKycStatus, null>;
    riskProfile?: InvestorRiskProfile;
  };
}



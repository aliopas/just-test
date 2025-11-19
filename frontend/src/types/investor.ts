export type InvestorLanguage = 'ar' | 'en';
export type InvestorIdType = 'national_id' | 'iqama' | 'passport' | 'other';
export type InvestorKycStatus =
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected';
export type InvestorRiskProfile =
  | 'conservative'
  | 'balanced'
  | 'aggressive'
  | null;

export type CommunicationChannels = 'email' | 'sms' | 'push';

export type CommunicationPreferences = Record<CommunicationChannels, boolean>;

export interface InvestorProfile {
  userId: string;
  fullName: string | null;
  preferredName: string | null;
  idType: InvestorIdType | null;
  idNumber: string | null;
  idExpiry: string | null;
  nationality: string | null;
  residencyCountry: string | null;
  city: string | null;
  kycStatus: InvestorKycStatus;
  kycUpdatedAt: string | null;
  language: InvestorLanguage;
  communicationPreferences: CommunicationPreferences;
  riskProfile: InvestorRiskProfile;
  kycDocuments: string[] | null;
  createdAt: string;
  updatedAt: string;
  email: string | null;
  phone: string | null;
  userStatus: string | null;
  userCreatedAt: string | null;
}

export interface InvestorProfileResponse {
  message: string;
  profile: InvestorProfile | null;
}

export interface InvestorProfileUpdateRequest {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  preferredName?: string | null;
  idType?: InvestorIdType | null;
  idNumber?: string | null;
  idExpiry?: string | null;
  nationality?: string | null;
  residencyCountry?: string | null;
  city?: string | null;
  kycStatus?: InvestorKycStatus;
  language?: InvestorLanguage;
  communicationPreferences?: Partial<CommunicationPreferences>;
  riskProfile?: InvestorRiskProfile;
  kycDocuments?: string[] | null;
}




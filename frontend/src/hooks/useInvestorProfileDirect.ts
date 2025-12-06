/**
 * Hook لجلب وتحديث ملف المستثمر مباشرة من Supabase
 * بديل لـ useInvestorProfile الذي يستخدم API backend
 */

import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  InvestorProfile,
  InvestorProfileUpdateRequest,
  InvestorIdType,
  InvestorKycStatus,
  InvestorLanguage,
  InvestorRiskProfile,
  CommunicationPreferences,
} from '../types/investor';

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  preferred_name: string | null;
  language: 'ar' | 'en' | null;
  id_type: string | null;
  id_number: string | null;
  id_expiry: string | null;
  nationality: string | null;
  residency_country: string | null;
  city: string | null;
  kyc_status: string | null;
  kyc_updated_at: string | null;
  risk_profile: string | null;
  communication_preferences: Record<string, boolean> | null;
  kyc_documents: unknown;
  created_at: string;
  updated_at: string;
};

// Helper functions to convert string types to typed enums
function toInvestorIdType(value: string | null): InvestorIdType | null {
  if (!value) return null;
  const validTypes: InvestorIdType[] = ['national_id', 'iqama', 'passport', 'other'];
  return validTypes.includes(value as InvestorIdType) ? (value as InvestorIdType) : null;
}

function toInvestorKycStatus(value: string | null): InvestorKycStatus {
  if (!value) return 'pending';
  const validStatuses: InvestorKycStatus[] = ['pending', 'in_review', 'approved', 'rejected'];
  return validStatuses.includes(value as InvestorKycStatus) ? (value as InvestorKycStatus) : 'pending';
}

function toInvestorLanguage(value: string | null): InvestorLanguage {
  if (!value) return 'ar';
  return value === 'en' ? 'en' : 'ar';
}

function toInvestorRiskProfile(value: string | null): InvestorRiskProfile {
  if (!value) return null;
  const validProfiles: InvestorRiskProfile[] = ['conservative', 'balanced', 'aggressive'];
  return validProfiles.includes(value as InvestorRiskProfile) ? (value as InvestorRiskProfile) : null;
}

function toCommunicationPreferences(
  value: Record<string, boolean> | null
): CommunicationPreferences {
  if (!value) {
    return { email: true, sms: false, push: false };
  }
  return {
    email: value.email ?? true,
    sms: value.sms ?? false,
    push: value.push ?? false,
  };
}

function toKycDocuments(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (value && typeof value === 'string') {
    return [value];
  }
  return null;
}

async function fetchInvestorProfileDirect(): Promise<InvestorProfile | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لعرض الملف الشخصي');
  }

  const userId = authData.user.id;
  const email = authData.user.email ?? null;

  // Fetch user record from users table for phone, status, and created_at
  const { data: userRecord } = await supabase
    .from('users')
    .select('phone, phone_cc, status, created_at')
    .eq('id', userId)
    .maybeSingle<{
      phone: string | null;
      phone_cc: string | null;
      status: string | null;
      created_at: string;
    }>();

  // Don't fail if user record doesn't exist - it might be created later
  const phone = userRecord?.phone 
    ? (userRecord.phone_cc ? `${userRecord.phone_cc}${userRecord.phone}` : userRecord.phone)
    : null;
  const userStatus = userRecord?.status ?? null;
  const userCreatedAt = userRecord?.created_at ?? null;

  // Fetch profile
  const { data, error } = await supabase
    .from('investor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    // If profile doesn't exist, return null (not an error)
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`خطأ في جلب الملف الشخصي: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  // Transform to InvestorProfile format
  return {
    userId: data.user_id,
    fullName: data.full_name ?? null,
    preferredName: data.preferred_name ?? null,
    language: toInvestorLanguage(data.language),
    idType: toInvestorIdType(data.id_type),
    idNumber: data.id_number ?? null,
    idExpiry: data.id_expiry ?? null,
    nationality: data.nationality ?? null,
    residencyCountry: data.residency_country ?? null,
    city: data.city ?? null,
    kycStatus: toInvestorKycStatus(data.kyc_status),
    kycUpdatedAt: data.kyc_updated_at ?? null,
    riskProfile: toInvestorRiskProfile(data.risk_profile),
    communicationPreferences: toCommunicationPreferences(data.communication_preferences),
    kycDocuments: toKycDocuments(data.kyc_documents),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    email: email,
    phone: phone,
    userStatus: userStatus,
    userCreatedAt: userCreatedAt,
  };
}

async function updateInvestorProfileDirect(
  payload: InvestorProfileUpdateRequest
): Promise<InvestorProfile> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لتحديث الملف الشخصي');
  }

  const userId = authData.user.id;
  const email = authData.user.email ?? null;

  // If phone is being updated, update it in the users table
  if (payload.phone !== undefined) {
    // Parse phone with country code if provided (format: +966XXXXXXXXX or 966XXXXXXXXX)
    const phoneValue = payload.phone;
    let parsedPhone = phoneValue;
    let parsedPhoneCc = null;
    
    if (phoneValue && phoneValue.startsWith('+')) {
      // Extract country code (assuming Saudi Arabia +966)
      if (phoneValue.startsWith('+966')) {
        parsedPhoneCc = '+966';
        parsedPhone = phoneValue.substring(4);
      } else {
        // Try to extract country code (first 1-3 digits after +)
        const match = phoneValue.match(/^\+(\d{1,3})(.+)$/);
        if (match) {
          parsedPhoneCc = `+${match[1]}`;
          parsedPhone = match[2];
        }
      }
    } else if (phoneValue && phoneValue.startsWith('966')) {
      parsedPhoneCc = '+966';
      parsedPhone = phoneValue.substring(3);
    }

    // Update users table
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        phone: parsedPhone || null,
        phone_cc: parsedPhoneCc || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (userUpdateError) {
      console.warn('Failed to update phone in users table:', userUpdateError);
      // Don't fail the whole operation, just log the warning
    }
  }

  // Fetch user record for phone, status and created_at (after potential update)
  const { data: userRecord } = await supabase
    .from('users')
    .select('phone, phone_cc, status, created_at')
    .eq('id', userId)
    .maybeSingle<{
      phone: string | null;
      phone_cc: string | null;
      status: string | null;
      created_at: string;
    }>();

  const phone = userRecord?.phone 
    ? (userRecord.phone_cc ? `${userRecord.phone_cc}${userRecord.phone}` : userRecord.phone)
    : null;
  const userStatus = userRecord?.status ?? null;
  const userCreatedAt = userRecord?.created_at ?? null;

  // Prepare update data (don't update email/phone in investor_profiles - they're in users table)
  const updateData: Partial<ProfileRow> = {};
  
  if (payload.fullName !== undefined) updateData.full_name = payload.fullName;
  if (payload.preferredName !== undefined) updateData.preferred_name = payload.preferredName;
  if (payload.language !== undefined) updateData.language = payload.language;
  if (payload.idType !== undefined) updateData.id_type = payload.idType ?? null;
  if (payload.idNumber !== undefined) updateData.id_number = payload.idNumber;
  if (payload.idExpiry !== undefined) updateData.id_expiry = payload.idExpiry;
  if (payload.nationality !== undefined) updateData.nationality = payload.nationality;
  if (payload.residencyCountry !== undefined) updateData.residency_country = payload.residencyCountry;
  if (payload.city !== undefined) updateData.city = payload.city;
  if (payload.riskProfile !== undefined) updateData.risk_profile = payload.riskProfile ?? null;
  if (payload.kycStatus !== undefined) updateData.kyc_status = payload.kycStatus;
  if (payload.communicationPreferences !== undefined) {
    // Merge with existing preferences to ensure all channels are present
    updateData.communication_preferences = {
      email: payload.communicationPreferences.email ?? true,
      sms: payload.communicationPreferences.sms ?? false,
      push: payload.communicationPreferences.push ?? false,
    } as Record<string, boolean>;
  }
  if (payload.kycDocuments !== undefined) {
    updateData.kyc_documents = payload.kycDocuments;
  }

  // Use upsert to create if doesn't exist, update if exists
  const { data, error } = await supabase
    .from('investor_profiles')
    .upsert(
      {
        user_id: userId,
        ...updateData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )
    .select('*')
    .single<ProfileRow>();

  if (error) {
    throw new Error(`خطأ في تحديث الملف الشخصي: ${error.message}`);
  }

  if (!data) {
    throw new Error('فشل تحديث الملف الشخصي');
  }

  // Transform to InvestorProfile format
  return {
    userId: data.user_id,
    fullName: data.full_name ?? null,
    preferredName: data.preferred_name ?? null,
    language: toInvestorLanguage(data.language),
    idType: toInvestorIdType(data.id_type),
    idNumber: data.id_number ?? null,
    idExpiry: data.id_expiry ?? null,
    nationality: data.nationality ?? null,
    residencyCountry: data.residency_country ?? null,
    city: data.city ?? null,
    kycStatus: toInvestorKycStatus(data.kyc_status),
    kycUpdatedAt: data.kyc_updated_at ?? null,
    riskProfile: toInvestorRiskProfile(data.risk_profile),
    communicationPreferences: toCommunicationPreferences(data.communication_preferences),
    kycDocuments: toKycDocuments(data.kyc_documents),
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    email: email,
    phone: phone,
    userStatus: userStatus,
    userCreatedAt: userCreatedAt,
  };
}

export const investorProfileDirectQueryKey = ['investor-profile-direct'];

export function useInvestorProfileDirect() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: investorProfileDirectQueryKey,
    queryFn: fetchInvestorProfileDirect,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    enabled: typeof window !== 'undefined', // Only on client
  });

  const mutation = useMutation({
    mutationFn: updateInvestorProfileDirect,
    onSuccess: profile => {
      queryClient.setQueryData(investorProfileDirectQueryKey, profile);
    },
  });

  return useMemo(
    () => ({
      profile: query.data ?? null,
      isLoading: query.isPending,
      isFetching: query.isFetching,
      isError: query.isError,
      error: query.error,
      refetch: query.refetch,
      updateProfile: mutation.mutateAsync,
      isUpdating: mutation.isPending,
      updateError: mutation.error,
      resetUpdate: mutation.reset,
    }),
    [mutation, query]
  );
}

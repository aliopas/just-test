import { useMemo } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient, ApiError } from '../utils/api-client';
import type {
  InvestorProfile,
  InvestorProfileResponse,
  InvestorProfileUpdateRequest,
} from '../types/investor';

export const investorProfileQueryKey = ['investor-profile'];

async function fetchInvestorProfile(): Promise<InvestorProfile | null> {
  try {
    const response = await apiClient<InvestorProfileResponse>(
      '/investor/profile',
      {
        method: 'GET',
      }
    );
    return response.profile;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function patchInvestorProfile(
  payload: InvestorProfileUpdateRequest
): Promise<InvestorProfile> {
  const response = await apiClient<InvestorProfileResponse>(
    '/investor/profile',
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );

  if (!response.profile) {
    throw new ApiError('Profile payload missing', 500, response);
  }

  return response.profile;
}

export function useInvestorProfile() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: investorProfileQueryKey,
    queryFn: fetchInvestorProfile,
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  const mutation = useMutation({
    mutationFn: patchInvestorProfile,
    onSuccess: profile => {
      queryClient.setQueryData(investorProfileQueryKey, profile);
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



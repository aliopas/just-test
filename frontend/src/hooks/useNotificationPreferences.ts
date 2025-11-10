import { useEffect, useMemo, useState } from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  NotificationPreference,
  NotificationPreferenceResponse,
} from '../types/notification';

const QUERY_KEY = ['notificationPreferences'];

async function fetchNotificationPreferences() {
  return apiClient<NotificationPreferenceResponse>('/notifications/preferences');
}

async function updateNotificationPreferences(preferences: NotificationPreference[]) {
  return apiClient<NotificationPreferenceResponse>('/notifications/preferences', {
    method: 'PATCH',
    body: JSON.stringify(preferences),
  });
}

export function useNotificationPreferences() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<NotificationPreference[]>([]);

  const query = useQuery<NotificationPreferenceResponse>({
    queryKey: QUERY_KEY,
    queryFn: fetchNotificationPreferences,
  });

  useEffect(() => {
    if (query.data?.preferences) {
      setDraft(query.data.preferences);
    }
  }, [query.data?.preferences]);

  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: data => {
      setDraft(data.preferences);
      queryClient.setQueryData<NotificationPreferenceResponse>(QUERY_KEY, data);
    },
  });

  const status = useMemo(
    () => ({
      isLoading: query.isLoading,
      isFetching: query.isFetching,
      isSaving: mutation.isPending,
      isError: query.isError || mutation.isError,
      error: mutation.error ?? query.error ?? null,
    }),
    [
      query.isLoading,
      query.isFetching,
      query.isError,
      query.error,
      mutation.isPending,
      mutation.isError,
      mutation.error,
    ]
  );

  return {
    preferences: draft,
    setPreferences: setDraft,
    savePreferences: mutation.mutate,
    query,
    mutation,
    status,
  };
}


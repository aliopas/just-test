import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

export interface CreateFeedbackRequestPayload {
  subject: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface CreateFeedbackRequestResponse {
  requestId: string;
  requestNumber: string;
  status: string;
  type: 'feedback';
}

async function postFeedbackRequest(
  payload: CreateFeedbackRequestPayload
): Promise<CreateFeedbackRequestResponse> {
  return apiClient<CreateFeedbackRequestResponse>(
    '/investor/requests/feedback',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export function useCreateFeedbackRequest() {
  return useMutation({
    mutationFn: postFeedbackRequest,
  });
}


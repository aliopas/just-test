import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

export type FeedbackCategory = 'suggestion' | 'complaint' | 'question' | 'other';
export type FeedbackPriority = 'low' | 'medium' | 'high';

export interface CreateFeedbackRequestPayload {
  subject: string;
  category: FeedbackCategory;
  description: string;
  priority?: FeedbackPriority;
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
  return apiClient<CreateFeedbackRequestResponse>('/investor/requests/feedback', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function useCreateFeedbackRequest() {
  return useMutation({
    mutationFn: postFeedbackRequest,
  });
}


import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  CreateRequestPayload,
  CreateRequestResponse,
} from '../types/request';

async function postRequest(payload: CreateRequestPayload) {
  const body: Record<string, unknown> = {
    type: payload.type,
  };

  // Only include amount and currency if they are provided
  if (payload.amount !== undefined && payload.amount !== null) {
    body.amount = payload.amount;
  }
  if (payload.currency !== undefined && payload.currency !== null) {
    body.currency = payload.currency;
  }

  // Include optional fields only if they are provided
  if (payload.targetPrice !== undefined && payload.targetPrice !== null) {
    body.targetPrice = payload.targetPrice;
  }
  if (payload.expiryAt !== undefined && payload.expiryAt !== null) {
    body.expiryAt = payload.expiryAt;
  }
  if (payload.notes !== undefined && payload.notes !== null) {
    body.notes = payload.notes;
  }
  if (payload.metadata !== undefined && payload.metadata !== null) {
    body.metadata = payload.metadata;
  }
  if (payload.projectId !== undefined && payload.projectId !== null && payload.projectId !== '') {
    body.projectId = payload.projectId;
  }

  return apiClient<CreateRequestResponse>('/investor/requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function useCreateRequest() {
  return useMutation({
    mutationFn: postRequest,
  });
}



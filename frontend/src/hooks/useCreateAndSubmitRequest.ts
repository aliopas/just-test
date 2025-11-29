import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  CreateRequestPayload,
  CreateRequestResponse,
} from '../types/request';

async function createAndSubmitRequest(payload: CreateRequestPayload) {
  // First create the request
  const createBody: Record<string, unknown> = {
    type: payload.type,
  };
  
  // Only include amount and currency if they are defined
  if (payload.amount !== undefined && payload.amount !== null) {
    createBody.amount = payload.amount;
  }
  if (payload.currency !== undefined && payload.currency !== null) {
    createBody.currency = payload.currency;
  }
  if (payload.targetPrice !== undefined && payload.targetPrice !== null) {
    createBody.targetPrice = payload.targetPrice;
  }
  if (payload.expiryAt !== undefined && payload.expiryAt !== null) {
    createBody.expiryAt = payload.expiryAt;
  }
  if (payload.notes !== undefined && payload.notes !== null) {
    createBody.notes = payload.notes;
  }

  const createResult = await apiClient<CreateRequestResponse>('/investor/requests', {
    method: 'POST',
    body: JSON.stringify(createBody),
  });

  // Then submit it immediately
  await apiClient(`/investor/requests/${createResult.requestId}/submit`, {
    method: 'POST',
  });

  return createResult;
}

export function useCreateAndSubmitRequest() {
  return useMutation({
    mutationFn: createAndSubmitRequest,
  });
}


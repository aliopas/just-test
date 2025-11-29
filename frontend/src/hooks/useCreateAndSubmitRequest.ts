import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  CreateRequestPayload,
  CreateRequestResponse,
} from '../types/request';

async function createAndSubmitRequest(payload: CreateRequestPayload) {
  // First create the request
  const createBody = {
    type: payload.type,
    amount: payload.amount,
    currency: payload.currency,
    targetPrice: payload.targetPrice ?? undefined,
    expiryAt: payload.expiryAt ?? undefined,
    notes: payload.notes ?? undefined,
  };

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


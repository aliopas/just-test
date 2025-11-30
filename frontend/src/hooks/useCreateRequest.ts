import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type {
  CreateRequestPayload,
  CreateRequestResponse,
} from '../types/request';

async function postRequest(payload: CreateRequestPayload) {
  const body = {
    type: payload.type,
    amount: payload.amount,
    currency: payload.currency,
    targetPrice: payload.targetPrice ?? undefined,
    expiryAt: payload.expiryAt ?? undefined,
    notes: payload.notes ?? undefined,
    metadata: payload.metadata ?? undefined,
  };

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



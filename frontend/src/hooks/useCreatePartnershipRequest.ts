import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

export interface CreatePartnershipRequestPayload {
  projectId?: string;
  proposedAmount?: number;
  partnershipPlan?: string;
  notes?: string;
}

export interface CreatePartnershipRequestResponse {
  requestId: string;
  requestNumber: string;
  status: string;
  type: 'partnership';
}

async function postPartnershipRequest(
  payload: CreatePartnershipRequestPayload
): Promise<CreatePartnershipRequestResponse> {
  return apiClient<CreatePartnershipRequestResponse>(
    '/investor/requests/partnership',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export function useCreatePartnershipRequest() {
  return useMutation({
    mutationFn: postPartnershipRequest,
  });
}


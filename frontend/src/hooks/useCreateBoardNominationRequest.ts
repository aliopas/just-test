import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

export interface CreateBoardNominationRequestPayload {
  cvSummary: string;
  experience: string;
  motivations: string;
  qualifications?: string;
  notes?: string;
}

export interface CreateBoardNominationRequestResponse {
  requestId: string;
  requestNumber: string;
  status: string;
  type: 'board_nomination';
}

async function postBoardNominationRequest(
  payload: CreateBoardNominationRequestPayload
): Promise<CreateBoardNominationRequestResponse> {
  return apiClient<CreateBoardNominationRequestResponse>(
    '/investor/requests/board-nomination',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export function useCreateBoardNominationRequest() {
  return useMutation({
    mutationFn: postBoardNominationRequest,
  });
}


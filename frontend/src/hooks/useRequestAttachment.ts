import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

export interface RequestAttachmentPresignInput {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface RequestAttachmentPresignResponse {
  attachmentId: string;
  bucket: string;
  storageKey: string;
  uploadUrl: string;
  token: string | null;
  path: string;
  headers: {
    'Content-Type': string;
    'x-upsert': string;
  };
}

async function presignAttachment(
  requestId: string,
  input: RequestAttachmentPresignInput
): Promise<RequestAttachmentPresignResponse> {
  return apiClient<RequestAttachmentPresignResponse>(
    `/investor/requests/${requestId}/files/presign`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
}

export function useRequestAttachmentPresign(requestId: string | null) {
  return useMutation({
    mutationFn: (input: RequestAttachmentPresignInput) => {
      if (!requestId) {
        throw new Error('Request ID is required');
      }
      return presignAttachment(requestId, input);
    },
    enabled: !!requestId,
  });
}


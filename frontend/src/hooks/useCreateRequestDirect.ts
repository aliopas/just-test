/**
 * Hook لإنشاء طلب جديد مباشرة من Supabase
 * بديل لـ useCreateRequest الذي يستخدم API backend
 * 
 * ملاحظة: هذا يتطلب استدعاء function في Supabase لإنشاء request_number
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  CreateRequestPayload,
  CreateRequestResponse,
} from '../types/request';

async function createRequestDirect(payload: CreateRequestPayload): Promise<CreateRequestResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Get current user
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('يجب تسجيل الدخول لإنشاء طلب');
  }

  const userId = authData.user.id;

  // Prepare request data
  const requestData: Record<string, unknown> = {
    user_id: userId,
    type: payload.type,
    status: 'draft',
  };

  // Only include amount and currency if they are provided and valid
  // For non-financial requests (partnership, board_nomination, feedback), don't include amount
  if (payload.type === 'buy' || payload.type === 'sell') {
    if (payload.amount !== undefined && payload.amount !== null && payload.amount > 0) {
      requestData.amount = payload.amount;
    }
    if (payload.currency !== undefined && payload.currency !== null) {
      requestData.currency = payload.currency;
    }
  }
  // For non-financial requests, explicitly set amount to NULL to avoid constraint violation
  else {
    requestData.amount = null;
    requestData.currency = null;
  }

  // Include optional fields
  if (payload.targetPrice !== undefined && payload.targetPrice !== null) {
    requestData.target_price = payload.targetPrice;
  }
  if (payload.expiryAt !== undefined && payload.expiryAt !== null) {
    requestData.expiry_at = payload.expiryAt;
  }
  if (payload.notes !== undefined && payload.notes !== null) {
    requestData.notes = payload.notes;
  }
  if (payload.metadata !== undefined && payload.metadata !== null) {
    requestData.metadata = payload.metadata;
  }
  if (payload.projectId !== undefined && payload.projectId !== null && payload.projectId !== '') {
    requestData.project_id = payload.projectId;
  }

  // Insert request (trigger will generate request_number automatically)
  const { data: request, error: requestError } = await supabase
    .from('requests')
    .insert(requestData)
    .select('id, request_number, status')
    .single();

  if (requestError) {
    throw new Error(`خطأ في إنشاء الطلب: ${requestError.message}`);
  }

  if (!request) {
    throw new Error('فشل إنشاء الطلب');
  }

  // Handle file uploads if provided
  if (payload.documents && payload.documents.length > 0) {
    // Upload files to storage
    const uploadPromises = payload.documents.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${request.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `request-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('request-attachments')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`خطأ في رفع الملف ${file.name}: ${uploadError.message}`);
      }

      // Create attachment record
      const { error: attachmentError } = await supabase
        .from('attachments')
        .insert({
          request_id: request.id,
          filename: file.name,
          mime_type: file.type,
          size: file.size,
          storage_key: filePath,
          category: 'general',
          metadata: {},
        });

      if (attachmentError) {
        throw new Error(`خطأ في حفظ معلومات الملف ${file.name}: ${attachmentError.message}`);
      }
    });

    await Promise.all(uploadPromises);
  }

  // Update status to 'submitted' (all new requests should be submitted, not draft)
  const { error: updateError } = await supabase
    .from('requests')
    .update({ status: 'submitted' })
    .eq('id', request.id);

  if (updateError) {
    console.warn('Failed to update request status to submitted:', updateError);
  }

  return {
    requestId: request.id,
    requestNumber: request.request_number,
    status: request.status,
  };
}

export function useCreateRequestDirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRequestDirect,
    onSuccess: () => {
      // Invalidate investor requests list
      queryClient.invalidateQueries({ queryKey: ['investorRequestsDirect'] });
      queryClient.invalidateQueries({ queryKey: ['investorDashboardDirect'] });
    },
  });
}

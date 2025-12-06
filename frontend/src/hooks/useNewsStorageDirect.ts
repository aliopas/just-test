/**
 * Hooks لرفع الصور والمرفقات مباشرة إلى Supabase Storage
 * بديل لـ useNewsImagePresignMutation و useNewsAttachmentPresignMutation
 */

import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type {
  NewsImagePresignResponse,
  NewsAttachmentPresignResponse,
} from '../types/news';

// Upload image directly to Supabase Storage
async function uploadNewsImageDirect(input: {
  fileName: string;
  fileType: string;
  fileSize: number;
  file: File;
}): Promise<NewsImagePresignResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const fileExt = input.fileName.split('.').pop();
  const fileName = `news/images/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `news-images/${fileName}`;

  // Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('news-images')
    .upload(filePath, input.file, {
      contentType: input.fileType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`خطأ في رفع الصورة: ${uploadError.message}`);
  }

  // Get public URL or signed URL
  const { data: urlData } = await supabase.storage
    .from('news-images')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  return {
    bucket: 'news-images',
    storageKey: filePath,
    uploadUrl: urlData?.signedUrl || '',
    token: null,
    headers: {},
    path: filePath,
  };
}

// Upload attachment directly to Supabase Storage
async function uploadNewsAttachmentDirect(input: {
  fileName: string;
  fileType: string;
  fileSize: number;
  file: File;
}): Promise<NewsAttachmentPresignResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  const fileExt = input.fileName.split('.').pop();
  const fileName = `news/attachments/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `news-attachments/${fileName}`;

  // Upload file
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('news-attachments')
    .upload(filePath, input.file, {
      contentType: input.fileType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`خطأ في رفع المرفق: ${uploadError.message}`);
  }

  // Create attachment record (if needed)
  // For now, just return the storage info
  const attachmentId = crypto.randomUUID();

  // Get public URL or signed URL
  const { data: urlData } = await supabase.storage
    .from('news-attachments')
    .createSignedUrl(filePath, 3600); // 1 hour expiry

  return {
    attachmentId,
    bucket: 'news-attachments',
    storageKey: filePath,
    uploadUrl: urlData?.signedUrl || '',
    token: null,
    headers: {},
    path: filePath,
  };
}

// For backward compatibility, create presign-like hooks
export function useNewsImagePresignMutationDirect() {
  return useMutation({
    mutationFn: async (input: {
      fileName: string;
      fileType: string;
      fileSize: number;
      file: File;
    }) => uploadNewsImageDirect(input),
  });
}

export function useNewsAttachmentPresignMutationDirect() {
  return useMutation({
    mutationFn: async (input: {
      fileName: string;
      fileType: string;
      fileSize: number;
      file: File;
    }) => uploadNewsAttachmentDirect(input),
  });
}

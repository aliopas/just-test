/**
 * Hook لتسجيل حساب جديد مباشرة من Supabase
 * بديل لـ useRegister الذي يستخدم API backend
 */

import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

type RegisterPayload = {
  email: string;
  fullName: string;
  phone?: string;
  company?: string;
  message?: string;
  language?: 'ar' | 'en';
};

type RegisterResponse = {
  request: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  };
  message: string;
};

async function registerRequestDirect(payload: RegisterPayload): Promise<RegisterResponse> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error('Supabase client غير متاح');
  }

  // Insert signup request
  const { data: request, error: requestError } = await supabase
    .from('investor_signup_requests')
    .insert({
      email: payload.email.trim().toLowerCase(),
      full_name: payload.fullName,
      phone: payload.phone || null,
      company: payload.company || null,
      message: payload.message || null,
      requested_role: 'investor',
      status: 'pending',
    })
    .select('id, status, created_at')
    .single();

  if (requestError) {
    throw new Error(`خطأ في إنشاء طلب التسجيل: ${requestError.message}`);
  }

  if (!request) {
    throw new Error('فشل إنشاء طلب التسجيل');
  }

  return {
    request: {
      id: request.id,
      status: request.status as 'pending' | 'approved' | 'rejected',
      createdAt: request.created_at,
    },
    message: 'تم إرسال طلب التسجيل بنجاح. سيتم مراجعته من قبل الإدارة.',
  };
}

export function useRegisterDirect() {
  return useMutation({
    mutationFn: registerRequestDirect,
  });
}

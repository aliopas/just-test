/**
 * useUpdatePassword Hook
 * 
 * Hook لتحديث كلمة المرور بعد النقر على رابط إعادة التعيين
 */

import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import { useRouter } from 'next/navigation';
import type { AuthError } from '@supabase/supabase-js';

type UpdatePasswordCredentials = {
  password: string;
  confirmPassword: string;
};

type UpdatePasswordError = {
  code: string;
  message: string;
};

/**
 * Hook لتحديث كلمة المرور
 */
export function useUpdatePassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: UpdatePasswordCredentials) => {
      const supabase = getSupabaseBrowserClient();
      
      if (!supabase) {
        throw new Error('Supabase client غير متاح. يرجى التحقق من الإعدادات.');
      }

      // التحقق من تطابق كلمات المرور
      if (credentials.password !== credentials.confirmPassword) {
        throw {
          code: 'PASSWORD_MISMATCH',
          message: 'كلمات المرور غير متطابقة.',
        } as UpdatePasswordError;
      }

      // التحقق من قوة كلمة المرور
      if (credentials.password.length < 8) {
        throw {
          code: 'WEAK_PASSWORD',
          message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
        } as UpdatePasswordError;
      }

      // تحديث كلمة المرور
      const { data, error } = await supabase.auth.updateUser({
        password: credentials.password,
      });

      if (error) {
        console.error('[UpdatePassword] Supabase Auth Error:', {
          status: error.status,
          message: error.message,
          name: error.name,
        });
        
        const updateError: UpdatePasswordError = {
          code: error.status?.toString() || 'UPDATE_FAILED',
          message: getErrorMessage(error),
        };
        throw updateError;
      }

      if (!data.user) {
        throw {
          code: 'UPDATE_FAILED',
          message: 'فشل تحديث كلمة المرور. لم يتم العثور على المستخدم.',
        } as UpdatePasswordError;
      }

      return {
        success: true,
        user: data.user,
      };
    },
    onSuccess: () => {
      console.log('[UpdatePassword] تم تحديث كلمة المرور بنجاح');
      
      // التوجيه إلى صفحة تسجيل الدخول بعد النجاح
      setTimeout(() => {
        router.push('/login?passwordUpdated=true');
      }, 1500);
    },
    onError: (error: UpdatePasswordError | Error) => {
      console.error('[UpdatePassword] خطأ في تحديث كلمة المرور:', error);
    },
  });
}

/**
 * تحويل رسائل خطأ Supabase إلى رسائل مفهومة بالعربية والإنجليزية
 */
function getErrorMessage(error: AuthError): string {
  const status = error.status;
  const message = error.message.toLowerCase();
  const errorCode = (error as any).code?.toLowerCase() || '';

  console.log('[UpdatePassword] Error details:', {
    status,
    message: error.message,
    errorCode,
  });

  if (status === 400) {
    if (message.includes('password') && message.includes('weak')) {
      return 'كلمة المرور ضعيفة. يرجى استخدام كلمة مرور أقوى.';
    }
    if (message.includes('session') || message.includes('token')) {
      return 'انتهت صلاحية رابط إعادة التعيين. يرجى طلب رابط جديد.';
    }
    return 'بيانات غير صحيحة. يرجى المحاولة مرة أخرى.';
  }

  if (status === 401) {
    return 'انتهت صلاحية رابط إعادة التعيين. يرجى طلب رابط جديد.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
  }

  // رسالة افتراضية
  return error.message || 'حدث خطأ أثناء تحديث كلمة المرور. يرجى المحاولة مرة أخرى.';
}

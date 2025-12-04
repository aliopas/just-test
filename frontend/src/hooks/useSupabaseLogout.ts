/**
 * useSupabaseLogout Hook
 * 
 * Hook مبسط لتسجيل الخروج باستخدام Supabase Auth مباشرة
 */

import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Hook لتسجيل الخروج باستخدام Supabase Auth مباشرة
 */
export function useSupabaseLogout() {
  const { setUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseBrowserClient();
      
      if (!supabase) {
        throw new Error('Supabase client غير متاح.');
      }

      // تسجيل الخروج من Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message || 'فشل تسجيل الخروج');
      }

      // تنظيف البيانات المحلية
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.clear();
      }

      return { success: true };
    },
    onSuccess: () => {
      // تحديث حالة المستخدم
      setUser(null);

      console.log('[Logout] تم تسجيل الخروج بنجاح');

      // التوجيه إلى صفحة تسجيل الدخول
      router.push('/login');
    },
    onError: (error: Error) => {
      console.error('[Logout] خطأ في تسجيل الخروج:', error);
      
      // حتى لو فشل تسجيل الخروج من Supabase، نظف البيانات المحلية
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.clear();
      }
      
      // التوجيه إلى صفحة تسجيل الدخول
      router.push('/login');
    },
  });
}


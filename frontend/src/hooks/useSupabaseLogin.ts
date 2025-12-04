/**
 * useSupabaseLogin Hook
 * 
 * Hook مبسط لتسجيل الدخول باستخدام Supabase Auth مباشرة
 * يتوافق بشكل كامل مع Supabase ويدير الجلسات تلقائياً
 */

import { useMutation } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import type { AuthError } from '@supabase/supabase-js';

type LoginCredentials = {
  email: string;
  password: string;
};

type LoginError = {
  code: string;
  message: string;
};

/**
 * Hook لتسجيل الدخول باستخدام Supabase Auth مباشرة
 */
export function useSupabaseLogin() {
  const { setUser } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const supabase = getSupabaseBrowserClient();
      
      if (!supabase) {
        throw new Error('Supabase client غير متاح. يرجى التحقق من الإعدادات.');
      }

      // تسجيل الدخول باستخدام Supabase Auth مباشرة
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password,
      });

      if (error) {
        console.error('[Login] Supabase Auth Error:', {
          status: error.status,
          message: error.message,
          name: error.name,
          email: credentials.email.trim(),
        });
        
        // تحويل Supabase error إلى شكل موحد
        const loginError: LoginError = {
          code: error.status?.toString() || 'LOGIN_FAILED',
          message: getErrorMessage(error),
        };
        throw loginError;
      }

      if (!data.user || !data.session) {
        throw {
          code: 'AUTH_FAILED',
          message: 'فشل تسجيل الدخول. لم يتم الحصول على بيانات الجلسة.',
        } as LoginError;
      }

      // الحصول على role من قاعدة البيانات
      // نستخدم fallback chain: DB role -> user_metadata -> app_metadata -> default
      let userRole: 'investor' | 'admin' = 'investor';
      
      // محاولة جلب role من قاعدة البيانات (مع معالجة الأخطاء)
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle(); // استخدام maybeSingle بدلاً من single لتجنب الأخطاء

        if (!userError && userData?.role === 'admin') {
          userRole = 'admin';
          console.log('[Login] Role from database:', userRole);
        } else if (userError) {
          console.warn('[Login] Failed to fetch role from database (RLS or other issue):', {
            error: userError.message,
            code: userError.code,
            hint: userError.hint,
          });
        }
      } catch (err) {
        console.warn('[Login] Exception fetching user role from database:', err);
      }

      // Fallback إلى metadata إذا لم نتمكن من جلب role من قاعدة البيانات
      if (userRole === 'investor') {
        const userMetadataRole = (data.user.user_metadata as { role?: string })?.role;
        const appMetadataRole = (data.user.app_metadata as { role?: string })?.role;
        
        if (userMetadataRole === 'admin' || appMetadataRole === 'admin') {
          userRole = 'admin';
          console.log('[Login] Role from metadata:', userRole);
        }
      }

      // تحديث حالة المستخدم في AuthContext
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        role: userRole,
      });

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          role: userRole,
        },
        session: data.session,
      };
    },
    onSuccess: (data) => {
      console.log('[Login] تسجيل الدخول ناجح:', {
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
      });

      // التوجيه حسب الدور بعد نجاح تسجيل الدخول
      const redirectPath = typeof window !== 'undefined' 
        ? sessionStorage.getItem('redirectAfterLogin')
        : null;

      if (redirectPath) {
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectPath);
        return;
      }

      // التوجيه الافتراضي حسب الدور
      setTimeout(() => {
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 300);
    },
    onError: (error: LoginError | Error) => {
      console.error('[Login] خطأ في تسجيل الدخول:', error);
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

  console.log('[Login] Error details:', {
    status,
    message: error.message,
    errorCode,
  });

  // رسائل خطأ شائعة
  if (status === 400) {
    if (message.includes('invalid') || message.includes('credentials') || errorCode === 'invalid_credentials') {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من أن المستخدم موجود في Supabase Auth وأن كلمة المرور صحيحة.';
    }
    if (message.includes('email')) {
      return 'البريد الإلكتروني غير صحيح.';
    }
    if (message.includes('email not confirmed') || errorCode === 'email_not_confirmed') {
      return 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول. تحقق من بريدك الإلكتروني للرسالة التأكيدية.';
    }
    if (message.includes('user not found') || errorCode === 'user_not_found') {
      return 'المستخدم غير موجود في Supabase Auth. يرجى إنشاء حساب جديد أو التحقق من البريد الإلكتروني.';
    }
    return `بيانات الدخول غير صحيحة. ${error.message || ''}`;
  }

  if (status === 401) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
  }

  if (status === 429) {
    return 'تم إجراء محاولات كثيرة. يرجى الانتظار قليلاً والمحاولة مرة أخرى.';
  }

  if (message.includes('network') || message.includes('fetch')) {
    return 'خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.';
  }

  if (message.includes('user not found')) {
    return 'المستخدم غير موجود في Supabase Auth.';
  }

  if (message.includes('email not confirmed')) {
    return 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.';
  }

  // رسالة افتراضية مع تفاصيل الخطأ
  return error.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.';
}


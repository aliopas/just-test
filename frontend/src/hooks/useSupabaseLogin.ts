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
        
        // تحويل Supabase error إلى Error instance مع خصائص إضافية
        const errorMessage = getErrorMessage(error);
        const loginError = new Error(errorMessage) as Error & LoginError;
        loginError.code = error.status?.toString() || 'LOGIN_FAILED';
        loginError.message = errorMessage;
        throw loginError;
      }

      if (!data.user || !data.session) {
        const authError = new Error('فشل تسجيل الدخول. لم يتم الحصول على بيانات الجلسة.') as Error & LoginError;
        authError.code = 'AUTH_FAILED';
        authError.message = 'فشل تسجيل الدخول. لم يتم الحصول على بيانات الجلسة.';
        throw authError;
      }

      // الحصول على role من قاعدة البيانات
      // نستخدم fallback chain: DB role column -> user_roles table -> user_metadata -> app_metadata -> default
      let userRole: 'investor' | 'admin' = 'investor';
      
      // محاولة جلب role من قاعدة البيانات (مع معالجة الأخطاء)
      try {
        // أولاً: محاولة جلب role من عمود role في جدول users
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle(); // استخدام maybeSingle بدلاً من single لتجنب الأخطاء

        if (!userError && userData?.role) {
          if (userData.role === 'admin') {
            userRole = 'admin';
            console.log('[Login] Role from database column:', userRole);
          }
        } else if (userError) {
          console.warn('[Login] Failed to fetch role from users table (RLS or other issue):', {
            error: userError.message,
            code: userError.code,
            hint: userError.hint,
          });
        }

        // ثانياً: إذا لم نجد admin في عمود role، تحقق من جدول user_roles (RBAC)
        if (userRole === 'investor') {
          try {
            const { data: userRolesData, error: rolesError } = await supabase
              .from('user_roles')
              .select(`
                roles:role_id (
                  name,
                  slug
                )
              `)
              .eq('user_id', data.user.id);

            if (!rolesError && userRolesData && userRolesData.length > 0) {
              // التحقق من وجود role 'admin' في user_roles
              const hasAdminRole = userRolesData.some((ur: any) => 
                ur.roles?.name === 'admin' || ur.roles?.slug === 'admin'
              );
              
              if (hasAdminRole) {
                userRole = 'admin';
                console.log('[Login] Role from user_roles table (RBAC):', userRole);
              }
            } else if (rolesError) {
              console.warn('[Login] Failed to fetch role from user_roles table:', {
                error: rolesError.message,
                code: rolesError.code,
              });
            }
          } catch (rolesErr) {
            console.warn('[Login] Exception fetching user roles from user_roles table:', rolesErr);
          }
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

      // Log final role determination
      console.log('[Login] Final determined role:', {
        userId: data.user.id,
        email: data.user.email,
        role: userRole,
      });

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
      // Admin → لوحة تحكم الأدمن | Investor → لوحة تحكم المستثمر
      const dashboardPath = data.user.role === 'admin' 
        ? '/admin/dashboard' 
        : '/dashboard';
      
      // استخدام replace بدلاً من push لتجنب إضافة صفحة تسجيل الدخول للتاريخ
      router.replace(dashboardPath);
    },
    onError: (error: LoginError | Error | unknown) => {
      console.error('[Login] خطأ في تسجيل الدخول:', error);
      console.error('[Login] Error type:', typeof error);
      console.error('[Login] Error instanceof Error:', error instanceof Error);
      if (error && typeof error === 'object') {
        console.error('[Login] Error keys:', Object.keys(error));
        console.error('[Login] Error details:', {
          message: (error as any).message,
          code: (error as any).code,
          stack: (error as any).stack,
        });
      }
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


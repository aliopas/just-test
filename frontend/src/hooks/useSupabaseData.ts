/**
 * Hook عام لاستخدام Supabase مباشرة لعرض البيانات
 * 
 * هذا الـ hook يسمح بجلب البيانات مباشرة من Supabase بدون الحاجة لـ API backend
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useEffect, useState } from 'react';

export interface UseSupabaseDataOptions<T> {
  /** اسم الجدول في Supabase */
  table: string;
  /** عمود أو أعمدة للترتيب (مثال: 'created_at' أو { column: 'created_at', ascending: false }) */
  orderBy?: string | { column: string; ascending?: boolean };
  /** عدد الصفوف المطلوبة (للـ pagination) */
  limit?: number;
  /** عدد الصفوف للتخطي (للـ pagination) */
  offset?: number;
  /** عمود أو أعمدة للفلترة (مثال: { column: 'status', value: 'active' }) */
  filters?: Array<{ column: string; operator?: string; value: unknown }>;
  /** الأعمدة المطلوبة (افتراضي: جميع الأعمدة) */
  select?: string;
  /** تفعيل الـ realtime updates */
  enableRealtime?: boolean;
  /** خيارات إضافية لـ React Query */
  queryOptions?: Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'>;
}

/**
 * Hook لاستخدام Supabase مباشرة لجلب البيانات
 * 
 * @example
 * ```tsx
 * // جلب جميع المستخدمين
 * const { data: users, isLoading } = useSupabaseData({
 *   table: 'users',
 *   orderBy: 'created_at',
 * });
 * 
 * // جلب الأخبار المنشورة فقط
 * const { data: news } = useSupabaseData({
 *   table: 'news',
 *   filters: [
 *     { column: 'status', value: 'published' }
 *   ],
 *   orderBy: { column: 'published_at', ascending: false },
 *   limit: 10,
 * });
 * ```
 */
export function useSupabaseData<T = Record<string, unknown>>(
  options: UseSupabaseDataOptions<T>
) {
  const {
    table,
    orderBy,
    limit,
    offset,
    filters = [],
    select = '*',
    enableRealtime = false,
    queryOptions = {},
  } = options;

  // Use a loose type here to avoid cross-package RealtimeChannel type mismatches in Netlify builds
  const [channel, setChannel] = useState<unknown | null>(null);

  const queryKey = [
    'supabase',
    table,
    orderBy,
    limit,
    offset,
    filters,
    select,
  ];

  const query = useQuery<T[], Error>({
    queryKey,
    queryFn: async () => {
      // التحقق من أننا على الـ client side
      if (typeof window === 'undefined') {
        return [];
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        // بدلاً من رمي خطأ، نعيد array فارغ
        console.warn('[useSupabaseData] Supabase client غير متاح');
        return [];
      }

      let queryBuilder = supabase
        .from(table)
        .select(select);

      // تطبيق الفلاتر
      filters.forEach(({ column, operator = 'eq', value }) => {
        if (operator === 'eq') {
          queryBuilder = queryBuilder.eq(column, value);
        } else if (operator === 'neq') {
          queryBuilder = queryBuilder.neq(column, value);
        } else if (operator === 'gt') {
          queryBuilder = queryBuilder.gt(column, value);
        } else if (operator === 'gte') {
          queryBuilder = queryBuilder.gte(column, value);
        } else if (operator === 'lt') {
          queryBuilder = queryBuilder.lt(column, value);
        } else if (operator === 'lte') {
          queryBuilder = queryBuilder.lte(column, value);
        } else if (operator === 'like') {
          queryBuilder = queryBuilder.like(column, value as string);
        } else if (operator === 'ilike') {
          queryBuilder = queryBuilder.ilike(column, value as string);
        } else if (operator === 'in') {
          queryBuilder = queryBuilder.in(column, value as unknown[]);
        } else if (operator === 'is') {
          queryBuilder = queryBuilder.is(column, value);
        }
      });

      // تطبيق الترتيب
      if (orderBy) {
        if (typeof orderBy === 'string') {
          queryBuilder = queryBuilder.order(orderBy, { ascending: true });
        } else {
          queryBuilder = queryBuilder.order(orderBy.column, {
            ascending: orderBy.ascending !== false,
          });
        }
      }

      // تطبيق الـ limit و offset
      if (limit) {
        queryBuilder = queryBuilder.limit(limit);
      }
      if (offset) {
        queryBuilder = queryBuilder.range(offset, offset + (limit || 1000) - 1);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        // تسجيل الخطأ ولكن لا نرميه حتى لا يسبب 500
        console.error(`[useSupabaseData] خطأ في جلب البيانات من ${table}:`, error.message);
        return [];
      }

      return (data as T[]) || [];
    },
    enabled: typeof window !== 'undefined', // فقط على الـ client
    staleTime: 5 * 60 * 1000, // 5 دقائق
    // إلغاء أي تحديثات تلقائية افتراضية حتى لا تتغير البيانات
    // أثناء إدخال المستخدم (تحديث عند التركيز، إعادة الاتصال، أو interval)
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    retry: false, // عدم إعادة المحاولة لتجنب الأخطاء المتكررة
    ...queryOptions,
  });

  // إعداد الـ realtime subscription
  useEffect(() => {
    if (!enableRealtime || typeof window === 'undefined') {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const realtimeChannel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // جميع الأحداث (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: table,
        },
        () => {
          // إعادة جلب البيانات عند حدوث تغيير
          query.refetch();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Supabase] تم الاشتراك في تحديثات ${table}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`[Supabase] خطأ في الاشتراك بتحديثات ${table}`);
        }
      });

    setChannel(realtimeChannel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [enableRealtime, table, query]);

  return {
    ...query,
    data: query.data || [],
  };
}

/**
 * Hook لجلب صف واحد فقط من Supabase
 * 
 * @example
 * ```tsx
 * const { data: user } = useSupabaseSingle({
 *   table: 'users',
 *   filters: [{ column: 'id', value: userId }],
 * });
 * ```
 */
export function useSupabaseSingle<T = Record<string, unknown>>(
  options: Omit<UseSupabaseDataOptions<T>, 'limit' | 'offset' | 'orderBy'>
) {
  const query = useSupabaseData<T>({
    ...options,
    limit: 1,
  });

  return {
    ...query,
    data: (query.data && query.data.length > 0 ? query.data[0] : null) as T | null,
  };
}

/**
 * Hook للعد (count) فقط
 * 
 * @example
 * ```tsx
 * const { count } = useSupabaseCount({
 *   table: 'news',
 *   filters: [{ column: 'status', value: 'published' }],
 * });
 * ```
 */
export function useSupabaseCount(
  options: Omit<UseSupabaseDataOptions<never>, 'select' | 'limit' | 'offset' | 'orderBy'>
) {
  const supabase = getSupabaseBrowserClient();
  const { table, filters = [] } = options;

  return useQuery<number, Error>({
    queryKey: ['supabase-count', table, filters],
    queryFn: async () => {
      // التحقق من أننا على الـ client side
      if (typeof window === 'undefined') {
        return 0;
      }

      if (!supabase) {
        // بدلاً من رمي خطأ، نعيد 0
        console.warn('[useSupabaseCount] Supabase client غير متاح');
        return 0;
      }

      let queryBuilder = supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      // تطبيق الفلاتر
      filters.forEach(({ column, operator = 'eq', value }) => {
        if (operator === 'eq') {
          queryBuilder = queryBuilder.eq(column, value);
        } else if (operator === 'neq') {
          queryBuilder = queryBuilder.neq(column, value);
        } else if (operator === 'gt') {
          queryBuilder = queryBuilder.gt(column, value);
        } else if (operator === 'gte') {
          queryBuilder = queryBuilder.gte(column, value);
        } else if (operator === 'lt') {
          queryBuilder = queryBuilder.lt(column, value);
        } else if (operator === 'lte') {
          queryBuilder = queryBuilder.lte(column, value);
        } else if (operator === 'like') {
          queryBuilder = queryBuilder.like(column, value as string);
        } else if (operator === 'ilike') {
          queryBuilder = queryBuilder.ilike(column, value as string);
        } else if (operator === 'in') {
          queryBuilder = queryBuilder.in(column, value as unknown[]);
        } else if (operator === 'is') {
          queryBuilder = queryBuilder.is(column, value);
        }
      });

      const { count, error } = await queryBuilder;

      if (error) {
        // تسجيل الخطأ ولكن لا نرميه حتى لا يسبب 500
        console.error(`[useSupabaseCount] خطأ في العد من ${table}:`, error.message);
        return 0;
      }

      return count || 0;
    },
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000,
    retry: false, // عدم إعادة المحاولة لتجنب الأخطاء المتكررة
  });
}


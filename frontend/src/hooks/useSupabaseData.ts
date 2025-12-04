/**
 * Hook عام لاستخدام Supabase مباشرة لعرض البيانات
 * 
 * هذا الـ hook يسمح بجلب البيانات مباشرة من Supabase بدون الحاجة لـ API backend
 */

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

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

  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

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
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
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
        throw new Error(`خطأ في جلب البيانات: ${error.message}`);
      }

      return (data as T[]) || [];
    },
    enabled: typeof window !== 'undefined', // فقط على الـ client
    staleTime: 5 * 60 * 1000, // 5 دقائق
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
      if (!supabase) {
        throw new Error('Supabase client غير متاح');
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
        throw new Error(`خطأ في العد: ${error.message}`);
      }

      return count || 0;
    },
    enabled: typeof window !== 'undefined',
    staleTime: 5 * 60 * 1000,
  });
}


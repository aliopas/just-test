/**
 * useSupabaseUser Hook
 * 
 * Hook للحصول على بيانات المستخدم من جدول users في Supabase
 * يستخدم Supabase MCP للاستعلام عن بيانات المستخدم
 */

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '../utils/supabase-client';

type UserRecord = {
  id: string;
  email: string;
  role: 'investor' | 'admin' | null;
  status: 'pending' | 'active' | 'suspended' | null;
  phone: string | null;
  phone_cc: string | null;
  mfa_enabled: boolean;
  created_at: string;
  updated_at: string;
};

type UseSupabaseUserReturn = {
  userRecord: UserRecord | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

export function useSupabaseUser(userId?: string | null): UseSupabaseUserReturn {
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = getSupabaseBrowserClient();

  const fetchUser = useCallback(async () => {
    if (!supabase || !userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('id, email, role, status, phone, phone_cc, mfa_enabled, created_at, updated_at')
        .eq('id', userId)
        .single<UserRecord>();

      if (fetchError) {
        // If user not found, it might be a timing issue - don't throw, just log
        if (fetchError.code === 'PGRST116') {
          console.warn('[Supabase User] User record not found yet, will retry:', userId);
          setUserRecord(null);
          setError(null); // Don't treat as error, might be timing issue
        } else {
          throw new Error(fetchError.message);
        }
      } else {
        setUserRecord(data);
        setError(null);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch user');
      console.error('[Supabase User] Error fetching user:', error);
      setError(error);
      setUserRecord(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    userRecord,
    isLoading,
    error,
    refresh: fetchUser,
  };
}


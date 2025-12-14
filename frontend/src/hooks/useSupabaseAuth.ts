/**
 * useSupabaseAuth Hook
 * 
 * Hook للتحقق من authentication باستخدام Supabase client مباشرة
 * يستخدم Supabase session للتحقق من حالة المستخدم
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient } from '../utils/supabase-client';
import type { User, Session } from '@supabase/supabase-js';

type UseSupabaseAuthReturn = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

export function useSupabaseAuth(): UseSupabaseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  const checkSession = useCallback(async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Supabase Auth] Error getting session:', error);
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    } catch (error) {
      console.error('[Supabase Auth] Failed to check session:', error);
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    if (!supabase) {
      return;
    }

    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[Supabase Auth] Error refreshing session:', error);
        return;
      }

      setSession(refreshedSession);
      setUser(refreshedSession?.user ?? null);
    } catch (error) {
      console.error('[Supabase Auth] Failed to refresh session:', error);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    if (!supabase) {
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Supabase Auth] Error signing out:', error);
        throw error;
      }
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error('[Supabase Auth] Failed to sign out:', error);
      throw error;
    }
  }, [supabase]);

  // Use refs to store latest functions to avoid dependency issues
  const checkSessionRef = useRef(checkSession);

  useEffect(() => {
    checkSessionRef.current = checkSession;
  }, [checkSession, refreshSession]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Check initial session
    checkSessionRef.current();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        console.log('[Supabase Auth] Auth state changed:', event, {
          hasSession: !!newSession,
          userId: newSession?.user?.id,
        });
        
        // Update state directly - no need to call refreshSession for TOKEN_REFRESHED
        // as the newSession is already provided
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Ensure loading state is cleared after initial load
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]); // Only depend on supabase

  return {
    user,
    session,
    isLoading,
    isAuthenticated: Boolean(user && session),
    signOut,
    refreshSession,
  };
}


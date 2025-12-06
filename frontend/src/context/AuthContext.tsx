import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { getStoredAccessToken, decodeJwtPayload } from '../utils/auth-token';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useSupabaseUser } from '../hooks/useSupabaseUser';

type UserRole = 'investor' | 'admin';

type AuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  hydrate: () => void;
};

const STORAGE_KEY = 'auth_user';

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  let existingToken: string | undefined;
  try {
    existingToken = getStoredAccessToken();
  } catch (error) {
    console.warn('Failed to read stored access token', error);
    existingToken = undefined;
  }

  if (!existingToken) {
    return null;
  }

  // First, try to read the cached user object from localStorage
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthUser>;
      if (
        parsed &&
        typeof parsed.id === 'string' &&
        typeof parsed.email === 'string' &&
        (parsed.role === 'investor' || parsed.role === 'admin')
      ) {
        return {
          id: parsed.id,
          email: parsed.email,
          role: parsed.role,
        };
      }
    }
  } catch (error) {
    console.warn('Failed to parse stored auth user', error);
  }

  // If we have a valid access token but no cached user, reconstruct user
  // information directly from the JWT payload so that clearing localStorage
  // (but keeping cookies) does not sign the user out of the app.
  try {
    const payload = decodeJwtPayload(existingToken);
    if (!payload) {
      return null;
    }

    const id =
      (typeof payload.sub === 'string' && payload.sub) ||
      (typeof (payload as any).user_id === 'string' && (payload as any).user_id) ||
      (typeof (payload as any).id === 'string' && (payload as any).id) ||
      null;

    const email =
      (typeof (payload as any).email === 'string' && (payload as any).email) ||
      null;

    const rawRole =
      (payload as any).role ||
      (payload as any).user_role ||
      (payload as any).app_metadata?.role ||
      (payload as any).user_metadata?.role ||
      null;

    const role: UserRole =
      rawRole === 'admin'
        ? 'admin'
        : 'investor';

    if (id && email) {
      const user: AuthUser = { id, email, role };
      // Persist reconstructed user so subsequent loads are faster
      window.localStorage.setItem(STORAGE_KEY, serializeUser(user));
      return user;
    }
  } catch (error) {
    console.warn('Failed to reconstruct auth user from token payload', error);
  }

  return null;
}

function serializeUser(user: AuthUser): string {
  return JSON.stringify({
    id: user.id,
    email: user.email,
    role: user.role,
  } satisfies AuthUser);
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Use Supabase auth for real-time authentication state
  const { user: supabaseUser, session, isLoading: supabaseLoading, isAuthenticated: supabaseAuthenticated } = useSupabaseAuth();
  
  // Fetch user record from users table if authenticated
  const { userRecord, isLoading: userRecordLoading } = useSupabaseUser(supabaseUser?.id);

  // Combine Supabase auth with user record
  const [user, setUserState] = useState<AuthUser | null>(() => {
    // Try to read from localStorage first for faster initial load
    const stored = readStoredUser();
    return stored;
  });

  // Update user when Supabase auth or user record changes
  useEffect(() => {
    // Wait for both Supabase auth and user record to finish loading
    if (supabaseLoading || userRecordLoading) {
      return;
    }

    if (supabaseAuthenticated && supabaseUser && session) {
      // User is authenticated via Supabase
      if (userRecord) {
        // We have the full user record - use it (database is source of truth for role)
        const authUser: AuthUser = {
          id: supabaseUser.id,
          email: supabaseUser.email || userRecord.email,
          role: (userRecord.role === 'admin' ? 'admin' : 'investor') as UserRole,
        };
        
        // Only update if role changed to avoid unnecessary re-renders
        setUserState((prev) => {
          if (prev?.id === authUser.id && prev?.role === authUser.role) {
            return prev; // No change
          }
          return authUser;
        });
        
        // Persist to localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, serializeUser(authUser));
        }
      } else {
        // Supabase user exists but no record yet - try to reconstruct from token
        // This handles the case where login just happened and userRecord hasn't loaded yet
        const stored = readStoredUser();
        if (stored && stored.id === supabaseUser.id) {
          // Use stored user temporarily until userRecord loads
          setUserState(stored);
        } else {
          // Create minimal user from Supabase data
          // Try to get role from user_metadata or app_metadata
          const metadataRole = 
            (supabaseUser.user_metadata as { role?: string })?.role ||
            (supabaseUser.app_metadata as { role?: string })?.role;
          
          const authUser: AuthUser = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            role: metadataRole === 'admin' ? 'admin' : 'investor',
          };
          setUserState(authUser);
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEY, serializeUser(authUser));
          }
        }
      }
    } else if (!supabaseAuthenticated || !supabaseUser || !session) {
      // User is not authenticated
      setUserState(null);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [supabaseUser, supabaseAuthenticated, supabaseLoading, userRecord, userRecordLoading, session]);

  const setUser = useCallback((next: AuthUser | null) => {
    if (typeof window !== 'undefined') {
      if (next) {
        window.localStorage.setItem(STORAGE_KEY, serializeUser(next));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setUserState(next);
  }, []);

  const hydrate = useCallback(() => {
    // Re-read from localStorage and sync with Supabase
    const stored = readStoredUser();
    setUserState(stored);
    
    // If we have Supabase session, prefer that
    if (supabaseAuthenticated && supabaseUser && userRecord) {
      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || userRecord.email,
        role: (userRecord.role === 'admin' ? 'admin' : 'investor') as UserRole,
      };
      setUserState(authUser);
    }
  }, [supabaseAuthenticated, supabaseUser, userRecord]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleFocus = () => {
      hydrate();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [hydrate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && (supabaseAuthenticated || !supabaseLoading)),
      setUser,
      hydrate,
    }),
    [hydrate, setUser, user, supabaseAuthenticated, supabaseLoading]
  );

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback for cases where components are rendered outside of AuthProvider,
    // such as during static pre-rendering. In development, warn so incorrect
    // usage can be fixed, but avoid crashing the build.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('useAuth used outside of AuthProvider. Using unauthenticated fallback.');
    }

    return {
      user: null,
      isAuthenticated: false,
      // No-op implementations; components rendered without a provider will not
      // be able to change auth state, but the app will not crash.
      setUser: () => {},
      hydrate: () => {},
    };
  }
  return context;
}


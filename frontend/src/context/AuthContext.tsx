import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { getStoredAccessToken, decodeJwtPayload } from '../utils/auth-token';

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
  const [user, setUserState] = useState<AuthUser | null>(() => readStoredUser());

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
    setUserState(readStoredUser());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleFocus = () => {
      setUserState(readStoredUser());
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      setUser,
      hydrate,
    }),
    [hydrate, setUser, user]
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


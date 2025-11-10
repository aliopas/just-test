import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

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

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
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
  } catch (error) {
    console.warn('Failed to parse stored auth user', error);
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

export function AuthProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      setUser,
      hydrate,
    }),
    [hydrate, setUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


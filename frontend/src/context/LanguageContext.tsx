import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { InvestorLanguage } from '../types/investor';

type LanguageContextValue = {
  language: InvestorLanguage;
  setLanguage: (language: InvestorLanguage) => void;
  direction: 'rtl' | 'ltr';
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

interface LanguageProviderProps {
  initialLanguage?: InvestorLanguage;
  children: ReactNode;
}

const STORAGE_KEY = 'investor_language';

export function LanguageProvider({
  initialLanguage = 'ar',
  children,
}: LanguageProviderProps) {
  const [language, setLanguageState] = useState<InvestorLanguage>(() => {
    if (typeof window === 'undefined') {
      return initialLanguage;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'ar' ? stored : initialLanguage;
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      window.localStorage.setItem(STORAGE_KEY, language);
    }
  }, [language]);

  const setLanguage = useCallback((next: InvestorLanguage) => {
    setLanguageState(next);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      direction: language === 'ar' ? 'rtl' : 'ltr',
    }),
    [language, setLanguage]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback for cases where components are rendered outside of LanguageProvider,
    // such as during static pre-rendering of legacy pages. In development, warn
    // so incorrect usage can be fixed, but avoid crashing the build.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('useLanguage used outside of LanguageProvider. Using default Arabic language fallback.');
    }

    return {
      language: 'ar',
      direction: 'rtl',
      // No-op setter when provider is missing; real components should be wrapped
      // in LanguageProvider to get a functional setter.
      setLanguage: () => {},
    };
  }
  return context;
}




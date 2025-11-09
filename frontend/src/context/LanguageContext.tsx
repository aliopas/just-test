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
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}




import type { InvestorLanguage } from '../../types/investor';
import { useLanguage } from '../../context/LanguageContext';
import { getMessage } from '../../locales/investorProfile';

interface LanguageSwitcherProps {
  onChange?: (language: InvestorLanguage) => void;
}

export function LanguageSwitcher({ onChange }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      style={{
        display: 'inline-flex',
        borderRadius: '999px',
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        background: '#FFFFFF',
      }}
    >
      {(['ar', 'en'] as const).map(option => (
        <button
          key={option}
          type="button"
          onClick={() => {
            setLanguage(option);
            onChange?.(option);
          }}
          style={{
            padding: '0.35rem 0.85rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            background: language === option ? '#2D6FA3' : 'transparent',
            color: language === option ? '#FFFFFF' : '#111418',
            transition: 'background 0.2s ease',
          }}
        >
          {getMessage(`language.switch.${option}` as const, language)}
        </button>
      ))}
    </div>
  );
}


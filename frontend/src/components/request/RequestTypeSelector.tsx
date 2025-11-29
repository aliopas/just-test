import { useLanguage } from '../../context/LanguageContext';

export type RequestTypeOption = 'buy' | 'sell' | 'partnership' | 'board_nomination' | 'feedback';

interface RequestTypeSelectorProps {
  value: RequestTypeOption;
  onChange: (type: RequestTypeOption) => void;
  disabled?: boolean;
}

export function RequestTypeSelector({
  value,
  onChange,
  disabled = false,
}: RequestTypeSelectorProps) {
  const { language, direction } = useLanguage();

  const options: Array<{ value: RequestTypeOption; label: { ar: string; en: string } }> = [
    { value: 'buy', label: { ar: 'شراء', en: 'Buy' } },
    { value: 'sell', label: { ar: 'بيع', en: 'Sell' } },
    { value: 'partnership', label: { ar: 'شراكة', en: 'Partnership' } },
    { value: 'board_nomination', label: { ar: 'ترشيح مجلس', en: 'Board Nomination' } },
    { value: 'feedback', label: { ar: 'ملاحظات', en: 'Feedback' } },
  ];

  return (
    <div style={{ direction }}>
      <label
        style={{
          display: 'block',
          fontWeight: 600,
          fontSize: '0.95rem',
          color: 'var(--color-text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {language === 'ar' ? 'نوع الطلب' : 'Request Type'}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value as RequestTypeOption)}
        disabled={disabled}
        style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.85rem',
          border: '1px solid var(--color-border-muted)',
          background: 'var(--color-background-surface)',
          color: 'var(--color-text-primary)',
          fontSize: '0.95rem',
          width: '100%',
          appearance: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label[language]}
          </option>
        ))}
      </select>
    </div>
  );
}


import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';

interface OrderControlsProps {
  currentOrder: number;
  minOrder: number;
  maxOrder: number;
  onOrderChange: (newOrder: number) => void;
  disabled?: boolean;
}

export function OrderControls({
  currentOrder,
  minOrder,
  maxOrder,
  onOrderChange,
  disabled = false,
}: OrderControlsProps) {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const handleIncrement = () => {
    if (currentOrder < maxOrder && !disabled) {
      onOrderChange(currentOrder + 1);
    }
  };

  const handleDecrement = () => {
    if (currentOrder > minOrder && !disabled) {
      onOrderChange(currentOrder - 1);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || currentOrder <= minOrder}
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '0.375rem',
          border: `1px solid ${palette.neutralBorderSoft}`,
          background: disabled || currentOrder <= minOrder ? palette.backgroundAlt : palette.backgroundSurface,
          color: disabled || currentOrder <= minOrder ? palette.textSecondary : palette.textPrimary,
          cursor: disabled || currentOrder <= minOrder ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
          opacity: disabled || currentOrder <= minOrder ? 0.5 : 1,
        }}
        title={isArabic ? 'نقل للأعلى' : 'Move Up'}
      >
        {isArabic ? '↑' : '↑'}
      </button>
      <span
        style={{
          minWidth: '2.5rem',
          textAlign: 'center',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: palette.textPrimary,
        }}
      >
        {currentOrder}
      </span>
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || currentOrder >= maxOrder}
        style={{
          padding: '0.25rem 0.5rem',
          borderRadius: '0.375rem',
          border: `1px solid ${palette.neutralBorderSoft}`,
          background: disabled || currentOrder >= maxOrder ? palette.backgroundAlt : palette.backgroundSurface,
          color: disabled || currentOrder >= maxOrder ? palette.textSecondary : palette.textPrimary,
          cursor: disabled || currentOrder >= maxOrder ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          fontWeight: 600,
          opacity: disabled || currentOrder >= maxOrder ? 0.5 : 1,
        }}
        title={isArabic ? 'نقل للأسفل' : 'Move Down'}
      >
        {isArabic ? '↓' : '↓'}
      </button>
    </div>
  );
}


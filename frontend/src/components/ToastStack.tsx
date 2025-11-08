import type { Toast } from '../context/ToastContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const variantColor: Record<Toast['variant'], { bg: string; border: string }> = {
  success: { bg: '#ECFDF5', border: '#34D399' },
  error: { bg: '#FEF2F2', border: '#F87171' },
  info: { bg: '#EFF6FF', border: '#60A5FA' },
};

export function ToastStack() {
  const { toasts, dismissToast } = useToast();
  const { direction } = useLanguage();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        [direction === 'rtl' ? 'left' : 'right']: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '22rem',
      }}
      role="status"
      aria-live="polite"
    >
      {toasts.map(toast => {
        const colors = variantColor[toast.variant];
        return (
          <div
            key={toast.id}
            style={{
              background: colors.bg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)',
              direction,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <span
                style={{
                  fontSize: '0.95rem',
                  color: '#111418',
                  lineHeight: 1.4,
                }}
              >
                {toast.message}
              </span>
              <button
                onClick={() => dismissToast(toast.id)}
                type="button"
                aria-label="Dismiss notification"
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: '#6B7280',
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


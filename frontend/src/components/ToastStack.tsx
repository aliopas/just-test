import type { Toast } from '../context/ToastContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const variantColor: Record<Toast['variant'], { bg: string; border: string; icon: string }> = {
  success: { 
    bg: '#ECFDF5', 
    border: '#34D399',
    icon: '✓'
  },
  error: { 
    bg: '#FEF2F2', 
    border: '#F87171',
    icon: '⚠'
  },
  info: { 
    bg: 'var(--color-background-alt)', 
    border: 'var(--color-brand-secondary-soft)',
    icon: 'ℹ'
  },
};

export function ToastStack() {
  const { toasts, dismissToast } = useToast();
  const { language, direction } = useLanguage();

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
      aria-atomic="false"
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
              animation: 'slideIn 0.3s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: '0.1rem',
                }}
                aria-hidden="true"
              >
                {colors.icon}
              </div>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--color-text-primary)',
                    lineHeight: 1.4,
                  }}
                >
                  {toast.message}
                </span>
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      if (toast.action?.dismissOnClick !== false) {
                        dismissToast(toast.id);
                      }
                    }}
                    type="button"
                    style={{
                      alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-end',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${colors.border}`,
                      background: 'transparent',
                      color: colors.border,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minHeight: '36px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.border;
                      e.currentTarget.style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = colors.border;
                    }}
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                type="button"
                aria-label={language === 'ar' ? 'إغلاق الإشعار' : 'Dismiss notification'}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1,
                  padding: '0.25rem',
                  minWidth: '32px',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.25rem',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(${direction === 'rtl' ? '100%' : '-100%'});
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}



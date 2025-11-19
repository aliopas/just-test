import { ReactNode } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { palette } from '../../styles/theme';

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  id?: string;
}

export function FormField({
  label,
  error,
  hint,
  required = false,
  children,
  id,
}: FormFieldProps) {
  const { language, direction } = useLanguage();
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}
    >
      <label
        htmlFor={fieldId}
        style={{
          fontWeight: 600,
          color: palette.textPrimary,
          fontSize: '0.95rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {label}
        {required && (
          <span
            style={{
              color: palette.error,
              fontSize: '1rem',
            }}
            aria-label={language === 'ar' ? 'مطلوب' : 'Required'}
          >
            *
          </span>
        )}
      </label>
      {hint && (
        <span
          style={{
            fontSize: '0.85rem',
            color: palette.textSecondary,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </span>
      )}
      <div
        style={{
          position: 'relative',
        }}
      >
        {children}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              color: palette.error,
              fontSize: '0.875rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '0.5rem',
              background: '#FEF2F2',
              border: `1px solid ${palette.error}`,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}


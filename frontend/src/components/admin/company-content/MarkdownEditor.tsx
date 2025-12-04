import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  label,
  placeholder,
  rows = 10,
}: MarkdownEditorProps) {
  const { language, direction } = useLanguage();
  const [showPreview, setShowPreview] = useState(false);
  const isArabic = language === 'ar';

  const renderMarkdownPreview = (text: string) => {
    return text.split('\n\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return null;

      // Headers
      if (/^#{1,6}\s/.test(trimmed)) {
        const level = Math.min(trimmed.match(/^#{1,6}/)?.[0].length || 1, 6);
        const text = trimmed.replace(/^#{1,6}\s+/, '');
        const headingProps = {
          key: index,
          style: {
            marginTop: index === 0 ? 0 : '1.5rem',
            marginBottom: '0.75rem',
            fontWeight: 700,
            fontSize: level === 1 ? '1.5rem' : level === 2 ? '1.25rem' : '1.1rem',
            color: palette.textPrimary,
          },
        };
        
        // Use React.createElement to dynamically create heading elements
        switch (level) {
          case 1:
            return React.createElement('h1', headingProps, text);
          case 2:
            return React.createElement('h2', headingProps, text);
          case 3:
            return React.createElement('h3', headingProps, text);
          case 4:
            return React.createElement('h4', headingProps, text);
          case 5:
            return React.createElement('h5', headingProps, text);
          case 6:
            return React.createElement('h6', headingProps, text);
          default:
            return React.createElement('h1', headingProps, text);
        }
      }

      // Lists
      if (/^[-*]\s+/m.test(trimmed)) {
        const items = trimmed
          .split('\n')
          .map((item) => item.trim())
          .filter((line) => /^[-*]\s+/.test(line))
          .map((line) => line.replace(/^[-*]\s+/, ''));

        return (
          <ul
            key={index}
            style={{
              margin: '0.5rem 0',
              paddingInlineStart: direction === 'rtl' ? '1.5rem' : '2rem',
              lineHeight: 1.6,
            }}
          >
            {items.map((item, itemIndex) => (
              <li key={itemIndex} style={{ color: palette.textPrimary }}>
                {item}
              </li>
            ))}
          </ul>
        );
      }

      // Regular paragraph
      return (
        <p key={index} style={{ margin: '0.5rem 0', color: palette.textPrimary, lineHeight: 1.8 }}>
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div style={{ width: '100%', direction }}>
      {label && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
          }}
        >
          <label
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: palette.textPrimary,
            }}
          >
            {label}
          </label>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
              background: showPreview ? palette.brandPrimaryStrong : palette.backgroundSurface,
              color: showPreview ? '#FFFFFF' : palette.textPrimary,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {showPreview
              ? isArabic
                ? 'إظهار المحرر'
                : 'Show Editor'
              : isArabic
                ? 'معاينة'
                : 'Preview'}
          </button>
        </div>
      )}

      {showPreview ? (
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            minHeight: `${rows * 1.5}rem`,
            maxHeight: '500px',
            overflowY: 'auto',
          }}
        >
          {value ? (
            <div style={{ direction }}>{renderMarkdownPreview(value)}</div>
          ) : (
            <div
              style={{
                color: palette.textSecondary,
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '2rem',
              }}
            >
              {isArabic ? 'لا يوجد محتوى للمعاينة' : 'No content to preview'}
            </div>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '0.75rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            color: palette.textPrimary,
            fontSize: '0.95rem',
            fontFamily: 'monospace',
            lineHeight: 1.6,
            resize: 'vertical' as const,
            direction: 'ltr', // Markdown is always LTR
          }}
        />
      )}
    </div>
  );
}


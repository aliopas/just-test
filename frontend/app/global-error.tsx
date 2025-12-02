'use client';

import { useEffect } from 'react';
import { palette } from '@/styles/theme';

/**
 * Global error boundary for the entire application
 * This catches errors that occur in the root layout
 * 
 * Note: This file MUST be a Client Component ('use client')
 * and MUST define its own <html> and <body> tags
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details to console for debugging
    console.error('=== GLOBAL ERROR ===');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Digest:', error.digest);
    console.error('Full Error Object:', error);
    console.error('========================');
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>خطأ في التطبيق</title>
      </head>
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            width: '100%',
            padding: '2rem',
            background: palette.backgroundBase || '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '800px',
              width: '100%',
              textAlign: 'center',
              background: palette.backgroundSurface || '#f9fafb',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: palette.error || '#dc2626',
                marginBottom: '1rem',
              }}
            >
              ⚠️ حدث خطأ خطير
            </h1>
            
            <div
              style={{
                background: palette.backgroundBase || '#ffffff',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem',
                textAlign: 'right',
                direction: 'rtl',
                border: `2px solid ${palette.error || '#dc2626'}`,
              }}
            >
              <h2
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: palette.textPrimary || '#1f2937',
                  marginBottom: '0.5rem',
                }}
              >
                تفاصيل الخطأ:
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: palette.textSecondary || '#6b7280',
                  marginBottom: '0.5rem',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                }}
              >
                {error.message || 'حدث خطأ غير معروف'}
              </p>
              
              {error.digest && (
                <p
                  style={{
                    fontSize: '0.875rem',
                    color: palette.textSecondary || '#9ca3af',
                    marginTop: '0.5rem',
                  }}
                >
                  Error Digest: {error.digest}
                </p>
              )}
              
              {process.env.NODE_ENV === 'development' && error.stack && (
                <details
                  style={{
                    marginTop: '1rem',
                    textAlign: 'left',
                    direction: 'ltr',
                  }}
                >
                  <summary
                    style={{
                      cursor: 'pointer',
                      color: palette.textSecondary || '#6b7280',
                      fontSize: '0.875rem',
                    }}
                  >
                    Stack Trace (Development Only)
                  </summary>
                  <pre
                    style={{
                      background: '#1f2937',
                      color: '#f9fafb',
                      padding: '1rem',
                      borderRadius: '4px',
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      marginTop: '0.5rem',
                      maxHeight: '300px',
                    }}
                  >
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                onClick={reset}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: palette.brandPrimaryStrong || '#2563eb',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                إعادة المحاولة
              </button>
              
              <button
                onClick={() => {
                  window.location.href = '/';
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: palette.textPrimary || '#1f2937',
                  background: palette.backgroundSurface || '#f3f4f6',
                  border: `1px solid ${palette.neutralBorder || '#d1d5db'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                العودة للصفحة الرئيسية
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: palette.textSecondary || '#6b7280',
                  marginTop: '2rem',
                  padding: '1rem',
                  background: '#fef3c7',
                  borderRadius: '8px',
                  border: '1px solid #fbbf24',
                }}
              >
                💡 <strong>وضع التطوير:</strong> افتح Console (F12) لرؤية تفاصيل أكثر عن الخطأ
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}


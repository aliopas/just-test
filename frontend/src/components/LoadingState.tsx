import { useLanguage } from '../context/LanguageContext';
import { palette } from '../styles/theme';

interface LoadingStateProps {
  message?: string;
  progress?: number;
  size?: 'small' | 'medium' | 'large';
}

export function LoadingState({
  message,
  progress,
  size = 'medium',
}: LoadingStateProps) {
  const { language } = useLanguage();

  const sizeMap = {
    small: '1rem',
    medium: '2rem',
    large: '3rem',
  };

  const spinnerSize = sizeMap[size];

  const defaultMessage =
    language === 'ar' ? 'جاري التحميل...' : 'Loading...';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        gap: '1rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `3px solid ${palette.neutralBorderSoft}`,
          borderTopColor: palette.brandPrimaryStrong,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
        aria-label={message || defaultMessage}
        role="status"
      />
      {message && (
        <p
          style={{
            margin: 0,
            color: palette.textSecondary,
            fontSize: '0.95rem',
          }}
        >
          {message}
        </p>
      )}
      {progress !== undefined && (
        <div
          style={{
            width: '100%',
            maxWidth: '300px',
            marginTop: '0.5rem',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '8px',
              background: palette.neutralBorderSoft,
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: palette.brandPrimaryStrong,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: '0.85rem',
              color: palette.textSecondary,
              marginTop: '0.25rem',
              display: 'block',
            }}
          >
            {progress}%
          </span>
        </div>
      )}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}


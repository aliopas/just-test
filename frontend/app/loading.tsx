import { palette } from '@/styles/theme';

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: palette.backgroundBase,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${palette.neutralBorder}`,
            borderTopColor: palette.brandPrimaryStrong,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            color: palette.textSecondary,
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          جاري التحميل...
        </p>
      </div>
    </div>
  );
}


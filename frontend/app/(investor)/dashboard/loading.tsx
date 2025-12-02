import { palette } from '@/styles/theme';

export default function DashboardLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '2rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${palette.neutralBorder}`,
            borderTopColor: palette.brandPrimaryStrong,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p
          style={{
            color: palette.textSecondary,
            fontSize: '0.9rem',
          }}
        >
          جاري تحميل لوحة التحكم...
        </p>
      </div>
    </div>
  );
}


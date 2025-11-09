type NotificationSkeletonProps = {
  count?: number;
};

export function NotificationSkeleton({ count = 3 }: NotificationSkeletonProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '1rem 1.25rem',
            borderRadius: '1rem',
            border: '1px solid var(--color-border)',
            background:
              'linear-gradient(90deg, rgba(236,239,244,0.9) 0%, rgba(245,247,250,0.9) 50%, rgba(236,239,244,0.9) 100%)',
            backgroundSize: '200% 100%',
            animation: 'notification-skeleton 1.6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              height: '0.85rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(148, 163, 184, 0.25)',
              width: '30%',
            }}
          />
          <div
            style={{
              height: '1.2rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(148, 163, 184, 0.28)',
              width: '60%',
            }}
          />
          <div
            style={{
              height: '0.9rem',
              borderRadius: '999px',
              backgroundColor: 'rgba(148, 163, 184, 0.22)',
              width: '85%',
            }}
          />
        </div>
      ))}
      <style>
        {`@keyframes notification-skeleton {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }`}
      </style>
    </div>
  );
}


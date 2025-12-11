'use client';

import { palette, radius, shadow, typography } from '@/styles/theme';

export default function InternalNewsDetailLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: palette.backgroundSurface,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Back button skeleton */}
        <div
          style={{
            width: '150px',
            height: '44px',
            borderRadius: radius.md,
            background: palette.backgroundBase,
            border: `1px solid ${palette.neutralBorderMuted}`,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />

        {/* Content skeleton */}
        <div
          style={{
            padding: '2rem 2.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.medium,
            border: `1px solid ${palette.neutralBorderMuted}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Title skeleton */}
          <div
            style={{
              width: '80%',
              height: '2.5rem',
              borderRadius: radius.md,
              background: palette.backgroundSurface,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />

          {/* Date skeleton */}
          <div
            style={{
              width: '60%',
              height: '1.5rem',
              borderRadius: radius.md,
              background: palette.backgroundSurface,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />

          {/* Cover image skeleton */}
          <div
            style={{
              width: '100%',
              height: '300px',
              borderRadius: radius.lg,
              background: palette.backgroundSurface,
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />

          {/* Content lines skeleton */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                width: i === 5 ? '60%' : '100%',
                height: '1.25rem',
                borderRadius: radius.md,
                background: palette.backgroundSurface,
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
}


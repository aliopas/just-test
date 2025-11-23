import { memo } from 'react';
import { palette } from '../../styles/theme';

export const SectionSkeleton = memo(function SectionSkeleton() {
  return (
    <div
      style={{
        padding: '4rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gap: '2rem',
      }}
    >
      {/* Title Skeleton */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            height: '2.5rem',
            width: '300px',
            margin: '0 auto 1rem',
            borderRadius: '0.5rem',
            background: `linear-gradient(90deg, ${palette.neutralBorderSoft}20 25%, ${palette.neutralBorderSoft}40 50%, ${palette.neutralBorderSoft}20 75%)`,
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>

      {/* Cards Grid Skeleton */}
      <div
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            style={{
              padding: '2rem 1.5rem',
              borderRadius: '1.25rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
              background: palette.backgroundSurface,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              minHeight: '200px',
            }}
          >
            {/* Icon Skeleton */}
            <div
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '1.5rem',
                background: `linear-gradient(90deg, ${palette.neutralBorderSoft}20 25%, ${palette.neutralBorderSoft}40 50%, ${palette.neutralBorderSoft}20 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${index * 0.1}s`,
              }}
            />
            {/* Title Skeleton */}
            <div
              style={{
                height: '1.25rem',
                width: '80%',
                borderRadius: '0.5rem',
                background: `linear-gradient(90deg, ${palette.neutralBorderSoft}20 25%, ${palette.neutralBorderSoft}40 50%, ${palette.neutralBorderSoft}20 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                animationDelay: `${index * 0.1 + 0.2}s`,
              }}
            />
          </div>
        ))}
      </div>

      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
    </div>
  );
});


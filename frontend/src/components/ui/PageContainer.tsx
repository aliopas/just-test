import React from 'react';
import { palette } from '../../styles/theme';

interface PageContainerProps {
  children: React.ReactNode;
  direction?: 'ltr' | 'rtl';
  /**
   * Max width of the inner content container.
   * Accepts number (px) or any CSS width string (e.g. '800px', '60rem', '100%').
   */
  maxWidth?: number | string;
  /** Outer padding (default: '2rem') */
  padding?: string;
  /** Whether to enforce full viewport height */
  fullHeight?: boolean;
}

export function PageContainer({
  children,
  direction = 'ltr',
  maxWidth = 800,
  padding = '2rem',
  fullHeight = true,
}: PageContainerProps) {
  const resolvedMaxWidth =
    typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;

  return (
    <div
      style={{
        minHeight: fullHeight ? '100vh' : undefined,
        padding,
        background: palette.backgroundSurface,
        direction,
      }}
    >
      <div
        style={{
          maxWidth: resolvedMaxWidth,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {children}
      </div>
    </div>
  );
}


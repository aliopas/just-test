import React from 'react';
import { palette, radius, shadow } from '../../styles/theme';

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  /** Inner padding (default: '1.6rem 1.7rem') */
  padding?: string;
}

export function Card({
  children,
  padding = '1.6rem 1.7rem',
  style,
  ...rest
}: CardProps) {
  return (
    <section
      style={{
        padding,
        borderRadius: radius.lg,
        background: palette.backgroundBase,
        boxShadow: shadow.subtle,
        border: `1px solid ${palette.neutralBorderMuted}`,
        ...(style || {}),
      }}
      {...rest}
    >
      {children}
    </section>
  );
}


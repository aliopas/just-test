import React from 'react';
import { palette, radius } from '../../styles/theme';

interface BackButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  direction?: 'ltr' | 'rtl';
}

export function BackButton({
  direction = 'ltr',
  children,
  style,
  ...rest
}: BackButtonProps) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
        padding: '0.45rem 0.9rem',
        borderRadius: radius.md,
        border: `1px solid ${palette.neutralBorderMuted}`,
        background: palette.backgroundBase,
        color: palette.textSecondary,
        fontSize: '0.85rem',
        cursor: 'pointer',
        ...(style || {}),
      }}
    >
      {children}
    </button>
  );
}


export const palette = {
  brandPrimary: '#2364a4',
  brandPrimaryStrong: '#2c74cc',
  brandPrimaryMuted: '#327cb6',
  brandSecondary: '#55677a',
  brandSecondaryMuted: '#7197b4',
  brandSecondarySoft: '#aacce3',
  brandAccent: '#3e6a95',
  brandAccentDeep: '#2e5b81',
  brandAccentMid: '#31566f',
  backgroundBase: '#e5eff2',
  backgroundSurface: '#f6fafa',
  backgroundAlt: '#ceedf8',
  backgroundHighlight: '#dcf5f9',
  backgroundInverse: '#042c54',
  neutralSurface: '#e4e4e4',
  neutralSolid: '#080809',
  neutralMuted: '#7c7c7c',
  neutralDivider: '#bcbcbc',
  neutralBorder: '#a2aeba',
  neutralBorderMuted: '#c7c8c8',
  neutralBorderSoft: '#dcdcd4',
  textPrimary: '#080809',
  textSecondary: '#31566f',
  textMuted: '#7c7c7c',
  textOnBrand: '#f6fafa',
  textOnInverse: '#f6fafa',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

export type PaletteColor = keyof typeof palette;

export interface TypographyScale {
  fontFamily: string;
  sizes: {
    display: string;
    heading: string;
    subheading: string;
    body: string;
    caption: string;
  };
  weights: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeights: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export const typography: TypographyScale = {
  fontFamily: "'Tajawal', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  sizes: {
    display: '2.75rem',
    heading: '2rem',
    subheading: '1.5rem',
    body: '1rem',
    caption: '0.875rem',
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeights: {
    tight: 1.1,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
} as const;

export const radius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  pill: '999px',
} as const;

export const shadow = {
  subtle: '0 1px 2px rgba(4, 44, 84, 0.06)',
  medium: '0 8px 20px rgba(4, 44, 84, 0.12)',
  focus: '0 0 0 3px rgba(44, 116, 204, 0.35)',
} as const;

export const rtl = {
  direction: 'rtl' as const,
  logicalProperties: {
    marginInlineStart: 'marginRight',
    marginInlineEnd: 'marginLeft',
    paddingInlineStart: 'paddingRight',
    paddingInlineEnd: 'paddingLeft',
  },
};

export const theme = {
  palette,
  typography,
  spacing,
  radius,
  shadow,
  rtl,
};

export type Theme = typeof theme;

export function toCssVariables({ palette: colors, spacing: space, radius: radii, shadow: shadows, typography: type }: Theme) {
  return {
    '--color-brand-primary': colors.brandPrimary,
    '--color-brand-primary-strong': colors.brandPrimaryStrong,
    '--color-brand-primary-muted': colors.brandPrimaryMuted,
    '--color-brand-secondary': colors.brandSecondary,
    '--color-brand-secondary-muted': colors.brandSecondaryMuted,
    '--color-brand-secondary-soft': colors.brandSecondarySoft,
    '--color-brand-accent': colors.brandAccent,
    '--color-brand-accent-deep': colors.brandAccentDeep,
    '--color-brand-accent-mid': colors.brandAccentMid,
    '--color-background-base': colors.backgroundBase,
    '--color-background-surface': colors.backgroundSurface,
    '--color-background-alt': colors.backgroundAlt,
    '--color-background-highlight': colors.backgroundHighlight,
    '--color-background-inverse': colors.backgroundInverse,
    '--color-neutral-surface': colors.neutralSurface,
    '--color-neutral-solid': colors.neutralSolid,
    '--color-neutral-muted': colors.neutralMuted,
    '--color-neutral-divider': colors.neutralDivider,
    '--color-border': colors.neutralBorder,
    '--color-border-muted': colors.neutralBorderMuted,
    '--color-border-soft': colors.neutralBorderSoft,
    '--color-text-primary': colors.textPrimary,
    '--color-text-secondary': colors.textSecondary,
    '--color-text-muted': colors.textMuted,
    '--color-text-on-brand': colors.textOnBrand,
    '--color-text-on-inverse': colors.textOnInverse,
    '--color-success': colors.success,
    '--color-warning': colors.warning,
    '--color-error': colors.error,
    '--spacing-xs': space.xs,
    '--spacing-sm': space.sm,
    '--spacing-md': space.md,
    '--spacing-lg': space.lg,
    '--spacing-xl': space.xl,
    '--spacing-2xl': space['2xl'],
    '--radius-sm': radii.sm,
    '--radius-md': radii.md,
    '--radius-lg': radii.lg,
    '--radius-pill': radii.pill,
    '--shadow-subtle': shadows.subtle,
    '--shadow-medium': shadows.medium,
    '--shadow-focus': shadows.focus,
    '--font-family-base': type.fontFamily,
    '--font-size-display': type.sizes.display,
    '--font-size-heading': type.sizes.heading,
    '--font-size-subheading': type.sizes.subheading,
    '--font-size-body': type.sizes.body,
    '--font-size-caption': type.sizes.caption,
  } as const;
}

export function applyTheme(theme: Theme, target?: HTMLElement | null) {
  if (typeof document === 'undefined') {
    return theme;
  }

  const root = target ?? document.documentElement;
  const variables = toCssVariables(theme);

  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  return theme;
}



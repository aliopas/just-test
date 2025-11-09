import React from 'react';
import { palette } from '../styles/theme';

const primaryLogoSrc = new URL('../assets/logo.png', import.meta.url).href;
const legacyLogoSrc = new URL('../assets/logo.jpg', import.meta.url).href;

export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
  variant?: 'primary' | 'inverse';
  showWordmark?: boolean;
  tagline?: string;
  stacked?: boolean;
  useLegacyAsset?: boolean;
}

const defaultTagline = {
  ar: 'باكورة للتقنيات',
  en: 'Bacura Technologies',
};

export const Logo: React.FC<LogoProps> = ({
  size = 120,
  variant = 'primary',
  showWordmark = true,
  tagline,
  stacked = false,
  useLegacyAsset = false,
  style,
  alt,
  ...imgProps
}) => {
  const background =
    variant === 'inverse'
      ? {
          backgroundColor: palette.backgroundInverse,
          padding: '10px',
          borderRadius: '18px',
        }
      : {
          backgroundColor: palette.backgroundSurface,
        };

  const resolvedAlt =
    alt ??
    (showWordmark
      ? 'Bakurah Technologies logo'
      : 'Bakurah icon');

  const illustrationStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 6px 18px rgba(4, 44, 84, 0.12)',
    ...background,
  };

  return (
    <figure
      style={{
        display: 'inline-flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'center' : 'flex-end',
        gap: stacked ? '0.5rem' : '0.85rem',
        margin: 0,
        ...style,
      }}
    >
      <span style={illustrationStyles}>
        <img
          src={useLegacyAsset ? legacyLogoSrc : primaryLogoSrc}
          alt={resolvedAlt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
          }}
          {...imgProps}
        />
      </span>

      {showWordmark && (
        <figcaption
          style={{
            fontFamily: "'Tajawal', 'Inter', sans-serif",
            fontWeight: 700,
            fontSize: stacked ? '1.5rem' : '1.7rem',
            lineHeight: stacked ? 1.15 : 1.2,
            color: variant === 'inverse' ? palette.textOnInverse : palette.brandAccentDeep,
            textAlign: stacked ? 'center' : 'start',
          }}
        >
          <span style={{ display: 'block', letterSpacing: '0.08em' }}>BACURA</span>
          <span
            style={{
              display: 'block',
              fontSize: stacked ? '1.1rem' : '1.35rem',
              fontWeight: 600,
              letterSpacing: '0.03em',
            }}
          >
            باكورة
          </span>
          <span
            style={{
              display: 'block',
              fontSize: stacked ? '0.85rem' : '0.9rem',
              fontWeight: 500,
              color:
                variant === 'inverse'
                  ? 'rgba(255, 255, 255, 0.75)'
                  : palette.brandAccent,
              marginTop: '0.25rem',
            }}
          >
            {tagline ?? `${defaultTagline.ar} · ${defaultTagline.en}`}
          </span>
        </figcaption>
      )}
    </figure>
  );
};

Logo.displayName = 'Logo';




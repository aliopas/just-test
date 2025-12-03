import React from 'react';
import { palette } from '../styles/theme';

// Note: For Next.js, images should be in public/ folder
// Logo files are in public/ folder: logo.jpg (primary) and logo.png (if available)
const primaryLogoSrc = '/logo.jpg';
const legacyLogoSrc = '/logo.png';

export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number; // Minimum: 96px for web, 72px for mobile (per PRD)
  variant?: 'primary' | 'inverse';
  showWordmark?: boolean;
  tagline?: string;
  stacked?: boolean;
  useLegacyAsset?: boolean;
  logoUrl?: string | null; // URL to use instead of default logo (e.g., from company profile)
}

const defaultTagline = {
  ar: 'باكورة للتقنيات',
  en: 'Bacura Technologies',
};

export function Logo({
  size = 120, // Default 120px, minimum 96px per PRD
  variant = 'primary',
  showWordmark = true,
  tagline,
  stacked = false,
  useLegacyAsset = false,
  logoUrl,
  style,
  alt,
  ...imgProps
}: LogoProps) {
  // Enforce minimum size per PRD: 96px for web, 72px for mobile
  const minSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 72 : 96;
  const actualSize = Math.max(size, minSize);
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
    width: actualSize,
    height: actualSize,
    minWidth: actualSize,
    minHeight: actualSize,
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 6px 18px rgba(4, 44, 84, 0.12)',
    // Minimum clear space per PRD: ≥ height of "ب" character in Arabic logo
    margin: `${actualSize * 0.1}px`, // ~10% of logo height for clear space
    ...background,
  };

  // Determine which logo source to use
  // Primary is logo.jpg, legacy is logo.png
  const logoSrc = logoUrl || (useLegacyAsset ? legacyLogoSrc : primaryLogoSrc);

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
          src={logoSrc}
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
            fontSize: stacked ? `${actualSize * 0.0125}rem` : `${actualSize * 0.014}rem`,
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
}




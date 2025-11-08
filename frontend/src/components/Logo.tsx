import React from 'react';

const logoSrc = new URL('../assets/logo.jpg', import.meta.url).href;

export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number;
  variant?: 'primary' | 'inverse';
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 120,
  variant = 'primary',
  showWordmark = true,
  style,
  ...imgProps
}) => {
  const background =
    variant === 'inverse'
      ? { backgroundColor: '#1E3A5F', padding: '8px', borderRadius: '12px' }
      : {};

  return (
    <figure
      style={{
        display: 'inline-flex',
        flexDirection: showWordmark ? 'row' : 'column',
        alignItems: 'center',
        gap: '0.75rem',
        margin: 0,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 6px 18px rgba(17, 20, 24, 0.1)',
          ...background,
        }}
      >
        <img
          src={logoSrc}
          alt="Bakurah Investors Portal logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          {...imgProps}
        />
      </span>

      {showWordmark && (
        <figcaption
          style={{
            fontFamily: "'Tajawal', 'Inter', sans-serif",
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.2,
            color: variant === 'inverse' ? '#FFFFFF' : '#1E3A5F',
            letterSpacing: '0.02em',
          }}
        >
          باكورة الاستثمارية
        </figcaption>
      )}
    </figure>
  );
};

Logo.displayName = 'Logo';



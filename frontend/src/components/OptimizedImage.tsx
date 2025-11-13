import { useState, useEffect, useRef } from 'react';
import { palette } from '../styles/theme';

interface OptimizedImageProps {
  src: string | null;
  alt: string;
  aspectRatio?: number; // e.g., 16/9 = 1.777, 4/3 = 1.333
  fallbackText?: string;
  className?: string;
  style?: React.CSSProperties;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  showPlaceholder?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  aspectRatio = 16 / 9,
  fallbackText,
  className,
  style,
  objectFit = 'cover',
  showPlaceholder = true,
  onError,
  onLoad,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string | null>(src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageSrc(src);
    setImageError(false);
    setIsLoading(true);
  }, [src]);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) {
      onLoad();
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: `${(1 / aspectRatio) * 100}%`,
    background: imageError || !imageSrc ? palette.neutralBorder : palette.backgroundInverse,
    overflow: 'hidden',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit,
    transition: 'opacity 0.3s ease',
    opacity: isLoading ? 0 : 1,
  };

  const placeholderStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${palette.neutralBorder} 0%, ${palette.backgroundSurface} 100%)`,
    color: palette.textSecondary,
    fontSize: '1.5rem',
    fontWeight: 600,
    opacity: isLoading ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  };

  const errorStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '0.5rem',
    background: `linear-gradient(135deg, ${palette.neutralBorder} 0%, ${palette.backgroundSurface} 100%)`,
    color: palette.textSecondary,
    fontSize: '0.9rem',
    textAlign: 'center',
    padding: '1rem',
  };

  if (!imageSrc || imageError) {
    return (
      <div className={className} style={containerStyle}>
        <div style={errorStyle}>
          {fallbackText ? (
            <span>{fallbackText}</span>
          ) : (
            <>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ opacity: 0.5 }}
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span style={{ fontSize: '0.85rem' }}>
                {alt || 'Image not available'}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      {showPlaceholder && isLoading && (
        <div style={placeholderStyle}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${palette.neutralBorder}`,
              borderTopColor: palette.brandPrimaryStrong,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        style={imageStyle}
        onError={handleError}
        onLoad={handleLoad}
        loading="lazy"
        decoding="async"
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}


'use client';

import Image from 'next/image';
import { useState } from 'react';
import { palette } from '@/styles/theme';

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
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
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
  width,
  height,
  fill,
  priority = false,
  sizes,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
    if (onError) {
      onError();
    }
  };

  const handleLoad = () => {
    if (onLoad) {
      onLoad();
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom: fill ? undefined : `${(1 / aspectRatio) * 100}%`,
    background: imageError || !src ? palette.neutralBorder : palette.backgroundInverse,
    overflow: 'hidden',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    objectFit,
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

  if (!src || imageError) {
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

  // Calculate dimensions if not provided
  const imageWidth = width || (height ? height * aspectRatio : 800);
  const imageHeight = height || (width ? width / aspectRatio : 450);

  return (
    <div className={className} style={containerStyle}>
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          style={imageStyle}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          unoptimized={src.startsWith('http') && !src.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={imageWidth}
          height={imageHeight}
          style={imageStyle}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
          unoptimized={src.startsWith('http') && !src.includes(process.env.NEXT_PUBLIC_SUPABASE_URL || '')}
        />
      )}
    </div>
  );
}


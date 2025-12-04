/**
 * SupabaseImage Component
 * 
 * Component for displaying images from Supabase Storage with:
 * - Automatic fallback handling
 * - Error state management
 * - Loading states
 * - Support for public and private buckets
 */

import { useState, useEffect } from 'react';
import { getStoragePublicUrl, getStorageSignedUrl } from '../utils/supabase-storage';
import type { ReactNode } from 'react';

interface SupabaseImageProps {
  /** Storage bucket name */
  bucket: string;
  /** File path/key in the bucket */
  path: string | null | undefined;
  /** Alt text for the image */
  alt: string;
  /** CSS styles */
  style?: React.CSSProperties;
  /** CSS class name */
  className?: string;
  /** Whether the bucket is public (default: true) */
  isPublic?: boolean;
  /** Fallback image URL if loading fails */
  fallbackSrc?: string;
  /** Transform options for image optimization */
  transform?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  };
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: (error: Error) => void;
}

export function SupabaseImage({
  bucket,
  path,
  alt,
  style,
  className,
  isPublic = true,
  fallbackSrc,
  transform,
  onLoad,
  onError,
}: SupabaseImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      if (!path) {
        setIsLoading(false);
        setHasError(true);
        return;
      }

      setIsLoading(true);
      setHasError(false);
      setError(null);

      try {
        let url: string | null = null;

        if (isPublic) {
          // Use public URL
          url = getStoragePublicUrl(bucket, path, {
            useDirectUrl: false,
            transform,
          });
        } else {
          // Use signed URL for private buckets
          url = await getStorageSignedUrl(bucket, path, 3600);
        }

        if (!url) {
          throw new Error(`Failed to generate URL for path: ${path}`);
        }

        // Verify the image can be loaded
        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            setImageUrl(url);
            setIsLoading(false);
            setHasError(false);
            onLoad?.();
          }
        };
        img.onerror = () => {
          if (isMounted) {
            setHasError(true);
            setError(new Error(`Failed to load image from: ${url}`));
            setIsLoading(false);
            onError?.(new Error(`Failed to load image from: ${url}`));
          }
        };
        img.src = url;
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error('Unknown error loading image');
          setError(error);
          setHasError(true);
          setIsLoading(false);
          onError?.(error);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [bucket, path, isPublic, transform, onLoad, onError]);

  // Show fallback or placeholder
  if (hasError || !imageUrl) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          style={style}
          className={className}
        />
      );
    }
    return (
      <div
        style={{
          ...style,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          color: '#9ca3af',
          fontSize: '0.875rem',
        }}
        className={className}
      >
        {isLoading ? 'Loading...' : 'Image not available'}
      </div>
    );
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      style={style}
      className={className}
      onError={() => {
        setHasError(true);
        onError?.(new Error('Image load error'));
      }}
    />
  );
}


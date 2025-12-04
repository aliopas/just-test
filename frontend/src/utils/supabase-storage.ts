/**
 * Supabase Storage - مبسط
 * 
 * يستخدم الإعدادات الموحدة من config/supabase.config.ts
 */
import { getSupabaseBrowserClient } from './supabase-client';
import { SUPABASE } from '../config/supabase.config';

export const NEWS_IMAGES_BUCKET = 'news-images';
export const PROJECT_IMAGES_BUCKET = 'project-images';
export const COMPANY_CONTENT_IMAGES_BUCKET = 'company-content-images';

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function getStorageBaseUrl(): string {
  return SUPABASE.storageBaseUrl;
}

function stripPublicPrefix(path: string): string {
  return path
    .replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\//i, '')
    .replace(/^public\//i, '')
    .replace(/^\/+/, '');
}

function resolveBucketAndPath(
  fallbackBucket: string,
  rawPath: string
): { bucket: string; objectPath: string } {
  const sanitized = stripPublicPrefix(rawPath);

  if (fallbackBucket) {
    if (sanitized.startsWith(`${fallbackBucket}/`)) {
      const objectPath = sanitized.slice(fallbackBucket.length + 1);
      return {
        bucket: fallbackBucket,
        objectPath: objectPath || sanitized,
      };
    }

    return { bucket: fallbackBucket, objectPath: sanitized || rawPath };
  }

  const segments = sanitized.split('/').filter(Boolean);
  if (segments.length > 1) {
    const [maybeBucket, ...rest] = segments;
    return { bucket: maybeBucket, objectPath: rest.join('/') };
  }

  return { bucket: sanitized || rawPath, objectPath: '' };
}

function buildDirectPublicUrl(
  bucket: string,
  objectPath: string
): string | null {
  const baseUrl = getStorageBaseUrl();
  if (!baseUrl) {
    // Fallback: try to construct URL from SUPABASE config
    try {
      // Import SUPABASE config dynamically to avoid circular dependency
      const { SUPABASE } = require('../config/supabase.config');
      if (SUPABASE?.url) {
        const normalizedBucket = bucket.replace(/^\/+|\/+$/g, '');
        const normalizedPath = objectPath.replace(/^\/+/, '');
        return `${SUPABASE.url.replace(/\/+$/, '')}/storage/v1/object/public/${normalizedBucket}/${normalizedPath}`;
      }
    } catch {
      // If import fails, return null
    }
    return null;
  }

  const normalizedBucket = bucket.replace(/^\/+|\/+$/g, '');
  const normalizedPath = objectPath.replace(/^\/+/, '');
  return `${baseUrl}/${normalizedBucket}/${normalizedPath}`;
}

/**
 * Get public URL for a file in Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path/key in the bucket
 * @param options - Optional configuration
 * @returns The public URL or null if client is not available
 */
export function getStoragePublicUrl(
  bucket: string,
  path: string,
  options?: {
    /**
     * Force use of direct URL construction instead of Supabase client
     * Useful when client is not initialized or for SSR
     */
    useDirectUrl?: boolean;
    /**
     * Transform options for image optimization
     */
    transform?: {
      width?: number;
      height?: number;
      quality?: number;
      format?: 'webp' | 'jpeg' | 'png';
    };
  }
): string | null {
  if (!path) {
    return null;
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  const { bucket: resolvedBucket, objectPath } = resolveBucketAndPath(
    bucket,
    path
  );

  // Try direct URL first if requested or if client is not available
  const client = getSupabaseBrowserClient();
  const useDirect = options?.useDirectUrl || !client;

  if (useDirect) {
    const directUrl = buildDirectPublicUrl(resolvedBucket, objectPath);
    if (directUrl) {
      // Add transform parameters if provided
      if (options?.transform) {
        const params = new URLSearchParams();
        if (options.transform.width) params.append('width', options.transform.width.toString());
        if (options.transform.height) params.append('height', options.transform.height.toString());
        if (options.transform.quality) params.append('quality', options.transform.quality.toString());
        if (options.transform.format) params.append('format', options.transform.format);
        if (params.toString()) {
          return `${directUrl}?${params.toString()}`;
        }
      }
      return directUrl;
    }
  }

  // Use Supabase client if available
  if (client) {
    try {
      // Build transform options for Supabase
      const transformOptions: {
        transform?: {
          width?: number;
          height?: number;
          quality?: number;
        };
      } = {};

      if (options?.transform) {
        transformOptions.transform = {};
        if (options.transform.width) transformOptions.transform.width = options.transform.width;
        if (options.transform.height) transformOptions.transform.height = options.transform.height;
        if (options.transform.quality) transformOptions.transform.quality = options.transform.quality;
      }

      const { data } = client.storage
        .from(resolvedBucket)
        .getPublicUrl(objectPath, transformOptions.transform ? transformOptions : undefined);

      let url = data.publicUrl;

      // Add format as query param if specified (Supabase doesn't support it in transform)
      if (options?.transform?.format && url) {
        try {
          const urlObj = new URL(url);
          urlObj.searchParams.set('format', options.transform.format);
          url = urlObj.toString();
        } catch {
          // If URL parsing fails, return original URL
        }
      }

      return url;
    } catch (error) {
      console.error('[Supabase Storage] Failed to get public URL:', error);
      // Fallback to direct URL
      const fallbackUrl = buildDirectPublicUrl(resolvedBucket, objectPath);
      return fallbackUrl;
    }
  }

  // Final fallback
  return buildDirectPublicUrl(resolvedBucket, objectPath);
}

/**
 * Get signed URL for a private file in Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path/key in the bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Promise resolving to the signed URL or null
 */
export async function getStorageSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  if (!path) {
    return null;
  }

  if (isAbsoluteUrl(path)) {
    return path;
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return null;
  }

  try {
    const { bucket: resolvedBucket, objectPath } = resolveBucketAndPath(
      bucket,
      path
    );
    const { data, error } = await client.storage
      .from(resolvedBucket)
      .createSignedUrl(objectPath, expiresIn);
    if (error) {
      console.error('Failed to create signed URL:', error);
      return null;
    }
    return data.signedUrl;
  } catch (error) {
    console.error('Failed to get storage signed URL:', error);
    return null;
  }
}

/**
 * Resolve cover image URL from storage key
 * Supports multiple buckets: 'news-covers', 'internal-news-assets', etc.
 * @param coverKey - The storage key/path
 * @param bucket - Optional bucket name (default: 'news-covers')
 * @returns The public URL or null
 */
export function resolveCoverUrl(
  coverKey: string | null,
  bucket: string = NEWS_IMAGES_BUCKET
): string | null {
  if (!coverKey) {
    return null;
  }

  const url = getStoragePublicUrl(bucket, coverKey);
  
  // Add image transformation parameters for better performance
  // Supabase Storage supports image transformations via query params
  if (url) {
    // You can add transformations like: ?width=800&height=600&quality=80
    // For now, we return the base URL and let the component handle sizing
    return url;
  }
  
  return null;
}

/**
 * Get optimized image URL with transformations
 * @param coverKey - The storage key/path
 * @param options - Transformation options
 * @param bucket - Optional bucket name (default: 'news-covers')
 * @returns The optimized URL or null
 */
export function getOptimizedImageUrl(
  coverKey: string | null,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {},
  bucket: string = NEWS_IMAGES_BUCKET
): string | null {
  if (!coverKey) {
    return null;
  }

  const baseUrl = getStoragePublicUrl(bucket, coverKey);
  if (!baseUrl) {
    return null;
  }

  const params = new URLSearchParams();
  if (options.width) params.append('width', options.width.toString());
  if (options.height) params.append('height', options.height.toString());
  if (options.quality) params.append('quality', options.quality.toString());
  if (options.format) params.append('format', options.format);

  if (params.toString()) {
    return `${baseUrl}?${params.toString()}`;
  }

  return baseUrl;
}

/**
 * Resolve attachment download URL
 * For private buckets, this will return a signed URL
 * @param storageKey - The storage key/path
 * @param bucket - The bucket name (default: 'internal-news-assets')
 * @param isPublic - Whether the bucket is public (default: false)
 * @returns Promise resolving to the URL or null
 */
export async function resolveAttachmentUrl(
  storageKey: string | null,
  bucket: string = 'internal-news-assets',
  isPublic: boolean = false
): Promise<string | null> {
  if (!storageKey) {
    return null;
  }

  if (isAbsoluteUrl(storageKey)) {
    return storageKey;
  }

  if (isPublic) {
    return getStoragePublicUrl(bucket, storageKey);
  }

  // For private buckets, use signed URL
  return getStorageSignedUrl(bucket, storageKey, 3600); // 1 hour expiry
}


import { getSupabaseBrowserClient } from './supabase-client';

export const NEWS_IMAGES_BUCKET = 'news-images';

function sanitizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function isAbsoluteUrl(path: string): boolean {
  return /^https?:\/\//i.test(path);
}

function getSupabaseProjectUrl(): string | null {
  if (typeof window !== 'undefined') {
    const runtime = window.__ENV__?.SUPABASE_URL;
    if (runtime) {
      return sanitizeBaseUrl(runtime);
    }
  }

  const buildTime =
    import.meta.env?.VITE_SUPABASE_URL ?? import.meta.env?.SUPABASE_URL ?? null;

  return buildTime ? sanitizeBaseUrl(buildTime) : null;
}

function getStorageBaseUrl(): string | null {
  if (typeof window !== 'undefined') {
    const runtime = window.__ENV__?.SUPABASE_STORAGE_URL;
    if (runtime) {
      return sanitizeBaseUrl(runtime);
    }
  }

  const buildTime =
    import.meta.env?.VITE_SUPABASE_STORAGE_URL ??
    import.meta.env?.SUPABASE_STORAGE_URL ??
    null;

  if (buildTime) {
    return sanitizeBaseUrl(buildTime);
  }

  const supabaseUrl = getSupabaseProjectUrl();
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public`;
  }

  return null;
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
 * @returns The public URL or null if client is not available
 */
export function getStoragePublicUrl(
  bucket: string,
  path: string
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

  const directUrl = buildDirectPublicUrl(resolvedBucket, objectPath);
  if (directUrl) {
    return directUrl;
  }

  const client = getSupabaseBrowserClient();
  if (!client) {
    return null;
  }

  try {
    const { data } = client.storage
      .from(resolvedBucket)
      .getPublicUrl(objectPath);

    return data.publicUrl;
  } catch (error) {
    console.error('Failed to get storage public URL:', error);
    return null;
  }
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


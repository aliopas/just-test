import { getSupabaseBrowserClient } from './supabase-client';

/**
 * Get public URL for a file in Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path/key in the bucket
 * @returns The public URL or null if client is not available
 */
export function getStoragePublicUrl(bucket: string, path: string): string | null {
  const client = getSupabaseBrowserClient();
  if (!client) {
    return null;
  }

  try {
    const { data } = client.storage.from(bucket).getPublicUrl(path);
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
  const client = getSupabaseBrowserClient();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
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
  bucket: string = 'news-covers'
): string | null {
  if (!coverKey) {
    return null;
  }

  return getStoragePublicUrl(bucket, coverKey);
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

  if (isPublic) {
    return getStoragePublicUrl(bucket, storageKey);
  }

  // For private buckets, use signed URL
  return getStorageSignedUrl(bucket, storageKey, 3600); // 1 hour expiry
}


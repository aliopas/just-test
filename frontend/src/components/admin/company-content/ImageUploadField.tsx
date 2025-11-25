import { useState, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import { OptimizedImage } from '../../OptimizedImage';
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '../../../utils/supabase-storage';

interface ImageUploadFieldProps {
  value: string | null;
  onChange: (storageKey: string | null) => void;
  onUpload: (file: File) => Promise<{ storageKey: string }>;
  label?: string;
  uploading?: boolean;
}

export function ImageUploadField({
  value,
  onChange,
  onUpload,
  label,
  uploading = false,
}: ImageUploadFieldProps) {
  const { language, direction } = useLanguage();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isArabic = language === 'ar';

  const imageUrl = value
    ? getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, value)
    : previewUrl;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    setIsUploading(true);
    try {
      const result = await onUpload(file);
      onChange(result.storageKey);
    } catch (error) {
      console.error('Failed to upload image:', error);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ width: '100%', direction }}>
      {label && (
        <label
          style={{
            display: 'block',
            fontSize: '0.95rem',
            fontWeight: 600,
            color: palette.textPrimary,
            marginBottom: '0.5rem',
          }}
        >
          {label}
        </label>
      )}

      {imageUrl ? (
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '300px',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: `2px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
          }}
        >
          <OptimizedImage
            src={imageUrl}
            alt="Preview"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading || uploading}
            style={{
              position: 'absolute',
              top: '0.5rem',
              [direction === 'rtl' ? 'left' : 'right']: '0.5rem',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#FFFFFF',
              cursor: isUploading || uploading ? 'not-allowed' : 'pointer',
              fontSize: '1.2rem',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '36px',
              minHeight: '36px',
            }}
          >
            ×
          </button>
          {(isUploading || uploading) && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#FFFFFF',
                textAlign: 'center',
                fontSize: '0.875rem',
              }}
            >
              {isArabic ? 'جاري الرفع...' : 'Uploading...'}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            border: `2px dashed ${palette.neutralBorderSoft}`,
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            background: palette.backgroundSurface,
            cursor: isUploading || uploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
          }}
          onClick={() => {
            if (!isUploading && !uploading) {
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
              const objectUrl = URL.createObjectURL(file);
              setPreviewUrl(objectUrl);
              setIsUploading(true);
              onUpload(file)
                .then((result) => {
                  onChange(result.storageKey);
                })
                .catch((error) => {
                  console.error('Failed to upload image:', error);
                  setPreviewUrl(null);
                })
                .finally(() => {
                  setIsUploading(false);
                });
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={isUploading || uploading}
          />
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📷</div>
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: palette.textPrimary,
              marginBottom: '0.25rem',
            }}
          >
            {isArabic ? 'انقر لرفع صورة' : 'Click to upload image'}
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: palette.textSecondary,
            }}
          >
            {isArabic ? 'أو اسحب وأفلت' : 'or drag and drop'}
          </div>
        </div>
      )}
    </div>
  );
}


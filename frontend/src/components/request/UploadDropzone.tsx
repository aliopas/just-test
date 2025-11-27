import { useCallback, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { tRequest } from '../../locales/newRequest';
import { useRequestAttachmentPresign } from '../../hooks/useRequestAttachment';
import { useToast } from '../../context/ToastContext';

interface UploadedFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface UploadDropzoneProps {
  requestId: string | null;
  onFilesChange?: (files: File[]) => void;
  onUploadComplete?: (uploadedFiles: UploadedFile[]) => void;
  disabled?: boolean;
}

export function UploadDropzone({
  requestId,
  onFilesChange,
  onUploadComplete,
  disabled = false,
}: UploadDropzoneProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setDragging] = useState(false);
  const presignMutation = useRequestAttachmentPresign(requestId);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile> => {
      if (!requestId) {
        throw new Error('Request ID is required');
      }

      // Validate file
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          language === 'ar'
            ? 'نوع الملف غير مدعوم. يُسمح فقط بـ PDF, JPG, PNG'
            : 'File type not supported. Only PDF, JPG, PNG are allowed'
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(
          language === 'ar'
            ? 'حجم الملف يجب أن يكون أقل من 10MB'
            : 'File size must be less than 10MB'
        );
      }

      // Get presign URL
      const presignResult = await presignMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // Upload to Supabase Storage
      const headers = new Headers(presignResult.headers);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', file.type);
      }

      const uploadResponse = await fetch(presignResult.uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          language === 'ar'
            ? `فشل رفع الملف: ${uploadResponse.status}`
            : `File upload failed: ${uploadResponse.status}`
        );
      }

      return {
        id: presignResult.attachmentId,
        file,
        status: 'success',
      };
    },
    [requestId, presignMutation, language]
  );

  const handleFiles = useCallback(
    async (incoming: FileList | null) => {
      if (!incoming) return;

      const fileList = Array.from(incoming);
      
      // If no requestId, just store files for later
      if (!requestId) {
        onFilesChange?.(fileList);
        return;
      }

      const newFiles: UploadedFile[] = fileList.map(file => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        file,
        status: 'pending',
      }));

      setFiles(prev => [...prev, ...newFiles]);
      onFilesChange?.(fileList);

      // Upload files
      for (const uploadFileItem of newFiles) {
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFileItem.id ? { ...f, status: 'uploading' } : f
          )
        );

        try {
          const uploaded = await uploadFile(uploadFileItem.file);
          setFiles(prev =>
            prev.map(f => (f.id === uploadFileItem.id ? uploaded : f))
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : language === 'ar'
              ? 'فشل رفع الملف'
              : 'File upload failed';

          setFiles(prev =>
            prev.map(f =>
              f.id === uploadFileItem.id
                ? { ...f, status: 'error', error: errorMessage }
                : f
            )
          );

          pushToast({
            message: `${uploadFileItem.file.name}: ${errorMessage}`,
            variant: 'error',
          });
        }
      }

      // Notify parent of completed uploads
      setFiles(current => {
        const completed = current.filter(f => f.status === 'success');
        onUploadComplete?.(completed);
        return current;
      });
    },
    [requestId, onFilesChange, onUploadComplete, uploadFile, language, pushToast]
  );

  return (
    <div style={{ direction }}>
      <label
        htmlFor="attachments"
        style={{
          display: 'block',
          fontWeight: 600,
          marginBottom: '0.5rem',
          color: 'var(--color-text-primary)',
        }}
      >
        {tRequest('form.documents', language)}
      </label>
      <div
        onDragOver={event => {
          event.preventDefault();
          if (!disabled && requestId) {
            setDragging(true);
          }
        }}
        onDragLeave={event => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={event => {
          event.preventDefault();
          setDragging(false);
          if (!disabled && requestId) {
            handleFiles(event.dataTransfer?.files ?? null);
          }
        }}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-brand-primary)' : 'var(--color-brand-secondary-soft)'}`,
          borderRadius: '1rem',
          padding: '1.5rem',
          background: isDragging ? 'var(--color-background-alt)' : 'var(--color-background-surface)',
          color: 'var(--color-brand-accent-deep)',
          textAlign: 'center',
          cursor: disabled || !requestId ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          opacity: disabled || !requestId ? 0.6 : 1,
        }}
      >
        <input
          id="attachments"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          hidden
          disabled={disabled || !requestId}
          onChange={event => handleFiles(event.target.files)}
        />
        <label
          htmlFor="attachments"
          style={{
            cursor: disabled || !requestId ? 'not-allowed' : 'pointer',
            opacity: disabled || !requestId ? 0.6 : 1,
          }}
        >
          <strong>{'\u{1F4CE}'}</strong>
          <div style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
            {tRequest('form.uploadHint', language)}
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <ul
          style={{
            marginTop: '0.75rem',
            listStyle: 'none',
            padding: 0,
            display: 'grid',
            gap: '0.5rem',
          }}
        >
          {files.map(uploadedFile => (
            <li
              key={uploadedFile.id}
              style={{
                background: 'var(--color-background-surface)',
                border: `1px solid ${
                  uploadedFile.status === 'success'
                    ? 'var(--color-brand-primary)'
                    : uploadedFile.status === 'error'
                    ? '#DC2626'
                    : uploadedFile.status === 'uploading'
                    ? 'var(--color-brand-secondary-soft)'
                    : 'var(--color-border-soft)'
                }`,
                borderRadius: '0.75rem',
                padding: '0.6rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9rem',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {uploadedFile.status === 'success' && '✅'}
                {uploadedFile.status === 'error' && '❌'}
                {uploadedFile.status === 'uploading' && '⏳'}
                {uploadedFile.status === 'pending' && '📄'}
                {uploadedFile.file.name}
              </span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                  {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                {uploadedFile.status === 'error' && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiles(prev => prev.filter(f => f.id !== uploadedFile.id));
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#DC2626',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.25rem',
                    }}
                    aria-label={language === 'ar' ? 'إزالة' : 'Remove'}
                  >
                    ×
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!requestId && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.75rem',
            background: 'var(--color-background-alt)',
            borderRadius: '0.75rem',
            color: 'var(--color-text-muted)',
            fontSize: '0.85rem',
            textAlign: 'center',
          }}
        >
          {language === 'ar'
            ? 'سيتم رفع الملفات بعد إنشاء الطلب'
            : 'Files will be uploaded after creating the request'}
        </div>
      )}
    </div>
  );
}

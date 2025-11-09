import { useCallback, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { tRequest } from '../../locales/newRequest';

interface UploadDropzoneProps {
  onFilesChange: (files: File[]) => void;
}

export function UploadDropzone({ onFilesChange }: UploadDropzoneProps) {
  const { language, direction } = useLanguage();
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const list = Array.from(incoming);
      setFiles(list);
      onFilesChange(list);
    },
    [onFilesChange]
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
          setDragging(true);
        }}
        onDragLeave={event => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={event => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer?.files ?? null);
        }}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-brand-primary)' : 'var(--color-brand-secondary-soft)'}`,
          borderRadius: '1rem',
          padding: '1.5rem',
          background: isDragging ? 'var(--color-background-alt)' : 'var(--color-background-surface)',
          color: 'var(--color-brand-accent-deep)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input
          id="attachments"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          hidden
          onChange={event => handleFiles(event.target.files)}
        />
        <label htmlFor="attachments" style={{ cursor: 'pointer' }}>
          <strong>â¬†ï¸</strong>
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
          {files.map(file => (
            <li
              key={file.name}
              style={{
                background: 'var(--color-background-surface)',
                border: '1px solid var(--color-border-soft)',
                borderRadius: '0.75rem',
                padding: '0.6rem 0.85rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                ðŸ“„ {file.name}
              </span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}




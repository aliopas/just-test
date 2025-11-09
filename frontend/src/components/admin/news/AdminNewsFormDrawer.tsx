import { useEffect, useMemo, useState } from 'react';
import type { AdminNewsItem, NewsStatus } from '../../../types/news';
import type { NewsImagePresignResponse } from '../../../types/news';
import { useLanguage } from '../../../context/LanguageContext';
import { tAdminNews } from '../../../locales/adminNews';

type FormValues = {
  title: string;
  slug: string;
  status: NewsStatus;
  bodyMd: string;
  scheduledAt: string;
  publishedAt: string;
  coverKey: string | null;
};

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  news?: AdminNewsItem | null;
  isLoadingDetail?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    title: string;
    slug: string;
    bodyMd: string;
    status: NewsStatus;
    coverKey: string | null;
    scheduledAt: string | null;
    publishedAt: string | null;
  }) => Promise<void>;
  submitting: boolean;
  onDelete?: () => Promise<void>;
  deleting?: boolean;
  onPresignImage: (file: File) => Promise<NewsImagePresignResponse>;
}

type ValidationErrors = Partial<Record<'scheduledAt' | 'publishedAt' | 'title' | 'slug', string>>;

export function AdminNewsFormDrawer({
  open,
  mode,
  news,
  isLoadingDetail = false,
  onClose,
  onSubmit,
  submitting,
  onDelete,
  deleting,
  onPresignImage,
}: Props) {
  const { language, direction } = useLanguage();
  const [values, setValues] = useState<FormValues>(() => initialFormValues());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);
  const reviewEntries = news?.reviews ?? [];

  useEffect(() => {
    if (open) {
      const nextValues = news
        ? {
            title: news.title,
            slug: news.slug,
            status: news.status,
            bodyMd: news.bodyMd,
            scheduledAt: toInputValue(news.scheduledAt),
            publishedAt: toInputValue(news.publishedAt),
            coverKey: news.coverKey,
          }
        : initialFormValues();
      setValues(nextValues);
      setErrors({});
      if (news?.coverKey) {
        setCoverPreview(null);
      } else {
        setCoverPreview(null);
      }
    }
  }, [open, news]);

  const drawerTitle = useMemo(
    () =>
      mode === 'create'
        ? tAdminNews('form.drawerTitle.create', language)
        : tAdminNews('form.drawerTitle.edit', language),
    [mode, language]
  );

  if (!open) {
    return null;
  }

  const handleChange = (field: keyof FormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (status: NewsStatus) => {
    setValues(prev => ({
      ...prev,
      status,
    }));
  };

  const handleCoverSelection = async (file: File | null) => {
    if (!file) {
      setValues(prev => ({ ...prev, coverKey: null }));
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
      setCoverPreview(null);
      return;
    }

    try {
      setUploading(true);
      const presign = await onPresignImage(file);
      const headers = new Headers(presign.headers);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', file.type);
      }

      const response = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      setValues(prev => ({ ...prev, coverKey: presign.storageKey }));
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
      setCoverPreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setUploading(false);
    }
  };
  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: ValidationErrors = {};

    if (!values.title.trim()) {
      nextErrors.title =
        language === 'ar' ? 'Ø§Ù„Ø¹Ù†ÙˆØ§Ù† Ù…Ø·Ù„ÙˆØ¨' : 'Title is required';
    }

    if (!values.slug.trim()) {
      nextErrors.slug =
        language === 'ar' ? 'Ø§Ù„Ù…Ø¹Ø±Ù‘Ù Ù…Ø·Ù„ÙˆØ¨' : 'Slug is required';
    }

    if (values.status === 'scheduled' && !values.scheduledAt) {
      nextErrors.scheduledAt = tAdminNews('form.validation.scheduleRequired', language);
    }

    if (values.status === 'published' && !values.publishedAt) {
      nextErrors.publishedAt = tAdminNews('form.validation.publishRequired', language);
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      title: values.title.trim(),
      slug: values.slug.trim(),
      bodyMd: values.bodyMd,
      status: values.status,
      coverKey: values.coverKey,
      scheduledAt:
        values.status === 'scheduled' && values.scheduledAt
          ? new Date(values.scheduledAt).toISOString()
          : null,
      publishedAt:
        values.status === 'published' && values.publishedAt
          ? new Date(values.publishedAt).toISOString()
          : null,
    });
  };

  const handleAutoSlug = () => {
    if (!values.title.trim()) return;
    const slug = values.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValues(prev => ({ ...prev, slug }));
  };

  return (
    <div style={overlayStyle}>
      <div style={drawerStyle(direction)}>
        <header style={drawerHeaderStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-text-primary)' }}>{drawerTitle}</h2>
            <p style={{ margin: '0.4rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              {language === 'ar'
                ? 'Ù‚Ù… Ø¨ØªØ¹Ø¨Ø¦Ø© Ø§Ù„ØªÙØ§ØµÙŠÙ„ Ø«Ù… Ø§Ø­ÙØ¸ Ø§Ù„Ù…Ø³ÙˆØ¯Ø© Ø£Ùˆ Ø¬Ø¯ÙˆÙ„ Ø§Ù„Ù†Ø´Ø±.'
                : 'Fill in the details, then save the draft or schedule publication.'}
            </p>
          </div>
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            âœ•
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}
        >
          <section style={sectionStyle}>
            <label style={labelStyle}>
              {tAdminNews('form.title', language)}
              <input
                type="text"
                value={values.title}
                onChange={event => handleChange('title', event.target.value)}
                onBlur={handleAutoSlug}
                style={{ ...inputStyle, borderColor: errors.title ? '#DC2626' : 'var(--color-brand-secondary-soft)' }}
              />
              {errors.title && <span style={errorStyle}>{errors.title}</span>}
            </label>

            <label style={labelStyle}>
              {tAdminNews('form.slug', language)}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={values.slug}
                  onChange={event => handleChange('slug', event.target.value)}
                  style={{ ...inputStyle, borderColor: errors.slug ? '#DC2626' : 'var(--color-brand-secondary-soft)' }}
                />
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  style={{ ...secondaryButtonStyle, padding: '0 1rem' }}
                >
                  {language === 'ar' ? 'ØªÙˆÙ„ÙŠØ¯' : 'Generate'}
                </button>
              </div>
              {errors.slug && <span style={errorStyle}>{errors.slug}</span>}
            </label>

            <label style={labelStyle}>
              {tAdminNews('form.status', language)}
              <select
                value={values.status}
                onChange={event => handleStatusChange(event.target.value as NewsStatus)}
                style={inputStyle}
              >
                <option value="draft">{tAdminNews('list.status.draft', language)}</option>
                <option value="pending_review">
                  {tAdminNews('list.status.pending_review', language)}
                </option>
                <option value="scheduled">{tAdminNews('list.status.scheduled', language)}</option>
                <option value="published">{tAdminNews('list.status.published', language)}</option>
                <option value="rejected">{tAdminNews('list.status.rejected', language)}</option>
                <option value="archived">{tAdminNews('list.status.archived', language)}</option>
              </select>
            </label>

            {values.status === 'scheduled' && (
              <label style={labelStyle}>
                {tAdminNews('form.scheduleLabel', language)}
                <input
                  type="datetime-local"
                  value={values.scheduledAt}
                  onChange={event => handleChange('scheduledAt', event.target.value)}
                  style={{ ...inputStyle, borderColor: errors.scheduledAt ? '#DC2626' : 'var(--color-brand-secondary-soft)' }}
                />
                {errors.scheduledAt && <span style={errorStyle}>{errors.scheduledAt}</span>}
              </label>
            )}

            {values.status === 'published' && (
              <label style={labelStyle}>
                {tAdminNews('form.publishAtLabel', language)}
                <input
                  type="datetime-local"
                  value={values.publishedAt}
                  onChange={event => handleChange('publishedAt', event.target.value)}
                  style={{ ...inputStyle, borderColor: errors.publishedAt ? '#DC2626' : 'var(--color-brand-secondary-soft)' }}
                />
                {errors.publishedAt && <span style={errorStyle}>{errors.publishedAt}</span>}
              </label>
            )}
          </section>

          <section style={sectionStyle}>
            <label style={labelStyle}>
              {tAdminNews('form.cover', language)}
              <input
                type="file"
                accept="image/*"
                onChange={event => handleCoverSelection(event.target.files?.[0] ?? null)}
              />
              <small style={{ color: 'var(--color-text-secondary)', display: 'block', marginTop: '0.35rem' }}>
                {tAdminNews('form.coverHint', language)}
              </small>
              {isUploading && (
                <small style={{ color: 'var(--color-brand-primary-strong)' }}>
                  {language === 'ar' ? 'Ø¬Ø§Ø±Ù Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©â€¦' : 'Uploading imageâ€¦'}
                </small>
              )}
              {values.coverKey && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--color-border-soft)',
                    borderRadius: '0.85rem',
                    background: 'var(--color-background-surface)',
                  }}
                >
                  <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                    {language === 'ar' ? 'Ø§Ù„Ù…ÙØªØ§Ø­ Ø§Ù„ØªØ®Ø²ÙŠÙ†ÙŠ:' : 'Storage key:'}
                  </strong>
                  <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                    {values.coverKey}
                  </div>
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{
                        marginTop: '0.75rem',
                        maxWidth: '100%',
                        borderRadius: '0.75rem',
                        boxShadow: '0 8px 25px rgba(15, 23, 42, 0.15)',
                      }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleCoverSelection(null)}
                    style={{
                      ...secondaryButtonStyle,
                      marginTop: '0.75rem',
                      background: '#FEE2E2',
                      color: '#B91C1C',
                      borderColor: '#FECACA',
                    }}
                  >
                    {language === 'ar' ? 'Ø¥Ø²Ø§Ù„Ø© Ø§Ù„ØµÙˆØ±Ø©' : 'Remove image'}
                  </button>
                </div>
              )}
            </label>
          </section>

          <section style={sectionStyle}>
            <label style={{ ...labelStyle, width: '100%' }}>
              {tAdminNews('form.body', language)}
              <textarea
                value={values.bodyMd}
                onChange={event => handleChange('bodyMd', event.target.value)}
                rows={12}
                style={{ ...textareaStyle, borderColor: 'var(--color-brand-secondary-soft)' }}
              />
            </label>
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.85rem',
                border: '1px dashed var(--color-brand-secondary-soft)',
                background: 'var(--color-background-surface)',
                color: 'var(--color-brand-accent-mid)',
                minHeight: '120px',
              }}
            >
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                {language === 'ar' ? 'Ù…Ø¹Ø§ÙŠÙ†Ø© Ø³Ø±ÙŠØ¹Ø©' : 'Quick preview'}
              </strong>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  margin: 0,
                }}
              >
                {values.bodyMd || (language === 'ar' ? 'Ø£Ø¶Ù Ø§Ù„Ù…Ø­ØªÙˆÙ‰ Ù‡Ù†Ø§â€¦' : 'Start typingâ€¦')}
              </pre>
            </div>
          </section>

          {mode === 'edit' && (
            <section style={sectionStyle}>
              <div style={reviewCardStyle}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '1.05rem',
                    color: 'var(--color-text-primary)',
                    fontWeight: 700,
                  }}
                >
                  {tAdminNews('table.reviewHistory', language)}
                </h3>
                {isLoadingDetail ? (
                  <p style={{ color: 'var(--color-text-secondary)', margin: '0.75rem 0 0' }}>
                    {tAdminNews('table.loading', language)}
                  </p>
                ) : reviewEntries.length === 0 ? (
                  <p style={{ color: 'var(--color-brand-secondary-muted)', margin: '0.75rem 0 0' }}>
                    {tAdminNews('table.noReviews', language)}
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {reviewEntries.map(review => {
                      const reviewerLabel =
                        review.reviewer.email ?? review.reviewer.id ?? 'â€”';
                      const actionLabel =
                        review.action === 'approve'
                          ? tAdminNews('table.approve', language)
                          : tAdminNews('table.reject', language);
                      return (
                        <article key={review.id} style={reviewEntryStyle}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: 'var(--color-brand-accent-deep)', fontSize: '0.95rem' }}>
                              {actionLabel}
                            </strong>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                              {formatReviewDate(review.createdAt, language)}
                            </span>
                          </div>
                          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                            {tAdminNews('table.reviewer', language)}: {reviewerLabel || 'â€”'}
                          </div>
                          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                            <strong>{tAdminNews('table.reviewComment', language)}:</strong>{' '}
                            {review.comment && review.comment.trim().length > 0
                              ? review.comment
                              : 'â€”'}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

          <footer style={footerStyle}>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      language === 'ar'
                        ? 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ø®Ø¨Ø±ØŸ'
                        : 'Delete this news item permanently?'
                    )
                  ) {
                    onDelete();
                  }
                }}
                style={deleteButtonStyle}
                disabled={Boolean(deleting)}
              >
                {deleting ? 'â€¦' : tAdminNews('form.deleteConfirmAccept', language)}
              </button>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} style={secondaryButtonStyle}>
                {tAdminNews('form.cancel', language)}
              </button>
              <button
                type="submit"
                disabled={submitting || isUploading}
                style={{
                  ...primaryButtonStyle,
                  cursor: submitting || isUploading ? 'not-allowed' : 'pointer',
                  opacity: submitting || isUploading ? 0.65 : 1,
                }}
              >
                {submitting ? `${tAdminNews('form.save', language)}â€¦` : tAdminNews('form.save', language)}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

function initialFormValues(): FormValues {
  return {
    title: '',
    slug: '',
    status: 'draft',
    bodyMd: '',
    scheduledAt: '',
    publishedAt: '',
    coverKey: null,
  };
}

function toInputValue(value: string | null) {
  if (!value) return '';
  try {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
}

function formatReviewDate(value: string, language: string) {
  try {
    return new Date(value).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.35)',
  display: 'flex',
  justifyContent: 'flex-end',
  zIndex: 50,
};

const drawerStyle = (direction: 'ltr' | 'rtl'): React.CSSProperties => ({
  width: 'min(540px, 100vw)',
  height: '100%',
  background: 'var(--color-background-surface)',
  padding: '2rem 1.75rem 2.5rem',
  boxShadow: direction === 'rtl' ? '-32px 0 60px rgba(15,23,42,0.25)' : '32px 0 60px rgba(15,23,42,0.25)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
});

const drawerHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '1rem',
};

const closeButtonStyle: React.CSSProperties = {
  border: 'none',
  background: 'var(--color-background-base)',
  color: 'var(--color-text-primary)',
  borderRadius: '0.75rem',
  padding: '0.4rem 0.75rem',
  cursor: 'pointer',
  fontSize: '1rem',
};

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const reviewCardStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '1rem',
  padding: '1.2rem',
  background: 'var(--color-background-surface)',
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.04)',
};

const reviewEntryStyle: React.CSSProperties = {
  border: '1px solid var(--color-border)',
  borderRadius: '0.85rem',
  padding: '0.85rem 1rem',
  background: 'var(--color-background-surface)',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.35rem',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  color: 'var(--color-text-primary)',
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  padding: '0.7rem 0.95rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  fontSize: '0.95rem',
  color: 'var(--color-text-primary)',
  background: 'var(--color-background-surface)',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: '200px',
  resize: 'vertical' as const,
  lineHeight: 1.6,
};

const footerStyle: React.CSSProperties = {
  marginTop: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

const primaryButtonStyle: React.CSSProperties = {
  background: 'var(--color-brand-primary-strong)',
  color: 'var(--color-text-on-brand)',
  border: 'none',
  borderRadius: '0.85rem',
  padding: '0.75rem 1.8rem',
  fontWeight: 700,
  fontSize: '0.95rem',
  boxShadow: '0 16px 30px rgba(37, 99, 235, 0.25)',
};

const secondaryButtonStyle: React.CSSProperties = {
  background: 'var(--color-background-surface)',
  color: 'var(--color-brand-accent-deep)',
  borderRadius: '0.85rem',
  padding: '0.7rem 1.6rem',
  fontWeight: 600,
  fontSize: '0.9rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  cursor: 'pointer',
};

const deleteButtonStyle: React.CSSProperties = {
  background: '#FFE4E6',
  color: '#B91C1C',
  border: 'none',
  borderRadius: '0.85rem',
  padding: '0.65rem 1.4rem',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
};

const errorStyle: React.CSSProperties = {
  color: '#DC2626',
  fontSize: '0.8rem',
  fontWeight: 500,
};




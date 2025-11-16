import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  AdminNewsItem,
  NewsStatus,
  NewsAttachment,
  NewsAudience,
} from '../../../types/news';
import type {
  NewsImagePresignResponse,
  NewsAttachmentPresignResponse,
} from '../../../types/news';
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
  audience: NewsAudience;
  attachments: NewsAttachment[];
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
    audience: NewsAudience;
    attachments: NewsAttachment[];
  }) => Promise<void>;
  submitting: boolean;
  onDelete?: () => Promise<void>;
  deleting?: boolean;
  onPresignImage: (file: File) => Promise<NewsImagePresignResponse>;
  onPresignAttachment: (
    file: File
  ) => Promise<NewsAttachmentPresignResponse>;
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
  onPresignAttachment,
}: Props) {
  const { language, direction } = useLanguage();
  const [values, setValues] = useState<FormValues>(() => initialFormValues());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);
  const [isAttachmentUploading, setAttachmentUploading] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const formScrollRef = useRef<HTMLDivElement | null>(null);
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
            audience: news.audience,
            attachments: news.attachments ?? [],
          }
        : initialFormValues();
      setValues(nextValues);
      setErrors({});
      setShowValidationAlert(false);
      if (news?.coverKey) {
        setCoverPreview(null);
      } else {
        setCoverPreview(null);
      }
      // Reset scroll to top when opening
      if (formScrollRef.current) {
        formScrollRef.current.scrollTop = 0;
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

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

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

  const handleAudienceChange = (audience: NewsAudience) => {
    setValues(prev => ({
      ...prev,
      audience,
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

  const handleAttachmentsSelection = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const fileArray = Array.from(files);
    setAttachmentUploading(true);

    try {
      const uploaded: NewsAttachment[] = [];

      for (const file of fileArray) {
        const presign = await onPresignAttachment(file);
        const headers = new Headers(presign.headers);
        if (!headers.has('Content-Type')) {
          headers.set(
            'Content-Type',
            file.type && file.type.length > 0
              ? file.type
              : 'application/octet-stream'
          );
        }

        const response = await fetch(presign.uploadUrl, {
          method: 'PUT',
          headers,
          body: file,
        });

        if (!response.ok) {
          throw new Error(`Attachment upload failed with status ${response.status}`);
        }

        uploaded.push({
          id: presign.attachmentId,
          name: file.name,
          storageKey: presign.storageKey,
          mimeType: file.type && file.type.length > 0 ? file.type : null,
          size: file.size ?? null,
          type: file.type.startsWith('image/') ? 'image' : 'document',
        });
      }

      if (uploaded.length > 0) {
        setValues(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...uploaded],
        }));
      }
    } catch (error) {
      console.error('Failed to upload attachment:', error);
    } finally {
      setAttachmentUploading(false);
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = '';
      }
    }
  };

  const handleAttachmentRemove = (attachmentId: string) => {
    setValues(prev => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => attachment.id !== attachmentId),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: ValidationErrors = {};

    if (!values.title.trim()) {
      nextErrors.title =
        language === 'ar' ? 'العنوان مطلوب' : 'Title is required';
    }

    if (!values.slug.trim()) {
      nextErrors.slug =
        language === 'ar' ? 'المعرّف مطلوب' : 'Slug is required';
    }

    if (values.status === 'scheduled' && !values.scheduledAt) {
      nextErrors.scheduledAt = tAdminNews('form.validation.scheduleRequired', language);
    }

    if (values.status === 'published' && !values.publishedAt) {
      nextErrors.publishedAt = tAdminNews('form.validation.publishRequired', language);
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setShowValidationAlert(true);
      // Scroll to top to show validation alert
      if (formScrollRef.current) {
        formScrollRef.current.scrollTop = 0;
      }
      return;
    }

    setShowValidationAlert(false);
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
      audience: values.audience,
      attachments: values.attachments,
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
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .news-form-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .news-form-scroll::-webkit-scrollbar-track {
          background: var(--color-background-alt);
          border-radius: 4px;
        }
        .news-form-scroll::-webkit-scrollbar-thumb {
          background: var(--color-brand-secondary-soft);
          border-radius: 4px;
        }
        .news-form-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--color-brand-accent-deep);
        }
      `}</style>
      <div style={overlayStyle}>
        <div style={drawerStyle(direction)}>
          <header style={drawerHeaderStyle}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--color-text-primary)' }}>{drawerTitle}</h2>
            <p style={{ margin: '0.4rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              {language === 'ar'
                ? 'قم بتعبئة التفاصيل ثم احفظ المسودة أو جدول النشر.'
                : 'Fill in the details, then save the draft or schedule publication.'}
            </p>
          </div>
          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ✕
          </button>
        </header>

        <div
          ref={formScrollRef}
          className="news-form-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '0.5rem',
            marginRight: '-0.5rem',
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1rem' }}
          >
            {showValidationAlert && Object.keys(errors).length > 0 && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '0.85rem',
                  background: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  color: '#92400E',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <strong style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⚠️ {language === 'ar' ? 'تعذر حفظ الخبر' : 'Cannot save news'}
                </strong>
                <span style={{ fontSize: '0.9rem' }}>
                  {language === 'ar'
                    ? 'يرجى تصحيح الأخطاء التالية:'
                    : 'Please fix the following errors:'}
                </span>
                <ul style={{ margin: '0.25rem 0 0', paddingInlineStart: '1.5rem', fontSize: '0.85rem' }}>
                  {Object.entries(errors).map(([field, error]) => (
                    <li key={field}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {(submitting || isUploading || isAttachmentUploading) && (
              <div
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '0.85rem',
                  background: '#DBEAFE',
                  border: '1px solid #3B82F6',
                  color: '#1E40AF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                }}
              >
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                <span>
                  {submitting
                    ? language === 'ar'
                      ? 'جارٍ حفظ الخبر...'
                      : 'Saving news...'
                    : isUploading
                      ? language === 'ar'
                        ? 'جارٍ رفع الصورة... يرجى الانتظار'
                        : 'Uploading image... Please wait'
                      : language === 'ar'
                        ? 'جارٍ رفع المرفقات... يرجى الانتظار'
                        : 'Uploading attachments... Please wait'}
                </span>
              </div>
            )}

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
                  {language === 'ar' ? 'توليد' : 'Generate'}
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

            <div style={labelStyle}>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {tAdminNews('form.audience.label', language)}
              </span>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  marginTop: '0.5rem',
                }}
              >
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="news-audience"
                    value="public"
                    checked={values.audience === 'public'}
                    onChange={() => handleAudienceChange('public')}
                  />
                  <span>{tAdminNews('form.audience.public', language)}</span>
                </label>
                <label style={radioLabelStyle}>
                  <input
                    type="radio"
                    name="news-audience"
                    value="investor_internal"
                    checked={values.audience === 'investor_internal'}
                    onChange={() => handleAudienceChange('investor_internal')}
                  />
                  <span>{tAdminNews('form.audience.investor_internal', language)}</span>
                </label>
              </div>
              <small style={{ color: 'var(--color-text-secondary)', marginTop: '0.35rem' }}>
                {tAdminNews('form.audience.helper', language)}
              </small>
            </div>
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
                  {language === 'ar' ? 'جارٍ رفع الصورة…' : 'Uploading image…'}
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
                    {language === 'ar' ? 'المفتاح التخزيني:' : 'Storage key:'}
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
                    {language === 'ar' ? 'إزالة الصورة' : 'Remove image'}
                  </button>
                </div>
              )}
            </label>
          </section>

          <section style={sectionStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {tAdminNews('form.attachments.label', language)}
                </span>
                <div>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    multiple
                    onChange={event => handleAttachmentsSelection(event.target.files)}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => attachmentInputRef.current?.click()}
                    style={secondaryButtonStyle}
                  >
                    {tAdminNews('form.attachments.upload', language)}
                  </button>
                </div>
              </div>
              <small style={{ color: 'var(--color-text-secondary)' }}>
                {tAdminNews('form.attachments.helper', language)}
              </small>
              {isAttachmentUploading && (
                <small style={{ color: 'var(--color-brand-primary-strong)' }}>
                  {tAdminNews('form.attachments.uploading', language)}
                </small>
              )}
              {values.attachments.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '0.85rem',
                    border: '1px dashed var(--color-brand-secondary-soft)',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.9rem',
                  }}
                >
                  {tAdminNews('form.attachments.empty', language)}
                </div>
              ) : (
                <ul style={attachmentListStyle}>
                  {values.attachments.map(attachment => (
                    <li key={attachment.id} style={attachmentItemStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>
                          {attachment.name}
                        </strong>
                        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                          {attachment.type === 'image'
                            ? tAdminNews('form.attachments.type.image', language)
                            : tAdminNews('form.attachments.type.document', language)}
                          {' · '}
                          {formatAttachmentSize(attachment.size, language)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAttachmentRemove(attachment.id)}
                        style={{ ...secondaryButtonStyle, padding: '0.35rem 0.8rem' }}
                      >
                        {tAdminNews('form.attachments.remove', language)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
                {language === 'ar' ? 'معاينة سريعة' : 'Quick preview'}
              </strong>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  margin: 0,
                }}
              >
                {values.bodyMd || (language === 'ar' ? 'أضف المحتوى هنا…' : 'Start typing…')}
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
                        review.reviewer.email ?? review.reviewer.id ?? '\u2014';
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
                            {tAdminNews('table.reviewer', language)}: {reviewerLabel || '\u2014'}
                          </div>
                          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                            <strong>{tAdminNews('table.reviewComment', language)}:</strong>{' '}
                            {review.comment && review.comment.trim().length > 0
                              ? review.comment
                              : '\u2014'}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}
          </form>
        </div>

        <footer style={footerStyle}>
            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (
                    window.confirm(
                      language === 'ar'
                        ? 'هل أنت متأكد من حذف هذا الخبر؟'
                        : 'Delete this news item permanently?'
                    )
                  ) {
                    onDelete();
                  }
                }}
                style={deleteButtonStyle}
                disabled={Boolean(deleting)}
              >
                {deleting ? '…' : tAdminNews('form.deleteConfirmAccept', language)}
              </button>
            )}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} style={secondaryButtonStyle}>
                {tAdminNews('form.cancel', language)}
              </button>
              <button
                type="submit"
                disabled={submitting || isUploading || isAttachmentUploading}
                style={{
                  ...primaryButtonStyle,
                  cursor:
                    submitting || isUploading || isAttachmentUploading
                      ? 'not-allowed'
                      : 'pointer',
                  opacity:
                    submitting || isUploading || isAttachmentUploading ? 0.65 : 1,
                }}
              >
                {submitting ? `${tAdminNews('form.save', language)}…` : tAdminNews('form.save', language)}
              </button>
            </div>
        </footer>
        </div>
      </div>
    </>
  );
}

function formatAttachmentSize(size: number | null, language: string): string {
  if (!size || size <= 0) {
    return language === 'ar' ? 'غير متوفر' : 'N/A';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitsAr = ['بايت', 'ك.ب', 'م.ب', 'ج.ب'];
  let value = size;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    maximumFractionDigits: value < 10 ? 1 : 0,
  });

  const unitLabel = language === 'ar' ? unitsAr[index] : units[index];

  return `${formatter.format(value)} ${unitLabel}`;
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
    audience: 'public',
    attachments: [],
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

const radioLabelStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  fontSize: '0.95rem',
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
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.75rem',
  paddingTop: '1.5rem',
  borderTop: '1px solid var(--color-border-soft)',
  marginTop: '0.5rem',
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

const attachmentListStyle: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.65rem',
};

const attachmentItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '0.75rem',
  border: '1px solid var(--color-border-soft)',
  borderRadius: '0.85rem',
  padding: '0.75rem 1rem',
  background: 'var(--color-background-surface)',
  boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)',
};




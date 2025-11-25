import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { CompanyProfile } from '../../../hooks/useAdminCompanyContent';
import { ImageUploadField } from './ImageUploadField';
import { MarkdownEditor } from './MarkdownEditor';

interface CompanyProfileFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  profile?: CompanyProfile | null;
  isLoadingDetail?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    iconKey: string | null;
    displayOrder: number;
    isActive: boolean;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitting: boolean;
  deleting?: boolean;
  onPresignImage: (file: File) => Promise<{ storageKey: string }>;
}

export function CompanyProfileFormDrawer({
  open,
  mode,
  profile,
  isLoadingDetail = false,
  onClose,
  onSubmit,
  onDelete,
  submitting,
  deleting = false,
  onPresignImage,
}: CompanyProfileFormDrawerProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const container = document.getElementById('drawer-root') ?? document.body;

  const [values, setValues] = useState({
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    iconKey: null as string | null,
    displayOrder: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open && profile && mode === 'edit') {
      setValues({
        titleAr: profile.titleAr,
        titleEn: profile.titleEn,
        contentAr: profile.contentAr,
        contentEn: profile.contentEn,
        iconKey: profile.iconKey,
        displayOrder: profile.displayOrder,
        isActive: profile.isActive,
      });
      setErrors({});
    } else if (open && mode === 'create') {
      setValues({
        titleAr: '',
        titleEn: '',
        contentAr: '',
        contentEn: '',
        iconKey: null,
        displayOrder: 0,
        isActive: true,
      });
      setErrors({});
    }
  }, [open, profile, mode]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleChange = (field: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await onPresignImage(file);
      return result;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!values.titleAr.trim()) {
      newErrors.titleAr = isArabic ? 'العنوان العربي مطلوب' : 'Arabic title is required';
    }
    if (!values.titleEn.trim()) {
      newErrors.titleEn = isArabic ? 'العنوان الإنجليزي مطلوب' : 'English title is required';
    }
    if (!values.contentAr.trim()) {
      newErrors.contentAr = isArabic ? 'المحتوى العربي مطلوب' : 'Arabic content is required';
    }
    if (!values.contentEn.trim()) {
      newErrors.contentEn = isArabic ? 'المحتوى الإنجليزي مطلوب' : 'English content is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(values);
      onClose();
    } catch (error) {
      console.error('Failed to submit:', error);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        zIndex: 1000,
        direction,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '800px',
          background: palette.backgroundSurface,
          boxShadow: '-4px 0 24px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100vh',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            borderBottom: `1px solid ${palette.neutralBorderSoft}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            {mode === 'create'
              ? isArabic
                ? 'إضافة ملف تعريف جديد'
                : 'Add New Profile'
              : isArabic
                ? 'تعديل الملف التعريفي'
                : 'Edit Profile'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1.5rem',
              color: palette.textSecondary,
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {isLoadingDetail ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: palette.textSecondary }}>
              {isArabic ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : (
            <>
              {/* Title Ar */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: palette.textPrimary,
                    marginBottom: '0.5rem',
                  }}
                >
                  {isArabic ? 'العنوان (عربي) *' : 'Title (Arabic) *'}
                </label>
                <input
                  type="text"
                  value={values.titleAr}
                  onChange={(e) => handleChange('titleAr', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.titleAr ? '#DC2626' : palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textPrimary,
                    fontSize: '1rem',
                  }}
                />
                {errors.titleAr && (
                  <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.titleAr}
                  </span>
                )}
              </div>

              {/* Title En */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: palette.textPrimary,
                    marginBottom: '0.5rem',
                  }}
                >
                  {isArabic ? 'العنوان (إنجليزي) *' : 'Title (English) *'}
                </label>
                <input
                  type="text"
                  value={values.titleEn}
                  onChange={(e) => handleChange('titleEn', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.titleEn ? '#DC2626' : palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textPrimary,
                    fontSize: '1rem',
                  }}
                />
                {errors.titleEn && (
                  <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.titleEn}
                  </span>
                )}
              </div>

              {/* Content Ar */}
              <MarkdownEditor
                value={values.contentAr}
                onChange={(value) => handleChange('contentAr', value)}
                label={isArabic ? 'المحتوى (عربي) *' : 'Content (Arabic) *'}
                placeholder={isArabic ? 'أدخل المحتوى هنا...' : 'Enter content here...'}
                rows={8}
              />
              {errors.contentAr && (
                <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '-1rem', display: 'block' }}>
                  {errors.contentAr}
                </span>
              )}

              {/* Content En */}
              <MarkdownEditor
                value={values.contentEn}
                onChange={(value) => handleChange('contentEn', value)}
                label={isArabic ? 'المحتوى (إنجليزي) *' : 'Content (English) *'}
                placeholder={isArabic ? 'Enter content here...' : 'Enter content here...'}
                rows={8}
              />
              {errors.contentEn && (
                <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '-1rem', display: 'block' }}>
                  {errors.contentEn}
                </span>
              )}

              {/* Icon */}
              <ImageUploadField
                value={values.iconKey}
                onChange={(key) => handleChange('iconKey', key)}
                onUpload={handleImageUpload}
                label={isArabic ? 'الأيقونة' : 'Icon'}
                uploading={isUploading}
              />

              {/* Display Order */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: palette.textPrimary,
                    marginBottom: '0.5rem',
                  }}
                >
                  {isArabic ? 'ترتيب العرض' : 'Display Order'}
                </label>
                <input
                  type="number"
                  value={values.displayOrder}
                  onChange={(e) => handleChange('displayOrder', parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textPrimary,
                    fontSize: '1rem',
                  }}
                />
              </div>

              {/* Is Active */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={values.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: palette.textPrimary }}>
                    {isArabic ? 'نشط' : 'Active'}
                  </span>
                </label>
              </div>
            </>
          )}

          {/* Footer */}
          <div
            style={{
              paddingTop: '1.5rem',
              borderTop: `1px solid ${palette.neutralBorderSoft}`,
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
            }}
          >
            {mode === 'edit' && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting || submitting}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: '#DC2626',
                  color: '#FFFFFF',
                  cursor: deleting || submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  opacity: deleting || submitting ? 0.6 : 1,
                }}
              >
                {deleting ? (isArabic ? 'جاري الحذف...' : 'Deleting...') : isArabic ? 'حذف' : 'Delete'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || deleting}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: `1px solid ${palette.neutralBorderSoft}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                cursor: submitting || deleting ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
              }}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting || deleting || isLoadingDetail}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: palette.brandPrimaryStrong,
                color: '#FFFFFF',
                cursor: submitting || deleting || isLoadingDetail ? 'not-allowed' : 'pointer',
                fontSize: '0.95rem',
                fontWeight: 600,
                opacity: submitting || deleting || isLoadingDetail ? 0.6 : 1,
              }}
            >
              {submitting
                ? isArabic
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : mode === 'create'
                  ? isArabic
                    ? 'إضافة'
                    : 'Create'
                  : isArabic
                    ? 'حفظ'
                    : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    container
  );
}


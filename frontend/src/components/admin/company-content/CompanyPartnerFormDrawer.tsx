import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { CompanyPartner } from '../../../hooks/useAdminCompanyContent';
import { ImageUploadField } from './ImageUploadField';
import { MarkdownEditor } from './MarkdownEditor';

interface CompanyPartnerFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  partner?: CompanyPartner | null;
  isLoadingDetail?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    nameAr: string;
    nameEn: string;
    logoKey: string | null;
    descriptionAr: string | null;
    descriptionEn: string | null;
    websiteUrl: string | null;
    displayOrder: number;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitting: boolean;
  deleting?: boolean;
  onPresignImage: (file: File) => Promise<{ storageKey: string }>;
}

export function CompanyPartnerFormDrawer({
  open,
  mode,
  partner,
  isLoadingDetail = false,
  onClose,
  onSubmit,
  onDelete,
  submitting,
  deleting = false,
  onPresignImage,
}: CompanyPartnerFormDrawerProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const container = document.getElementById('drawer-root') ?? document.body;

  const [values, setValues] = useState({
    nameAr: '',
    nameEn: '',
    logoKey: null as string | null,
    descriptionAr: null as string | null,
    descriptionEn: null as string | null,
    websiteUrl: null as string | null,
    displayOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open && partner && mode === 'edit') {
      setValues({
        nameAr: partner.nameAr,
        nameEn: partner.nameEn,
        logoKey: partner.logoKey,
        descriptionAr: partner.descriptionAr,
        descriptionEn: partner.descriptionEn,
        websiteUrl: partner.websiteUrl,
        displayOrder: partner.displayOrder,
      });
      setErrors({});
    } else if (open && mode === 'create') {
      setValues({
        nameAr: '',
        nameEn: '',
        logoKey: null,
        descriptionAr: null,
        descriptionEn: null,
        websiteUrl: null,
        displayOrder: 0,
      });
      setErrors({});
    }
  }, [open, partner, mode]);

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
    if (!values.nameAr.trim()) {
      newErrors.nameAr = isArabic ? 'الاسم العربي مطلوب' : 'Arabic name is required';
    }
    if (!values.nameEn.trim()) {
      newErrors.nameEn = isArabic ? 'الاسم الإنجليزي مطلوب' : 'English name is required';
    }
    if (values.websiteUrl && values.websiteUrl.trim() && !/^https?:\/\//.test(values.websiteUrl.trim())) {
      newErrors.websiteUrl = isArabic ? 'يجب أن يبدأ الرابط بـ http:// أو https://' : 'URL must start with http:// or https://';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        ...values,
        websiteUrl: values.websiteUrl?.trim() || null,
        descriptionAr: values.descriptionAr?.trim() || null,
        descriptionEn: values.descriptionEn?.trim() || null,
      });
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
                ? 'إضافة شريك جديد'
                : 'Add New Partner'
              : isArabic
                ? 'تعديل الشريك'
                : 'Edit Partner'}
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
              {/* Name Ar */}
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
                  {isArabic ? 'الاسم (عربي) *' : 'Name (Arabic) *'}
                </label>
                <input
                  type="text"
                  value={values.nameAr}
                  onChange={(e) => handleChange('nameAr', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.nameAr ? '#DC2626' : palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textPrimary,
                    fontSize: '1rem',
                  }}
                />
                {errors.nameAr && (
                  <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.nameAr}
                  </span>
                )}
              </div>

              {/* Name En */}
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
                  {isArabic ? 'الاسم (إنجليزي) *' : 'Name (English) *'}
                </label>
                <input
                  type="text"
                  value={values.nameEn}
                  onChange={(e) => handleChange('nameEn', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.nameEn ? '#DC2626' : palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textPrimary,
                    fontSize: '1rem',
                  }}
                />
                {errors.nameEn && (
                  <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.nameEn}
                  </span>
                )}
              </div>

              {/* Description Ar */}
              <MarkdownEditor
                value={values.descriptionAr || ''}
                onChange={(value) => handleChange('descriptionAr', value || null)}
                label={isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                placeholder={isArabic ? 'أدخل الوصف هنا...' : 'Enter description here...'}
                rows={6}
              />

              {/* Description En */}
              <MarkdownEditor
                value={values.descriptionEn || ''}
                onChange={(value) => handleChange('descriptionEn', value || null)}
                label={isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                placeholder={isArabic ? 'Enter description here...' : 'Enter description here...'}
                rows={6}
              />

              {/* Logo */}
              <ImageUploadField
                value={values.logoKey}
                onChange={(key) => handleChange('logoKey', key)}
                onUpload={handleImageUpload}
                label={isArabic ? 'الشعار' : 'Logo'}
                uploading={isUploading}
              />

              {/* Website URL */}
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
                  {isArabic ? 'الموقع الإلكتروني' : 'Website URL'}
                </label>
                <input
                  type="url"
                  value={values.websiteUrl || ''}
                  onChange={(e) => handleChange('websiteUrl', e.target.value || null)}
                  placeholder="https://example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.websiteUrl ? '#DC2626' : palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textPrimary,
                    fontSize: '1rem',
                  }}
                />
                {errors.websiteUrl && (
                  <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.websiteUrl}
                  </span>
                )}
              </div>

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


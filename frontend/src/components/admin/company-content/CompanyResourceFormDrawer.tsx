import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { CompanyResource } from '../../../hooks/useAdminCompanyContent';
import { ImageUploadField } from './ImageUploadField';
import { MarkdownEditor } from './MarkdownEditor';

interface CompanyResourceFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  resource?: CompanyResource | null;
  isLoadingDetail?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string | null;
    descriptionEn: string | null;
    iconKey: string | null;
    value: number | null;
    currency: string;
    displayOrder: number;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitting: boolean;
  deleting?: boolean;
  onPresignImage: (file: File) => Promise<{ storageKey: string }>;
}

export function CompanyResourceFormDrawer({
  open,
  mode,
  resource,
  isLoadingDetail = false,
  onClose,
  onSubmit,
  onDelete,
  submitting,
  deleting = false,
  onPresignImage,
}: CompanyResourceFormDrawerProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const container = document.getElementById('drawer-root') ?? document.body;

  const [values, setValues] = useState({
    titleAr: '',
    titleEn: '',
    descriptionAr: null as string | null,
    descriptionEn: null as string | null,
    iconKey: null as string | null,
    value: null as number | null,
    currency: 'SAR',
    displayOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open && resource && mode === 'edit') {
      setValues({
        titleAr: resource.titleAr,
        titleEn: resource.titleEn,
        descriptionAr: resource.descriptionAr,
        descriptionEn: resource.descriptionEn,
        iconKey: resource.iconKey,
        value: resource.value,
        currency: resource.currency,
        displayOrder: resource.displayOrder,
      });
      setErrors({});
    } else if (open && mode === 'create') {
      setValues({
        titleAr: '',
        titleEn: '',
        descriptionAr: null,
        descriptionEn: null,
        iconKey: null,
        value: null,
        currency: 'SAR',
        displayOrder: 0,
      });
      setErrors({});
    }
  }, [open, resource, mode]);

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
    if (values.value !== null && values.value !== undefined && values.value < 0) {
      newErrors.value = isArabic ? 'القيمة يجب أن تكون أكبر من أو تساوي الصفر' : 'Value must be non-negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        ...values,
        descriptionAr: values.descriptionAr?.trim() || null,
        descriptionEn: values.descriptionEn?.trim() || null,
        value: values.value ?? null,
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
                ? 'إضافة مورد مالي جديد'
                : 'Add New Resource'
              : isArabic
                ? 'تعديل المورد المالي'
                : 'Edit Resource'}
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

              {/* Value and Currency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '1rem' }}>
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
                    {isArabic ? 'القيمة' : 'Value'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.value ?? ''}
                    onChange={(e) => handleChange('value', e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={isArabic ? '0.00' : '0.00'}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${errors.value ? '#DC2626' : palette.neutralBorderSoft}`,
                      background: palette.backgroundSurface,
                      color: palette.textPrimary,
                      fontSize: '1rem',
                    }}
                  />
                  {errors.value && (
                    <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                      {errors.value}
                    </span>
                  )}
                </div>
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
                    {isArabic ? 'العملة' : 'Currency'}
                  </label>
                  <select
                    value={values.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      background: palette.backgroundSurface,
                      color: palette.textPrimary,
                      fontSize: '1rem',
                    }}
                  >
                    <option value="SAR">SAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

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


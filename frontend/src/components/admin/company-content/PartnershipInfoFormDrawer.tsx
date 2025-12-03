import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { PartnershipInfo } from '../../../hooks/useAdminCompanyContent';
import { ImageUploadField } from './ImageUploadField';
import { MarkdownEditor } from './MarkdownEditor';

interface PartnershipInfoFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  partnershipInfo?: PartnershipInfo | null;
  isLoadingDetail?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    stepsAr: string[] | null;
    stepsEn: string[] | null;
    iconKey: string | null;
    displayOrder: number;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitting: boolean;
  deleting?: boolean;
  onPresignImage: (file: File) => Promise<{ storageKey: string }>;
}

export function PartnershipInfoFormDrawer({
  open,
  mode,
  partnershipInfo,
  isLoadingDetail = false,
  onClose,
  onSubmit,
  onDelete,
  submitting,
  deleting = false,
  onPresignImage,
}: PartnershipInfoFormDrawerProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const container = document.getElementById('drawer-root') ?? document.body;

  const [values, setValues] = useState({
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    stepsAr: [] as string[],
    stepsEn: [] as string[],
    iconKey: null as string | null,
    displayOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open && partnershipInfo && mode === 'edit') {
      setValues({
        titleAr: partnershipInfo.titleAr,
        titleEn: partnershipInfo.titleEn,
        contentAr: partnershipInfo.contentAr,
        contentEn: partnershipInfo.contentEn,
        stepsAr: partnershipInfo.stepsAr || [],
        stepsEn: partnershipInfo.stepsEn || [],
        iconKey: partnershipInfo.iconKey,
        displayOrder: partnershipInfo.displayOrder,
      });
      setErrors({});
    } else if (open && mode === 'create') {
      setValues({
        titleAr: '',
        titleEn: '',
        contentAr: '',
        contentEn: '',
        stepsAr: [],
        stepsEn: [],
        iconKey: null,
        displayOrder: 0,
      });
      setErrors({});
    }
  }, [open, partnershipInfo, mode]);

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

  const handleAddStep = (lang: 'ar' | 'en') => {
    const field = lang === 'ar' ? 'stepsAr' : 'stepsEn';
    setValues((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const handleRemoveStep = (lang: 'ar' | 'en', index: number) => {
    const field = lang === 'ar' ? 'stepsAr' : 'stepsEn';
    setValues((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleStepChange = (lang: 'ar' | 'en', index: number, value: string) => {
    const field = lang === 'ar' ? 'stepsAr' : 'stepsEn';
    setValues((prev) => {
      const newSteps = [...prev[field]];
      newSteps[index] = value;
      return { ...prev, [field]: newSteps };
    });
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
      await onSubmit({
        ...values,
        stepsAr: values.stepsAr.filter((s) => s.trim()).length > 0 ? values.stepsAr.filter((s) => s.trim()) : null,
        stepsEn: values.stepsEn.filter((s) => s.trim()).length > 0 ? values.stepsEn.filter((s) => s.trim()) : null,
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
          maxWidth: '900px',
          background: palette.backgroundSurface,
          boxShadow: '-4px 0 24px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '100vh',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
                ? 'إضافة معلومات شراكة جديدة'
                : 'Add Partnership Info'
              : isArabic
                ? 'تعديل معلومات الشراكة'
                : 'Edit Partnership Info'}
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

              <MarkdownEditor
                value={values.contentAr}
                onChange={(value) => handleChange('contentAr', value)}
                label={isArabic ? 'المحتوى (عربي) *' : 'Content (Arabic) *'}
                placeholder={isArabic ? 'أدخل المحتوى هنا...' : 'Enter content here...'}
                rows={6}
              />
              {errors.contentAr && (
                <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '-1rem', display: 'block' }}>
                  {errors.contentAr}
                </span>
              )}

              <MarkdownEditor
                value={values.contentEn}
                onChange={(value) => handleChange('contentEn', value)}
                label={isArabic ? 'المحتوى (إنجليزي) *' : 'Content (English) *'}
                placeholder={isArabic ? 'Enter content here...' : 'Enter content here...'}
                rows={6}
              />
              {errors.contentEn && (
                <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '-1rem', display: 'block' }}>
                  {errors.contentEn}
                </span>
              )}

              {/* Steps Ar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: palette.textPrimary,
                    }}
                  >
                    {isArabic ? 'الخطوات (عربي)' : 'Steps (Arabic)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddStep('ar')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      background: palette.backgroundSurface,
                      color: palette.textPrimary,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {isArabic ? '+ إضافة خطوة' : '+ Add Step'}
                  </button>
                </div>
                {values.stepsAr.map((step, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange('ar', index, e.target.value)}
                      placeholder={`${isArabic ? 'الخطوة' : 'Step'} ${index + 1}`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${palette.neutralBorderSoft}`,
                        background: palette.backgroundSurface,
                        color: palette.textPrimary,
                        fontSize: '1rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStep('ar', index)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: '#DC2626',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {isArabic ? 'حذف' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Steps En */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: palette.textPrimary,
                    }}
                  >
                    {isArabic ? 'الخطوات (إنجليزي)' : 'Steps (English)'}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAddStep('en')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      background: palette.backgroundSurface,
                      color: palette.textPrimary,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                    }}
                  >
                    {isArabic ? '+ إضافة خطوة' : '+ Add Step'}
                  </button>
                </div>
                {values.stepsEn.map((step, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={step}
                      onChange={(e) => handleStepChange('en', index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${palette.neutralBorderSoft}`,
                        background: palette.backgroundSurface,
                        color: palette.textPrimary,
                        fontSize: '1rem',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveStep('en', index)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: '#DC2626',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                      }}
                    >
                      {isArabic ? 'حذف' : 'Remove'}
                    </button>
                  </div>
                ))}
              </div>

              <ImageUploadField
                value={values.iconKey}
                onChange={(key) => handleChange('iconKey', key)}
                onUpload={handleImageUpload}
                label={isArabic ? 'الأيقونة' : 'Icon'}
                uploading={isUploading}
              />

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


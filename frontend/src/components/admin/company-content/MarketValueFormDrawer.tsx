import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { MarketValue } from '../../../hooks/useAdminCompanyContent';

interface MarketValueFormDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  marketValue?: MarketValue | null;
  isLoadingDetail?: boolean;
  onClose: () => void;
  onSubmit: (values: {
    value: number;
    currency: string;
    valuationDate: string;
    source: string | null;
    isVerified: boolean;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitting: boolean;
  deleting?: boolean;
}

export function MarketValueFormDrawer({
  open,
  mode,
  marketValue,
  isLoadingDetail = false,
  onClose,
  onSubmit,
  onDelete,
  submitting,
  deleting = false,
}: MarketValueFormDrawerProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const container = document.getElementById('drawer-root') ?? document.body;

  const [values, setValues] = useState({
    value: 0,
    currency: 'SAR',
    valuationDate: '',
    source: null as string | null,
    isVerified: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && marketValue && mode === 'edit') {
      setValues({
        value: marketValue.value,
        currency: marketValue.currency,
        valuationDate: marketValue.valuationDate.split('T')[0],
        source: marketValue.source,
        isVerified: marketValue.isVerified,
      });
      setErrors({});
    } else if (open && mode === 'create') {
      setValues({
        value: 0,
        currency: 'SAR',
        valuationDate: '',
        source: null,
        isVerified: false,
      });
      setErrors({});
    }
  }, [open, marketValue, mode]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (values.value <= 0) {
      newErrors.value = isArabic ? 'القيمة يجب أن تكون أكبر من الصفر' : 'Value must be greater than zero';
    }
    if (!values.valuationDate) {
      newErrors.valuationDate = isArabic ? 'تاريخ التقييم مطلوب' : 'Valuation date is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        ...values,
        source: values.source?.trim() || null,
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
                ? 'إضافة قيمة سوقية'
                : 'Add Market Value'
              : isArabic
                ? 'تعديل القيمة السوقية'
                : 'Edit Market Value'}
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
                    {isArabic ? 'القيمة *' : 'Value *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={values.value}
                    onChange={(e) => handleChange('value', parseFloat(e.target.value) || 0)}
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
                  {isArabic ? 'تاريخ التقييم *' : 'Valuation Date *'}
                </label>
                <input
                  type="date"
                  value={values.valuationDate}
                  onChange={(e) => handleChange('valuationDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${errors.valuationDate ? '#DC2626' : palette.neutralBorderSoft}`,
                    background: palette.backgroundSurface,
                    color: palette.textPrimary,
                    fontSize: '1rem',
                  }}
                />
                {errors.valuationDate && (
                  <span style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
                    {errors.valuationDate}
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
                  {isArabic ? 'المصدر' : 'Source'}
                </label>
                <input
                  type="text"
                  value={values.source || ''}
                  onChange={(e) => handleChange('source', e.target.value || null)}
                  placeholder={isArabic ? 'مصدر التقييم (اختياري)' : 'Source of valuation (optional)'}
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
                    checked={values.isVerified}
                    onChange={(e) => handleChange('isVerified', e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: palette.textPrimary }}>
                    {isArabic ? 'مؤكد' : 'Verified'}
                  </span>
                </label>
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


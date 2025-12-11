import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useUpdateAdminUserMutation } from '../../../hooks/useAdminUsers';
import { useToast } from '../../../context/ToastContext';
import { palette, radius, shadow, typography } from '../../../styles/theme';
import type { AdminUser, AdminUpdateUserPayload } from '../../../types/admin-users';

interface EditUserModalProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditUserModal({ isOpen, user, onClose, onSuccess }: EditUserModalProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const updateMutation = useUpdateAdminUserMutation();

  const [formData, setFormData] = useState<Partial<AdminUpdateUserPayload>>({
    email: '',
    phone: null,
    fullName: '',
    role: '',
    status: 'pending',
    locale: 'ar',
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role || 'investor',
        status: user.status,
        locale: user.profileLanguage || 'ar',
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        payload: {
          email: formData.email,
          phone: formData.phone,
          fullName: formData.fullName,
          role: formData.role,
          status: formData.status,
          locale: formData.locale,
        },
      });

      pushToast({
        message:
          language === 'ar'
            ? 'تم تحديث المستخدم بنجاح'
            : 'User updated successfully',
        variant: 'success',
      });

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : language === 'ar'
            ? 'فشل تحديث المستخدم'
            : 'Failed to update user';
      pushToast({
        message,
        variant: 'error',
      });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
        direction,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          background: palette.backgroundBase,
          borderRadius: radius.lg,
          boxShadow: shadow.medium,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: `1px solid ${palette.neutralBorderMuted}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: typography.sizes.subheading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {language === 'ar' ? 'تعديل المستخدم' : 'Edit User'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: palette.textSecondary,
              padding: '0.25rem',
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Email */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
              }}
            />
          </div>

          {/* Full Name */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
            </label>
            <input
              type="text"
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'رقم الهاتف (E.164)' : 'Phone (E.164)'}
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value || null })}
              placeholder="+9665xxxxxxx"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
              }}
            />
          </div>

          {/* Role */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'الدور' : 'Role'}
            </label>
            <select
              value={formData.role || 'investor'}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
              }}
            >
              <option value="investor">{language === 'ar' ? 'مستثمر' : 'Investor'}</option>
              <option value="admin">{language === 'ar' ? 'أدمن' : 'Admin'}</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <select
              value={formData.status || 'pending'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as AdminUser['status'],
                })
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
              }}
            >
              <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="suspended">{language === 'ar' ? 'موقوف' : 'Suspended'}</option>
              <option value="deactivated">{language === 'ar' ? 'معطل' : 'Deactivated'}</option>
            </select>
          </div>

          {/* Locale */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: typography.sizes.caption,
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'اللغة المفضلة' : 'Preferred Language'}
            </label>
            <select
              value={formData.locale || 'ar'}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  locale: e.target.value as 'ar' | 'en',
                })
              }
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
              }}
            >
              <option value="ar">{language === 'ar' ? 'العربية' : 'Arabic'}</option>
              <option value="en">{language === 'ar' ? 'الإنجليزية' : 'English'}</option>
            </select>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
                cursor: 'pointer',
                fontWeight: typography.weights.semibold,
              }}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: radius.md,
                border: 'none',
                background: updateMutation.isPending
                  ? palette.neutralBorderMuted
                  : palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontSize: typography.sizes.body,
                cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                fontWeight: typography.weights.semibold,
              }}
            >
              {updateMutation.isPending
                ? language === 'ar'
                  ? 'جاري التحديث...'
                  : 'Updating...'
                : language === 'ar'
                  ? 'حفظ'
                  : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


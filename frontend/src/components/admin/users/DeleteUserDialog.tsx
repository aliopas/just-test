import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useDeleteAdminUserMutation } from '../../../hooks/useAdminUsers';
import { useToast } from '../../../context/ToastContext';
import { palette, radius, shadow, typography } from '../../../styles/theme';
import type { AdminUser } from '../../../types/admin-users';

interface DeleteUserDialogProps {
  isOpen: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({ isOpen, user, onClose, onSuccess }: DeleteUserDialogProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const deleteMutation = useDeleteAdminUserMutation();

  if (!isOpen || !user) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(user.id);

      pushToast({
        message:
          language === 'ar'
            ? 'تم حذف المستخدم بنجاح'
            : 'User deleted successfully',
        variant: 'success',
      });

      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : language === 'ar'
            ? 'فشل حذف المستخدم'
            : 'Failed to delete user';
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
          maxWidth: '500px',
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
              color: palette.error,
            }}
          >
            {language === 'ar' ? 'حذف المستخدم' : 'Delete User'}
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

        {/* Content */}
        <div
          style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textPrimary,
            }}
          >
            {language === 'ar' ? (
              <>
                هل أنت متأكد من حذف المستخدم <strong>{user.email}</strong>؟
                <br />
                <br />
                لا يمكن التراجع عن هذا الإجراء.
              </>
            ) : (
              <>
                Are you sure you want to delete user <strong>{user.email}</strong>?
                <br />
                <br />
                This action cannot be undone.
              </>
            )}
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            padding: '1.5rem',
            borderTop: `1px solid ${palette.neutralBorderMuted}`,
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end',
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
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: radius.md,
              border: 'none',
              background: deleteMutation.isPending
                ? palette.neutralBorderMuted
                : palette.error,
              color: palette.textOnBrand,
              fontSize: typography.sizes.body,
              cursor: deleteMutation.isPending ? 'not-allowed' : 'pointer',
              fontWeight: typography.weights.semibold,
            }}
          >
            {deleteMutation.isPending
              ? language === 'ar'
                ? 'جاري الحذف...'
                : 'Deleting...'
              : language === 'ar'
                ? 'حذف'
                : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}


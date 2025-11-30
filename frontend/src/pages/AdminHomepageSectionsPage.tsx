import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { palette } from '../styles/theme';
import {
  useAdminHomepageSections,
  useUpdateHomepageSectionMutation,
} from '../hooks/useAdminHomepageSections';
import type { HomepageSection } from '../hooks/useHomepageSections';

export function AdminHomepageSectionsPage() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const isArabic = language === 'ar';
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [editForm, setEditForm] = useState<{
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    iconSvg: string;
    displayOrder: number;
    isActive: boolean;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useAdminHomepageSections(true);
  const updateMutation = useUpdateHomepageSectionMutation();

  const sections = data?.sections ?? [];

  const handleEdit = (section: HomepageSection) => {
    setEditingSection(section);
    setEditForm({
      titleAr: section.titleAr,
      titleEn: section.titleEn,
      contentAr: section.contentAr,
      contentEn: section.contentEn,
      iconSvg: section.iconSvg ?? '',
      displayOrder: section.displayOrder,
      isActive: section.isActive,
    });
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditForm(null);
  };

  const handleSave = async () => {
    if (!editingSection || !editForm) return;

    try {
      await updateMutation.mutateAsync({
        id: editingSection.id,
        input: editForm,
      });
      pushToast({
        message: isArabic ? 'تم تحديث القسم بنجاح' : 'Section updated successfully',
        variant: 'success',
      });
      setEditingSection(null);
      setEditForm(null);
      refetch();
    } catch (error) {
      pushToast({
        message: isArabic ? 'فشل تحديث القسم' : 'Failed to update section',
        variant: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: palette.textSecondary }}>
        {isArabic ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: palette.textSecondary }}>
        {isArabic ? 'حدث خطأ في تحميل الأقسام' : 'Failed to load sections'}
      </div>
    );
  }

  return (
    <div
      style={{
        direction,
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        background: palette.backgroundBase,
        minHeight: 'calc(100vh - 180px)',
      }}
    >
      <div
        style={{
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: '2rem',
            fontWeight: 700,
            color: palette.textPrimary,
          }}
        >
          {isArabic ? 'إدارة أقسام الصفحة الرئيسية' : 'Manage Homepage Sections'}
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {sections.map((section) => {
          const isEditing = editingSection?.id === section.id;

          return (
            <div
              key={section.id}
              style={{
                padding: '2rem',
                borderRadius: '1rem',
                border: `1px solid ${palette.neutralBorderSoft}`,
                background: palette.backgroundSurface,
              }}
            >
              {!isEditing ? (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '1rem',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: 0,
                          marginBottom: '0.5rem',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: palette.textPrimary,
                        }}
                      >
                        {isArabic ? section.titleAr : section.titleEn}
                      </h3>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.875rem',
                            background: section.isActive
                              ? `${palette.brandPrimaryStrong}20`
                              : `${palette.textSecondary}20`,
                            color: section.isActive
                              ? palette.brandPrimaryStrong
                              : palette.textSecondary,
                          }}
                        >
                          {section.isActive
                            ? isArabic
                              ? 'نشط'
                              : 'Active'
                            : isArabic
                              ? 'غير نشط'
                              : 'Inactive'}
                        </span>
                        <span
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.875rem',
                            background: `${palette.textSecondary}20`,
                            color: palette.textSecondary,
                          }}
                        >
                          {isArabic ? 'ترتيب العرض:' : 'Display Order:'} {section.displayOrder}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleEdit(section)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${palette.neutralBorderSoft}`,
                        background: palette.backgroundSurface,
                        color: palette.textPrimary,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                  </div>
                  <div
                    style={{
                      color: palette.textSecondary,
                      lineHeight: 1.7,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {isArabic ? section.contentAr : section.contentEn}
                  </div>
                </>
              ) : (
                editForm && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 600,
                            color: palette.textPrimary,
                          }}
                        >
                          {isArabic ? 'العنوان (عربي)' : 'Title (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={editForm.titleAr}
                          onChange={(e) =>
                            setEditForm({ ...editForm, titleAr: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${palette.neutralBorderSoft}`,
                            background: palette.backgroundSurface,
                            color: palette.textPrimary,
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 600,
                            color: palette.textPrimary,
                          }}
                        >
                          {isArabic ? 'العنوان (إنجليزي)' : 'Title (English)'}
                        </label>
                        <input
                          type="text"
                          value={editForm.titleEn}
                          onChange={(e) =>
                            setEditForm({ ...editForm, titleEn: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${palette.neutralBorderSoft}`,
                            background: palette.backgroundSurface,
                            color: palette.textPrimary,
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 600,
                            color: palette.textPrimary,
                          }}
                        >
                          {isArabic ? 'المحتوى (عربي)' : 'Content (Arabic)'}
                        </label>
                        <textarea
                          value={editForm.contentAr}
                          onChange={(e) =>
                            setEditForm({ ...editForm, contentAr: e.target.value })
                          }
                          rows={6}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${palette.neutralBorderSoft}`,
                            background: palette.backgroundSurface,
                            color: palette.textPrimary,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 600,
                            color: palette.textPrimary,
                          }}
                        >
                          {isArabic ? 'المحتوى (إنجليزي)' : 'Content (English)'}
                        </label>
                        <textarea
                          value={editForm.contentEn}
                          onChange={(e) =>
                            setEditForm({ ...editForm, contentEn: e.target.value })
                          }
                          rows={6}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${palette.neutralBorderSoft}`,
                            background: palette.backgroundSurface,
                            color: palette.textPrimary,
                            fontFamily: 'inherit',
                            resize: 'vertical',
                          }}
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: 600,
                            color: palette.textPrimary,
                          }}
                        >
                          {isArabic ? 'ترتيب العرض' : 'Display Order'}
                        </label>
                        <input
                          type="number"
                          value={editForm.displayOrder}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              displayOrder: parseInt(e.target.value) || 0,
                            })
                          }
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            border: `1px solid ${palette.neutralBorderSoft}`,
                            background: palette.backgroundSurface,
                            color: palette.textPrimary,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          marginTop: '1.75rem',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editForm.isActive}
                          onChange={(e) =>
                            setEditForm({ ...editForm, isActive: e.target.checked })
                          }
                          style={{
                            width: '1.25rem',
                            height: '1.25rem',
                            cursor: 'pointer',
                          }}
                        />
                        <label
                          style={{
                            fontWeight: 600,
                            color: palette.textPrimary,
                            cursor: 'pointer',
                          }}
                        >
                          {isArabic ? 'نشط' : 'Active'}
                        </label>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        justifyContent: 'flex-end',
                        marginTop: '1rem',
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleCancel}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${palette.neutralBorderSoft}`,
                          background: palette.backgroundSurface,
                          color: palette.textPrimary,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={updateMutation.isPending}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          background: palette.brandPrimaryStrong,
                          color: palette.textOnBrand,
                          fontWeight: 600,
                          cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
                          opacity: updateMutation.isPending ? 0.6 : 1,
                        }}
                      >
                        {updateMutation.isPending
                          ? isArabic
                            ? 'جاري الحفظ...'
                            : 'Saving...'
                          : isArabic
                            ? 'حفظ'
                            : 'Save'}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Default export for Next.js page validation (not used, App Router uses named export)
export default AdminHomepageSectionsPage;

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import {
  useAdminProjectsList,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  type Project,
  type ProjectListFilters,
  useProjectImagePresignMutation,
} from '../hooks/useAdminProjects';
import { palette } from '../styles/theme';
import { PROJECT_IMAGES_BUCKET, resolveCoverUrl } from '../utils/supabase-storage';

const queryClient = new QueryClient();

const defaultFilters: ProjectListFilters = {
  page: 1,
  limit: 25,
  status: 'all',
  search: '',
};

type FormState = {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  coverKey: string | null;
  operatingCosts: string;
  annualBenefits: string;
  totalShares: string;
  sharePrice: string;
  status: 'active' | 'inactive' | 'archived';
};

function AdminProjectsPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const isArabic = language === 'ar';
  const [filters, setFilters] = useState<ProjectListFilters>(defaultFilters);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    coverKey: null,
    operatingCosts: '',
    annualBenefits: '',
    totalShares: '',
    sharePrice: '50000',
    status: 'active',
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingImage, setUploadingImage] = useState(false);

  const { data, isLoading, isError, error, refetch } = useAdminProjectsList(filters);
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();
  const imagePresignMutation = useProjectImagePresignMutation();

  const revokePreview = (preview: string | null) => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  };

  useEffect(() => {
    return () => {
      revokePreview(coverPreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverPreview]);

  const closeForm = () => {
    revokePreview(coverPreview);
    setCoverPreview(null);
    setShowForm(false);
    setEditingProject(null);
  };

  useEffect(() => {
    if (isError) {
      pushToast({
        message: error instanceof Error ? error.message : (isArabic ? 'خطأ في تحميل المشاريع' : 'Failed to load projects'),
        variant: 'error',
      });
    }
  }, [isError, error, pushToast, isArabic]);

  const projects = data?.projects ?? [];
  const meta = data?.meta;

  const handleCreate = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      coverKey: null,
      operatingCosts: '',
      annualBenefits: '',
      totalShares: '',
      sharePrice: '50000',
      status: 'active',
    });
    revokePreview(coverPreview);
    setCoverPreview(null);
    setShowForm(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      nameAr: project.nameAr || '',
      description: project.description || '',
      descriptionAr: project.descriptionAr || '',
      coverKey: project.coverKey ?? null,
      operatingCosts: String(project.operatingCosts),
      annualBenefits: String(project.annualBenefits),
      totalShares: String(project.totalShares),
      sharePrice: String(project.sharePrice),
      status: project.status,
    });
    const existingCover =
      project.coverKey !== null
        ? resolveCoverUrl(project.coverKey, PROJECT_IMAGES_BUCKET)
        : null;
    revokePreview(coverPreview);
    setCoverPreview(existingCover);
    setShowForm(true);
  };

  const handleDelete = async (project: Project) => {
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(project.id);
      pushToast({
        message: isArabic ? 'تم حذف المشروع بنجاح' : 'Project deleted successfully',
        variant: 'success',
      });
      refetch();
    } catch (err) {
      pushToast({
        message: err instanceof Error ? err.message : (isArabic ? 'فشل حذف المشروع' : 'Failed to delete project'),
        variant: 'error',
      });
    }
  };

  const handleImageSelection = async (file: File | null) => {
    if (!file) {
      revokePreview(coverPreview);
      setCoverPreview(null);
      setFormData(prev => ({ ...prev, coverKey: null }));
      return;
    }

    try {
      setUploadingImage(true);
      const presign = await imagePresignMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
      });

      const headers = new Headers(presign.headers);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', file.type || 'application/octet-stream');
      }

      const response = await fetch(presign.uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      revokePreview(coverPreview);
      setCoverPreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, coverKey: presign.storageKey }));
      pushToast({
        message: isArabic ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully',
        variant: 'success',
      });
    } catch (err) {
      console.error(err);
      pushToast({
        message: err instanceof Error ? err.message : (isArabic ? 'فشل رفع الصورة' : 'Failed to upload image'),
        variant: 'error',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        nameAr: formData.nameAr || undefined,
        description: formData.description || undefined,
        descriptionAr: formData.descriptionAr || undefined,
        coverKey: formData.coverKey ?? undefined,
        operatingCosts: Number(formData.operatingCosts),
        annualBenefits: Number(formData.annualBenefits),
        totalShares: Number(formData.totalShares),
        sharePrice: Number(formData.sharePrice),
        status: formData.status,
      };

      if (editingProject) {
        await updateMutation.mutateAsync({ id: editingProject.id, input: payload });
        pushToast({
          message: isArabic ? 'تم تحديث المشروع بنجاح' : 'Project updated successfully',
          variant: 'success',
        });
      } else {
        await createMutation.mutateAsync(payload);
        pushToast({
          message: isArabic ? 'تم إنشاء المشروع بنجاح' : 'Project created successfully',
          variant: 'success',
        });
      }
      closeForm();
      refetch();
    } catch (err) {
      pushToast({
        message: err instanceof Error ? err.message : (isArabic ? 'فشل حفظ المشروع' : 'Failed to save project'),
        variant: 'error',
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        direction,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 700, margin: 0 }}>
            {isArabic ? 'إدارة المشاريع' : 'Manage Projects'}
          </h1>
          <p style={{ marginTop: '0.5rem', color: palette.textSecondary }}>
            {isArabic ? 'إضافة وتعديل المشاريع الاستثمارية' : 'Add and manage investment projects'}
          </p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            background: palette.brandPrimaryStrong,
            color: palette.textOnBrand,
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isArabic ? '+ إضافة مشروع جديد' : '+ Add New Project'}
        </button>
      </header>

      {showForm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeForm}
        >
          <div
            style={{
              background: palette.backgroundSurface,
              padding: '2rem',
              borderRadius: '1rem',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0 }}>
              {editingProject ? (isArabic ? 'تعديل المشروع' : 'Edit Project') : (isArabic ? 'إضافة مشروع جديد' : 'Add New Project')}
            </h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {isArabic ? 'اسم المشروع (إنجليزي)' : 'Project Name (English)'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {isArabic ? 'اسم المشروع (عربي)' : 'Project Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {isArabic ? 'الوصف (إنجليزي)' : 'Description (English)'}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {isArabic ? 'الوصف (عربي)' : 'Description (Arabic)'}
                </label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {isArabic ? 'صورة المشروع' : 'Project cover image'}
                </label>
                <div
                  style={{
                    border: `1px dashed ${palette.neutralBorder}`,
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    textAlign: 'center',
                    background: palette.backgroundBase,
                    marginBottom: '0.75rem',
                  }}
                >
                  {coverPreview ? (
                    <img
                      src={coverPreview}
                      alt={formData.name || 'Project cover'}
                      style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '0.5rem' }}
                    />
                  ) : (
                    <p style={{ margin: 0, color: palette.textSecondary, fontSize: '0.95rem' }}>
                      {isArabic
                        ? 'يمكنك رفع صورة توضيحية للمشروع (PNG، JPG، WebP)'
                        : 'Upload a cover image for the project (PNG, JPG, WebP)'}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelection(e.target.files?.[0] ?? null)}
                    disabled={isUploadingImage || imagePresignMutation.isPending}
                  />
                  {formData.coverKey && (
                    <button
                      type="button"
                      onClick={() => handleImageSelection(null)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${palette.neutralBorder}`,
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {isArabic ? 'إزالة الصورة' : 'Remove image'}
                    </button>
                  )}
                </div>
                {(isUploadingImage || imagePresignMutation.isPending) && (
                  <p style={{ marginTop: '0.5rem', color: palette.textSecondary, fontSize: '0.9rem' }}>
                    {isArabic ? 'جارٍ رفع الصورة...' : 'Uploading image...'}
                  </p>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {isArabic ? 'تكاليف التشغيل (ريال)' : 'Operating Costs (SAR)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.operatingCosts}
                    onChange={(e) => setFormData({ ...formData, operatingCosts: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {isArabic ? 'الفوائد السنوية (ريال)' : 'Annual Benefits (SAR)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.annualBenefits}
                    onChange={(e) => setFormData({ ...formData, annualBenefits: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {isArabic ? 'إجمالي الأسهم' : 'Total Shares'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.totalShares}
                    onChange={(e) => setFormData({ ...formData, totalShares: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                    {isArabic ? 'سعر السهم (ريال)' : 'Share Price (SAR)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.sharePrice}
                    onChange={(e) => setFormData({ ...formData, sharePrice: e.target.value })}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                  {isArabic ? 'الحالة' : 'Status'} *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: `1px solid ${palette.neutralBorder}` }}
                >
                  <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
                  <option value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
                  <option value="archived">{isArabic ? 'مؤرشف' : 'Archived'}</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={closeForm}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: `1px solid ${palette.neutralBorder}`,
                    background: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    background: palette.brandPrimaryStrong,
                    color: palette.textOnBrand,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? (isArabic ? 'جاري الحفظ...' : 'Saving...')
                    : (editingProject ? (isArabic ? 'تحديث' : 'Update') : (isArabic ? 'إنشاء' : 'Create'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder={isArabic ? 'بحث...' : 'Search...'}
          value={filters.search || ''}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${palette.neutralBorder}`,
            maxWidth: '400px',
          }}
        />
        <select
          value={filters.status || 'all'}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as any, page: 1 })}
          style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${palette.neutralBorder}`,
          }}
        >
          <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
          <option value="active">{isArabic ? 'نشط' : 'Active'}</option>
          <option value="inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
          <option value="archived">{isArabic ? 'مؤرشف' : 'Archived'}</option>
        </select>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          {isArabic ? 'جاري التحميل...' : 'Loading...'}
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: palette.textSecondary }}>
          {isArabic ? 'لا توجد مشاريع' : 'No projects found'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {projects.map((project) => {
            const costPerShare = project.operatingCostPerShare;
            const benefitPerShare = project.annualBenefitPerShare;
            const coverUrl = resolveCoverUrl(project.coverKey, PROJECT_IMAGES_BUCKET);
            return (
              <div
                key={project.id}
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  border: `1px solid ${palette.neutralBorder}`,
                  background: palette.backgroundSurface,
                }}
              >
                {coverUrl && (
                  <div
                    style={{
                      marginBottom: '1rem',
                      borderRadius: '0.75rem',
                      overflow: 'hidden',
                      border: `1px solid ${palette.neutralBorderSoft}`,
                    }}
                  >
                    <img
                      src={coverUrl}
                      alt={project.name}
                      style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                      {isArabic && project.nameAr ? project.nameAr : project.name}
                    </h3>
                    {project.description && (
                      <p style={{ margin: '0.5rem 0 0', color: palette.textSecondary }}>
                        {isArabic && project.descriptionAr ? project.descriptionAr : project.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleEdit(project)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${palette.neutralBorder}`,
                        background: 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: `1px solid ${palette.brandPrimaryStrong}`,
                        background: palette.brandPrimaryStrong,
                        color: palette.textOnBrand,
                        cursor: 'pointer',
                      }}
                    >
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: palette.textSecondary }}>
                      {isArabic ? 'تكاليف التشغيل للسهم الواحد' : 'Operating Cost per Share'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {costPerShare.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: palette.textSecondary }}>
                      {isArabic ? 'الفوائد السنوية للسهم الواحد' : 'Annual Benefit per Share'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: palette.brandPrimaryStrong }}>
                      {benefitPerShare.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: palette.textSecondary }}>
                      {isArabic ? 'سعر السهم' : 'Share Price'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {project.sharePrice.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: palette.textSecondary }}>
                      {isArabic ? 'إجمالي الأسهم' : 'Total Shares'}
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                      {project.totalShares.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <button
            disabled={meta.page === 1}
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: `1px solid ${palette.neutralBorder}`,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {isArabic ? 'السابق' : 'Previous'}
          </button>
          <span style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center' }}>
            {meta.page} / {meta.totalPages}
          </span>
          <button
            disabled={!meta.hasNext}
            onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: `1px solid ${palette.neutralBorder}`,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {isArabic ? 'التالي' : 'Next'}
          </button>
        </div>
      )}
    </div>
  );
}

export function AdminProjectsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AdminProjectsPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// Default export for Next.js page validation (not used, App Router uses named export)
export default AdminProjectsPage;

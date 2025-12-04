import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import type { ProjectListFilters, Project } from '../hooks/useAdminProjects';
import {
  useAdminProjectsList,
  useAdminProjectDetail,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from '../hooks/useAdminProjects';

export function AdminProjectsPage() {
  const { language, direction } = useLanguage();

  const [filters, setFilters] = useState<ProjectListFilters>({
    page: 1,
    status: 'all',
    search: '',
    sortBy: 'created_at',
    order: 'desc',
  });

  const { data, isLoading, isError, refetch } = useAdminProjectsList(filters);
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const deleteMutation = useDeleteProjectMutation();

  const projects = data?.projects ?? [];
  const meta = data?.meta ?? {
    page: filters.page ?? 1,
    limit: filters.limit ?? 25,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  type FormValues = {
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    coverKey: string;
    operatingCosts: string;
    annualBenefits: string;
    totalShares: string;
    sharePrice: string;
    status: Project['status'];
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    coverKey: '',
    operatingCosts: '',
    annualBenefits: '',
    totalShares: '',
    sharePrice: '',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormValues, string>>>(
    {}
  );

  const detailQuery = useAdminProjectDetail(selectedProjectId);

  const handleStatusFilterChange = (status: ProjectListFilters['status']) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const resetForm = () => {
    setFormValues({
      name: '',
      nameAr: '',
      description: '',
      descriptionAr: '',
      coverKey: '',
      operatingCosts: '',
      annualBenefits: '',
      totalShares: '',
      sharePrice: '',
      status: 'active',
    });
    setFormErrors({});
  };

  const handleCreateClick = () => {
    setDrawerMode('create');
    setSelectedProjectId(null);
    resetForm();
    setDrawerOpen(true);
  };

  const handleEditClick = (project: Project) => {
    setDrawerMode('edit');
    setSelectedProjectId(project.id);
    setDrawerOpen(true);
  };

  useEffect(() => {
    if (drawerMode === 'edit' && drawerOpen && detailQuery.data) {
      const p = detailQuery.data;
      setFormValues({
        name: p.name,
        nameAr: p.nameAr ?? '',
        description: p.description ?? '',
        descriptionAr: p.descriptionAr ?? '',
        coverKey: p.coverKey ?? '',
        operatingCosts: String(p.operatingCosts),
        annualBenefits: String(p.annualBenefits),
        totalShares: String(p.totalShares),
        sharePrice: String(p.sharePrice),
        status: p.status,
      });
      setFormErrors({});
    }
  }, [drawerMode, drawerOpen, detailQuery.data]);

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذا المشروع نهائيًا؟'
        : 'Are you sure you want to permanently delete this project?'
    );
    if (!confirmed) return;

    await deleteMutation.mutateAsync(project.id);
  };

  const handleFieldChange = (field: keyof FormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormValues, string>> = {};

    if (!formValues.name.trim()) {
      errors.name = language === 'ar' ? 'اسم المشروع مطلوب' : 'Project name is required';
    }
    if (!formValues.operatingCosts.trim() || Number.isNaN(Number(formValues.operatingCosts))) {
      errors.operatingCosts =
        language === 'ar' ? 'أدخل تكلفة تشغيل صحيحة' : 'Enter valid operating cost';
    }
    if (!formValues.annualBenefits.trim() || Number.isNaN(Number(formValues.annualBenefits))) {
      errors.annualBenefits =
        language === 'ar' ? 'أدخل عوائد سنوية صحيحة' : 'Enter valid annual benefits';
    }
    if (!formValues.totalShares.trim() || Number.isNaN(Number(formValues.totalShares))) {
      errors.totalShares =
        language === 'ar' ? 'أدخل عدد حصص صحيح' : 'Enter valid total shares';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formValues.name.trim(),
      nameAr: formValues.nameAr.trim() || undefined,
      description: formValues.description.trim() || undefined,
      descriptionAr: formValues.descriptionAr.trim() || undefined,
      coverKey: formValues.coverKey.trim() || null,
      operatingCosts: Number(formValues.operatingCosts),
      annualBenefits: Number(formValues.annualBenefits),
      totalShares: Number(formValues.totalShares),
      sharePrice: formValues.sharePrice.trim()
        ? Number(formValues.sharePrice)
        : undefined,
      status: formValues.status,
    };

    if (drawerMode === 'create') {
      await createMutation.mutateAsync(payload);
    } else if (drawerMode === 'edit' && selectedProjectId) {
      await updateMutation.mutateAsync({ id: selectedProjectId, input: payload });
    }

    setDrawerOpen(false);
  };

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: palette.backgroundSurface,
        direction,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {language === 'ar' ? 'المشاريع الاستثمارية' : 'Investment projects'}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {language === 'ar'
              ? 'استعرض وأدِر مشاريع باكورة الاستثمارية، العوائد، وتكاليف التشغيل.'
              : 'Browse and manage Bacura investment projects, returns and operating costs.'}
          </p>
        </header>

        {/* Filters + actions */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <select
              value={filters.status ?? 'all'}
              onChange={event =>
                handleStatusFilterChange(
                  event.target.value as ProjectListFilters['status']
                )
              }
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: '0.95rem',
              }}
            >
              <option value="all">
                {language === 'ar' ? 'الكل' : 'All'}
              </option>
              <option value="active">
                {language === 'ar' ? 'نشط' : 'Active'}
              </option>
              <option value="inactive">
                {language === 'ar' ? 'موقوف' : 'Inactive'}
              </option>
              <option value="archived">
                {language === 'ar' ? 'مؤرشف' : 'Archived'}
              </option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
            <label
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'بحث' : 'Search'}
            </label>
            <input
              type="search"
              placeholder={
                language === 'ar'
                  ? 'ابحث باسم المشروع…'
                  : 'Search by project name…'
              }
              value={filters.search ?? ''}
              onChange={event => handleSearchChange(event.target.value)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: '0.95rem',
              }}
            />
          </div>

          <div
            style={{
              marginInlineStart: 'auto',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textSecondary,
                fontSize: '0.9rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {'\u21BB '}
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handleCreateClick}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: radius.md,
                border: 'none',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontSize: '0.9rem',
                fontWeight: typography.weights.semibold,
                cursor: 'pointer',
              }}
            >
              {language === 'ar' ? 'مشروع جديد' : 'New project'}
            </button>
          </div>
        </section>

        {/* List */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          {isLoading && (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar' ? 'جارٍ تحميل المشاريع…' : 'Loading projects…'}
            </div>
          )}

          {isError && !isLoading && (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: palette.error,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar'
                ? 'تعذر تحميل المشاريع، حاول مرة أخرى.'
                : 'Failed to load projects, please try again.'}
            </div>
          )}

          {!isLoading && !isError && projects.length === 0 && (
            <div
              style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar'
                ? 'لا توجد مشاريع مضافة حالياً.'
                : 'There are no projects yet.'}
            </div>
          )}

          {!isLoading && !isError && projects.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '900px',
                  direction,
                  background: 'var(--color-background-surface)',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08)',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: 'var(--color-background-surface)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <th style={thStyle}>
                      {language === 'ar' ? 'المشروع' : 'Project'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'التكلفة التشغيلية' : 'Operating cost'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'العوائد السنوية' : 'Annual benefits'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'عدد الحصص' : 'Total shares'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'سعر الحصة' : 'Share price'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'أضيفت في' : 'Created at'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'إجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => (
                    <tr
                      key={project.id}
                      style={{
                        borderTop: '1px solid var(--color-background-base)',
                      }}
                    >
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                          }}
                        >
                          <strong
                            style={{
                              color: 'var(--color-text-primary)',
                            }}
                          >
                            {language === 'ar' && project.nameAr
                              ? project.nameAr
                              : project.name}
                          </strong>
                          {project.description && (
                            <span
                              style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.85rem',
                                maxWidth: '360px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {language === 'ar' && project.descriptionAr
                                ? project.descriptionAr
                                : project.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {new Intl.NumberFormat(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          {
                            style: 'currency',
                            currency: 'SAR',
                            maximumFractionDigits: 0,
                          }
                        ).format(project.operatingCosts)}
                      </td>
                      <td style={tdStyle}>
                        {new Intl.NumberFormat(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          {
                            style: 'currency',
                            currency: 'SAR',
                            maximumFractionDigits: 0,
                          }
                        ).format(project.annualBenefits)}
                      </td>
                      <td style={tdStyle}>{project.totalShares}</td>
                      <td style={tdStyle}>
                        {new Intl.NumberFormat(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          {
                            style: 'currency',
                            currency: 'SAR',
                            maximumFractionDigits: 2,
                          }
                        ).format(project.sharePrice)}
                      </td>
                      <td style={tdStyle}>
                        <span style={getStatusBadgeStyle(project.status)}>
                          {project.status === 'active'
                            ? language === 'ar'
                              ? 'نشط'
                              : 'Active'
                            : project.status === 'inactive'
                              ? language === 'ar'
                                ? 'موقوف'
                                : 'Inactive'
                              : language === 'ar'
                                ? 'مؤرشف'
                                : 'Archived'}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {new Date(project.createdAt).toLocaleString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { dateStyle: 'medium', timeStyle: 'short' }
                        )}
                      </td>
                      <td style={{ ...tdStyle, width: '180px' }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleEditClick(project)}
                            style={actionButtonStyle}
                          >
                            {'\u270F\uFE0F '}
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(project)}
                            style={{
                              ...actionButtonStyle,
                              color: '#DC2626',
                            }}
                          >
                            {'\u{1F5D1} '}
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Simple pagination */}
        <section
          style={{
            padding: '0 0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: palette.textSecondary,
            fontSize: '0.9rem',
          }}
        >
          <span>
            {meta.total > 0
              ? `${meta.page} / ${meta.totalPages} (${meta.total})`
              : '0 / 0 (0)'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={!meta.hasPrev}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: !meta.hasPrev
                  ? palette.backgroundSurface
                  : palette.backgroundBase,
                cursor: !meta.hasPrev ? 'not-allowed' : 'pointer',
              }}
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.hasNext}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: meta.hasNext
                  ? palette.backgroundBase
                  : palette.backgroundSurface,
                cursor: meta.hasNext ? 'pointer' : 'not-allowed',
              }}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        </section>
      </div>

      {/* Project create/edit drawer */}
      {drawerOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.35)',
            display: 'flex',
            justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: 'min(520px, 100vw)',
              height: '100%',
              background: palette.backgroundSurface,
              padding: '2rem 1.75rem 2.5rem',
              boxShadow:
                direction === 'rtl'
                  ? '-32px 0 60px rgba(15,23,42,0.25)'
                  : '32px 0 60px rgba(15,23,42,0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            <header
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.3rem',
                    color: palette.textPrimary,
                  }}
                >
                  {drawerMode === 'create'
                    ? language === 'ar'
                      ? 'مشروع جديد'
                      : 'New project'
                    : language === 'ar'
                      ? 'تعديل المشروع'
                      : 'Edit project'}
                </h2>
                <p
                  style={{
                    margin: '0.4rem 0 0',
                    color: palette.textSecondary,
                    fontSize: '0.95rem',
                  }}
                >
                  {language === 'ar'
                    ? 'أدخل تفاصيل المشروع ثم احفظ.'
                    : 'Fill in the project details, then save.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  border: 'none',
                  background: palette.backgroundBase,
                  color: palette.textPrimary,
                  borderRadius: '0.75rem',
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                ✕
              </button>
            </header>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '0.5rem',
                marginRight: '-0.5rem',
              }}
            >
              <form
                onSubmit={handleSubmit}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div style={sectionStyle}>
                  <label style={labelStyle}>
                    {language === 'ar' ? 'اسم المشروع (إنجليزي)' : 'Project name (EN)'}
                    <input
                      type="text"
                      value={formValues.name}
                      onChange={e => handleFieldChange('name', e.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.name ? '#DC2626' : 'var(--color-brand-secondary-soft)',
                      }}
                    />
                    {formErrors.name && (
                      <span style={errorStyle}>{formErrors.name}</span>
                    )}
                  </label>

                  <label style={labelStyle}>
                    {language === 'ar' ? 'اسم المشروع (عربي)' : 'Project name (AR)'}
                    <input
                      type="text"
                      value={formValues.nameAr}
                      onChange={e => handleFieldChange('nameAr', e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div style={sectionStyle}>
                  <label style={labelStyle}>
                    {language === 'ar' ? 'وصف مختصر (إنجليزي)' : 'Description (EN)'}
                    <textarea
                      value={formValues.description}
                      onChange={e => handleFieldChange('description', e.target.value)}
                      rows={3}
                      style={textareaStyle}
                    />
                  </label>
                  <label style={labelStyle}>
                    {language === 'ar' ? 'وصف مختصر (عربي)' : 'Description (AR)'}
                    <textarea
                      value={formValues.descriptionAr}
                      onChange={e => handleFieldChange('descriptionAr', e.target.value)}
                      rows={3}
                      style={textareaStyle}
                    />
                  </label>
                </div>

                <div style={sectionStyle}>
                  <label style={labelStyle}>
                    {language === 'ar' ? 'تكاليف التشغيل (ريال)' : 'Operating costs (SAR)'}
                    <input
                      type="number"
                      value={formValues.operatingCosts}
                      onChange={e => handleFieldChange('operatingCosts', e.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.operatingCosts
                          ? '#DC2626'
                          : 'var(--color-brand-secondary-soft)',
                      }}
                    />
                    {formErrors.operatingCosts && (
                      <span style={errorStyle}>{formErrors.operatingCosts}</span>
                    )}
                  </label>

                  <label style={labelStyle}>
                    {language === 'ar' ? 'العوائد السنوية (ريال)' : 'Annual benefits (SAR)'}
                    <input
                      type="number"
                      value={formValues.annualBenefits}
                      onChange={e => handleFieldChange('annualBenefits', e.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.annualBenefits
                          ? '#DC2626'
                          : 'var(--color-brand-secondary-soft)',
                      }}
                    />
                    {formErrors.annualBenefits && (
                      <span style={errorStyle}>{formErrors.annualBenefits}</span>
                    )}
                  </label>
                </div>

                <div style={sectionStyle}>
                  <label style={labelStyle}>
                    {language === 'ar' ? 'عدد الحصص' : 'Total shares'}
                    <input
                      type="number"
                      value={formValues.totalShares}
                      onChange={e => handleFieldChange('totalShares', e.target.value)}
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.totalShares
                          ? '#DC2626'
                          : 'var(--color-brand-secondary-soft)',
                      }}
                    />
                    {formErrors.totalShares && (
                      <span style={errorStyle}>{formErrors.totalShares}</span>
                    )}
                  </label>

                  <label style={labelStyle}>
                    {language === 'ar' ? 'سعر الحصة (اختياري)' : 'Share price (optional)'}
                    <input
                      type="number"
                      step="0.01"
                      value={formValues.sharePrice}
                      onChange={e => handleFieldChange('sharePrice', e.target.value)}
                      style={inputStyle}
                    />
                  </label>
                </div>

                <div style={sectionStyle}>
                  <label style={labelStyle}>
                    {language === 'ar' ? 'حالة المشروع' : 'Project status'}
                    <select
                      value={formValues.status}
                      onChange={e =>
                        handleFieldChange('status', e.target.value as Project['status'])
                      }
                      style={inputStyle}
                    >
                      <option value="active">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </option>
                      <option value="inactive">
                        {language === 'ar' ? 'موقوف' : 'Inactive'}
                      </option>
                      <option value="archived">
                        {language === 'ar' ? 'مؤرشف' : 'Archived'}
                      </option>
                    </select>
                  </label>

                  <label style={labelStyle}>
                    {language === 'ar'
                      ? 'مفتاح صورة الغلاف (من التخزين)'
                      : 'Cover image storage key'}
                    <input
                      type="text"
                      value={formValues.coverKey}
                      onChange={e => handleFieldChange('coverKey', e.target.value)}
                      style={inputStyle}
                      placeholder={
                        language === 'ar'
                          ? 'path/to/image.jpg'
                          : 'path/to/image.jpg'
                      }
                    />
                    <small
                      style={{
                        color: palette.textSecondary,
                        fontSize: '0.8rem',
                      }}
                    >
                      {language === 'ar'
                        ? 'يمكن ربط هذا الحقل بمرفوعات سوبابيز لاحقاً.'
                        : 'You can later connect this to Supabase uploads.'}
                    </small>
                  </label>
                </div>
              </form>
            </div>

            <footer
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-border-soft)',
              }}
            >
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                style={{
                  background: palette.backgroundSurface,
                  color: 'var(--color-brand-accent-deep)',
                  borderRadius: '0.85rem',
                  padding: '0.7rem 1.6rem',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: '1px solid var(--color-brand-secondary-soft)',
                  cursor: 'pointer',
                }}
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isMutating}
                style={{
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  border: 'none',
                  borderRadius: '0.85rem',
                  padding: '0.75rem 1.8rem',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 16px 30px rgba(37, 99, 235, 0.25)',
                  cursor: isMutating ? 'not-allowed' : 'pointer',
                  opacity: isMutating ? 0.65 : 1,
                }}
              >
                {language === 'ar' ? 'حفظ' : 'Save'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '0.85rem 1.1rem',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '0.9rem',
};

const tdStyle: React.CSSProperties = {
  padding: '0.9rem 1.1rem',
  verticalAlign: 'top',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
};

const actionButtonStyle: React.CSSProperties = {
  background: 'var(--color-background-alt)',
  color: 'var(--color-brand-accent-deep)',
  border: 'none',
  borderRadius: '0.7rem',
  padding: '0.45rem 0.9rem',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '0.85rem',
};

function getStatusBadgeStyle(status: Project['status']): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    fontWeight: 600,
  };

  if (status === 'active') {
    return {
      ...base,
      background: '#DCFCE7',
      color: '#166534',
    };
  }
  if (status === 'inactive') {
    return {
      ...base,
      background: '#FEF3C7',
      color: '#B45309',
    };
  }
  return {
    ...base,
    background: 'var(--color-border)',
    color: 'var(--color-text-secondary)',
  };
}

const sectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  color: 'var(--color-text-primary)',
  fontWeight: 600,
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
  minHeight: '120px',
  resize: 'vertical' as const,
  lineHeight: 1.6,
};

const errorStyle: React.CSSProperties = {
  color: '#DC2626',
  fontSize: '0.8rem',
  fontWeight: 500,
};


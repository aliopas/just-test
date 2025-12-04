import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import type { ProjectListFilters, Project } from '../hooks/useAdminProjects';
import {
  useAdminProjectsList,
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

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذا المشروع نهائيًا؟'
        : 'Are you sure you want to permanently delete this project?'
    );
    if (!confirmed) return;

    await deleteMutation.mutateAsync(project.id);
  };

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
                      <td style={{ ...tdStyle, width: '140px' }}>
                        <button
                          type="button"
                          onClick={() => handleDelete(project)}
                          style={{
                            ...actionButtonStyle,
                            color: '#DC2626',
                          }}
                        >
                          {'\u{1F5D1}'}
                          {' '}
                          {language === 'ar' ? 'حذف' : 'Delete'}
                        </button>
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


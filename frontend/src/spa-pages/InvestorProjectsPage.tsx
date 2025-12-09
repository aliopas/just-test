import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import type { Project } from '../hooks/useAdminProjects';
import { useInvestorProjectsDirect, useCompanyResourcesForInvestor } from '../hooks/useInvestorProjectsDirect';
import { useNextNavigate } from '../utils/next-router';

export function InvestorProjectsPage() {
  const { language, direction } = useLanguage();
  const navigate = useNextNavigate();
  const { data: projects, isLoading, isError } = useInvestorProjectsDirect();
  const { data: companyResources } = useCompanyResourcesForInvestor();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects?.filter((project) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      project.name.toLowerCase().includes(query) ||
      (project.nameAr && project.nameAr.toLowerCase().includes(query)) ||
      (project.description && project.description.toLowerCase().includes(query)) ||
      (project.descriptionAr && project.descriptionAr.toLowerCase().includes(query))
    );
  }) ?? [];

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
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
            {language === 'ar' ? 'مشاريع الشركة' : 'Company Projects'}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {language === 'ar'
              ? 'استعرض مشاريع باكورة الاستثمارية النشطة.'
              : 'Browse active Bacura investment projects.'}
          </p>
        </header>

        {/* Search */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
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
              {language === 'ar' ? 'بحث' : 'Search'}
            </label>
            <input
              type="search"
              placeholder={
                language === 'ar'
                  ? 'ابحث باسم المشروع…'
                  : 'Search by project name…'
              }
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
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

          {!isLoading && !isError && filteredProjects.length === 0 && (
            <div
              style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar'
                ? searchQuery
                  ? 'لا توجد مشاريع تطابق البحث.'
                  : 'لا توجد مشاريع نشطة حالياً.'
                : searchQuery
                  ? 'No projects match your search.'
                  : 'There are no active projects yet.'}
            </div>
          )}

          {!isLoading && !isError && filteredProjects.length > 0 && (
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
                      {language === 'ar' ? 'اسم المشروع' : 'Project Name'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'تاريخ العقد' : 'Contract Date'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'نسبة الإنجاز' : 'Completion %'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'قيمة المشروع' : 'Project Value'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'مورد الشركة' : 'Company Resource'}
                    </th>
                    <th style={thStyle}>
                      {language === 'ar' ? 'أضيفت في' : 'Created at'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project: Project) => (
                    <tr
                      key={project.id}
                      onClick={() => handleProjectClick(project.id)}
                      style={{
                        borderTop: '1px solid var(--color-background-base)',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = palette.brandSecondarySoft;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={tdStyle}>
                        <strong
                          style={{
                            color: 'var(--color-text-primary)',
                          }}
                        >
                          {project.name}
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        {project.contractDate
                          ? new Date(project.contractDate).toLocaleDateString(
                              language === 'ar' ? 'ar-SA' : 'en-US',
                              { dateStyle: 'medium' }
                            )
                          : '-'}
                      </td>
                      <td style={tdStyle}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              background: palette.neutralBorderSoft,
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${project.completionPercentage}%`,
                                height: '100%',
                                background:
                                  project.completionPercentage >= 80
                                    ? '#10B981'
                                    : project.completionPercentage >= 50
                                    ? '#F59E0B'
                                    : '#EF4444',
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              minWidth: '40px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: palette.textPrimary,
                            }}
                          >
                            {project.completionPercentage.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        {project.projectValue
                          ? new Intl.NumberFormat(
                              language === 'ar' ? 'ar-SA' : 'en-US',
                              {
                                style: 'currency',
                                currency: 'SAR',
                                maximumFractionDigits: 0,
                              }
                            ).format(project.projectValue)
                          : '-'}
                      </td>
                      <td style={tdStyle}>
                        {project.companyResourceId
                          ? (() => {
                              const resource = companyResources?.find(
                                (r) => r.id === project.companyResourceId
                              );
                              return resource
                                ? language === 'ar'
                                  ? resource.titleAr
                                  : resource.titleEn
                                : '-';
                            })()
                          : '-'}
                      </td>
                      <td style={tdStyle}>
                        {new Date(project.createdAt).toLocaleString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { dateStyle: 'medium', timeStyle: 'short' }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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


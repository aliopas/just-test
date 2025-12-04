import React from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { usePublicProjectDetail } from '../hooks/usePublicProjects';
import { useNextNavigate } from '../utils/next-router';
import type { Project } from '../hooks/useAdminProjects';

export function InvestorProjectDetailPage() {
  const { language, direction } = useLanguage();
  const params = useParams();
  const navigate = useNextNavigate();
  const projectId = params?.id as string | undefined;

  const { data: project, isLoading, isError } = usePublicProjectDetail(projectId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'long',
    });
  };

  const getProjectName = (project: Project) => {
    return language === 'ar' && project.nameAr ? project.nameAr : project.name;
  };

  const getProjectDescription = (project: Project) => {
    return language === 'ar' && project.descriptionAr
      ? project.descriptionAr
      : project.description || '';
  };

  const getCoverImageUrl = (coverKey: string | null) => {
    if (!coverKey) return null;
    // Assuming Supabase storage URL pattern
    // This should be replaced with actual Supabase storage URL generation
    return coverKey.startsWith('http') ? coverKey : `https://storage.supabase.co/object/public/projects/${coverKey}`;
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: palette.backgroundSurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          direction,
        }}
      >
        <p style={{ color: palette.textSecondary }}>
          {language === 'ar' ? 'جاري تحميل المشروع...' : 'Loading project...'}
        </p>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: palette.backgroundSurface,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          direction,
        }}
      >
        <p style={{ color: palette.error }}>
          {language === 'ar'
            ? 'تعذّر تحميل المشروع. حاول مرة أخرى.'
            : 'Failed to load project. Please try again.'}
        </p>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: radius.md,
            background: palette.brandPrimary,
            color: palette.textOnBrand,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to home'}
        </button>
      </div>
    );
  }

  const coverImageUrl = getCoverImageUrl(project.coverKey);

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
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
            padding: '0.45rem 0.9rem',
            borderRadius: radius.md,
            border: `1px solid ${palette.neutralBorderMuted}`,
            background: palette.backgroundBase,
            color: palette.textSecondary,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {language === 'ar' ? '← العودة' : '← Back'}
        </button>

        {/* Cover image */}
        {coverImageUrl && (
          <div
            style={{
              width: '100%',
              height: '400px',
              borderRadius: radius.lg,
              overflow: 'hidden',
              boxShadow: shadow.medium,
            }}
          >
            <img
              src={coverImageUrl}
              alt={getProjectName(project)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}

        {/* Project header */}
        <header
          style={{
            padding: '1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          <h1
            style={{
              margin: 0,
              marginBottom: '0.5rem',
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {getProjectName(project)}
          </h1>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
              marginTop: '0.75rem',
            }}
          >
            <span
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: radius.pill,
                background:
                  project.status === 'active'
                    ? `${palette.success}20`
                    : `${palette.textSecondary}20`,
                color:
                  project.status === 'active' ? palette.success : palette.textSecondary,
                fontSize: typography.sizes.caption,
                fontWeight: 600,
              }}
            >
              {project.status === 'active'
                ? language === 'ar'
                  ? 'نشط'
                  : 'Active'
                : language === 'ar'
                  ? 'غير نشط'
                  : 'Inactive'}
            </span>
            <span
              style={{
                fontSize: typography.sizes.caption,
                color: palette.textSecondary,
              }}
            >
              {language === 'ar' ? 'تاريخ الإنشاء: ' : 'Created: '}
              {formatDate(project.createdAt)}
            </span>
          </div>
        </header>

        {/* Main content grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '1.5rem',
          }}
        >
          {/* Left column - Description */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Description */}
            {getProjectDescription(project) && (
              <section
                style={{
                  padding: '1.5rem',
                  borderRadius: radius.lg,
                  background: palette.backgroundBase,
                  boxShadow: shadow.subtle,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: '1rem',
                    fontSize: typography.sizes.subheading,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {language === 'ar' ? 'وصف المشروع' : 'Project Description'}
                </h2>
                <div
                  style={{
                    fontSize: typography.sizes.body,
                    color: palette.textPrimary,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {getProjectDescription(project)}
                </div>
              </section>
            )}
          </div>

          {/* Right column - Financial details */}
          <div>
            <section
              style={{
                padding: '1.5rem',
                borderRadius: radius.lg,
                background: palette.backgroundBase,
                boxShadow: shadow.subtle,
                border: `1px solid ${palette.neutralBorderMuted}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: '1rem',
                  fontSize: typography.sizes.subheading,
                  fontWeight: 600,
                  color: palette.textPrimary,
                }}
              >
                {language === 'ar' ? 'التفاصيل المالية' : 'Financial Details'}
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <FinancialRow
                  label={language === 'ar' ? 'تكاليف التشغيل' : 'Operating Costs'}
                  value={formatCurrency(project.operatingCosts)}
                />
                <FinancialRow
                  label={language === 'ar' ? 'الفوائد السنوية' : 'Annual Benefits'}
                  value={formatCurrency(project.annualBenefits)}
                />
                <FinancialRow
                  label={language === 'ar' ? 'إجمالي الأسهم' : 'Total Shares'}
                  value={formatNumber(project.totalShares)}
                />
                <FinancialRow
                  label={language === 'ar' ? 'سعر السهم' : 'Share Price'}
                  value={formatCurrency(project.sharePrice)}
                />
                <div
                  style={{
                    marginTop: '0.5rem',
                    paddingTop: '1rem',
                    borderTop: `1px solid ${palette.neutralBorderMuted}`,
                  }}
                >
                  <FinancialRow
                    label={
                      language === 'ar'
                        ? 'تكلفة التشغيل لكل سهم'
                        : 'Operating Cost per Share'
                    }
                    value={formatCurrency(project.operatingCostPerShare)}
                    highlight
                  />
                  <FinancialRow
                    label={
                      language === 'ar'
                        ? 'الفائدة السنوية لكل سهم'
                        : 'Annual Benefit per Share'
                    }
                    value={formatCurrency(project.annualBenefitPerShare)}
                    highlight
                  />
                </div>
              </div>
            </section>

            {/* Investment CTA */}
            <section
              style={{
                marginTop: '1.5rem',
                padding: '1.5rem',
                borderRadius: radius.lg,
                background: `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`,
                boxShadow: shadow.medium,
                color: palette.textOnBrand,
                textAlign: 'center',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  marginBottom: '0.5rem',
                  fontSize: typography.sizes.subheading,
                  fontWeight: 600,
                }}
              >
                {language === 'ar' ? 'مهتم بالاستثمار؟' : 'Interested in investing?'}
              </h3>
              <p
                style={{
                  margin: 0,
                  marginBottom: '1rem',
                  fontSize: typography.sizes.body,
                  opacity: 0.9,
                }}
              >
                {language === 'ar'
                  ? 'قدّم طلب استثماري لهذا المشروع'
                  : 'Submit an investment request for this project'}
              </p>
              <button
                onClick={() => navigate('/requests/new')}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: radius.md,
                  background: palette.textOnBrand,
                  color: palette.brandPrimary,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: typography.sizes.body,
                }}
              >
                {language === 'ar' ? 'إنشاء طلب استثماري' : 'Create Investment Request'}
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const { palette, typography } = require('../styles/theme');

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: highlight ? '0.5rem 0' : '0.25rem 0',
      }}
    >
      <span
        style={{
          fontSize: typography.sizes.body,
          color: highlight ? palette.textPrimary : palette.textSecondary,
          fontWeight: highlight ? 600 : 400,
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: highlight ? typography.sizes.subheading : typography.sizes.body,
          color: palette.textPrimary,
          fontWeight: 600,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

import React from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { usePublicProjectDetail } from '../hooks/useSupabaseProjects';
import { useNextNavigate } from '../utils/next-router';

type PublicProject = {
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  coverKey: string | null;
  operatingCosts: number;
  annualBenefits: number;
  totalShares: number;
  sharePrice: number;
  operatingCostPerShare: number;
  annualBenefitPerShare: number;
};

export function InvestorProjectDetailPage() {
  const { language, direction } = useLanguage();
  const params = useParams();
  const navigate = useNextNavigate();
  const projectId = params?.id as string | undefined;

  const { data: project, isLoading, isError } = usePublicProjectDetail(projectId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'long',
    });
  };

  const getProjectName = (project: PublicProject) => {
    return language === 'ar' && project.nameAr ? project.nameAr : project.name;
  };

  const getProjectDescription = (project: PublicProject) => {
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

        {/* Main content */}
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

          {/* Investment CTA */}
          <section
            style={{
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
  );
}


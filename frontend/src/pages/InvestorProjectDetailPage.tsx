import React, { useEffect, type CSSProperties } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import Link from 'next/link';
import { useParams } from '../utils/next-router';
import { useLanguage, LanguageProvider } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { usePublicProjectDetail } from '../hooks/usePublicProjects';
import { palette } from '../styles/theme';
import { resolveCoverUrl, PROJECT_IMAGES_BUCKET } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';
import type { InvestorLanguage } from '../types/investor';

const queryClient = new QueryClient();

function formatCurrency(
  amount: number,
  currency: string,
  language: InvestorLanguage
) {
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatDate(
  value: string | null,
  language: 'ar' | 'en'
): string | null {
  if (!value) {
    return null;
  }

  try {
    return new Date(value).toLocaleString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  } catch {
    return value;
  }
}

const detailCardStyle: CSSProperties = {
  borderRadius: '1.25rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundSurface,
  padding: '1.75rem',
  boxShadow: '0 18px 40px rgba(15, 23, 42, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const detailItemStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const detailLabelStyle: CSSProperties = {
  fontSize: '0.9rem',
  color: palette.textSecondary,
  fontWeight: 500,
};

const detailValueStyle: CSSProperties = {
  fontSize: '1.2rem',
  fontWeight: 700,
  color: palette.textPrimary,
};

const financialGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.5rem',
  marginTop: '1rem',
};

function InvestorProjectDetailPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const params = useParams<{ id: string }>();
  const projectId = params?.id;

  const { data, isLoading, isError } = usePublicProjectDetail(projectId ?? null);

  useEffect(() => {
    if (!isError) {
      return;
    }

    pushToast({
      message: language === 'ar' 
        ? 'فشل تحميل تفاصيل المشروع' 
        : 'Failed to load project details',
      variant: 'error',
    });
  }, [isError, pushToast, language]);

  const coverUrl = resolveCoverUrl(data?.coverKey ?? null, PROJECT_IMAGES_BUCKET);
  const createdAt = formatDate(data?.createdAt ?? null, language);
  const updatedAt = formatDate(data?.updatedAt ?? null, language);
  
  const projectName = data && language === 'ar' && data.nameAr
    ? data.nameAr
    : data?.name;
  const projectDescription = data && language === 'ar' && data.descriptionAr
    ? data.descriptionAr
    : data?.description;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-background-surface)',
      }}
    >
      <header
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2.5rem 1.5rem 1.5rem',
          direction,
        }}
      >
        <Link
          href="/home"
          style={{
            display: 'inline-block',
            marginBottom: '1.5rem',
            color: palette.brandPrimaryStrong,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          {language === 'ar' ? '← العودة' : '← Back'}
        </Link>

        {isLoading && (
          <p
            style={{
              color: palette.textSecondary,
              fontSize: '1.05rem',
            }}
          >
            {language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
          </p>
        )}

        {!isLoading && !data && (
          <p
            style={{
              color: '#DC2626',
              fontWeight: 600,
            }}
          >
            {language === 'ar' 
              ? 'فشل تحميل المشروع' 
              : 'Failed to load project'}
          </p>
        )}

        {data && (
          <>
            <h1
              style={{
                margin: 0,
                fontSize: '2.4rem',
                fontWeight: 700,
                color: palette.textPrimary,
                lineHeight: 1.3,
              }}
            >
              {projectName}
            </h1>
            <div
              style={{
                marginTop: '1rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.5rem',
                color: palette.textSecondary,
                fontSize: '0.95rem',
              }}
            >
              {createdAt && (
                <span>
                  {language === 'ar' ? 'تاريخ الإنشاء' : 'Created'}: {createdAt}
                </span>
              )}
              {updatedAt && updatedAt !== createdAt && (
                <span>
                  {language === 'ar' ? 'آخر تحديث' : 'Last updated'}: {updatedAt}
                </span>
              )}
            </div>
          </>
        )}
      </header>

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem',
        }}
      >
        <div
          style={{
            borderRadius: '1.2rem',
            overflow: 'hidden',
            boxShadow: '0 25px 55px rgba(15, 23, 42, 0.18)',
          }}
        >
          <OptimizedImage
            src={coverUrl}
            alt={projectName ?? 'Project cover'}
            aspectRatio={2.08}
            fallbackText={projectName ? projectName.charAt(0).toUpperCase() : undefined}
            objectFit="cover"
            style={{
              borderRadius: '1.2rem',
            }}
          />
        </div>
      </div>

      {data && (
        <>
          <article
            style={{
              maxWidth: '900px',
              margin: '2.5rem auto 4rem',
              padding: '0 1.5rem',
              color: palette.textPrimary,
              direction,
            }}
          >
            {projectDescription && (
              <div
                style={{
                  fontSize: '1.1rem',
                  lineHeight: 1.8,
                  color: palette.textPrimary,
                  whiteSpace: 'pre-line',
                }}
              >
                {projectDescription}
              </div>
            )}

            <section
              style={{
                marginTop: '3rem',
                direction,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                  marginBottom: '1.5rem',
                }}
              >
                {language === 'ar' ? 'المعلومات المالية' : 'Financial Information'}
              </h2>
              <div style={detailCardStyle}>
                <div style={financialGridStyle}>
                  <div style={detailItemStyle}>
                    <span style={detailLabelStyle}>
                      {language === 'ar' ? 'سعر السهم' : 'Share Price'}
                    </span>
                    <span style={{ ...detailValueStyle, color: palette.brandAccentDeep }}>
                      {formatCurrency(data.sharePrice, 'SAR', language)}
                    </span>
                  </div>
                  <div style={detailItemStyle}>
                    <span style={detailLabelStyle}>
                      {language === 'ar' ? 'إجمالي الأسهم' : 'Total Shares'}
                    </span>
                    <span style={detailValueStyle}>
                      {data.totalShares.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  <div style={detailItemStyle}>
                    <span style={detailLabelStyle}>
                      {language === 'ar' ? 'التكاليف التشغيلية' : 'Operating Costs'}
                    </span>
                    <span style={detailValueStyle}>
                      {formatCurrency(data.operatingCosts, 'SAR', language)}
                    </span>
                  </div>
                  <div style={detailItemStyle}>
                    <span style={detailLabelStyle}>
                      {language === 'ar' ? 'الفوائد السنوية' : 'Annual Benefits'}
                    </span>
                    <span style={detailValueStyle}>
                      {formatCurrency(data.annualBenefits, 'SAR', language)}
                    </span>
                  </div>
                  <div style={detailItemStyle}>
                    <span style={detailLabelStyle}>
                      {language === 'ar' ? 'التكلفة التشغيلية للسهم' : 'Operating Cost per Share'}
                    </span>
                    <span style={detailValueStyle}>
                      {formatCurrency(data.operatingCostPerShare, 'SAR', language)}
                    </span>
                  </div>
                  <div style={detailItemStyle}>
                    <span style={detailLabelStyle}>
                      {language === 'ar' ? 'الفائدة السنوية للسهم' : 'Annual Benefit per Share'}
                    </span>
                    <span style={detailValueStyle}>
                      {formatCurrency(data.annualBenefitPerShare, 'SAR', language)}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </article>
        </>
      )}
    </div>
  );
}

export function InvestorProjectDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <InvestorProjectDetailPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// Default export used only for legacy Next.js pages directory validation.
// We export a simple stub that does not rely on React Router, React Query, or
// any browser-only APIs so that static generation in Netlify succeeds.
export default function InvestorProjectDetailPageStub() {
  return null;
}

// Prevent static generation - this page uses client-side hooks and state
// In Pages Router, we need to use getServerSideProps instead of export const dynamic
export async function getServerSideProps() {
  return {
    props: {},
  };
}

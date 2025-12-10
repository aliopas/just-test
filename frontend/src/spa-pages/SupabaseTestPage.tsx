/**
 * صفحة اختبار Supabase - Test Supabase Data Display
 * 
 * هذه الصفحة تختبر:
 * 1. جلب البيانات من Supabase (GET)
 * 2. إرسال البيانات إلى Supabase (POST)
 * 3. عرض البيانات في React
 * 4. عرض الأخطاء إن وجدت
 */

import { useState } from 'react';
import { useInvestorNewsList } from '../hooks/useSupabaseNews';
import { usePublicProjects } from '../hooks/useSupabaseProjects';
import { useCompanyProfiles } from '../hooks/useSupabaseTables';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { apiClient } from '../utils/api-client';
import { palette } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';

export function SupabaseTestPage() {
  const { language, direction } = useLanguage();
  const [testResult, setTestResult] = useState<{
    type: 'success' | 'error';
    message: string;
    data?: unknown;
  } | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  // Test GET operations - جلب البيانات
  const {
    data: newsData,
    isLoading: isNewsLoading,
    isError: isNewsError,
    error: newsError,
  } = useInvestorNewsList({ page: 1, limit: 5 });

  const {
    data: projectsData,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
    error: projectsError,
  } = usePublicProjects();

  const {
    data: profiles,
    isLoading: isProfilesLoading,
    isError: isProfilesError,
    error: profilesError,
  } = useCompanyProfiles();
  
  // Transform profiles to match expected format
  const profilesData = profiles ? { profiles: profiles.map(p => ({
    id: p.id,
    title: language === 'ar' ? p.titleAr : p.titleEn,
    content: language === 'ar' ? p.contentAr : p.contentEn,
    iconKey: p.iconKey,
    displayOrder: p.displayOrder,
  })) } : null;

  // Test POST operation - إرسال البيانات
  const createRequestMutation = useCreateRequest();

  const handleTestPost = async () => {
    setIsPosting(true);
    setTestResult(null);

    try {
      // Test creating a simple request
      const result = await createRequestMutation.mutateAsync({
        type: 'feedback',
        notes: `Test request from Supabase Test Page - ${new Date().toISOString()}`,
        metadata: {
          test: true,
          timestamp: new Date().toISOString(),
        },
      });

      setTestResult({
        type: 'success',
        message: language === 'ar' 
          ? 'تم إرسال البيانات بنجاح!' 
          : 'Data posted successfully!',
        data: result,
      });
    } catch (error) {
      setTestResult({
        type: 'error',
        message: language === 'ar'
          ? `خطأ في إرسال البيانات: ${error instanceof Error ? error.message : 'Unknown error'}`
          : `Error posting data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: error,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const handleTestDirectApi = async () => {
    setIsPosting(true);
    setTestResult(null);

    try {
      // Test direct API call
      const result = await apiClient('/health', { auth: false });
      setTestResult({
        type: 'success',
        message: language === 'ar'
          ? 'تم الاتصال بالـ API بنجاح!'
          : 'API connection successful!',
        data: result,
      });
    } catch (error) {
      setTestResult({
        type: 'error',
        message: language === 'ar'
          ? `خطأ في الاتصال بالـ API: ${error instanceof Error ? error.message : 'Unknown error'}`
          : `API connection error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: error,
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div
      style={{
        direction,
        minHeight: '100vh',
        padding: '2rem',
        background: palette.backgroundBase,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Header */}
        <header
          style={{
            background: palette.backgroundSurface,
            padding: '2rem',
            borderRadius: '1rem',
            border: `1px solid ${palette.neutralBorder}`,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '2rem',
              color: palette.textPrimary,
              marginBottom: '0.5rem',
            }}
          >
            {language === 'ar' 
              ? 'اختبار Supabase - عرض البيانات' 
              : 'Supabase Test - Data Display'}
          </h1>
          <p style={{ margin: 0, color: palette.textSecondary }}>
            {language === 'ar'
              ? 'هذه الصفحة تختبر جلب وإرسال البيانات من/إلى Supabase'
              : 'This page tests fetching and posting data from/to Supabase'}
          </p>
        </header>

        {/* Test Buttons */}
        <section
          style={{
            background: palette.backgroundSurface,
            padding: '1.5rem',
            borderRadius: '1rem',
            border: `1px solid ${palette.neutralBorder}`,
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleTestPost}
            disabled={isPosting}
            style={{
              padding: '0.75rem 1.5rem',
              background: isPosting 
                ? palette.neutralMuted 
                : palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: isPosting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {isPosting
              ? language === 'ar' ? 'جاري الإرسال...' : 'Posting...'
              : language === 'ar' ? 'اختبار POST (إرسال بيانات)' : 'Test POST (Send Data)'}
          </button>

          <button
            onClick={handleTestDirectApi}
            disabled={isPosting}
            style={{
              padding: '0.75rem 1.5rem',
              background: isPosting
                ? palette.neutralMuted
                : palette.brandSecondary,
              color: palette.textOnBrand,
              border: 'none',
              borderRadius: '0.5rem',
              cursor: isPosting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {isPosting
              ? language === 'ar' ? 'جاري الاختبار...' : 'Testing...'
              : language === 'ar' ? 'اختبار API مباشر' : 'Test Direct API'}
          </button>
        </section>

        {/* Test Result */}
        {testResult && (
          <section
            style={{
              background: testResult.type === 'success'
                ? palette.backgroundAlt
                : palette.backgroundSurface,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: `2px solid ${
                testResult.type === 'success'
                  ? palette.brandPrimary
                  : palette.brandSecondaryMuted
              }`,
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                color: testResult.type === 'success'
                  ? palette.brandPrimary
                  : palette.brandSecondaryMuted,
              }}
            >
              {testResult.type === 'success'
                ? (language === 'ar' ? '✓ نجح الاختبار' : '✓ Test Successful')
                : (language === 'ar' ? '✗ فشل الاختبار' : '✗ Test Failed')}
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: palette.textPrimary }}>
              {testResult.message}
            </p>
            {Boolean(testResult.data) && (
              <details
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: palette.backgroundBase,
                  borderRadius: '0.5rem',
                  border: `1px solid ${palette.neutralBorder}`,
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    color: palette.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                </summary>
                <pre
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: palette.backgroundAlt,
                    borderRadius: '0.25rem',
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    color: palette.textPrimary,
                  }}
                >
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </details>
            )}
          </section>
        )}

        {/* GET Operations Results - نتائج عمليات الجلب */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {/* News Data */}
          <div
            style={{
              background: palette.backgroundSurface,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: `1px solid ${palette.neutralBorder}`,
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: palette.textPrimary }}>
              {language === 'ar' ? 'الأخبار (News)' : 'News Data'}
            </h3>
            {isNewsLoading ? (
              <p style={{ color: palette.textSecondary }}>
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </p>
            ) : isNewsError ? (
              <div>
                <p style={{ color: palette.brandSecondaryMuted, margin: '0 0 0.5rem 0' }}>
                  {language === 'ar' ? '✗ خطأ في جلب البيانات' : '✗ Error fetching data'}
                </p>
                <pre
                  style={{
                    fontSize: '0.75rem',
                    color: palette.textSecondary,
                    overflow: 'auto',
                    padding: '0.5rem',
                    background: palette.backgroundAlt,
                    borderRadius: '0.25rem',
                  }}
                >
                  {JSON.stringify(newsError, null, 2)}
                </pre>
              </div>
            ) : newsData ? (
              <div>
                <p style={{ color: palette.brandPrimary, margin: '0 0 0.5rem 0' }}>
                  {language === 'ar' ? '✓ تم جلب البيانات بنجاح' : '✓ Data fetched successfully'}
                </p>
                <p style={{ color: palette.textSecondary, fontSize: '0.875rem' }}>
                  {language === 'ar' ? 'عدد الأخبار:' : 'News count:'} {newsData.news.length}
                </p>
                <details style={{ marginTop: '0.5rem' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      color: palette.textSecondary,
                      fontSize: '0.875rem',
                    }}
                  >
                    {language === 'ar' ? 'عرض البيانات' : 'View Data'}
                  </summary>
                  <pre
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      padding: '0.5rem',
                      background: palette.backgroundAlt,
                      borderRadius: '0.25rem',
                    }}
                  >
                    {JSON.stringify(newsData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : null}
          </div>

          {/* Projects Data */}
          <div
            style={{
              background: palette.backgroundSurface,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: `1px solid ${palette.neutralBorder}`,
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: palette.textPrimary }}>
              {language === 'ar' ? 'المشاريع (Projects)' : 'Projects Data'}
            </h3>
            {isProjectsLoading ? (
              <p style={{ color: palette.textSecondary }}>
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </p>
            ) : isProjectsError ? (
              <div>
                <p style={{ color: palette.brandSecondaryMuted, margin: '0 0 0.5rem 0' }}>
                  {language === 'ar' ? '✗ خطأ في جلب البيانات' : '✗ Error fetching data'}
                </p>
                <pre
                  style={{
                    fontSize: '0.75rem',
                    color: palette.textSecondary,
                    overflow: 'auto',
                    padding: '0.5rem',
                    background: palette.backgroundAlt,
                    borderRadius: '0.25rem',
                  }}
                >
                  {JSON.stringify(projectsError, null, 2)}
                </pre>
              </div>
            ) : projectsData ? (
              <div>
                <p style={{ color: palette.brandPrimary, margin: '0 0 0.5rem 0' }}>
                  {language === 'ar' ? '✓ تم جلب البيانات بنجاح' : '✓ Data fetched successfully'}
                </p>
                <p style={{ color: palette.textSecondary, fontSize: '0.875rem' }}>
                  {language === 'ar' ? 'عدد المشاريع:' : 'Projects count:'} {projectsData.projects.length}
                </p>
                <details style={{ marginTop: '0.5rem' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      color: palette.textSecondary,
                      fontSize: '0.875rem',
                    }}
                  >
                    {language === 'ar' ? 'عرض البيانات' : 'View Data'}
                  </summary>
                  <pre
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      padding: '0.5rem',
                      background: palette.backgroundAlt,
                      borderRadius: '0.25rem',
                    }}
                  >
                    {JSON.stringify(projectsData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : null}
          </div>

          {/* Profiles Data */}
          <div
            style={{
              background: palette.backgroundSurface,
              padding: '1.5rem',
              borderRadius: '1rem',
              border: `1px solid ${palette.neutralBorder}`,
            }}
          >
            <h3 style={{ margin: '0 0 1rem 0', color: palette.textPrimary }}>
              {language === 'ar' ? 'الملفات الشخصية (Profiles)' : 'Company Profiles'}
            </h3>
            {isProfilesLoading ? (
              <p style={{ color: palette.textSecondary }}>
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </p>
            ) : isProfilesError ? (
              <div>
                <p style={{ color: palette.brandSecondaryMuted, margin: '0 0 0.5rem 0' }}>
                  {language === 'ar' ? '✗ خطأ في جلب البيانات' : '✗ Error fetching data'}
                </p>
                <pre
                  style={{
                    fontSize: '0.75rem',
                    color: palette.textSecondary,
                    overflow: 'auto',
                    padding: '0.5rem',
                    background: palette.backgroundAlt,
                    borderRadius: '0.25rem',
                  }}
                >
                  {JSON.stringify(profilesError, null, 2)}
                </pre>
              </div>
            ) : profilesData ? (
              <div>
                <p style={{ color: palette.brandPrimary, margin: '0 0 0.5rem 0' }}>
                  {language === 'ar' ? '✓ تم جلب البيانات بنجاح' : '✓ Data fetched successfully'}
                </p>
                <p style={{ color: palette.textSecondary, fontSize: '0.875rem' }}>
                  {language === 'ar' ? 'عدد الملفات:' : 'Profiles count:'} {profilesData.profiles.length}
                </p>
                <details style={{ marginTop: '0.5rem' }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      color: palette.textSecondary,
                      fontSize: '0.875rem',
                    }}
                  >
                    {language === 'ar' ? 'عرض البيانات' : 'View Data'}
                  </summary>
                  <pre
                    style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      overflow: 'auto',
                      padding: '0.5rem',
                      background: palette.backgroundAlt,
                      borderRadius: '0.25rem',
                    }}
                  >
                    {JSON.stringify(profilesData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : null}
          </div>
        </section>

        {/* Summary */}
        <section
          style={{
            background: palette.backgroundSurface,
            padding: '1.5rem',
            borderRadius: '1rem',
            border: `1px solid ${palette.neutralBorder}`,
          }}
        >
          <h3 style={{ margin: '0 0 1rem 0', color: palette.textPrimary }}>
            {language === 'ar' ? 'ملخص الاختبار' : 'Test Summary'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: isNewsError ? palette.brandSecondaryMuted : palette.brandPrimary }}>
                {isNewsError ? '✗' : isNewsLoading ? '⏳' : '✓'}
              </span>
              <span style={{ color: palette.textPrimary }}>
                {language === 'ar' ? 'جلب الأخبار' : 'Fetch News'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: isProjectsError ? palette.brandSecondaryMuted : palette.brandPrimary }}>
                {isProjectsError ? '✗' : isProjectsLoading ? '⏳' : '✓'}
              </span>
              <span style={{ color: palette.textPrimary }}>
                {language === 'ar' ? 'جلب المشاريع' : 'Fetch Projects'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: isProfilesError ? palette.brandSecondaryMuted : palette.brandPrimary }}>
                {isProfilesError ? '✗' : isProfilesLoading ? '⏳' : '✓'}
              </span>
              <span style={{ color: palette.textPrimary }}>
                {language === 'ar' ? 'جلب الملفات الشخصية' : 'Fetch Profiles'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}


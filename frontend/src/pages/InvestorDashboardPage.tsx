import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import { useInvestorNewsList } from '../hooks/useInvestorNews';
import { usePublicProjects } from '../hooks/usePublicProjects';
import { resolveCoverUrl, PROJECT_IMAGES_BUCKET, NEWS_IMAGES_BUCKET } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';
import { tDashboard } from '../locales/dashboard';
import { palette } from '../styles/theme';
import { getStatusLabel } from '../utils/requestStatus';
import type { InvestorLanguage } from '../types/investor';
import type { Project } from '../hooks/useAdminProjects';
import type { InvestorNewsItem } from '../types/news';

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

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        background: palette.backgroundSurface,
        borderRadius: '1.25rem',
        border: `1px solid ${palette.neutralBorderSoft}`,
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)',
        minHeight: '140px',
      }}
    >
      <span
        style={{
          fontSize: '0.9rem',
          color: palette.textSecondary,
        }}
      >
        {label}
      </span>
      <strong
        style={{
          fontSize: '2.25rem',
          fontWeight: 700,
          color: palette.textPrimary,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function InvestorDashboardPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<'news' | 'projects'>('news');
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useInvestorDashboard();

  const {
    data: newsResponse,
    isLoading: isNewsLoading,
    isError: isNewsError,
  } = useInvestorNewsList({ page: 1, limit: 6 });

  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = usePublicProjects();

  useEffect(() => {
    if (!isError) {
      return;
    }
    const message =
      error instanceof Error
        ? error.message
        : language === 'ar'
          ? 'تعذر تحميل لوحة المتابعة.'
          : 'Failed to load dashboard.';
    pushToast({ message, variant: 'error' });
  }, [isError, error, language, pushToast]);

  const summaryCards = useMemo(() => {
    if (!data) {
      return [];
    }
    const { byStatus } = data.requestSummary;
    const allCards = [
      {
        label: tDashboard('summary.total', language),
        value: data.requestSummary.total,
        isTotal: true,
      },
      {
        label: tDashboard('summary.submitted', language),
        value: byStatus.submitted ?? 0,
        isTotal: false,
      },
      {
        label: tDashboard('summary.screening', language),
        value: byStatus.screening ?? 0,
        isTotal: false,
      },
      {
        label: tDashboard('summary.pendingInfo', language),
        value: byStatus.pending_info ?? 0,
        isTotal: false,
      },
      {
        label: tDashboard('summary.complianceReview', language),
        value: byStatus.compliance_review ?? 0,
        isTotal: false,
      },
      {
        label: tDashboard('summary.approved', language),
        value: byStatus.approved ?? 0,
        isTotal: false,
      },
      {
        label: tDashboard('summary.settling', language),
        value: byStatus.settling ?? 0,
        isTotal: false,
      },
      {
        label: tDashboard('summary.completed', language),
        value: byStatus.completed ?? 0,
        isTotal: false,
      },
      {
        label: tDashboard('summary.rejected', language),
        value: byStatus.rejected ?? 0,
        isTotal: false,
      },
      {
        label: tDashboard('summary.draft', language),
        value: byStatus.draft ?? 0,
        isTotal: false,
      },
    ];
    
    // إظهار بطاقة الإجمالي دائماً + البطاقات التي قيمتها أكبر من 0
    return allCards.filter(card => card.isTotal || card.value > 0);
  }, [data, language]);

  const recentRequests = data?.recentRequests ?? [];
  const pendingItems = data?.pendingActions.items ?? [];

  return (
    <main
      style={{
        direction,
        padding: '2.5rem 2rem 4rem',
        background: palette.backgroundBase,
        minHeight: 'calc(100vh - 180px)',
      }}
    >
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '2.2rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            {tDashboard('pageTitle', language)}
          </h1>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap',
              alignItems: 'center',
              color: palette.textSecondary,
            }}
          >
            <span>
              {tDashboard('notifications.unreadLabel', language)}:{' '}
              <strong style={{ color: palette.brandAccentDeep }}>
                {data?.unreadNotifications ?? 0}
              </strong>
            </span>
            <span style={{ fontSize: '0.85rem' }}>
              {tDashboard('updatedAt', language)}:{' '}
              {data
                ? new Date(data.generatedAt).toLocaleString(
                    language === 'ar' ? 'ar-SA' : 'en-US',
                    { dateStyle: 'medium', timeStyle: 'short' }
                  )
                : '—'}
            </span>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`summary-skeleton-${index}`}
                  style={{
                    background: palette.backgroundSurface,
                    borderRadius: '1.25rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    padding: '1.5rem',
                    minHeight: '140px',
                    animation: 'pulse 1.2s ease-in-out infinite',
                  }}
                />
              ))
            : summaryCards.map(card => (
                <SummaryCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                />
              ))}
        </section>

        {data?.requestSummary.byType && (
          <section
            style={{
              background: palette.backgroundSurface,
              borderRadius: '1.25rem',
              border: `1px solid ${palette.neutralBorder}`,
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.35rem',
                fontWeight: 700,
                color: palette.textPrimary,
              }}
            >
              {tDashboard('summary.byType', language)}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
              }}
            >
              {[
                { key: 'buy' as const, labelKey: 'summary.typeBuy' as const },
                { key: 'sell' as const, labelKey: 'summary.typeSell' as const },
              ].map(({ key, labelKey }) => (
                <SummaryCard
                  key={key}
                  label={tDashboard(labelKey, language)}
                  value={data.requestSummary.byType[key] ?? 0}
                />
              ))}
            </div>
          </section>
        )}

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <article
            style={{
              background: palette.backgroundSurface,
              borderRadius: '1.25rem',
              border: `1px solid ${palette.neutralBorder}`,
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minHeight: '260px',
            }}
          >
            <header
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                }}
              >
                {tDashboard('pendingActions.title', language)}
              </h2>
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tDashboard('pendingActions.subtitle', language)}
              </span>
            </header>
            {isLoading ? (
              <div
                style={{
                  height: '100%',
                  borderRadius: '1rem',
                  background: palette.neutralBorderSoft,
                  opacity: 0.4,
                }}
              />
            ) : pendingItems.length === 0 ? (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  background: palette.backgroundAlt,
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tDashboard('pendingActions.empty', language)}
              </div>
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {pendingItems.map(item => (
                  <li
                    key={item.id}
                    style={{
                      display: 'flex',
                      flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.85rem 1rem',
                      borderRadius: '0.85rem',
                      border: `1px dashed ${palette.brandSecondarySoft}`,
                      background: palette.backgroundAlt,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        color: palette.textSecondary,
                      }}
                    >
                      <strong
                        style={{
                          color: palette.textPrimary,
                          fontSize: '0.95rem',
                        }}
                      >
                        #{item.requestNumber}
                      </strong>
                      <span style={{ fontSize: '0.85rem' }}>
                        {new Date(item.updatedAt).toLocaleString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { dateStyle: 'medium', timeStyle: 'short' }
                        )}
                      </span>
                    </div>
                    <Link
                      to="/requests"
                      style={{
                        padding: '0.55rem 1.1rem',
                        borderRadius: '999px',
                        background: palette.brandAccentDeep,
                        color: palette.textOnBrand,
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tDashboard('viewRequest', language)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article
            style={{
              background: palette.backgroundSurface,
              borderRadius: '1.25rem',
              border: `1px solid ${palette.neutralBorder}`,
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              minHeight: '260px',
            }}
          >
            <header
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                }}
              >
                {tDashboard('recentActivity.title', language)}
              </h2>
            </header>
            {isLoading ? (
              <div
                style={{
                  height: '100%',
                  borderRadius: '1rem',
                  background: palette.neutralBorderSoft,
                  opacity: 0.4,
                }}
              />
            ) : recentRequests.length === 0 ? (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  background: palette.backgroundAlt,
                  color: palette.textSecondary,
                  fontSize: '0.95rem',
                }}
              >
                {tDashboard('recentActivity.empty', language)}
              </div>
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {recentRequests.map(item => (
                  <li
                    key={item.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      padding: '0.9rem 1rem',
                      borderRadius: '0.85rem',
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      background: palette.backgroundAlt,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection:
                          direction === 'rtl' ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <strong
                        style={{
                          color: palette.textPrimary,
                          fontSize: '0.95rem',
                        }}
                      >
                        #{item.requestNumber}
                      </strong>
                      <span
                        style={{
                          color: palette.textSecondary,
                          fontSize: '0.9rem',
                        }}
                      >
                        {getStatusLabel(item.status, language)}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection:
                          direction === 'rtl' ? 'row-reverse' : 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: palette.textSecondary,
                        fontSize: '0.85rem',
                      }}
                    >
                      <span>
                        {formatCurrency(
                          item.amount,
                          item.currency,
                          language
                        )}
                      </span>
                      <span>
                        {new Date(item.createdAt).toLocaleString(
                          language === 'ar' ? 'ar-SA' : 'en-US',
                          { dateStyle: 'medium', timeStyle: 'short' }
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>

        <section
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.25rem',
            border: `1px solid ${palette.neutralBorder}`,
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              borderBottom: `1px solid ${palette.neutralBorderSoft}`,
              paddingBottom: '0.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('news')}
              style={{
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                color:
                  activeTab === 'news'
                    ? palette.brandAccentDeep
                    : palette.textSecondary,
                background:
                  activeTab === 'news'
                    ? palette.backgroundAlt
                    : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {language === 'ar' ? 'الأخبار العامة' : 'General News'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              style={{
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                color:
                  activeTab === 'projects'
                    ? palette.brandAccentDeep
                    : palette.textSecondary,
                background:
                  activeTab === 'projects'
                    ? palette.backgroundAlt
                    : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {language === 'ar' ? 'المشاريع' : 'Projects'}
            </button>
          </div>

          {activeTab === 'news' && (
            <div>
              {isNewsLoading ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`news-skeleton-${index}`}
                      style={{
                        border: `1px solid ${palette.neutralBorder}`,
                        borderRadius: '1rem',
                        padding: '1.25rem',
                        background: palette.backgroundAlt,
                        animation: 'pulse 1.6s ease-in-out infinite',
                        minHeight: '200px',
                      }}
                    />
                  ))}
                </div>
              ) : isNewsError ? (
                <div
                  style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    background: palette.backgroundAlt,
                    border: `1px dashed ${palette.brandSecondaryMuted}`,
                    textAlign: 'center',
                    color: palette.textSecondary,
                    fontSize: '0.95rem',
                  }}
                >
                  {language === 'ar'
                    ? 'تعذر تحميل الأخبار'
                    : 'Failed to load news'}
                </div>
              ) : !newsResponse || newsResponse.news.length === 0 ? (
                <div
                  style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    background: palette.backgroundAlt,
                    border: `1px dashed ${palette.brandSecondaryMuted}`,
                    textAlign: 'center',
                    color: palette.textSecondary,
                    fontSize: '0.95rem',
                  }}
                >
                  {language === 'ar'
                    ? 'لا توجد أخبار متاحة حالياً'
                    : 'No news available at the moment'}
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {newsResponse.news.slice(0, 6).map((item: InvestorNewsItem) => {
                    const coverUrl = resolveCoverUrl(item.coverKey, NEWS_IMAGES_BUCKET);
                    const publishedDate = new Date(item.publishedAt).toLocaleDateString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      { dateStyle: 'medium' }
                    );
                    return (
                      <article
                        key={item.id}
                        style={{
                          border: `1px solid ${palette.neutralBorderSoft}`,
                          borderRadius: '1rem',
                          overflow: 'hidden',
                          background: palette.backgroundAlt,
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        {coverUrl && (
                          <div
                            style={{
                              width: '100%',
                              height: '160px',
                              overflow: 'hidden',
                              background: palette.neutralBorderSoft,
                            }}
                          >
                            <OptimizedImage
                              src={coverUrl}
                              alt={item.title}
                              aspectRatio={16 / 9}
                              objectFit="cover"
                            />
                          </div>
                        )}
                        <div
                          style={{
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            flex: 1,
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                              color: palette.textPrimary,
                              lineHeight: 1.4,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {item.title}
                          </h3>
                          {item.excerpt && (
                            <p
                              style={{
                                margin: 0,
                                fontSize: '0.9rem',
                                color: palette.textSecondary,
                                lineHeight: 1.5,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {item.excerpt}
                            </p>
                          )}
                          <span
                            style={{
                              fontSize: '0.85rem',
                              color: palette.textSecondary,
                              marginTop: 'auto',
                            }}
                          >
                            {publishedDate}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              {isProjectsLoading ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`project-skeleton-${index}`}
                      style={{
                        border: `1px solid ${palette.neutralBorder}`,
                        borderRadius: '1rem',
                        padding: '1.25rem',
                        background: palette.backgroundAlt,
                        animation: 'pulse 1.6s ease-in-out infinite',
                        minHeight: '300px',
                      }}
                    />
                  ))}
                </div>
              ) : isProjectsError ? (
                <div
                  style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    background: palette.backgroundAlt,
                    border: `1px dashed ${palette.brandSecondaryMuted}`,
                    textAlign: 'center',
                    color: palette.textSecondary,
                    fontSize: '0.95rem',
                  }}
                >
                  {language === 'ar'
                    ? 'تعذر تحميل المشاريع'
                    : 'Failed to load projects'}
                </div>
              ) : !projectsResponse || projectsResponse.projects.length === 0 ? (
                <div
                  style={{
                    padding: '2rem',
                    borderRadius: '1rem',
                    background: palette.backgroundAlt,
                    border: `1px dashed ${palette.brandSecondaryMuted}`,
                    textAlign: 'center',
                    color: palette.textSecondary,
                    fontSize: '0.95rem',
                  }}
                >
                  {language === 'ar'
                    ? 'لا توجد مشاريع متاحة حالياً'
                    : 'No projects available at the moment'}
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '1.25rem',
                  }}
                >
                  {projectsResponse.projects
                    .filter((p: Project) => p.status === 'active')
                    .slice(0, 6)
                    .map((project: Project) => {
                      const projectCoverUrl = resolveCoverUrl(
                        project.coverKey,
                        PROJECT_IMAGES_BUCKET
                      );
                      const projectName =
                        language === 'ar' && project.nameAr
                          ? project.nameAr
                          : project.name;
                      const projectDescription =
                        language === 'ar' && project.descriptionAr
                          ? project.descriptionAr
                          : project.description;
                      return (
                        <Link
                          key={project.id}
                          to={`/projects/${project.id}`}
                          style={{
                            textDecoration: 'none',
                            color: 'inherit',
                          }}
                        >
                          <article
                            style={{
                              border: `1px solid ${palette.neutralBorderSoft}`,
                              borderRadius: '1rem',
                              overflow: 'hidden',
                              background: palette.backgroundAlt,
                              display: 'flex',
                              flexDirection: 'column',
                              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                          {projectCoverUrl && (
                            <div
                              style={{
                                width: '100%',
                                height: '180px',
                                overflow: 'hidden',
                                background: palette.neutralBorderSoft,
                              }}
                            >
                              <OptimizedImage
                                src={projectCoverUrl}
                                alt={projectName}
                                aspectRatio={16 / 9}
                                objectFit="cover"
                              />
                            </div>
                          )}
                          <div
                            style={{
                              padding: '1.25rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                              flex: 1,
                            }}
                          >
                            <h3
                              style={{
                                margin: 0,
                                fontSize: '1.2rem',
                                fontWeight: 700,
                                color: palette.textPrimary,
                                lineHeight: 1.4,
                              }}
                            >
                              {projectName}
                            </h3>
                            {projectDescription && (
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: '0.9rem',
                                  color: palette.textSecondary,
                                  lineHeight: 1.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {projectDescription}
                              </p>
                            )}
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: 'auto',
                                paddingTop: '0.75rem',
                                borderTop: `1px solid ${palette.neutralBorderSoft}`,
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    fontSize: '0.8rem',
                                    color: palette.textSecondary,
                                    marginBottom: '0.25rem',
                                  }}
                                >
                                  {language === 'ar' ? 'سعر السهم' : 'Share Price'}
                                </div>
                                <div
                                  style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: palette.brandAccentDeep,
                                  }}
                                >
                                  {formatCurrency(
                                    project.sharePrice,
                                    'SAR',
                                    language
                                  )}
                                </div>
                              </div>
                              <div
                                style={{
                                  textAlign: direction === 'rtl' ? 'left' : 'right',
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: '0.8rem',
                                    color: palette.textSecondary,
                                    marginBottom: '0.25rem',
                                  }}
                                >
                                  {language === 'ar' ? 'إجمالي الأسهم' : 'Total Shares'}
                                </div>
                                <div
                                  style={{
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    color: palette.textPrimary,
                                  }}
                                >
                                  {project.totalShares.toLocaleString(
                                    language === 'ar' ? 'ar-SA' : 'en-US'
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </section>

        {isError && (
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '0.85rem',
              background: '#FEF3C7',
              border: '1px solid #F59E0B',
              color: '#92400E',
              display: 'flex',
              flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <span>
              {language === 'ar'
                ? 'حدث خطأ أثناء تحديث لوحة المتابعة.'
                : 'Something went wrong while refreshing the dashboard.'}
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              style={{
                border: 'none',
                background: palette.brandAccentDeep,
                color: palette.textOnBrand,
                borderRadius: '999px',
                padding: '0.5rem 1.1rem',
                cursor: isFetching ? 'progress' : 'pointer',
                fontWeight: 600,
              }}
            >
              {isFetching
                ? language === 'ar'
                  ? 'جارٍ التحديث…'
                  : 'Refreshing…'
                : language === 'ar'
                  ? 'إعادة المحاولة'
                  : 'Try again'}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

export function InvestorDashboardPage() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <InvestorDashboardPageInner />
          <ToastStack />
        </QueryClientProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}


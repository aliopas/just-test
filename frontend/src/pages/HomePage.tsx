import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { palette } from '../styles/theme';
import { Logo } from '../components/Logo';
import { useInvestorNewsList } from '../hooks/useInvestorNews';
import { usePublicProjects } from '../hooks/usePublicProjects';
import { resolveCoverUrl, NEWS_IMAGES_BUCKET, PROJECT_IMAGES_BUCKET } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';
import type { InvestorNewsItem } from '../types/news';
import type { Project } from '../hooks/useAdminProjects';
import type { InvestorLanguage } from '../types/investor';

const PAGE_LIMIT = 12;

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

export function HomePage() {
  const { direction, language } = useLanguage();
  const [page, setPage] = useState(1);
  const [allNews, setAllNews] = useState<InvestorNewsItem[]>([]);
  const [activeTab, setActiveTab] = useState<'news' | 'projects'>('news');

  const {
    data: newsResponse,
    isLoading: isNewsLoading,
    isError: isNewsError,
    isFetching: isNewsFetching,
  } = useInvestorNewsList({ page, limit: PAGE_LIMIT });

  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = usePublicProjects();

  const {
    data: dashboardNewsResponse,
    isLoading: isDashboardNewsLoading,
    isError: isDashboardNewsError,
  } = useInvestorNewsList({ page: 1, limit: 6 });

  useEffect(() => {
    if (!newsResponse) {
      return;
    }

    setAllNews((prev: InvestorNewsItem[]) => {
      if (page === 1) {
        return newsResponse.news;
      }

      const existing = new Set(prev.map((item: InvestorNewsItem) => item.id));
      const merged = [...prev];
      newsResponse.news.forEach((item: InvestorNewsItem) => {
        if (!existing.has(item.id)) {
          merged.push(item);
        }
      });
      return merged;
    });
  }, [newsResponse, page]);

  const latestNews = useMemo(
    () => allNews,
    [allNews]
  );

  const hasMore = newsResponse?.meta.hasNext ?? false;

  const renderNewsCards = () => {
    if (isNewsLoading && latestNews.length === 0) {
      return Array.from({ length: 6 }).map((_, index) => (
        <article
          key={`news-skeleton-${index}`}
          style={{
            border: `1px solid ${palette.neutralBorder}`,
            borderRadius: '1.25rem',
            padding: '1.5rem',
            background: palette.backgroundSurface,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.9rem',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              height: '0.85rem',
              width: '60%',
              background: `${palette.neutralBorder}66`,
              borderRadius: '999px',
            }}
          />
          <div
            style={{
              height: '1.1rem',
              width: '80%',
              background: `${palette.neutralBorder}66`,
              borderRadius: '0.75rem',
            }}
          />
          <div
            style={{
              height: '3.2rem',
              width: '100%',
              background: `${palette.neutralBorder}44`,
              borderRadius: '0.75rem',
            }}
          />
          <div
            style={{
              height: '0.9rem',
              width: '40%',
              background: `${palette.neutralBorder}66`,
              borderRadius: '0.75rem',
              marginTop: 'auto',
            }}
          />
        </article>
      ));
    }

    if (isNewsError) {
      return (
        <div
          style={{
            padding: '2rem',
            borderRadius: '1.25rem',
            background: palette.backgroundBase,
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          {language === 'ar'
            ? 'تعذر تحميل الأخبار الآن. نعمل على إصلاح المشكلة، حاول مرة أخرى لاحقاً.'
            : 'We could not load the latest news right now. Please try again shortly.'}
        </div>
      );
    }

    if (latestNews.length === 0) {
      return (
        <div
          style={{
            padding: '2rem',
            borderRadius: '1.25rem',
            background: palette.backgroundBase,
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '0.95rem',
            lineHeight: 1.6,
          }}
        >
          {language === 'ar'
            ? 'لم يتم نشر أخبار جديدة بعد. تابعنا لتتعرف على أحدث التحديثات من فريق باكورة.'
            : 'No news have been published yet. Check back soon for the latest updates from the Bakurah team.'}
        </div>
      );
    }

    return latestNews.map((item: InvestorNewsItem) => {
      const coverUrl = resolveCoverUrl(item.coverKey, NEWS_IMAGES_BUCKET);
      const publishedLabel = new Date(item.publishedAt).toLocaleDateString(
        language === 'ar' ? 'ar-SA' : 'en-GB',
        { month: 'short', day: 'numeric' }
      );
      const excerpt =
        item.excerpt ??
        (language === 'ar'
          ? 'تفاصيل هذا الخبر متاحة في مركز الأخبار للتعمق في ما يقدمه فريق باكورة.'
          : 'Visit the news center for the full story and additional context from the Bakurah team.');

      return (
        <article
          key={item.id}
          style={{
            border: `1px solid ${palette.neutralBorder}`,
            borderRadius: '1.25rem',
            overflow: 'hidden',
            background: palette.backgroundSurface,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 22px 48px rgba(4, 38, 63, 0.12)',
          }}
        >
            <div style={{ position: 'relative' }}>
              <OptimizedImage
                src={coverUrl}
                alt={item.title}
                aspectRatio={16 / 9}
                fallbackText={language === 'ar' ? 'لا توجد صورة مرفقة' : 'No cover image'}
                objectFit="cover"
              />
              <span
                style={{
                  position: 'absolute',
                  top: '1rem',
                  left: direction === 'rtl' ? undefined : '1rem',
                  right: direction === 'rtl' ? '1rem' : undefined,
                  padding: '0.35rem 0.75rem',
                  borderRadius: '999px',
                  background: `${palette.backgroundSurface}E6`,
                  color: palette.brandPrimaryStrong,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  zIndex: 1,
                }}
              >
                {language === 'ar' ? 'خبر باكورة' : 'Bakurah News'}
              </span>
            </div>

          <div
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              flexGrow: 1,
            }}
          >
            <time
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
              }}
            >
              {publishedLabel}
            </time>
            <h4
              style={{
                margin: 0,
                fontSize: '1.25rem',
                color: palette.textPrimary,
                lineHeight: 1.4,
              }}
            >
              {item.title}
            </h4>
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.6,
                flexGrow: 1,
              }}
            >
              {excerpt}
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 'auto',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  color: palette.brandAccentDeep,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                }}
              >
                {language === 'ar'
                  ? 'اقرأ المزيد داخل مركز الأخبار'
                  : 'Read the full story in the news hub'}
              </span>
              <Link
                to={`/news/${item.id}`}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '0.75rem',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  textDecoration: 'none',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {language === 'ar' ? 'عرض التفاصيل' : 'View details'}
              </Link>
            </div>
          </div>
        </article>
      );
    });
  };

  return (
    <div
      style={{
        direction,
        minHeight: 'calc(100vh - 180px)',
        padding: '3rem 1.5rem 4rem',
        background: palette.backgroundBase,
      }}
    >
      <section
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.5rem',
        }}
      >
        {/* القسم الجديد: الأخبار العامة والمشاريع */}
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
              {isDashboardNewsLoading ? (
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
              ) : isDashboardNewsError ? (
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
              ) : !dashboardNewsResponse || dashboardNewsResponse.news.length === 0 ? (
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
                  {dashboardNewsResponse.news.slice(0, 6).map((item: InvestorNewsItem) => {
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
                        <article
                          key={project.id}
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
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </section>

        <header
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 420px)',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem',
            }}
          >
            <Logo size={120} stacked tagline={language === 'ar' ? 'بوابتك للاستثمار الذكي' : 'Your gateway to smart investing'} />
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '2.4rem',
                  color: palette.textPrimary,
                  lineHeight: 1.1,
                }}
              >
                {language === 'ar'
                  ? 'مرحباً بك في باكورة للاستثمار'
                  : 'Welcome to Bakurah Investors Portal'}
              </h2>
              <p
                style={{
                  marginTop: '1rem',
                  fontSize: '1.05rem',
                  color: palette.textSecondary,
                  lineHeight: 1.6,
                }}
              >
                {language === 'ar'
                  ? 'تابع آخر أخبار السوق ومبادرات باكورة، وابدأ رحلة طلبك الاستثماري بخطوات واضحة وسلسة.'
                  : 'Stay on top of market headlines and Bakurah initiatives, and launch your investment requests with a clear, guided journey.'}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  marginTop: '1.75rem',
                }}
              >
                <Link
                  to="/requests/new"
                  style={{
                    padding: '0.85rem 2rem',
                    background: palette.brandPrimaryStrong,
                    color: palette.textOnBrand,
                    borderRadius: '0.85rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {language === 'ar' ? 'ابدأ طلباً جديداً' : 'Start a new request'}
                </Link>
                <Link
                  to="/profile"
                  style={{
                    padding: '0.85rem 2rem',
                    background: palette.backgroundSurface,
                    color: palette.brandAccentDeep,
                    borderRadius: '0.85rem',
                    border: `1px solid ${palette.brandSecondarySoft}`,
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  {language === 'ar' ? 'عرض الملف الاستثماري' : 'View investor profile'}
                </Link>
              </div>
            </div>
          </div>
          <div
            style={{
              background: `linear-gradient(135deg, ${palette.backgroundInverse} 0%, ${palette.brandPrimary} 100%)`,
              borderRadius: '1.5rem',
              color: palette.textOnInverse,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              boxShadow: '0 24px 60px rgba(4, 44, 84, 0.25)',
            }}
          >
            <span
              style={{
                fontSize: '0.85rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: `${palette.textOnInverse}B3`,
              }}
            >
              {language === 'ar' ? 'مستجدات باكورة' : 'Bakurah Pulse'}
            </span>
            <strong style={{ fontSize: '1.4rem', lineHeight: 1.4 }}>
              {language === 'ar'
                ? 'تجربة موحدة لإدارة المستثمرين، مع إشعارات مباشرة وركائز أمان مدعومة بسوبابيس.'
                : 'A unified investor journey with real-time updates and secure Supabase foundations.'}
            </strong>
            <p
              style={{
                margin: 0,
                color: `${palette.textOnInverse}B3`,
                lineHeight: 1.6,
              }}
            >
              {language === 'ar'
                ? 'استفد من مركز التوعية لتجد مقالات مختارة حول الفرص واللوائح المالية في المملكة.'
                : 'Explore curated guidance on opportunities and regulatory movements shaping the Kingdom’s financial landscape.'}
            </p>
          </div>
        </header>

        <section
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1.5rem',
            border: `1px solid ${palette.neutralBorder}`,
            padding: '2rem',
            boxShadow: '0 24px 60px rgba(4, 44, 84, 0.08)',
          }}
        >
          <header
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.6rem',
                  color: palette.textPrimary,
                }}
              >
                {language === 'ar' ? 'آخر الأخبار' : 'Latest updates'}
              </h3>
              <p style={{ margin: '0.4rem 0 0', color: palette.textSecondary }}>
                {language === 'ar'
                  ? 'اطّلع على أبرز أخبار السوق والتقنية والصفقات.'
                  : 'A snapshot of market, technology, and deal-flow highlights.'}
              </p>
            </div>
            <Link
              to="/requests/new"
              style={{
                padding: '0.6rem 1.4rem',
                borderRadius: '0.75rem',
                border: `1px solid ${palette.brandSecondaryMuted}`,
                color: palette.textPrimary,
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'انتقل لنموذج الطلب' : 'Go to request form'}
            </Link>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {renderNewsCards()}
          </div>
          
          {hasMore && (
            <div
              style={{
                marginTop: '2.5rem',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                type="button"
                onClick={() => setPage((current: number) => current + 1)}
                disabled={isNewsFetching}
                style={{
                  border: 'none',
                  borderRadius: '999px',
                  padding: '0.85rem 2.4rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  boxShadow: '0 18px 35px rgba(44, 116, 204, 0.25)',
                  cursor: isNewsFetching ? 'not-allowed' : 'pointer',
                  opacity: isNewsFetching ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {isNewsFetching
                  ? language === 'ar' ? 'جارٍ التحميل…' : 'Loading…'
                  : language === 'ar' ? 'تحميل المزيد من الأخبار' : 'Load more news'}
              </button>
            </div>
          )}
          
          {isNewsFetching && !isNewsLoading && latestNews.length > 0 && !hasMore ? (
            <div
              style={{
                marginTop: '1.5rem',
                fontSize: '0.85rem',
                color: palette.textSecondary,
                textAlign: 'center',
              }}
            >
              {language === 'ar' ? 'جارٍ تحديث آخر الأخبار…' : 'Refreshing the latest stories…'}
            </div>
          ) : null}
        </section>
      </section>
    </div>
  );
}



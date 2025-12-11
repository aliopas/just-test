import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorDashboardDirect } from '../hooks/useInvestorDashboardDirect';
import { useNews } from '../hooks/useSupabaseTables';
import type { DashboardRecentRequest, DashboardRequestSummary } from '../types/dashboard';
import type { RequestStatus } from '../types/request';

export function InvestorDashboardPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const { data, isLoading, isError, refetch } = useInvestorDashboardDirect();
  const [mounted, setMounted] = useState(false);
  
  // Fetch internal news with full content directly from Supabase
  const { data: newsData, isLoading: isLoadingNews } = useNews({
    page: 1,
    limit: 3, // Show only latest 3 news items for better display
    audience: 'investor_internal',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const summary: DashboardRequestSummary | undefined = data?.requestSummary;
  const recent = data?.recentRequests ?? [];
  const pendingItems = data?.pendingActions.items ?? [];
  const news = newsData ?? [];
  const insights = data?.insights;

  // Helper function to create excerpt from markdown
  const createExcerpt = (bodyMd: string, maxLength: number = 200): string => {
    const plainText = bodyMd
      .replace(/^#+\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove code
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    if (plainText.length <= maxLength) {
      return plainText;
    }

    return plainText.substring(0, maxLength).trim() + '...';
  };

  const statusOrder: RequestStatus[] = [
    'submitted',
    'screening',
    'pending_info',
    'compliance_review',
    'approved',
    'rejected',
    'settling',
    'completed',
  ];

  const formatCurrency = (amount: number, currency: string) =>
    new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(isArabic ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US').format(value);

  // Calculate statistics
  const underReviewCount = (summary?.byStatus.submitted ?? 0) +
    (summary?.byStatus.screening ?? 0) +
    (summary?.byStatus.pending_info ?? 0) +
    (summary?.byStatus.compliance_review ?? 0);

  const approvedCompletedCount = (summary?.byStatus.approved ?? 0) +
    (summary?.byStatus.completed ?? 0);

  // Show loading skeleton
  if (!mounted || isLoading) {
    return <DashboardSkeleton isArabic={isArabic} direction={direction} />;
  }

  // Show error state
  if (isError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: palette.backgroundSurface,
          direction,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: palette.backgroundBase,
            borderRadius: radius.lg,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
            maxWidth: '500px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1rem',
              borderRadius: '50%',
              background: '#FEF2F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="#EF4444" strokeWidth="2" />
              <path d="M12 8V12M12 16H12.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2
            style={{
              margin: 0,
              marginBottom: '0.5rem',
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {isArabic ? 'خطأ في تحميل البيانات' : 'Error loading data'}
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: '1.5rem',
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {isArabic
              ? 'حدث خطأ أثناء تحميل لوحة التحكم. يرجى المحاولة مرة أخرى.'
              : 'An error occurred while loading the dashboard. Please try again.'}
          </p>
          <button
            onClick={() => refetch()}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: radius.md,
              border: 'none',
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: typography.weights.semibold,
              fontSize: typography.sizes.body,
              cursor: 'pointer',
            }}
          >
            {isArabic ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 'clamp(1rem, 4vw, 2rem)',
        background: palette.backgroundSurface,
        direction,
        animation: mounted ? 'fadeIn 0.3s ease-in' : 'none',
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            animation: 'slideUp 0.4s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                  fontWeight: typography.weights.bold,
                  color: palette.textPrimary,
                  marginBottom: '0.5rem',
                }}
              >
                {isArabic ? 'لوحة تحكم المستثمر' : 'Investor Dashboard'}
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: typography.sizes.body,
                  color: palette.textSecondary,
                }}
              >
                {isArabic
                  ? 'تابع طلباتك، حالتها، التنبيهات، وآخر الأنشطة المالية في باكورة.'
                  : 'Track your requests, their status, alerts, and recent financial activity in Bakura.'}
              </p>
            </div>
            {insights?.rolling30DayVolume !== undefined && (
              <div
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: radius.lg,
                  background: `linear-gradient(135deg, ${palette.brandPrimary}15 0%, ${palette.brandPrimaryStrong}25 100%)`,
                  border: `2px solid ${palette.brandPrimaryStrong}30`,
                  textAlign: 'center',
                  minWidth: 'min(100%, 200px)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: palette.textSecondary,
                    marginBottom: '0.25rem',
                  }}
                >
                  {isArabic ? 'حجم الطلبات (30 يوم)' : '30-Day Volume'}
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: typography.weights.bold,
                    color: palette.brandPrimaryStrong,
                  }}
                >
                  {formatCurrency(insights.rolling30DayVolume, 'SAR')}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Top actions / state */}
        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundBase,
                color: palette.textSecondary,
                fontSize: '0.9rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {'\u21BB '}
              {isArabic ? 'تحديث البيانات' : 'Refresh Data'}
            </button>
          </div>

          {data && (
            <div
              style={{
                padding: '0.6rem 1rem',
                borderRadius: radius.lg,
                background: palette.backgroundBase,
                border: `1px solid ${palette.neutralBorderMuted}`,
                fontSize: '0.85rem',
                color: palette.textSecondary,
              }}
            >
              {isArabic
                ? `آخر تحديث: ${formatDateTime(data.generatedAt)}`
                : `Last updated: ${formatDateTime(data.generatedAt)}`}
            </div>
          )}
        </section>

        {/* Summary cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
            gap: '1.25rem',
            animation: 'slideUp 0.5s ease-out',
          }}
        >
          <SummaryCard
            title={isArabic ? 'إجمالي الطلبات' : 'Total Requests'}
            value={summary?.total ?? 0}
            highlight
            icon="📊"
            trend={summary?.total ? undefined : undefined}
          />

          <SummaryCard
            title={isArabic ? 'قيد المراجعة' : 'Under Review'}
            value={underReviewCount}
            icon="⏳"
            color={palette.brandSecondary}
          />

          <SummaryCard
            title={isArabic ? 'معتمدة / مكتملة' : 'Approved / Completed'}
            value={approvedCompletedCount}
            icon="✅"
            color="#10B981"
          />

          <SummaryCard
            title={isArabic ? 'تنبيهات غير مقروءة' : 'Unread Alerts'}
            value={data?.unreadNotifications ?? 0}
            icon="🔔"
            color={data?.unreadNotifications ? '#F59E0B' : palette.textSecondary}
            badge={data?.unreadNotifications ? data.unreadNotifications : undefined}
          />
        </section>

        {/* Status distribution */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: '1rem',
              fontWeight: typography.weights.semibold,
              color: palette.textPrimary,
            }}
          >
            {isArabic ? 'توزيع الطلبات حسب الحالة' : 'Requests by Status'}
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {statusOrder.map(statusKey => {
              const count = summary?.byStatus[statusKey] ?? 0;
              const label =
                statusKey === 'submitted'
                  ? isArabic
                    ? 'تم الإرسال'
                    : 'Submitted'
                  : statusKey === 'screening'
                    ? isArabic
                      ? 'فرز أولي'
                      : 'Screening'
                    : statusKey === 'pending_info'
                      ? isArabic
                        ? 'بانتظار معلومات'
                        : 'Pending info'
                      : statusKey === 'compliance_review'
                        ? isArabic
                          ? 'مراجعة التوافق'
                          : 'Compliance review'
                        : statusKey === 'approved'
                          ? isArabic
                            ? 'معتمدة'
                            : 'Approved'
                          : statusKey === 'rejected'
                            ? isArabic
                              ? 'مرفوضة'
                              : 'Rejected'
                            : statusKey === 'settling'
                              ? isArabic
                                ? 'قيد التسوية'
                                : 'Settling'
                              : isArabic
                                ? 'مكتملة'
                                : 'Completed';

              return (
                <span
                  key={statusKey}
                  style={{
                    padding: '0.45rem 0.85rem',
                    borderRadius: '999px',
                    border: `1px solid ${palette.neutralBorderMuted}`,
                    background: palette.backgroundSurface,
                    fontSize: '0.85rem',
                    color: palette.textSecondary,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <strong
                    style={{
                      fontSize: '0.9rem',
                      color: palette.textPrimary,
                    }}
                  >
                    {count}
                  </strong>
                  <span>{label}</span>
                </span>
              );
            })}
          </div>
        </section>

        {/* Recent requests + pending actions */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
            gap: '1.5rem',
            animation: 'slideUp 0.6s ease-out',
          }}
        >
          {/* Recent requests */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: typography.weights.semibold,
                  color: palette.textPrimary,
                }}
              >
                {isArabic ? 'آخر الطلبات' : 'Recent Requests'}
              </h2>
              <a
                href="/my-requests"
                style={{
                  fontSize: '0.85rem',
                  color: palette.brandPrimaryStrong,
                  textDecoration: 'none',
                  fontWeight: 500,
                }}
              >
                {isArabic ? 'عرض الكل →' : 'View All →'}
              </a>
            </div>

            {recent.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  padding: '1rem 0.25rem',
                  fontSize: '0.9rem',
                  color: palette.textSecondary,
                }}
              >
                {isArabic
                  ? 'لا توجد طلبات حديثة.'
                  : 'No recent requests.'}
              </p>
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                {recent.map(item => (
                  <RecentRequestItem
                    key={item.id}
                    item={item}
                    language={language}
                    formatCurrency={formatCurrency}
                    formatDateTime={formatDateTime}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Pending actions */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {isArabic ? 'إجراءات مطلوبة' : 'Pending Actions'}
              {pendingItems.length > 0 && (
                <span
                  style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '999px',
                    background: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '0.75rem',
                    fontWeight: typography.weights.bold,
                  }}
                >
                  {pendingItems.length}
                </span>
              )}
            </h2>
            {pendingItems.length === 0 ? (
              <p
                style={{
                  margin: 0,
                  padding: '0.5rem 0',
                  fontSize: '0.9rem',
                  color: palette.textSecondary,
                }}
              >
                {isArabic
                  ? 'لا توجد عناصر تتطلب إجراء حالياً.'
                  : 'No items require your action at the moment.'}
              </p>
            ) : (
              <ul
                style={{
                  listStyle: 'none',
                  margin: 0,
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {pendingItems.map(item => (
                  <li
                    key={item.id}
                    style={{
                      borderRadius: radius.md,
                      border: `1px solid ${palette.neutralBorderMuted}`,
                      padding: '0.6rem 0.75rem',
                      background: palette.backgroundHighlight,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.9rem',
                        color: palette.textPrimary,
                        fontWeight: 600,
                      }}
                    >
                      {isArabic ? 'طلب' : 'Request'} #{item.requestNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: palette.textSecondary,
                      }}
                    >
                      {isArabic
                        ? `آخر تحديث: ${formatDateTime(item.updatedAt)}`
                        : `Last updated: ${formatDateTime(item.updatedAt)}`}
                    </span>
                    <a
                      href={`/requests/${item.id}`}
                      style={{
                        fontSize: '0.8rem',
                        color: palette.brandPrimaryStrong,
                        textDecoration: 'none',
                        fontWeight: 500,
                      }}
                    >
                      {isArabic ? 'فتح التفاصيل →' : 'View Details →'}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Internal News Section */}
        <section
          style={{
            padding: '1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
            animation: 'slideUp 0.7s ease-out',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: typography.weights.bold,
                color: palette.textPrimary,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>📰</span>
              {isArabic ? 'آخر الأخبار الداخلية' : 'Latest Internal News'}
            </h2>
            <a
              href="/internal-news"
              style={{
                fontSize: '0.875rem',
                color: palette.brandPrimaryStrong,
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = palette.brandPrimary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = palette.brandPrimaryStrong;
              }}
            >
              {isArabic ? 'عرض الكل →' : 'View All →'}
            </a>
          </div>

          {isLoadingNews ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  style={{
                    padding: '1.5rem',
                    borderRadius: radius.md,
                    background: palette.backgroundSurface,
                    border: `1px solid ${palette.neutralBorderMuted}`,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                >
                  <div
                    style={{
                      width: '60%',
                      height: '20px',
                      background: palette.neutralBorderMuted,
                      borderRadius: radius.md,
                      marginBottom: '0.75rem',
                    }}
                  />
                  <div
                    style={{
                      width: '100%',
                      height: '16px',
                      background: palette.neutralBorderMuted,
                      borderRadius: radius.md,
                      marginBottom: '0.5rem',
                    }}
                  />
                  <div
                    style={{
                      width: '80%',
                      height: '16px',
                      background: palette.neutralBorderMuted,
                      borderRadius: radius.md,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div
              style={{
                padding: '3rem 1rem',
                textAlign: 'center',
                color: palette.textSecondary,
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ margin: 0, fontSize: '1rem' }}>
                {isArabic
                  ? 'لا توجد أخبار داخلية حالياً.'
                  : 'No internal news at the moment.'}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {news.map((item, index) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  isArabic={isArabic}
                  formatDateTime={formatDateTime}
                  createExcerpt={createExcerpt}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Loading Skeleton Component
function DashboardSkeleton({ isArabic, direction }: { isArabic: boolean; direction: 'ltr' | 'rtl' }) {
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
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Header Skeleton */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                width: '300px',
                height: '32px',
                background: palette.neutralBorderMuted,
                borderRadius: radius.md,
                marginBottom: '0.5rem',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '500px',
                height: '20px',
                background: palette.neutralBorderMuted,
                borderRadius: radius.md,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          </div>
          <div
            style={{
              width: '200px',
              height: '80px',
              background: palette.neutralBorderMuted,
              borderRadius: radius.lg,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </div>

        {/* Cards Skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {[1, 2, 3, 4].map(i => (
            <div
              key={i}
              style={{
                padding: '1.5rem',
                borderRadius: radius.lg,
                background: palette.backgroundBase,
                border: `1px solid ${palette.neutralBorderMuted}`,
                minHeight: '120px',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <div
                style={{
                  width: '60%',
                  height: '16px',
                  background: palette.neutralBorderMuted,
                  borderRadius: radius.md,
                  marginBottom: '1rem',
                }}
              />
              <div
                style={{
                  width: '40%',
                  height: '32px',
                  background: palette.neutralBorderMuted,
                  borderRadius: radius.md,
                }}
              />
            </div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[1, 2].map(i => (
            <div
              key={i}
              style={{
                padding: '1.5rem',
                borderRadius: radius.lg,
                background: palette.backgroundBase,
                border: `1px solid ${palette.neutralBorderMuted}`,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <div
                style={{
                  width: '40%',
                  height: '20px',
                  background: palette.neutralBorderMuted,
                  borderRadius: radius.md,
                  marginBottom: '1rem',
                }}
              />
              {[1, 2, 3].map(j => (
                <div
                  key={j}
                  style={{
                    height: '60px',
                    background: palette.neutralBorderMuted,
                    borderRadius: radius.md,
                    marginBottom: '0.75rem',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  highlight?: boolean;
  icon?: string;
  color?: string;
  trend?: number;
  badge?: number;
}

function SummaryCard({ title, value, highlight, icon, color, badge }: SummaryCardProps) {
  const cardColor = color || (highlight ? palette.brandPrimaryStrong : palette.textPrimary);
  
  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: radius.lg,
        background: palette.backgroundBase,
        boxShadow: highlight ? shadow.medium : shadow.subtle,
        border: `2px solid ${highlight ? palette.brandPrimaryStrong : palette.neutralBorderMuted}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        minHeight: '120px',
        position: 'relative',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = shadow.medium;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = highlight ? shadow.medium : shadow.subtle;
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: '1.5rem',
            marginBottom: '0.25rem',
          }}
        >
          {icon}
        </div>
      )}
      <span
        style={{
          fontSize: '0.875rem',
          color: palette.textSecondary,
          fontWeight: typography.weights.medium,
        }}
      >
        {title}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '0.5rem',
        }}
      >
        <strong
          style={{
            fontSize: '2rem',
            color: cardColor,
            fontWeight: typography.weights.bold,
            lineHeight: 1,
          }}
        >
          {value.toLocaleString()}
        </strong>
        {badge !== undefined && badge > 0 && (
          <span
            style={{
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              background: '#FEF2F2',
              color: '#DC2626',
              fontSize: '0.75rem',
              fontWeight: typography.weights.bold,
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

interface RecentItemProps {
  item: DashboardRecentRequest;
  language: string;
  formatCurrency: (amount: number, currency: string) => string;
  formatDateTime: (value: string) => string;
}

function RecentRequestItem({
  item,
  language,
  formatCurrency,
  formatDateTime,
}: RecentItemProps) {
  const isArabic = language === 'ar';
  const typeLabel =
    item.type === 'buy'
      ? (isArabic ? 'شراء أسهم' : 'Buy shares')
      : item.type === 'sell'
        ? (isArabic ? 'بيع أسهم' : 'Sell shares')
        : item.type === 'partnership'
          ? (isArabic ? 'شراكة' : 'Partnership')
          : item.type === 'board_nomination'
            ? (isArabic ? 'ترشيح مجلس الإدارة' : 'Board nomination')
            : (isArabic ? 'ملاحظات / استفسار' : 'Feedback / inquiry');

  const statusColor =
    item.status === 'approved' || item.status === 'completed'
      ? '#16A34A'
      : item.status === 'rejected'
        ? '#DC2626'
        : item.status === 'submitted' ||
          item.status === 'screening' ||
          item.status === 'pending_info' ||
          item.status === 'compliance_review' ||
          item.status === 'settling'
          ? '#F59E0B'
          : '#6B7280';

  const statusLabel =
    item.status === 'draft'
      ? (isArabic ? 'مسودة' : 'Draft')
      : item.status === 'submitted'
        ? (isArabic ? 'تم الإرسال' : 'Submitted')
        : item.status === 'screening'
          ? (isArabic ? 'فرز أولي' : 'Screening')
          : item.status === 'pending_info'
            ? (isArabic ? 'بانتظار معلومات' : 'Pending info')
            : item.status === 'compliance_review'
              ? (isArabic ? 'مراجعة التوافق' : 'Compliance review')
              : item.status === 'approved'
                ? (isArabic ? 'معتمد' : 'Approved')
                : item.status === 'rejected'
                  ? (isArabic ? 'مرفوض' : 'Rejected')
                  : item.status === 'settling'
                    ? (isArabic ? 'قيد التسوية' : 'Settling')
                    : (isArabic ? 'مكتمل' : 'Completed');

  return (
    <li
      style={{
        borderRadius: radius.md,
        border: `1px solid ${palette.neutralBorderMuted}`,
        padding: '0.75rem 0.9rem',
        background: palette.backgroundBase,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.2rem',
          }}
        >
          <span
            style={{
              fontSize: '0.9rem',
              color: palette.textPrimary,
              fontWeight: 600,
            }}
          >
            {isArabic ? 'طلب' : 'Request'} #{item.requestNumber}
          </span>
          <span
            style={{
              fontSize: '0.8rem',
              color: palette.textSecondary,
            }}
          >
            {typeLabel}
          </span>
        </div>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: palette.textPrimary,
          }}
        >
          {formatCurrency(item.amount, item.currency)}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '0.1rem',
        }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            color: palette.textSecondary,
          }}
        >
          {formatDateTime(item.createdAt)}
        </span>
        <span
          style={{
            fontSize: '0.8rem',
            padding: '0.25rem 0.7rem',
            borderRadius: '999px',
            background: '#F9FAFB',
            border: `1px solid ${statusColor}40`,
            color: statusColor,
            fontWeight: 600,
          }}
        >
          {statusLabel}
        </span>
      </div>
    </li>
  );
}

interface NewsCardProps {
  item: {
    id: string;
    title: string;
    body_md: string;
    published_at: string | null;
    created_at: string;
  };
  isArabic: boolean;
  formatDateTime: (value: string) => string;
  createExcerpt: (bodyMd: string, maxLength?: number) => string;
  index: number;
}

function NewsCard({ item, isArabic, formatDateTime, createExcerpt, index }: NewsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const excerpt = createExcerpt(item.body_md, 250);
  const fullContent = item.body_md;
  const publishedDate = item.published_at || item.created_at;
  const showExpandButton = fullContent.length > 250;

  return (
    <article
      style={{
        borderRadius: radius.lg,
        border: `2px solid ${palette.neutralBorderMuted}`,
        padding: '1.5rem',
        background: palette.backgroundBase,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'all 0.3s ease',
        animation: `slideUp 0.${5 + index}s ease-out`,
        boxShadow: shadow.subtle,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.brandPrimaryStrong;
        e.currentTarget.style.boxShadow = shadow.medium;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.neutralBorderMuted;
        e.currentTarget.style.boxShadow = shadow.subtle;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
        }}
      >
        <div style={{ flex: 1 }}>
          <h3
            style={{
              margin: 0,
              marginBottom: '0.5rem',
              fontSize: '1.125rem',
              color: palette.textPrimary,
              fontWeight: typography.weights.bold,
              lineHeight: 1.4,
            }}
          >
            {item.title}
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.8rem',
              color: palette.textSecondary,
            }}
          >
            <span>📅</span>
            <span>{formatDateTime(publishedDate)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          fontSize: '0.95rem',
          color: palette.textPrimary,
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {isExpanded ? (
          <div
            style={{
              maxHeight: 'none',
              overflow: 'visible',
            }}
          >
            {fullContent.split('\n').map((line, i) => {
              // Simple markdown rendering
              if (line.startsWith('#')) {
                const level = line.match(/^#+/)?.[0].length || 1;
                const text = line.replace(/^#+\s+/, '');
                return (
                  <div
                    key={i}
                    style={{
                      fontSize: level === 1 ? '1.1rem' : level === 2 ? '1rem' : '0.95rem',
                      fontWeight: typography.weights.bold,
                      marginTop: i > 0 ? '1rem' : 0,
                      marginBottom: '0.5rem',
                      color: palette.textPrimary,
                    }}
                  >
                    {text}
                  </div>
                );
              }
              if (line.trim() === '') {
                return <br key={i} />;
              }
              // Handle bold text
              const processedLine = line
                .replace(/\*\*(.*?)\*\*/g, `<strong style="font-weight: ${typography.weights.bold}">$1</strong>`)
                .replace(/\*(.*?)\*/g, `<em style="font-style: italic">$1</em>`);
              
              return (
                <p
                  key={i}
                  style={{ margin: '0.5rem 0' }}
                  dangerouslySetInnerHTML={{ __html: processedLine }}
                />
              );
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: palette.textSecondary }}>
            {excerpt}
          </p>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '0.5rem',
          borderTop: `1px solid ${palette.neutralBorderSoft}`,
        }}
      >
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: radius.md,
            border: `1px solid ${palette.brandPrimaryStrong}`,
            background: 'transparent',
            color: palette.brandPrimaryStrong,
            fontSize: '0.875rem',
            fontWeight: typography.weights.semibold,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${palette.brandPrimaryStrong}10`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          {isExpanded
            ? isArabic
              ? 'عرض أقل'
              : 'Show Less'
            : isArabic
              ? 'قراءة المزيد'
              : 'Read More'}
        </button>
        <a
          href={`/internal-news/${item.id}`}
          style={{
            fontSize: '0.875rem',
            color: palette.brandPrimaryStrong,
            textDecoration: 'none',
            fontWeight: typography.weights.semibold,
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = palette.brandPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = palette.brandPrimaryStrong;
          }}
        >
          {isArabic ? 'فتح التفاصيل الكاملة →' : 'Open Full Article →'}
        </a>
      </div>
    </article>
  );
}


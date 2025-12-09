import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorDashboardDirect } from '../hooks/useInvestorDashboardDirect';
import { useNextNavigate } from '../utils/next-router';
import { useIsMobile } from '../hooks/useMediaQuery';

export function HomePage() {
  const { language, direction } = useLanguage();
  const navigate = useNextNavigate();
  const { data: dashboardData, isLoading } = useInvestorDashboardDirect();
  const isMobile = useIsMobile();

  const quickActions = [
    {
      title: language === 'ar' ? 'إنشاء طلب جديد' : 'New request',
      description:
        language === 'ar'
          ? 'قدّم طلب شراء أو بيع أو شراكة'
          : 'Submit a buy, sell, or partnership request',
      icon: '➕',
      path: '/requests/new',
      color: palette.brandPrimary,
    },
    {
      title: language === 'ar' ? 'طلباتي' : 'My requests',
      description:
        language === 'ar'
          ? 'تابع جميع طلباتك الاستثمارية'
          : 'Track all your investment requests',
      icon: '📋',
      path: '/requests',
      color: palette.brandSecondary,
    },
    {
      title: language === 'ar' ? 'الأخبار' : 'News',
      description:
        language === 'ar'
          ? 'اطّلع على آخر الأخبار والإعلانات'
          : 'Stay updated with latest news and announcements',
      icon: '📰',
      path: '/news',
      color: palette.success,
    },
    {
      title: language === 'ar' ? 'التحديثات الداخلية' : 'Internal updates',
      description:
        language === 'ar'
          ? 'رسائل ومرفقات خاصة بالمستثمرين'
          : 'Private investor communications and resources',
      icon: '🔒',
      path: '/internal-news',
      color: palette.warning,
    },
    {
      title: language === 'ar' ? 'الملف الشخصي' : 'Profile',
      description:
        language === 'ar'
          ? 'إدارة بياناتك الشخصية والإعدادات'
          : 'Manage your personal information and settings',
      icon: '👤',
      path: '/profile',
      color: palette.brandSecondary,
    },
    {
      title: language === 'ar' ? 'لوحة التحكم' : 'Dashboard',
      description:
        language === 'ar'
          ? 'نظرة شاملة على نشاطك الاستثماري'
          : 'Overview of your investment activity',
      icon: '📊',
      path: '/dashboard',
      color: palette.brandPrimaryStrong,
    },
  ];

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: isMobile ? '1rem' : '2rem',
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
          gap: isMobile ? '1.25rem' : '2rem',
        }}
      >
        {/* Welcome header */}
        <header
          style={{
            padding: isMobile ? '1.5rem' : '2rem',
            borderRadius: radius.lg,
            background: `linear-gradient(135deg, ${palette.brandPrimary} 0%, ${palette.brandPrimaryStrong} 100%)`,
            color: palette.textOnBrand,
            boxShadow: shadow.medium,
          }}
        >
          <h1
            style={{
              margin: 0,
              marginBottom: '0.5rem',
              fontSize: isMobile ? '1.5rem' : typography.sizes.heading,
              fontWeight: typography.weights.bold,
            }}
          >
            {language === 'ar'
              ? 'مرحباً بك في منصة باكورة للاستثمار'
              : 'Welcome to Bakurah Investment Platform'}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: isMobile ? '0.9rem' : typography.sizes.body,
              opacity: 0.9,
            }}
          >
            {language === 'ar'
              ? 'منصة متكاملة لإدارة استثماراتك وطلباتك المالية'
              : 'An integrated platform to manage your investments and financial requests'}
          </p>
        </header>

        {/* Quick stats (if dashboard data available) */}
        {!isLoading && dashboardData && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: isMobile ? '0.75rem' : '1rem',
            }}
          >
            <StatCard
              title={language === 'ar' ? 'إجمالي الطلبات' : 'Total requests'}
              value={dashboardData.requestSummary?.total ?? 0}
            />
            <StatCard
              title={language === 'ar' ? 'طلبات قيد المراجعة' : 'Pending review'}
              value={
                (dashboardData.requestSummary?.byStatus.submitted ?? 0) +
                (dashboardData.requestSummary?.byStatus.screening ?? 0) +
                (dashboardData.requestSummary?.byStatus.pending_info ?? 0) +
                (dashboardData.requestSummary?.byStatus.compliance_review ?? 0)
              }
            />
            <StatCard
              title={language === 'ar' ? 'طلبات معتمدة' : 'Approved'}
              value={
                (dashboardData.requestSummary?.byStatus.approved ?? 0) +
                (dashboardData.requestSummary?.byStatus.completed ?? 0)
              }
            />
            <StatCard
              title={language === 'ar' ? 'تنبيهات غير مقروءة' : 'Unread alerts'}
              value={dashboardData.unreadNotifications ?? 0}
            />
          </section>
        )}

        {/* Quick actions */}
        <section>
          <h2
            style={{
              margin: 0,
              marginBottom: isMobile ? '0.75rem' : '1rem',
              fontSize: isMobile ? '1.25rem' : typography.sizes.subheading,
              fontWeight: 600,
              color: palette.textPrimary,
            }}
          >
            {language === 'ar' ? 'إجراءات سريعة' : 'Quick actions'}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: isMobile ? '0.75rem' : '1.25rem',
            }}
          >
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} action={action} navigate={navigate} />
            ))}
          </div>
        </section>

        {/* Recent activity preview */}
        {!isLoading && dashboardData && dashboardData.recentRequests.length > 0 && (
          <section
            style={{
              padding: isMobile ? '1rem' : '1.5rem',
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
                marginBottom: '1rem',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? '1.25rem' : typography.sizes.subheading,
                  fontWeight: 600,
                  color: palette.textPrimary,
                }}
              >
                {language === 'ar' ? 'الطلبات الأخيرة' : 'Recent requests'}
              </h2>
              <button
                onClick={() => navigate('/requests')}
                style={{
                  padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
                  borderRadius: radius.md,
                  background: 'transparent',
                  color: palette.brandPrimary,
                  border: `1px solid ${palette.brandPrimary}`,
                  cursor: 'pointer',
                  fontSize: isMobile ? '0.8rem' : typography.sizes.caption,
                  fontWeight: 600,
                  minHeight: isMobile ? '36px' : 'auto',
                }}
              >
                {language === 'ar' ? 'عرض الكل' : 'View all'}
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {dashboardData.recentRequests.slice(0, 3).map(request => (
                <div
                  key={request.id}
                  style={{
                    padding: isMobile ? '0.75rem' : '0.75rem 1rem',
                    borderRadius: radius.md,
                    background: palette.backgroundSurface,
                    border: `1px solid ${palette.neutralBorderMuted}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '0.5rem' : 0,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isMobile) {
                      e.currentTarget.style.background = palette.backgroundHighlight;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isMobile) {
                      e.currentTarget.style.background = palette.backgroundSurface;
                    }
                  }}
                  onClick={() => navigate(`/requests/${request.id}`)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: isMobile ? '0.9rem' : typography.sizes.body,
                        fontWeight: 600,
                        color: palette.textPrimary,
                        marginBottom: isMobile ? '0.25rem' : 0,
                      }}
                    >
                      #{request.requestNumber}
                    </div>
                    {request.amount && (
                      <div
                        style={{
                          fontSize: isMobile ? '0.8rem' : typography.sizes.caption,
                          color: palette.textSecondary,
                        }}
                      >
                        {formatCurrency(request.amount, request.currency || 'SAR')}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: typography.sizes.caption,
                      color: palette.brandPrimary,
                    }}
                  >
                    →
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  const { palette, radius, shadow, typography } = require('../styles/theme');
  const isMobile = window.innerWidth <= 640;

  return (
    <div
      style={{
        padding: isMobile ? '1rem' : '1.25rem',
        borderRadius: radius.lg,
        background: palette.backgroundBase,
        boxShadow: shadow.subtle,
        border: `1px solid ${palette.neutralBorderMuted}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <span
        style={{
          fontSize: isMobile ? '0.75rem' : typography.sizes.caption,
          color: palette.textSecondary,
        }}
      >
        {title}
      </span>
      <strong
        style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          fontWeight: 700,
          color: palette.textPrimary,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

function QuickActionCard({
  action,
  navigate,
}: {
  action: {
    title: string;
    description: string;
    icon: string;
    path: string;
    color: string;
  };
  navigate: (path: string) => void;
}) {
  const { palette, radius, shadow, typography } = require('../styles/theme');
  const isMobile = window.innerWidth <= 640;

  return (
    <div
      style={{
        padding: isMobile ? '1.25rem' : '1.5rem',
        borderRadius: radius.lg,
        background: palette.backgroundBase,
        boxShadow: shadow.subtle,
        border: `1px solid ${palette.neutralBorderMuted}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '0.5rem' : '0.75rem',
        minHeight: isMobile ? '120px' : 'auto',
      }}
      onMouseEnter={e => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = shadow.medium;
          e.currentTarget.style.borderColor = action.color;
        }
      }}
      onMouseLeave={e => {
        if (!isMobile) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = shadow.subtle;
          e.currentTarget.style.borderColor = palette.neutralBorderMuted;
        }
      }}
      onClick={() => navigate(action.path)}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? '0.75rem' : '1rem',
        }}
      >
        <span
          style={{
            fontSize: isMobile ? '1.75rem' : '2rem',
            lineHeight: 1,
          }}
        >
          {action.icon}
        </span>
        <h3
          style={{
            margin: 0,
            fontSize: isMobile ? '1.1rem' : typography.sizes.subheading,
            fontWeight: 600,
            color: palette.textPrimary,
          }}
        >
          {action.title}
        </h3>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: isMobile ? '0.9rem' : typography.sizes.body,
          color: palette.textSecondary,
        }}
      >
        {action.description}
      </p>
    </div>
  );
}

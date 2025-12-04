import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import type { DashboardRecentRequest, DashboardRequestSummary } from '../types/dashboard';
import type { RequestStatus } from '../types/request';

export function InvestorDashboardPage() {
  const { language, direction } = useLanguage();
  const { data, isLoading, isError, refetch } = useInvestorDashboard();

  const summary: DashboardRequestSummary | undefined = data?.requestSummary;
  const recent = data?.recentRequests ?? [];
  const pendingItems = data?.pendingActions.items ?? [];

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
    new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

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
            {language === 'ar' ? 'لوحة تحكم المستثمر' : 'Investor dashboard'}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {language === 'ar'
              ? 'تابع طلباتك، حالتها، التنبيهات، وآخر الأنشطة المالية في باكورة.'
              : 'Track your requests, their status, alerts, and recent financial activity in Bakura.'}
          </p>
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
              {language === 'ar' ? 'تحديث البيانات' : 'Refresh data'}
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
              {language === 'ar'
                ? `آخر تحديث: ${formatDateTime(data.generatedAt)}`
                : `Last updated: ${formatDateTime(data.generatedAt)}`}
            </div>
          )}
        </section>

        {/* Summary cards */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <SummaryCard
            title={language === 'ar' ? 'إجمالي الطلبات' : 'Total requests'}
            value={summary?.total ?? 0}
            highlight
          />

          <SummaryCard
            title={language === 'ar' ? 'طلبات قيد المراجعة' : 'Under review'}
            value={
              (summary?.byStatus.submitted ?? 0) +
              (summary?.byStatus.screening ?? 0) +
              (summary?.byStatus.pending_info ?? 0) +
              (summary?.byStatus.compliance_review ?? 0)
            }
          />

          <SummaryCard
            title={language === 'ar' ? 'طلبات معتمدة' : 'Approved / completed'}
            value={
              (summary?.byStatus.approved ?? 0) +
              (summary?.byStatus.completed ?? 0)
            }
          />

          <SummaryCard
            title={language === 'ar' ? 'تنبيهات غير مقروءة' : 'Unread alerts'}
            value={data?.unreadNotifications ?? 0}
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
            {language === 'ar' ? 'حالة طلباتك' : 'Your requests status'}
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
                  ? language === 'ar'
                    ? 'تم الإرسال'
                    : 'Submitted'
                  : statusKey === 'screening'
                    ? language === 'ar'
                      ? 'فرز أولي'
                      : 'Screening'
                    : statusKey === 'pending_info'
                      ? language === 'ar'
                        ? 'بانتظار معلومات'
                        : 'Pending info'
                      : statusKey === 'compliance_review'
                        ? language === 'ar'
                          ? 'مراجعة التوافق'
                          : 'Compliance review'
                        : statusKey === 'approved'
                          ? language === 'ar'
                            ? 'معتمدة'
                            : 'Approved'
                          : statusKey === 'rejected'
                            ? language === 'ar'
                              ? 'مرفوضة'
                              : 'Rejected'
                            : statusKey === 'settling'
                              ? language === 'ar'
                                ? 'قيد التسوية'
                                : 'Settling'
                              : language === 'ar'
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
            gridTemplateColumns: 'minmax(0, 2.5fr) minmax(0, 1.5fr)',
            gap: '1.25rem',
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
                  fontSize: '1rem',
                  fontWeight: typography.weights.semibold,
                  color: palette.textPrimary,
                }}
              >
                {language === 'ar' ? 'آخر الطلبات' : 'Recent requests'}
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
                {language === 'ar' ? 'عرض الكل' : 'View all'}
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
                {language === 'ar'
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
                fontSize: '1rem',
                fontWeight: typography.weights.semibold,
                color: palette.textPrimary,
              }}
            >
              {language === 'ar' ? 'إجراءات مطلوبة' : 'Pending actions'}
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
                {language === 'ar'
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
                      {language === 'ar' ? 'طلب' : 'Request'} #{item.requestNumber}
                    </span>
                    <span
                      style={{
                        fontSize: '0.8rem',
                        color: palette.textSecondary,
                      }}
                    >
                      {language === 'ar'
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
                      {language === 'ar' ? 'فتح تفاصيل الطلب' : 'Open request details'}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  highlight?: boolean;
}

function SummaryCard({ title, value, highlight }: SummaryCardProps) {
  return (
    <div
      style={{
        padding: '1.1rem 1.25rem',
        borderRadius: radius.lg,
        background: palette.backgroundBase,
        boxShadow: shadow.subtle,
        border: `1px solid ${highlight ? palette.brandPrimaryStrong : palette.neutralBorderMuted}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        minHeight: '90px',
      }}
    >
      <span
        style={{
          fontSize: '0.85rem',
          color: palette.textSecondary,
        }}
      >
        {title}
      </span>
      <strong
        style={{
          fontSize: '1.4rem',
          color: highlight ? palette.brandPrimaryStrong : palette.textPrimary,
        }}
      >
        {value}
      </strong>
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
  const typeLabel =
    item.type === 'buy'
      ? (language === 'ar' ? 'شراء أسهم' : 'Buy shares')
      : item.type === 'sell'
        ? (language === 'ar' ? 'بيع أسهم' : 'Sell shares')
        : item.type === 'partnership'
          ? (language === 'ar' ? 'شراكة' : 'Partnership')
          : item.type === 'board_nomination'
            ? (language === 'ar' ? 'ترشيح مجلس الإدارة' : 'Board nomination')
            : (language === 'ar' ? 'ملاحظات / استفسار' : 'Feedback / inquiry');

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
      ? (language === 'ar' ? 'مسودة' : 'Draft')
      : item.status === 'submitted'
        ? (language === 'ar' ? 'تم الإرسال' : 'Submitted')
        : item.status === 'screening'
          ? (language === 'ar' ? 'فرز أولي' : 'Screening')
          : item.status === 'pending_info'
            ? (language === 'ar' ? 'بانتظار معلومات' : 'Pending info')
            : item.status === 'compliance_review'
              ? (language === 'ar' ? 'مراجعة التوافق' : 'Compliance review')
              : item.status === 'approved'
                ? (language === 'ar' ? 'معتمد' : 'Approved')
                : item.status === 'rejected'
                  ? (language === 'ar' ? 'مرفوض' : 'Rejected')
                  : item.status === 'settling'
                    ? (language === 'ar' ? 'قيد التسوية' : 'Settling')
                    : (language === 'ar' ? 'مكتمل' : 'Completed');

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
            {language === 'ar' ? 'طلب' : 'Request'} #{item.requestNumber}
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


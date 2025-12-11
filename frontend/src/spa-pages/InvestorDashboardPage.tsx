import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorDashboardDirect } from '../hooks/useInvestorDashboardDirect';
import { useNotifications } from '../hooks/useNotifications';
import { useConversations } from '../hooks/useChat';
import { NotificationBadge } from '../components/notifications/NotificationBadge';
import { ChatIcon } from '../components/chat/ChatIcon';
import { ChatModal } from '../components/chat/ChatModal';
import type { DashboardRecentRequest, DashboardRequestSummary } from '../types/dashboard';
import type { RequestStatus } from '../types/request';

export function InvestorDashboardPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const { data, isLoading, isError, refetch } = useInvestorDashboardDirect();
  const [mounted, setMounted] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Fetch notifications
  const { meta: notificationsMeta } = useNotifications({ status: 'unread' });
  const unreadNotificationCount = notificationsMeta?.unreadCount ?? 0;
  
  // Fetch conversations for unread count
  const { conversations } = useConversations();
  const unreadChatCount = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  useEffect(() => {
    setMounted(true);
  }, []);


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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <NotificationBadge
                count={unreadNotificationCount}
                language={language}
                onClick={() => {
                  window.location.href = '/notifications';
                }}
                isActive={showNotifications}
              />
              <ChatIcon
                unreadCount={unreadChatCount}
                onClick={() => setShowChatModal(true)}
                isActive={showChatModal}
              />
            </div>
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
      </div>
      
      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
      )}
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


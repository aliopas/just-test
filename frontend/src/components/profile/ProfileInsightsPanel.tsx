import type {
  DashboardRecentRequest,
  InvestorDashboardResponse,
} from '../../types/dashboard';
import { useLanguage } from '../../context/LanguageContext';
import { getMessage } from '../../locales/investorProfile';
import { getStatusLabel, getStatusColor } from '../../utils/requestStatus';

interface ProfileInsightsPanelProps {
  insights: InvestorDashboardResponse['insights'] | null;
  recentRequests: DashboardRecentRequest[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => Promise<unknown> | unknown;
}

function formatCurrency(
  amount: number,
  currency: string,
  language: 'ar' | 'en'
) {
  try {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} ${currency}`;
  }
}

export function ProfileInsightsPanel({
  insights,
  recentRequests,
  isLoading = false,
  isError = false,
  onRetry,
}: ProfileInsightsPanelProps) {
  const { language, direction } = useLanguage();

  const defaultCurrency =
    insights?.lastRequest?.currency ??
    recentRequests[0]?.currency ??
    'SAR';

  const stats = [
    {
      label: getMessage('insights.averageBuy', language),
      value: formatCurrency(
        insights?.averageAmountByType.buy ?? 0,
        defaultCurrency,
        language
      ),
    },
    {
      label: getMessage('insights.averageSell', language),
      value: formatCurrency(
        insights?.averageAmountByType.sell ?? 0,
        defaultCurrency,
        language
      ),
    },
    {
      label: getMessage('insights.rollingVolume', language),
      value: formatCurrency(
        insights?.rolling30DayVolume ?? 0,
        defaultCurrency,
        language
      ),
    },
  ];

  return (
    <section
      aria-live="polite"
      style={{
        background: 'var(--color-background-surface)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: '1rem',
        padding: '1.35rem',
        boxShadow: '0 12px 32px rgba(17, 24, 39, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        direction,
      }}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.35rem',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {getMessage('insights.title', language)}
        </h3>
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-muted)',
            fontSize: '0.9rem',
          }}
        >
          {getMessage('insights.subtitle', language)}
        </p>
      </header>

      {isLoading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={`insight-skeleton-${index}`}
              style={{
                height: '72px',
                borderRadius: '0.85rem',
                background: 'var(--color-border-muted)',
                opacity: 0.35,
                animation: 'pulse 1.2s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : isError ? (
        <div
          style={{
            borderRadius: '0.85rem',
            border: '1px solid #FCA5A5',
            background: '#FEF2F2',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              color: '#B91C1C',
              fontWeight: 600,
            }}
          >
            {getMessage('insights.error', language)}
          </span>
          {onRetry && (
            <button
              type="button"
              onClick={() => onRetry()}
              style={{
                alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-end',
                padding: '0.55rem 1.25rem',
                borderRadius: '999px',
                border: '1px solid var(--color-brand-primary)',
                background: 'var(--color-background-surface)',
                color: 'var(--color-brand-primary)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {getMessage('insights.retry', language)}
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {stats.map(stat => (
            <div
              key={stat.label}
              style={{
                borderRadius: '0.85rem',
                border: '1px solid var(--color-border-muted)',
                padding: '0.75rem 0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                background: 'var(--color-background-alt)',
              }}
            >
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)',
                }}
              >
                {stat.label}
              </span>
              <strong
                style={{
                  fontSize: '1.1rem',
                  color: 'var(--color-text-primary)',
                }}
              >
                {stat.value}
              </strong>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {getMessage('insights.lastRequest', language)}
        </h4>
        {recentRequests.length === 0 ? (
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-muted)',
              fontSize: '0.9rem',
            }}
          >
            {getMessage('insights.noRecent', language)}
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {recentRequests.slice(0, 3).map(item => {
              const statusColor = getStatusColor(item.status);
              return (
                <li
                  key={item.id}
                  style={{
                    borderRadius: '0.85rem',
                    border: '1px solid var(--color-border-muted)',
                    padding: '0.75rem 0.9rem',
                    display: 'flex',
                    flexDirection:
                      direction === 'rtl' ? 'row-reverse' : 'row',
                    justifyContent: 'space-between',
                    gap: '0.85rem',
                    alignItems: 'center',
                    background: 'var(--color-background-base)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <strong
                      style={{
                        color: 'var(--color-text-primary)',
                        fontSize: '0.95rem',
                      }}
                    >
                      #{item.requestNumber}
                    </strong>
                    <span>
                      {item.type === 'sell'
                        ? language === 'ar'
                          ? 'طلب بيع'
                          : 'Sell request'
                        : language === 'ar'
                        ? 'طلب شراء'
                        : 'Buy request'}
                      {' · '}
                      {new Date(item.createdAt).toLocaleDateString(
                        language === 'ar' ? 'ar-SA' : 'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </span>
                  </div>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: statusColor,
                    }}
                  >
                    <span
                      style={{
                        width: '0.55rem',
                        height: '0.55rem',
                        borderRadius: '50%',
                        background: statusColor,
                      }}
                    />
                    {getStatusLabel(item.status, language)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}



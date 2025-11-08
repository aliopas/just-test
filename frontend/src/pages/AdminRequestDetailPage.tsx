import { useMemo } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useAdminRequestDetail } from '../hooks/useAdminRequestDetail';
import { tAdminRequests } from '../locales/adminRequests';
import { RequestStatusBadge } from '../components/request/RequestStatusBadge';
import { getStatusLabel } from '../utils/requestStatus';

const queryClient = new QueryClient();

function resolveRequestId(): string | null {
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  return segments[segments.length - 1] ?? null;
}

function AdminRequestDetailPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();

  const requestId = useMemo(resolveRequestId, []);
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminRequestDetail(requestId);

  const request = data?.request;

  if (isError) {
    pushToast({
      message:
        error instanceof Error
          ? error.message
          : tAdminRequests('table.error', language),
      variant: 'error',
    });
  }

  const amountFormatted = request
    ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: request.currency,
      }).format(request.amount)
    : '—';

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        minHeight: '100vh',
        background: '#F1F5F9',
        direction,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
      }}
    >
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <a
          href="/app/admin/requests"
          style={{
            color: '#2563EB',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.95rem',
            alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
          }}
        >
          ← {tAdminRequests('detail.back', language)}
        </a>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#0F172A',
              margin: 0,
            }}
          >
            {tAdminRequests('detail.title', language)}
          </h1>
          {request && (
            <RequestStatusBadge status={request.status} />
          )}
        </div>
        {request && (
          <div style={{ color: '#475569', fontSize: '0.95rem' }}>
            #{request.requestNumber} ·{' '}
            {tAdminRequests('detail.updatedAt', language)}:{' '}
            {new Date(request.updatedAt).toLocaleString(
              language === 'ar' ? 'ar-SA' : 'en-US',
              { dateStyle: 'medium', timeStyle: 'short' }
            )}
          </div>
        )}
      </header>

      <section
        style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <Card>
            <CardTitle>{tAdminRequests('detail.requestInfo', language)}</CardTitle>
            {isLoading || !request ? (
              <Skeleton />
            ) : (
              <InfoGrid
                items={[
                  {
                    label: tAdminRequests('table.requestNumber', language),
                    value: request.requestNumber,
                  },
                  {
                    label: tAdminRequests('table.amount', language),
                    value: amountFormatted,
                  },
                  {
                    label: tAdminRequests('table.status', language),
                    value: getStatusLabel(request.status, language),
                  },
                  {
                    label: tAdminRequests('table.createdAt', language),
                    value: new Date(request.createdAt).toLocaleString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    ),
                  },
                ]}
              />
            )}
          </Card>

          <Card>
            <CardTitle>{tAdminRequests('detail.investorInfo', language)}</CardTitle>
            {isLoading || !request ? (
              <Skeleton />
            ) : (
              <InfoGrid
                items={[
                  {
                    label: tAdminRequests('table.investor', language),
                    value:
                      request.investor?.fullName ??
                      request.investor?.preferredName ??
                      request.investor?.email ??
                      '—',
                  },
                  {
                    label: 'Email',
                    value: request.investor?.email ?? '—',
                  },
                  {
                    label: 'Language',
                    value: request.investor?.language ?? '—',
                  },
                ]}
              />
            )}
          </Card>

          <Card>
            <CardTitle>{tAdminRequests('detail.timeline', language)}</CardTitle>
            {isLoading || !data ? (
              <Skeleton />
            ) : data.events.length === 0 ? (
              <EmptyState message={tAdminRequests('detail.noEvents', language)} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft: direction === 'rtl' ? 'none' : '2px solid #E2E8F0',
                  borderRight: direction === 'rtl' ? '2px solid #E2E8F0' : 'none',
                  paddingInlineStart: direction === 'rtl' ? 0 : '1.25rem',
                  paddingInlineEnd: direction === 'rtl' ? '1.25rem' : 0,
                }}
              >
                {data.events.map(event => (
                  <article key={event.id} style={{ position: 'relative' }}>
                    <span
                      style={{
                        position: 'absolute',
                        top: '0.4rem',
                        left: direction === 'rtl' ? 'auto' : '-1.25rem',
                        right: direction === 'rtl' ? '-1.25rem' : 'auto',
                        width: '0.7rem',
                        height: '0.7rem',
                        borderRadius: '999px',
                        background: '#2563EB',
                      }}
                    />
                    <div
                      style={{
                        fontWeight: 600,
                        color: '#0F172A',
                      }}
                    >
                      {event.toStatus
                        ? getStatusLabel(event.toStatus as any, language)
                        : '—'}
                    </div>
                    <div
                      style={{
                        color: '#64748B',
                        fontSize: '0.85rem',
                      }}
                    >
                      {new Date(event.createdAt).toLocaleString(
                        language === 'ar' ? 'ar-SA' : 'en-US',
                        { dateStyle: 'medium', timeStyle: 'short' }
                      )}
                    </div>
                    {event.note && (
                      <p
                        style={{
                          margin: '0.35rem 0 0',
                          color: '#475569',
                        }}
                      >
                        {event.note}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardTitle>{tAdminRequests('detail.comments', language)}</CardTitle>
            {isLoading || !data ? (
              <Skeleton />
            ) : data.comments.length === 0 ? (
              <EmptyState message={tAdminRequests('detail.noComments', language)} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {data.comments.map(comment => (
                  <div
                    key={comment.id}
                    style={{
                      background: '#F8FAFC',
                      borderRadius: '0.85rem',
                      padding: '0.75rem 1rem',
                    }}
                  >
                    <div
                      style={{
                        color: '#64748B',
                        fontSize: '0.8rem',
                      }}
                    >
                      {new Date(comment.createdAt).toLocaleString(
                        language === 'ar' ? 'ar-SA' : 'en-US',
                        { dateStyle: 'medium', timeStyle: 'short' }
                      )}
                    </div>
                    <div style={{ marginTop: '0.35rem' }}>{comment.note}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <Card>
            <CardTitle>{tAdminRequests('detail.attachments', language)}</CardTitle>
            {isLoading || !data ? (
              <Skeleton />
            ) : data.attachments.length === 0 ? (
              <EmptyState message={tAdminRequests('detail.noAttachments', language)} />
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
                {data.attachments.map(attachment => (
                  <li
                    key={attachment.id}
                    style={{
                      border: '1px solid #E2E8F0',
                      borderRadius: '0.85rem',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <strong style={{ color: '#0F172A' }}>{attachment.filename}</strong>
                    <span style={{ color: '#64748B', fontSize: '0.85rem' }}>
                      {attachment.mimeType ?? '—'} ·{' '}
                      {attachment.size != null
                        ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`
                        : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardTitle>{tAdminRequests('detail.actions', language)}</CardTitle>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <ActionButton label={tAdminRequests('detail.approve', language)} />
              <ActionButton
                label={tAdminRequests('detail.reject', language)}
                variant="danger"
              />
              <ActionButton
                label={tAdminRequests('detail.requestInfoAction', language)}
                variant="secondary"
              />
            </div>
            <p
              style={{
                marginTop: '0.75rem',
                color: '#94A3B8',
                fontSize: '0.85rem',
              }}
            >
              * سيتم ربط الأزرار بواجهات Story 4.4 و4.5.
            </p>
          </Card>

          <Card>
            <CardTitle>{tAdminRequests('detail.notes', language)}</CardTitle>
            {isLoading || !request ? (
              <Skeleton />
            ) : (
              <div
                style={{
                  background: '#F8FAFC',
                  borderRadius: '0.85rem',
                  padding: '0.75rem 1rem',
                  color: '#0F172A',
                  minHeight: '4rem',
                }}
              >
                {request.notes ?? '—'}
              </div>
            )}
          </Card>
        </div>
      </section>

      <button
        type="button"
        onClick={() => refetch()}
        disabled={isFetching}
        style={{
          alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-end',
          padding: '0.65rem 1.4rem',
          borderRadius: '0.85rem',
          border: '1px solid #CBD5F5',
          background: '#FFFFFF',
          color: '#1E3A5F',
          fontWeight: 600,
          cursor: isFetching ? 'progress' : 'pointer',
        }}
      >
        ⟳
      </button>
    </div>
  );
}

type CardProps = {
  children: React.ReactNode;
};

function Card({ children }: CardProps) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        margin: 0,
        fontSize: '1.1rem',
        fontWeight: 700,
        color: '#0F172A',
      }}
    >
      {children}
    </h2>
  );
}

function Skeleton() {
  return (
    <div
      style={{
        height: '80px',
        width: '100%',
        borderRadius: '0.85rem',
        background:
          'linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: '1rem',
        borderRadius: '0.85rem',
        background: '#F8FAFC',
        color: '#475569',
        textAlign: 'center',
        fontSize: '0.9rem',
      }}
    >
      {message}
    </div>
  );
}

function InfoGrid({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        margin: 0,
      }}
    >
      {items.map(item => (
        <div key={item.label} style={{ display: 'flex', flexDirection: 'column' }}>
          <dt
            style={{
              color: '#94A3B8',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {item.label}
          </dt>
          <dd
            style={{
              margin: '0.25rem 0 0',
              fontWeight: 600,
              color: '#0F172A',
            }}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ActionButton({
  label,
  variant = 'primary',
}: {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const colors: Record<typeof variant, string> = {
    primary: '#2563EB',
    secondary: '#0EA5E9',
    danger: '#DC2626',
  };
  return (
    <button
      type="button"
      style={{
        padding: '0.75rem 1.4rem',
        borderRadius: '0.85rem',
        border: 'none',
        background: colors[variant],
        color: '#FFFFFF',
        fontWeight: 700,
        cursor: 'not-allowed',
        opacity: 0.75,
      }}
      disabled
    >
      {label}
    </button>
  );
}

export function AdminRequestDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AdminRequestDetailPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}


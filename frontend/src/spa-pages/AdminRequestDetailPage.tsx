import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAdminRequestDetail } from '../hooks/useAdminRequestDetail';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { tAdminRequests } from '../locales/adminRequests';
import { RequestStatusBadge } from '../components/request/RequestStatusBadge';
import { getStatusLabel } from '../utils/requestStatus';

export function AdminRequestDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, direction } = useLanguage();

  // Note: in App Router we get the id from pathname (/admin/requests/[id])
  // but since this component is used via a wrapper page, we can read it from URL
  const requestId = typeof window !== 'undefined'
    ? window.location.pathname.split('/').pop() ?? null
    : searchParams.get('id');

  const { data, isLoading, isError } = useAdminRequestDetail(requestId);

  const request = data?.request;

  const goBack = () => {
    router.push('/admin/requests');
  };

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
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={goBack}
              style={{
                alignSelf: 'flex-start',
                padding: '0.4rem 0.9rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundBase,
                color: palette.textSecondary,
                fontSize: typography.sizes.caption,
                cursor: 'pointer',
              }}
            >
              {tAdminRequests('detail.back', language)}
            </button>
            <div>
              <h1
                style={{
                  margin: '0.25rem 0 0.15rem',
                  fontSize: typography.sizes.heading,
                  fontWeight: typography.weights.bold,
                  color: palette.textPrimary,
                }}
              >
                {tAdminRequests('detail.title', language)}
              </h1>
              {request && (
                <p
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  #{request.requestNumber}{' '}
                  <span style={{ opacity: 0.7 }}>
                    · {new Date(request.createdAt).toLocaleString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  </span>
                </p>
              )}
            </div>
          </div>

          {request && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <RequestStatusBadge status={request.status} />
              <span
                style={{
                  fontSize: typography.sizes.caption,
                  color: palette.textSecondary,
                }}
              >
                {getStatusLabel(request.status, language)}
              </span>
            </div>
          )}
        </header>

        {/* Loading / Error states */}
        {isLoading && (
          <div
            style={{
              padding: '2rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              textAlign: 'center',
              color: palette.textSecondary,
            }}
          >
            {tAdminRequests('table.loading', language)}
          </div>
        )}

        {isError && !isLoading && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: '#FEF2F2',
              color: palette.error,
              border: `1px solid ${palette.error}33`,
            }}
          >
            {tAdminRequests('table.error', language)}
          </div>
        )}

        {request && !isLoading && !isError && (
          <main
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.4fr)',
              gap: '1.25rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Left column: request & investor info */}
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Request info */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: radius.lg,
                  background: palette.backgroundBase,
                  boxShadow: shadow.subtle,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: '0.75rem',
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {tAdminRequests('detail.requestInfo', language)}
                </h2>
                <dl
                  style={{
                    margin: 0,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: '0.75rem 1.5rem',
                    fontSize: typography.sizes.caption,
                  }}
                >
                  <InfoRow
                    label={tAdminRequests('table.type', language)}
                    value={request.type}
                  />
                  <InfoRow
                    label={tAdminRequests('table.status', language)}
                    value={getStatusLabel(request.status, language)}
                  />
                  <InfoRow
                    label={tAdminRequests('table.amount', language)}
                    value={
                      request.amount != null && request.currency
                        ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
                            style: 'currency',
                            currency: request.currency,
                          }).format(request.amount)
                        : '—'
                    }
                  />
                  <InfoRow
                    label={tAdminRequests('table.createdAt', language)}
                    value={new Date(request.createdAt).toLocaleString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  />
                  <InfoRow
                    label={tAdminRequests('detail.updatedAt', language)}
                    value={new Date(request.updatedAt).toLocaleString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  />
                </dl>
              </div>

              {/* Placeholder: timeline / attachments / comments يمكن توسيعه لاحقاً */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: radius.lg,
                  background: palette.backgroundBase,
                  boxShadow: shadow.subtle,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: '0.75rem',
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {tAdminRequests('detail.timeline', language)}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {tAdminRequests('detail.noEvents', language)}
                </p>
              </div>
            </section>

            {/* Right column: investor info / notes */}
            <section
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {/* Investor info */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: radius.lg,
                  background: palette.backgroundBase,
                  boxShadow: shadow.subtle,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: '0.75rem',
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {tAdminRequests('detail.investorInfo', language)}
                </h2>
                <dl
                  style={{
                    margin: 0,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    gap: '0.6rem',
                    fontSize: typography.sizes.caption,
                  }}
                >
                  <InfoRow
                    label={tAdminRequests('table.investor', language)}
                    value={
                      request.investor.fullName ??
                      request.investor.preferredName ??
                      request.investor.email ??
                      '—'
                    }
                  />
                  <InfoRow
                    label="Email"
                    value={request.investor.email ?? '—'}
                  />
                  <InfoRow
                    label={language === 'ar' ? 'الهاتف' : 'Phone'}
                    value={request.investor.phone ?? '—'}
                  />
                  <InfoRow
                    label={language === 'ar' ? 'الدولة' : 'Country'}
                    value={request.investor.residencyCountry ?? '—'}
                  />
                </dl>
              </div>

              {/* Notes placeholder */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderRadius: radius.lg,
                  background: palette.backgroundBase,
                  boxShadow: shadow.subtle,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: '0.75rem',
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {tAdminRequests('detail.notes', language)}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {request.notes
                    ? request.notes
                    : tAdminRequests('detail.noComments', language)}
                </p>
              </div>
            </section>
          </main>
        )}
      </div>
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string | number | null;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
      <dt
        style={{
          fontSize: typography.sizes.caption,
          color: palette.textSecondary,
        }}
      >
        {label}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: typography.sizes.body,
          color: palette.textPrimary,
          fontWeight: typography.weights.medium,
        }}
      >
        {value ?? '—'}
      </dd>
    </div>
  );
}

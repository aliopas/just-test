import React from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorRequestDetail } from '../hooks/useInvestorRequestDetail';
import { useRequestTimelineDirect } from '../hooks/useRequestTimelineDirect';
import { tRequestList, type MessageKey } from '../locales/requestList';
import { useNextNavigate } from '../utils/next-router';
import type { RequestStatus } from '../types/request';

export function InvestorRequestDetailPage() {
  const { language, direction } = useLanguage();
  const params = useParams();
  const navigate = useNextNavigate();
  const requestId = params?.id as string | undefined;

  const { data: requestDetail, isLoading, isError } = useInvestorRequestDetail(requestId);
  const { data: timelineData, isLoading: timelineLoading } = useRequestTimelineDirect(
    requestId,
    'investor'
  );

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (!amount) return '—';
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency || 'SAR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return palette.success;
      case 'rejected':
        return palette.error;
      case 'pending_info':
      case 'screening':
      case 'compliance_review':
        return palette.warning;
      case 'submitted':
        return palette.brandPrimary;
      default:
        return palette.textSecondary;
    }
  };

  const getStatusLabel = (status: RequestStatus) => {
    const keyMap: Record<RequestStatus, MessageKey> = {
      draft: 'filters.draft',
      submitted: 'filters.submitted',
      screening: 'filters.screening',
      pending_info: 'filters.pendingInfo',
      compliance_review: 'filters.complianceReview',
      approved: 'filters.approved',
      rejected: 'filters.rejected',
      settling: 'filters.settling',
      completed: 'filters.completed',
    };
    return tRequestList(keyMap[status], language);
  };

  const getTypeLabel = (type: string) => {
    const keyMap: Record<string, MessageKey> = {
      buy: 'filters.typeBuy',
      sell: 'filters.typeSell',
      partnership: 'filters.typePartnership',
      board_nomination: 'filters.typeBoardNomination',
      feedback: 'filters.typeFeedback',
    };
    return tRequestList(keyMap[type] || 'filters.typeAll', language);
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: palette.backgroundSurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          direction,
        }}
      >
        <p style={{ color: palette.textSecondary }}>
          {tRequestList('details.loading', language)}
        </p>
      </div>
    );
  }

  if (isError || !requestDetail) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: palette.backgroundSurface,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          direction,
        }}
      >
        <p style={{ color: palette.error }}>
          {tRequestList('details.error', language)}
        </p>
        <button
          onClick={() => navigate('/requests')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: radius.md,
            background: palette.brandPrimary,
            color: palette.textOnBrand,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {language === 'ar' ? 'العودة للطلبات' : 'Back to requests'}
        </button>
      </div>
    );
  }

  const { request, attachments, events, comments } = requestDetail;

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
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundBase,
                color: palette.textSecondary,
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginBottom: '1rem',
              }}
            >
              {language === 'ar' ? 'العودة' : 'Back'}
            </button>
            <h1
              style={{
                margin: 0,
                fontSize: typography.sizes.heading,
                fontWeight: typography.weights.bold,
                color: palette.textPrimary,
              }}
            >
              {tRequestList('details.title', language)} #{request.requestNumber}
            </h1>
          </div>
          <span
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              borderRadius: radius.pill,
              background: `${getStatusColor(request.status)}20`,
              color: getStatusColor(request.status),
              fontSize: typography.sizes.body,
              fontWeight: 600,
            }}
          >
            {getStatusLabel(request.status)}
          </span>
        </header>

        {/* Main content grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: '1.5rem',
          }}
        >
          {/* Left column - Details */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Request Information */}
            <section
              style={{
                padding: '1.5rem',
                borderRadius: radius.lg,
                background: palette.backgroundBase,
                boxShadow: shadow.subtle,
                border: `1px solid ${palette.neutralBorderMuted}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: '1rem',
                  fontSize: typography.sizes.subheading,
                  fontWeight: 600,
                  color: palette.textPrimary,
                }}
              >
                {tRequestList('details.title', language)}
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <DetailRow
                  label={tRequestList('details.type', language)}
                  value={getTypeLabel(request.type)}
                />
                {request.amount && (
                  <DetailRow
                    label={tRequestList('details.amount', language)}
                    value={formatCurrency(request.amount, request.currency)}
                  />
                )}
                {request.targetPrice && (
                  <DetailRow
                    label={tRequestList('details.targetPrice', language)}
                    value={formatCurrency(request.targetPrice, request.currency)}
                  />
                )}
                {request.expiryAt && (
                  <DetailRow
                    label={tRequestList('details.expiry', language)}
                    value={formatDateTime(request.expiryAt)}
                  />
                )}
                {request.notes && (
                  <DetailRow
                    label={tRequestList('details.notes', language)}
                    value={request.notes}
                    multiline
                  />
                )}
                <DetailRow
                  label={tRequestList('details.lastUpdate', language)}
                  value={formatDateTime(request.updatedAt)}
                />
              </div>
            </section>

            {/* Attachments */}
            {attachments.length > 0 && (
              <section
                style={{
                  padding: '1.5rem',
                  borderRadius: radius.lg,
                  background: palette.backgroundBase,
                  boxShadow: shadow.subtle,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    marginBottom: '1rem',
                    fontSize: typography.sizes.subheading,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {tRequestList('details.attachments', language)}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {attachments.map(attachment => (
                    <div
                      key={attachment.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        borderRadius: radius.md,
                        background: palette.backgroundSurface,
                        border: `1px solid ${palette.neutralBorderMuted}`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: typography.sizes.body,
                          color: palette.textPrimary,
                        }}
                      >
                        {attachment.filename}
                      </span>
                      {attachment.downloadUrl && (
                        <a
                          href={attachment.downloadUrl}
                          download
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: radius.sm,
                            background: palette.brandPrimary,
                            color: palette.textOnBrand,
                            textDecoration: 'none',
                            fontSize: typography.sizes.caption,
                            fontWeight: 600,
                          }}
                        >
                          {tRequestList('details.download', language)}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {attachments.length === 0 && (
              <section
                style={{
                  padding: '1.5rem',
                  borderRadius: radius.lg,
                  background: palette.backgroundBase,
                  boxShadow: shadow.subtle,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.body,
                    color: palette.textSecondary,
                    fontStyle: 'italic',
                  }}
                >
                  {tRequestList('details.noAttachments', language)}
                </p>
              </section>
            )}
          </div>

          {/* Right column - Timeline */}
          <div>
            <section
              style={{
                padding: '1.5rem',
                borderRadius: radius.lg,
                background: palette.backgroundBase,
                boxShadow: shadow.subtle,
                border: `1px solid ${palette.neutralBorderMuted}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: '1rem',
                  fontSize: typography.sizes.subheading,
                  fontWeight: 600,
                  color: palette.textPrimary,
                }}
              >
                {tRequestList('details.timeline', language)}
              </h2>
              {timelineLoading ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.body,
                    color: palette.textSecondary,
                  }}
                >
                  {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </p>
              ) : timelineData && timelineData.items.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {timelineData.items.map((entry, index) => (
                    <TimelineEntry key={entry.id} entry={entry} language={language} />
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.body,
                    color: palette.textSecondary,
                    fontStyle: 'italic',
                  }}
                >
                  {tRequestList('details.noEvents', language)}
                </p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const { palette, typography } = require('../styles/theme');

  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '0.35rem',
          fontSize: typography.sizes.caption,
          fontWeight: 600,
          color: palette.textSecondary,
        }}
      >
        {label}
      </label>
      <div
        style={{
          fontSize: typography.sizes.body,
          color: palette.textPrimary,
          whiteSpace: multiline ? 'pre-wrap' : 'normal',
        }}
      >
        {value}
      </div>
    </div>
  );
}

function TimelineEntry({
  entry,
  language,
}: {
  entry: any;
  language: 'ar' | 'en';
}) {
  const { palette, radius, typography } = require('../styles/theme');

  const getEntryIcon = () => {
    switch (entry.entryType) {
      case 'status_change':
        return '🔄';
      case 'comment':
        return '💬';
      case 'notification':
        return '🔔';
      default:
        return '•';
    }
  };

  const getEntryText = () => {
    if (entry.entryType === 'status_change' && entry.event) {
      const from = entry.event.fromStatus || (language === 'ar' ? 'بداية' : 'Start');
      const to = entry.event.toStatus || (language === 'ar' ? 'نهاية' : 'End');
      return language === 'ar'
        ? `تم تغيير الحالة من "${from}" إلى "${to}"`
        : `Status changed from "${from}" to "${to}"`;
    }
    if (entry.entryType === 'comment' && entry.comment) {
      return entry.comment.comment;
    }
    if (entry.entryType === 'notification' && entry.notification) {
      return language === 'ar' ? 'تم إرسال إشعار' : 'Notification sent';
    }
    return '';
  };

  const formatDateTime = (value: string) => {
    return new Date(value).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div
      style={{
        padding: '0.75rem 1rem',
        borderRadius: radius.md,
        background: palette.backgroundSurface,
        border: `1px solid ${palette.neutralBorderMuted}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span style={{ fontSize: '1.2rem' }}>{getEntryIcon()}</span>
        <span
          style={{
            fontSize: typography.sizes.caption,
            color: palette.textSecondary,
          }}
        >
          {formatDateTime(entry.createdAt)}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          fontSize: typography.sizes.body,
          color: palette.textPrimary,
          whiteSpace: 'pre-wrap',
        }}
      >
        {getEntryText()}
      </p>
      {entry.actor && (
        <span
          style={{
            fontSize: typography.sizes.caption,
            color: palette.textSecondary,
          }}
        >
          {language === 'ar' ? 'بواسطة: ' : 'By: '}
          {entry.actor.name || entry.actor.email || (language === 'ar' ? 'نظام' : 'System')}
        </span>
      )}
    </div>
  );
}


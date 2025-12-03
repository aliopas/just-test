import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import type { InvestorRequest } from '../../types/request';
import { RequestStatusBadge } from './RequestStatusBadge';
import { tRequestList } from '../../locales/requestList';
import { getStatusLabel } from '../../utils/requestStatus';
import { useInvestorRequestDetail } from '../../hooks/useInvestorRequestDetail';
import { useRequestTimeline } from '../../hooks/useRequestTimeline';
import { RequestTimeline } from './RequestTimeline';
import { NotificationSkeleton } from '../notifications/NotificationSkeleton';

interface RequestDetailsDrawerProps {
  request: InvestorRequest;
  onClose: () => void;
}

export function RequestDetailsDrawer({
  request,
  onClose,
}: RequestDetailsDrawerProps) {
  const { language, direction } = useLanguage();
  const container = document.getElementById('drawer-root') ?? document.body;
  const { data, isLoading, isError, error, refetch } = useInvestorRequestDetail(
    request.id
  );
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    error: timelineError,
    refetch: refetchTimeline,
  } = useRequestTimeline(request.id, 'investor');

  const detailRequest = data?.request ?? request;
  const attachments = data?.attachments ?? [];
  const comments = data?.comments ?? [];
  const timelineItems = timelineData?.items ?? [];

  const formattedAmount = useMemo(() => {
    if (detailRequest.amount == null || detailRequest.currency == null) {
      return '—';
    }
    try {
      return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: detailRequest.currency,
      }).format(detailRequest.amount);
    } catch (formatError) {
      return `${detailRequest.amount.toFixed(2)} ${detailRequest.currency}`;
    }
  }, [language, detailRequest.amount, detailRequest.currency]);

  const targetPriceDisplay = useMemo(() => {
    if (detailRequest.targetPrice == null || detailRequest.currency == null) return '—';
    try {
      return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: detailRequest.currency,
      }).format(detailRequest.targetPrice);
    } catch (formatError) {
      return `${detailRequest.targetPrice.toFixed(2)} ${detailRequest.currency}`;
    }
  }, [language, detailRequest.currency, detailRequest.targetPrice]);

  const expiryDisplay = detailRequest.expiryAt
    ? new Date(detailRequest.expiryAt).toLocaleDateString(
        language === 'ar' ? 'ar-SA' : 'en-US',
        { dateStyle: 'medium' }
      )
    : '—';

  const updatedAtDisplay = new Date(detailRequest.updatedAt).toLocaleString(
    language === 'ar' ? 'ar-SA' : 'en-US',
    { dateStyle: 'medium', timeStyle: 'short' }
  );

  const typeLabels: Record<string, { en: string; ar: string }> = {
    buy: { en: 'Buy request', ar: 'طلب شراء' },
    sell: { en: 'Sell request', ar: 'طلب بيع' },
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.35)',
        display: 'flex',
        justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
        alignItems: 'stretch',
        zIndex: 50,
        direction,
      }}
      onClick={onClose}
    >
      <aside
        onClick={event => event.stopPropagation()}
        style={{
          width: 'min(420px, 90vw)',
          background: 'var(--color-background-surface)',
          padding: '2rem',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '1.6rem',
                color: 'var(--color-text-primary)',
              }}
            >
              {tRequestList('details.title', language)}
            </h2>
            <p
              style={{
                margin: '0.35rem 0 0',
                color: 'var(--color-text-secondary)',
                fontSize: '0.95rem',
              }}
            >
              {typeLabels[detailRequest.type][language]}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              borderRadius: '999px',
              width: '2.5rem',
              height: '2.5rem',
              fontSize: '1.2rem',
              cursor: 'pointer',
              fontWeight: 700,
            }}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        {isLoading && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'var(--color-background-base)',
              borderRadius: '0.85rem',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem',
            }}
          >
            {tRequestList('details.loading', language)}
          </div>
        )}

        {isError && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#FEF2F2',
              borderRadius: '0.85rem',
              color: '#B91C1C',
              fontSize: '0.9rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <span>{tRequestList('details.error', language)}</span>
            <button
              type="button"
              onClick={() => refetch()}
              style={{
                border: 'none',
                background: '#B91C1C',
                color: 'var(--color-text-on-brand)',
                borderRadius: '0.65rem',
                padding: '0.35rem 0.9rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {'\u21BB'}
            </button>
          </div>
        )}

        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <RequestStatusBadge status={detailRequest.status} />
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            {getStatusLabel(detailRequest.status, language)}
          </div>
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '1rem',
              margin: 0,
            }}
          >
            <DetailItem
              title={tRequestList('details.amount', language)}
              value={formattedAmount}
            />
            <DetailItem
              title={tRequestList('details.targetPrice', language)}
              value={targetPriceDisplay}
            />
            <DetailItem
              title={tRequestList('details.expiry', language)}
              value={expiryDisplay}
            />
            <DetailItem
              title={tRequestList('details.lastUpdate', language)}
              value={updatedAtDisplay}
            />
          </dl>
        </section>

        {detailRequest.notes && (
          <section
            style={{
              background: 'var(--color-background-surface)',
              borderRadius: '1rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: 'var(--color-text-primary)',
            }}
          >
            <strong>{tRequestList('details.notes', language)}</strong>
            <p
              style={{
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {detailRequest.notes}
            </p>
          </section>
        )}

        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <strong>{tRequestList('details.attachments', language)}</strong>
          {attachments.length === 0 ? (
            <span
              style={{
                color: 'var(--color-brand-secondary-muted)',
                fontSize: '0.9rem',
              }}
            >
              {tRequestList('details.noAttachments', language)}
            </span>
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
              {attachments.map(attachment => (
                <li
                  key={attachment.id}
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.85rem',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{attachment.filename}</span>
                    <span
                      style={{
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {attachment.mimeType ?? '\u2014'} {'\u2022'}{' '}
                      {attachment.size != null
                        ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`
                        : '\u2014'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (attachment.downloadUrl) {
                        window.open(attachment.downloadUrl, '_blank', 'noopener');
                      }
                    }}
                    disabled={!attachment.downloadUrl}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--color-brand-secondary-soft)',
                      background: attachment.downloadUrl ? '#FFFFFF' : 'var(--color-background-surface)',
                      color: 'var(--color-brand-accent-deep)',
                      cursor: attachment.downloadUrl ? 'pointer' : 'not-allowed',
                      fontWeight: 600,
                    }}
                  >
                    {tRequestList('details.download', language)}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <strong>{tRequestList('details.timeline', language)}</strong>
          {isTimelineLoading ? (
            <NotificationSkeleton count={3} />
          ) : isTimelineError ? (
            <div
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '0.85rem',
                background: '#FEF3C7',
                color: '#92400E',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.9rem',
              }}
            >
              <span>
                {timelineError instanceof Error
                  ? timelineError.message
                  : tRequestList('details.error', language)}
              </span>
              <button
                type="button"
                onClick={() => refetchTimeline()}
                style={{
                  border: 'none',
                  background: '#92400E',
                  color: '#FFFFFF',
                  borderRadius: '0.65rem',
                  padding: '0.4rem 0.9rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ⟳
              </button>
            </div>
          ) : (
            <RequestTimeline
              entries={timelineItems}
              language={language}
              direction={direction}
            />
          )}
        </section>

        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <strong>{tRequestList('details.comments', language)}</strong>
          {comments.length === 0 ? (
            <span
              style={{
                color: 'var(--color-brand-secondary-muted)',
                fontSize: '0.9rem',
              }}
            >
              {tRequestList('details.noComments', language)}
            </span>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              {comments.map(comment => (
                <li
                  key={comment.id}
                  style={{
                    background: 'var(--color-background-surface)',
                    borderRadius: '0.85rem',
                    padding: '0.75rem 1rem',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <div
                    style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.8rem',
                    }}
                  >
                    {new Date(comment.createdAt).toLocaleString(
                      language === 'ar' ? 'ar-SA' : 'en-US',
                      { dateStyle: 'medium', timeStyle: 'short' }
                    )}
                  </div>
                  <div style={{ marginTop: '0.35rem' }}>{comment.note}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>,
    container
  ) as React.ReactNode;
}

interface DetailItemProps {
  title: string;
  value: string;
}

function DetailItem({ title, value }: DetailItemProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      <dt
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-brand-secondary-muted)',
          fontWeight: 600,
        }}
      >
        {title}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: '1rem',
          color: 'var(--color-text-primary)',
          fontWeight: 600,
        }}
      >
        {value}
      </dd>
    </div>
  );
}




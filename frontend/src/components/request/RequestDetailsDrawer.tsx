import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import type { InvestorRequest } from '../../types/request';
import { RequestStatusBadge } from './RequestStatusBadge';
import { tRequestList } from '../../locales/requestList';
import { getStatusLabel } from '../../utils/requestStatus';
import { useInvestorRequestDetail } from '../../hooks/useInvestorRequestDetail';

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

  const detailRequest = data?.request ?? request;
  const attachments = data?.attachments ?? [];
  const events = data?.events ?? [];
  const comments = data?.comments ?? [];

  const formattedAmount = useMemo(() => {
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
    if (detailRequest.targetPrice == null) return '—';
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

  const typeLabels = {
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
          background: '#FFFFFF',
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
                color: '#0F172A',
              }}
            >
              {tRequestList('details.title', language)}
            </h2>
            <p
              style={{
                margin: '0.35rem 0 0',
                color: '#64748B',
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
              background: '#E2E8F0',
              color: '#0F172A',
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
              background: '#F1F5F9',
              borderRadius: '0.85rem',
              color: '#475569',
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
                color: '#FFFFFF',
                borderRadius: '0.65rem',
                padding: '0.35rem 0.9rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ⟳
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
              color: '#475569',
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
              background: '#F8FAFC',
              borderRadius: '1rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              color: '#0F172A',
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
                color: '#94A3B8',
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
                    border: '1px solid #E2E8F0',
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
                      color: '#0F172A',
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>{attachment.filename}</span>
                    <span
                      style={{
                        color: '#64748B',
                        fontSize: '0.85rem',
                      }}
                    >
                      {attachment.mimeType ?? '—'} •{' '}
                      {attachment.size != null
                        ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`
                        : '—'}
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
                      border: '1px solid #CBD5F5',
                      background: attachment.downloadUrl ? '#FFFFFF' : '#F8FAFC',
                      color: '#1E3A5F',
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
          <div
            style={{
              borderLeft:
                direction === 'rtl' ? 'none' : '2px solid #E2E8F0',
              borderRight:
                direction === 'rtl' ? '2px solid #E2E8F0' : 'none',
              padding: direction === 'rtl' ? '0 1rem 0 0.5rem' : '0 0.5rem 0 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {events.length === 0 ? (
              <span
                style={{
                  color: '#94A3B8',
                  fontSize: '0.9rem',
                }}
              >
                {tRequestList('details.noEvents', language)}
              </span>
            ) : (
              events.map(event => (
                <article
                  key={event.id}
                  style={{
                    position: 'relative',
                    paddingLeft: direction === 'rtl' ? '0' : '1rem',
                    paddingRight: direction === 'rtl' ? '1rem' : '0',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '0.35rem',
                      left: direction === 'rtl' ? 'auto' : '-1.25rem',
                      right: direction === 'rtl' ? '-1.25rem' : 'auto',
                      width: '0.8rem',
                      height: '0.8rem',
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
                    {getStatusLabel(
                      (event.toStatus as InvestorRequest['status']) ?? 'draft',
                      language
                    )}
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
              ))
            )}
          </div>
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
                color: '#94A3B8',
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
                    background: '#F8FAFC',
                    borderRadius: '0.85rem',
                    padding: '0.75rem 1rem',
                    color: '#0F172A',
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
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>,
    container
  );
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
          color: '#94A3B8',
          fontWeight: 600,
        }}
      >
        {title}
      </dt>
      <dd
        style={{
          margin: 0,
          fontSize: '1rem',
          color: '#0F172A',
          fontWeight: 600,
        }}
      >
        {value}
      </dd>
    </div>
  );
}


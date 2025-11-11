import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useAdminRequestDetail } from '../hooks/useAdminRequestDetail';
import { tAdminRequests } from '../locales/adminRequests';
import { RequestStatusBadge } from '../components/request/RequestStatusBadge';
import { getStatusLabel } from '../utils/requestStatus';
import { apiClient } from '../utils/api-client';
import { useRequestTimeline } from '../hooks/useRequestTimeline';
import { RequestTimeline } from '../components/request/RequestTimeline';

const queryClient = new QueryClient();

type WorkflowStatus = 'screening' | 'compliance_review';

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
  const [decisionNote, setDecisionNote] = useState('');
  const [settlementReference, setSettlementReference] = useState('');
  const [newComment, setNewComment] = useState('');
  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    error: timelineError,
    refetch: refetchTimeline,
  } = useRequestTimeline(requestId ?? undefined, 'admin');

  const approveMutation = useMutation({
    mutationFn: async (payload: { note?: string }) => {
      if (!requestId) {
        throw new Error('Request id is missing');
      }
      return apiClient(`/admin/requests/${requestId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      pushToast({
        message: tAdminRequests('decision.approvedSuccess', language),
        variant: 'success',
      });
      setDecisionNote('');
      refetch();
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminRequests('table.error', language);
      pushToast({
        message,
        variant: 'error',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (payload: { note?: string }) => {
      if (!requestId) {
        throw new Error('Request id is missing');
      }
      return apiClient(`/admin/requests/${requestId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      pushToast({
        message: tAdminRequests('decision.rejectedSuccess', language),
        variant: 'success',
      });
      setDecisionNote('');
      refetch();
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminRequests('table.error', language);
      pushToast({
        message,
        variant: 'error',
      });
    },
  });

  const requestInfoMutation = useMutation({
    mutationFn: async (payload: { message: string }) => {
      if (!requestId) {
        throw new Error('Request id is missing');
      }
      return apiClient(`/admin/requests/${requestId}/request-info`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      pushToast({
        message: tAdminRequests('decision.infoRequestedSuccess', language),
        variant: 'success',
      });
      setDecisionNote('');
      refetch();
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminRequests('table.error', language);
      pushToast({
        message,
        variant: 'error',
      });
    },
  });

  const startSettlementMutation = useMutation({
    mutationFn: async (payload: { reference: string; note?: string }) => {
      if (!requestId) {
        throw new Error('Request id is missing');
      }
      return apiClient(`/admin/requests/${requestId}/settle`, {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'start',
          reference: payload.reference,
          note: payload.note,
        }),
      });
    },
    onSuccess: () => {
      pushToast({
        message: tAdminRequests('decision.settlementStartedSuccess', language),
        variant: 'success',
      });
      setDecisionNote('');
      refetch();
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminRequests('table.error', language);
      pushToast({
        message,
        variant: 'error',
      });
    },
  });

const completeSettlementMutation = useMutation({
  mutationFn: async (payload: { reference: string; note?: string }) => {
      if (!requestId) {
        throw new Error('Request id is missing');
      }
      return apiClient(`/admin/requests/${requestId}/settle`, {
        method: 'PATCH',
        body: JSON.stringify({
          stage: 'complete',
          reference: payload.reference,
          note: payload.note,
        }),
      });
    },
    onSuccess: () => {
      pushToast({
        message: tAdminRequests('decision.settlementCompletedSuccess', language),
        variant: 'success',
      });
      setDecisionNote('');
      refetch();
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminRequests('table.error', language);
      pushToast({
        message,
        variant: 'error',
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { status: WorkflowStatus; note?: string }) => {
      if (!requestId) {
        throw new Error('Request id is missing');
      }
      return apiClient(`/admin/requests/${requestId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (_data, variables) => {
      const successKey =
        variables.status === 'screening'
          ? 'decision.screeningSuccess'
          : 'decision.complianceSuccess';
      pushToast({
        message: tAdminRequests(successKey, language),
        variant: 'success',
      });
      refetch();
      refetchTimeline();
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminRequests('table.error', language);
      pushToast({
        message,
        variant: 'error',
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (payload: { comment: string }) => {
      if (!requestId) {
        throw new Error('Request id is missing');
      }
      return apiClient(`/admin/requests/${requestId}/comments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      pushToast({
        message: tAdminRequests('comment.addSuccess', language),
        variant: 'success',
      });
      setNewComment('');
      refetch();
    },
    onError: (mutationError: unknown) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminRequests('comment.addError', language);
      pushToast({
        message,
        variant: 'error',
      });
    },
  });

  useEffect(() => {
    if (!isError) return;
    const message =
      error instanceof Error
        ? error.message
        : tAdminRequests('table.error', language);
    pushToast({
      message,
      variant: 'error',
    });
  }, [isError, error, pushToast, language]);

  useEffect(() => {
    if (!data?.request?.settlement) {
      setSettlementReference('');
      return;
    }

    setSettlementReference(data.request.settlement.reference ?? '');
  }, [data?.request?.settlement?.reference]);

  const request = data?.request;
  const settlement = request?.settlement;
  const timelineItems = timelineData?.items ?? [];
  const isDecisionFinal = request
    ? request.status === 'approved' || request.status === 'rejected'
    : false;
  const isActionBusy =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    requestInfoMutation.isPending ||
    startSettlementMutation.isPending ||
    completeSettlementMutation.isPending ||
    updateStatusMutation.isPending;
  const isCommentBusy = addCommentMutation.isPending;

  const amountFormatted = request
    ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: request.currency ?? 'SAR',
      }).format(request.amount)
    : '\u2014';

  const formatDateTime = (value?: string | null) => {
    if (!value) return '\u2014';
    try {
      return new Date(value).toLocaleString(
        language === 'ar' ? 'ar-SA' : 'en-US',
        { dateStyle: 'medium', timeStyle: 'short' }
      );
    } catch {
      return value;
    }
  };

  const attachmentCategoryLabel = (category?: string) => {
    if (category === 'settlement') {
      return tAdminRequests('detail.attachmentCategory.settlement', language);
    }
    return tAdminRequests('detail.attachmentCategory.general', language);
  };

  const canMoveToScreening =
    request?.status === 'submitted' || request?.status === 'pending_info';
  const canMoveToCompliance =
    request?.status === 'screening' || request?.status === 'pending_info';

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        minHeight: '100vh',
        background: 'var(--color-background-base)',
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
            color: 'var(--color-brand-primary-strong)',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.95rem',
            alignSelf: direction === 'rtl' ? 'flex-end' : 'flex-start',
          }}
        >
          {'\u2190'} {tAdminRequests('detail.back', language)}
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
              color: 'var(--color-text-primary)',
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
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            #{request.requestNumber} Â·{' '}
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
                      '\u2014',
                  },
                  {
                    label: 'Email',
                    value: request.investor?.email ?? '\u2014',
                  },
                  {
                    label: 'Language',
                    value: request.investor?.language ?? '\u2014',
                  },
                ]}
              />
            )}
          </Card>

          <Card>
          <CardTitle>{tAdminRequests('detail.timeline', language)}</CardTitle>
          {isTimelineLoading ? (
            <Skeleton />
          ) : isTimelineError ? (
            <div
              style={{
                padding: '0.95rem 1.1rem',
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
                  : tAdminRequests('table.error', language)}
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
          </Card>

          <Card>
            <CardTitle>{tAdminRequests('detail.settlement', language)}</CardTitle>
            {isLoading || !request ? (
              <Skeleton />
            ) : (
              <>
                <InfoGrid
                  items={[
                    {
                      label: tAdminRequests(
                        'detail.settlementReference',
                        language
                      ),
                      value: settlement?.reference?.trim() || '\u2014',
                    },
                    {
                      label: tAdminRequests(
                        'detail.settlementStartedAt',
                        language
                      ),
                      value: formatDateTime(settlement?.startedAt),
                    },
                    {
                      label: tAdminRequests(
                        'detail.settlementCompletedAt',
                        language
                      ),
                      value: formatDateTime(settlement?.completedAt),
                    },
                  ]}
                />
                {settlement?.notes ? (
                  <p
                    style={{
                      marginTop: '0.75rem',
                      color: 'var(--color-text-secondary)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {settlement.notes}
                  </p>
                ) : null}
              </>
            )}
          </Card>

          <Card>
            <CardTitle>{tAdminRequests('detail.comments', language)}</CardTitle>
            {isLoading || !data ? (
              <Skeleton />
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data.comments.length === 0 ? (
                    <EmptyState message={tAdminRequests('detail.noComments', language)} />
                  ) : (
                    data.comments.map(comment => {
                      const actorLabel = comment.actor
                        ? comment.actor.preferredName ||
                          comment.actor.fullName ||
                          comment.actor.email ||
                          tAdminRequests('detail.commentUnknownActor', language)
                        : tAdminRequests('detail.commentUnknownActor', language);
                      return (
                        <div
                          key={comment.id}
                          style={{
                            background: 'var(--color-background-surface)',
                            borderRadius: '0.85rem',
                            padding: '0.75rem 1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '0.75rem',
                            }}
                          >
                            <strong style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                              {actorLabel}
                            </strong>
                            <span
                              style={{
                                color: 'var(--color-text-secondary)',
                                fontSize: '0.8rem',
                              }}
                            >
                              {new Date(comment.createdAt).toLocaleString(
                                language === 'ar' ? 'ar-SA' : 'en-US',
                                { dateStyle: 'medium', timeStyle: 'short' }
                              )}
                            </span>
                          </div>
                          <div
                            style={{
                              color: 'var(--color-text-secondary)',
                              lineHeight: 1.5,
                              whiteSpace: 'pre-wrap',
                            }}
                          >
                            {comment.note}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <div
                  style={{
                    marginTop: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <textarea
                    value={newComment}
                    onChange={event => setNewComment(event.target.value)}
                    maxLength={2000}
                    placeholder={tAdminRequests('detail.commentPlaceholder', language)}
                    style={{ ...textAreaStyle, direction, minHeight: '160px' }}
                  />
                  <ActionButton
                    label={tAdminRequests('detail.commentSubmit', language)}
                    onClick={() => {
                      const trimmed = newComment.trim();
                      if (!trimmed) {
                        pushToast({
                          message: tAdminRequests('comment.required', language),
                          variant: 'error',
                        });
                        return;
                      }
                      addCommentMutation.mutate({ comment: trimmed });
                    }}
                    disabled={isCommentBusy}
                    loading={isCommentBusy}
                  />
                </div>
              </>
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
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.85rem',
                      padding: '0.75rem 1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                    }}
                  >
                    <strong style={{ color: 'var(--color-text-primary)' }}>{attachment.filename}</strong>
                    <span
                      style={{
                        color: 'var(--color-brand-primary-strong)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {attachmentCategoryLabel(attachment.category)}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      {attachment.mimeType ?? '\u2014'} {'\u00B7'}{' '}
                      {attachment.size != null
                        ? `${(attachment.size / (1024 * 1024)).toFixed(2)} MB`
                        : '\u2014'}
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
              <textarea
                value={decisionNote}
                onChange={event => setDecisionNote(event.target.value)}
                maxLength={500}
                placeholder={tAdminRequests('decision.notePlaceholder', language)}
                style={{ ...textAreaStyle, direction }}
              />
              <label
                style={{
                  display: 'flex',
                  flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
                  justifyContent: direction === 'rtl' ? 'flex-end' : 'flex-start',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  color: 'var(--color-text-secondary)',
                  fontWeight: 600,
                }}
              >
                {tAdminRequests('decision.referenceLabel', language)}
              </label>
              <input
                type="text"
                value={settlementReference}
                onChange={event => setSettlementReference(event.target.value)}
                maxLength={120}
                placeholder={tAdminRequests('decision.referencePlaceholder', language)}
                style={{ ...inputStyle, direction }}
              />
              <ActionButton
                label={tAdminRequests('detail.moveToScreening', language)}
                variant="secondary"
                onClick={() =>
                  updateStatusMutation.mutate({
                    status: 'screening',
                    note: decisionNote.trim() ? decisionNote.trim() : undefined,
                  })
                }
                disabled={!canMoveToScreening || isActionBusy || !request}
                loading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'screening'}
              />
              <ActionButton
                label={tAdminRequests('detail.moveToCompliance', language)}
                variant="secondary"
                onClick={() =>
                  updateStatusMutation.mutate({
                    status: 'compliance_review',
                    note: decisionNote.trim() ? decisionNote.trim() : undefined,
                  })
                }
                disabled={!canMoveToCompliance || isActionBusy || !request}
                loading={updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'compliance_review'}
              />
              <ActionButton
                label={tAdminRequests('detail.approve', language)}
                onClick={() =>
                  approveMutation.mutate({
                    note: decisionNote.trim() ? decisionNote.trim() : undefined,
                  })
                }
                disabled={isDecisionFinal || isActionBusy || !request}
                loading={approveMutation.isPending}
              />
              <ActionButton
                label={tAdminRequests('detail.reject', language)}
                variant="danger"
                onClick={() =>
                  rejectMutation.mutate({
                    note: decisionNote.trim() ? decisionNote.trim() : undefined,
                  })
                }
                disabled={isDecisionFinal || isActionBusy || !request}
                loading={rejectMutation.isPending}
              />
              <ActionButton
                label={tAdminRequests('detail.requestInfoAction', language)}
                variant="secondary"
                onClick={() => {
                  const message = decisionNote.trim();
                  if (!message) {
                    pushToast({
                      message: tAdminRequests('decision.noteRequired', language),
                      variant: 'error',
                    });
                    return;
                  }
                  requestInfoMutation.mutate({ message });
                }}
                disabled={isActionBusy || !request}
                loading={requestInfoMutation.isPending}
              />
              {request?.status === 'approved' && (
                <ActionButton
                  label={tAdminRequests('detail.startSettlement', language)}
                  variant="secondary"
                  onClick={() => {
                    const reference = settlementReference.trim();
                    if (!reference) {
                      pushToast({
                        message: tAdminRequests('decision.referenceRequired', language),
                        variant: 'error',
                      });
                      return;
                    }
                    startSettlementMutation.mutate({
                      reference,
                      note: decisionNote.trim() ? decisionNote.trim() : undefined,
                    });
                  }}
                  disabled={isActionBusy || !request}
                  loading={startSettlementMutation.isPending}
                />
              )}
              {request?.status === 'settling' && (
                <ActionButton
                  label={tAdminRequests('detail.completeSettlement', language)}
                  variant="secondary"
                  onClick={() => {
                    const reference = settlementReference.trim();
                    if (!reference) {
                      pushToast({
                        message: tAdminRequests('decision.referenceRequired', language),
                        variant: 'error',
                      });
                      return;
                    }
                    completeSettlementMutation.mutate({
                      reference,
                      note: decisionNote.trim() ? decisionNote.trim() : undefined,
                    });
                  }}
                  disabled={isActionBusy || !request}
                  loading={completeSettlementMutation.isPending}
                />
              )}
            </div>
            <p
              style={{
                marginTop: '0.75rem',
                color: 'var(--color-brand-secondary-muted)',
                fontSize: '0.85rem',
              }}
            >
              {`* ${tAdminRequests('detail.noteHelper', language)}`}
            </p>
          </Card>

          <Card>
            <CardTitle>{tAdminRequests('detail.notes', language)}</CardTitle>
            {isLoading || !request ? (
              <Skeleton />
            ) : (
              <div
                style={{
                  background: 'var(--color-background-surface)',
                  borderRadius: '0.85rem',
                  padding: '0.75rem 1rem',
                  color: 'var(--color-text-primary)',
                  minHeight: '4rem',
                }}
              >
                {request.notes ?? '\u2014'}
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
          border: '1px solid var(--color-brand-secondary-soft)',
          background: 'var(--color-background-surface)',
          color: 'var(--color-brand-accent-deep)',
          fontWeight: 600,
          cursor: isFetching ? 'progress' : 'pointer',
        }}
      >
        {'\u21BB'}
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
        background: 'var(--color-background-surface)',
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
        color: 'var(--color-text-primary)',
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
          'linear-gradient(90deg, var(--color-background-base) 0%, var(--color-border) 50%, var(--color-background-base) 100%)',
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
        background: 'var(--color-background-surface)',
        color: 'var(--color-text-secondary)',
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
              color: 'var(--color-brand-secondary-muted)',
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
              color: 'var(--color-text-primary)',
            }}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const textAreaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '120px',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
  padding: '0.75rem 1rem',
  resize: 'vertical',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
  padding: '0.65rem 1rem',
};

function ActionButton({
  label,
  variant = 'primary',
  onClick,
  disabled = false,
  loading = false,
}: {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const colors: Record<typeof variant, string> = {
    primary: 'var(--color-brand-primary-strong)',
    secondary: 'var(--color-brand-primary-muted)',
    danger: '#DC2626',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '0.75rem 1.4rem',
        borderRadius: '0.85rem',
        border: 'none',
        background: colors[variant],
        color: 'var(--color-text-on-brand)',
        fontWeight: 700,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.6 : 1,
      }}
      disabled={disabled || loading}
    >
      {loading ? '…' : label}
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




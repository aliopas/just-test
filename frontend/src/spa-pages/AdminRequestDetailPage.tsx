import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminRequestDetailDirect } from '../hooks/useAdminRequestDetailDirect';
import {
  useApproveRequestMutationDirect,
  useRejectRequestMutationDirect,
  useMoveToScreeningMutationDirect,
} from '../hooks/useAdminRequestMutationsDirect';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { tAdminRequests } from '../locales/adminRequests';
import { RequestStatusBadge } from '../components/request/RequestStatusBadge';
import { getStatusLabel } from '../utils/requestStatus';
import type { RequestStatus } from '../types/request';

export function AdminRequestDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { language, direction } = useLanguage();

  // Note: in App Router we get the id from pathname (/admin/requests/[id])
  // but since this component is used via a wrapper page, we can read it from URL
  const requestId = typeof window !== 'undefined'
    ? window.location.pathname.split('/').pop() ?? null
    : searchParams.get('id');

  const { data, isLoading, isError, refetch } = useAdminRequestDetailDirect(requestId);
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  const request = data?.request;

  // Debug logging
  useEffect(() => {
    if (request) {
      console.log('[AdminRequestDetailPage] Request data:', {
        requestId,
        hasRequest: !!request,
        hasInvestor: !!request.investor,
        investorEmail: request.investor?.email,
        investorFullName: request.investor?.fullName,
        investorPreferredName: request.investor?.preferredName,
        investorPhone: request.investor?.phone,
        investorCountry: request.investor?.residencyCountry,
        fullInvestorData: request.investor,
      });
    }
  }, [request, requestId]);

  // Function to clear cache and refetch
  const handleClearCache = async () => {
    try {
      // Clear all queries related to admin requests
      queryClient.removeQueries({ queryKey: ['adminRequestsDirect'] });
      queryClient.removeQueries({ queryKey: ['adminRequestDetailDirect'] });
      queryClient.removeQueries({ queryKey: ['adminRequestReportDirect'] });
      
      // Refetch current request if refetch is available
      if (refetch) {
        await refetch();
      } else {
        // If refetch is not available, invalidate and let React Query refetch automatically
        queryClient.invalidateQueries({ queryKey: ['adminRequestDetailDirect', requestId] });
      }
      
      pushToast({
        message: language === 'ar' ? 'تم مسح الكاش وإعادة تحميل البيانات' : 'Cache cleared and data refreshed',
        variant: 'success',
      });
    } catch (error) {
      pushToast({
        message: language === 'ar' ? 'فشل مسح الكاش' : 'Failed to clear cache',
        variant: 'error',
      });
    }
  };

  // Mutations - فقط قبول، رفض، تحت المراجعة
  const approveMutation = useApproveRequestMutationDirect();
  const rejectMutation = useRejectRequestMutationDirect();
  const moveToScreeningMutation = useMoveToScreeningMutationDirect();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectNote, setRejectNote] = useState('');

  const goBack = () => {
    router.push('/admin/requests');
  };

  // Helper to check if transition is allowed
  const canTransition = (fromStatus: RequestStatus, toStatus: RequestStatus): boolean => {
    const stateMachine: Record<RequestStatus, RequestStatus[]> = {
      draft: ['submitted', 'screening', 'pending_info', 'compliance_review', 'approved', 'rejected'],
      submitted: ['screening', 'pending_info', 'compliance_review', 'approved', 'rejected'],
      screening: ['pending_info', 'compliance_review', 'approved', 'rejected'],
      pending_info: ['screening', 'compliance_review', 'approved', 'rejected'],
      compliance_review: ['approved', 'pending_info', 'rejected'],
      approved: ['settling', 'rejected'],
      settling: ['completed', 'rejected'],
      completed: [],
      rejected: [],
    };
    return stateMachine[fromStatus]?.includes(toStatus) ?? false;
  };

  // Get allowed actions for current status - فقط قبول، رفض، تحت المراجعة
  const getAllowedActions = (status: RequestStatus) => {
    const actions: Array<{ key: string; label: string; variant: 'primary' | 'danger' | 'secondary' }> = [];
    
    // فقط قبول، رفض، تحت المراجعة
    if (canTransition(status, 'approved')) {
      actions.push({
        key: 'approve',
        label: language === 'ar' ? 'قبول' : 'Approve',
        variant: 'primary',
      });
    }
    
    if (canTransition(status, 'rejected')) {
      actions.push({
        key: 'reject',
        label: language === 'ar' ? 'رفض' : 'Reject',
        variant: 'danger',
      });
    }
    
    if (canTransition(status, 'screening')) {
      actions.push({
        key: 'screening',
        label: language === 'ar' ? 'تحت المراجعة' : 'Under Review',
        variant: 'secondary',
      });
    }
    
    return actions;
  };

  const handleApprove = async () => {
    if (!requestId) return;
    
    try {
      await approveMutation.mutateAsync({ requestId });
      pushToast({
        message: language === 'ar' ? 'تمت الموافقة على الطلب بنجاح' : 'Request approved successfully',
        variant: 'success',
      });
    } catch (error) {
      pushToast({
        message: error instanceof Error ? error.message : (language === 'ar' ? 'فشلت الموافقة على الطلب' : 'Failed to approve request'),
        variant: 'error',
      });
    }
  };

  const handleReject = async () => {
    if (!requestId || !rejectNote.trim()) {
      pushToast({
        message: language === 'ar' ? 'يرجى إدخال سبب الرفض' : 'Please enter a rejection reason',
        variant: 'error',
      });
      return;
    }
    
    try {
      await rejectMutation.mutateAsync({ requestId, note: rejectNote });
      pushToast({
        message: language === 'ar' ? 'تم رفض الطلب بنجاح' : 'Request rejected successfully',
        variant: 'success',
      });
      setShowRejectDialog(false);
      setRejectNote('');
    } catch (error) {
      pushToast({
        message: error instanceof Error ? error.message : (language === 'ar' ? 'فشل رفض الطلب' : 'Failed to reject request'),
        variant: 'error',
      });
    }
  };

  const handleMoveToScreening = async () => {
    if (!requestId) return;
    
    try {
      await moveToScreeningMutation.mutateAsync({ requestId });
      pushToast({
        message: language === 'ar' ? 'تم نقل الطلب إلى المراجعة' : 'Request moved to screening',
        variant: 'success',
      });
    } catch (error) {
      pushToast({
        message: error instanceof Error ? error.message : (language === 'ar' ? 'فشل نقل الطلب' : 'Failed to move request'),
        variant: 'error',
      });
    }
  };

  const allowedActions = request ? getAllowedActions(request.status) : [];
  const isAnyMutationPending = 
    approveMutation.isPending ||
    rejectMutation.isPending ||
    moveToScreeningMutation.isPending;

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
              <button
                type="button"
                onClick={handleClearCache}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: palette.backgroundBase,
                  color: palette.textSecondary,
                  fontSize: typography.sizes.caption,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                title={language === 'ar' ? 'مسح الكاش وإعادة التحميل' : 'Clear cache and refresh'}
              >
                <span>🔄</span>
                <span>{language === 'ar' ? 'مسح الكاش' : 'Clear Cache'}</span>
              </button>
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
                  {request.type === 'partnership' && request.project && (
                    <InfoRow
                      label={language === 'ar' ? 'المشروع' : 'Project'}
                      value={language === 'ar' && request.project.nameAr 
                        ? request.project.nameAr 
                        : request.project.name}
                    />
                  )}
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
                      request.investor?.fullName ||
                      request.investor?.preferredName ||
                      request.investor?.email ||
                      '—'
                    }
                  />
                  <InfoRow
                    label="Email"
                    value={request.investor?.email || '—'}
                  />
                  <InfoRow
                    label={language === 'ar' ? 'الهاتف' : 'Phone'}
                    value={
                      request.investor?.phone
                        ? `${request.investor.phoneCc ? `+${request.investor.phoneCc} ` : ''}${request.investor.phone}`
                        : '—'
                    }
                  />
                  <InfoRow
                    label={language === 'ar' ? 'الدولة' : 'Country'}
                    value={request.investor?.residencyCountry || '—'}
                  />
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <InfoRow
                        label="Debug: Investor ID"
                        value={request.investor?.id || 'null'}
                      />
                      <InfoRow
                        label="Debug: Has Investor Data"
                        value={request.investor ? 'Yes' : 'No'}
                      />
                    </>
                  )}
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

              {/* Action Buttons */}
              {allowedActions.length > 0 && (
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
                      marginBottom: '1rem',
                      fontSize: typography.sizes.subheading,
                      fontWeight: typography.weights.semibold,
                      color: palette.textPrimary,
                    }}
                  >
                    {language === 'ar' ? 'إجراءات الطلب' : 'Request Actions'}
                  </h2>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    {allowedActions.map(action => {
                      if (action.key === 'approve') {
                        return (
                          <button
                            key={action.key}
                            type="button"
                            onClick={handleApprove}
                            disabled={isAnyMutationPending}
                            style={{
                              padding: '0.75rem 1.25rem',
                              borderRadius: radius.md,
                              border: 'none',
                              background: palette.success,
                              color: '#FFFFFF',
                              fontWeight: 600,
                              cursor: isAnyMutationPending ? 'not-allowed' : 'pointer',
                              opacity: isAnyMutationPending ? 0.6 : 1,
                              fontSize: typography.sizes.body,
                            }}
                          >
                            {approveMutation.isPending
                              ? (language === 'ar' ? 'جاري الموافقة...' : 'Approving...')
                              : action.label}
                          </button>
                        );
                      }
                      
                      if (action.key === 'reject') {
                        return (
                          <div key={action.key}>
                            <button
                              type="button"
                              onClick={() => setShowRejectDialog(true)}
                              disabled={isAnyMutationPending}
                              style={{
                                width: '100%',
                                padding: '0.75rem 1.25rem',
                                borderRadius: radius.md,
                                border: 'none',
                                background: palette.error,
                                color: '#FFFFFF',
                                fontWeight: 600,
                                cursor: isAnyMutationPending ? 'not-allowed' : 'pointer',
                                opacity: isAnyMutationPending ? 0.6 : 1,
                                fontSize: typography.sizes.body,
                              }}
                            >
                              {action.label}
                            </button>
                            {showRejectDialog && (
                              <div
                                style={{
                                  marginTop: '1rem',
                                  padding: '1rem',
                                  borderRadius: radius.md,
                                  background: palette.backgroundSurface,
                                  border: `1px solid ${palette.error}33`,
                                }}
                              >
                                <label
                                  style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    fontSize: typography.sizes.caption,
                                    fontWeight: 600,
                                    color: palette.textPrimary,
                                  }}
                                >
                                  {language === 'ar' ? 'سبب الرفض (مطلوب)' : 'Rejection Reason (Required)'}
                                </label>
                                <textarea
                                  value={rejectNote}
                                  onChange={e => setRejectNote(e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: radius.md,
                                    border: `1px solid ${palette.neutralBorderSoft}`,
                                    background: palette.backgroundBase,
                                    color: palette.textPrimary,
                                    fontSize: typography.sizes.body,
                                    minHeight: '100px',
                                    resize: 'vertical',
                                    fontFamily: 'inherit',
                                  }}
                                  placeholder={language === 'ar' ? 'أدخل سبب الرفض...' : 'Enter rejection reason...'}
                                />
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    marginTop: '0.75rem',
                                    justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShowRejectDialog(false);
                                      setRejectNote('');
                                    }}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      borderRadius: radius.md,
                                      border: `1px solid ${palette.neutralBorderSoft}`,
                                      background: palette.backgroundBase,
                                      color: palette.textPrimary,
                                      cursor: 'pointer',
                                      fontSize: typography.sizes.caption,
                                    }}
                                  >
                                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleReject}
                                    disabled={isAnyMutationPending || !rejectNote.trim()}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      borderRadius: radius.md,
                                      border: 'none',
                                      background: palette.error,
                                      color: '#FFFFFF',
                                      fontWeight: 600,
                                      cursor: isAnyMutationPending || !rejectNote.trim() ? 'not-allowed' : 'pointer',
                                      opacity: isAnyMutationPending || !rejectNote.trim() ? 0.6 : 1,
                                      fontSize: typography.sizes.caption,
                                    }}
                                  >
                                    {rejectMutation.isPending
                                      ? (language === 'ar' ? 'جاري الرفض...' : 'Rejecting...')
                                      : (language === 'ar' ? 'تأكيد الرفض' : 'Confirm Reject')}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      if (action.key === 'screening') {
                        return (
                          <button
                            key={action.key}
                            type="button"
                            onClick={handleMoveToScreening}
                            disabled={isAnyMutationPending}
                            style={{
                              padding: '0.75rem 1.25rem',
                              borderRadius: radius.md,
                              border: `1px solid ${palette.neutralBorderSoft}`,
                              background: palette.backgroundBase,
                              color: palette.textPrimary,
                              fontWeight: 600,
                              cursor: isAnyMutationPending ? 'not-allowed' : 'pointer',
                              opacity: isAnyMutationPending ? 0.6 : 1,
                              fontSize: typography.sizes.body,
                            }}
                          >
                            {moveToScreeningMutation.isPending
                              ? (language === 'ar' ? 'جاري النقل...' : 'Moving...')
                              : action.label}
                          </button>
                        );
                      }
                      
                      return null;
                    })}
                  </div>
                </div>
              )}
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

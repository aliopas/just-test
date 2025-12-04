import React, { FormEvent, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { tAdminRequests } from '../locales/adminRequests';
import type { AdminSignupRequestFilters, AdminSignupRequest } from '../types/admin-account-request';
import {
  useAdminAccountRequests,
  useApproveAccountRequestMutation,
  useRejectAccountRequestMutation,
} from '../hooks/useAdminAccountRequests';

export function AdminSignupRequestsPage() {
  const { language, direction } = useLanguage();

  const [filters, setFilters] = useState<AdminSignupRequestFilters>({
    page: 1,
    status: 'pending',
    search: '',
  });

  const { data, isLoading, isError, refetch } = useAdminAccountRequests(filters);
  const approveMutation = useApproveAccountRequestMutation();
  const rejectMutation = useRejectAccountRequestMutation();

  const requests = data?.requests ?? [];
  const meta = data?.meta ?? {
    page: filters.page ?? 1,
    limit: 20,
    total: 0,
    pageCount: 0,
    hasNext: false,
  };

  const [decisionNote, setDecisionNote] = useState('');

  const handleStatusFilterChange = (status: AdminSignupRequestFilters['status']) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  async function handleApprove(request: AdminSignupRequest, event: FormEvent) {
    event.preventDefault();
    await approveMutation.mutateAsync({
      id: request.id,
      note: decisionNote || undefined,
      sendInvite: true,
      locale: language,
    });
    setDecisionNote('');
  }

  async function handleReject(request: AdminSignupRequest, event: FormEvent) {
    event.preventDefault();
    await rejectMutation.mutateAsync({
      id: request.id,
      note: decisionNote || undefined,
    });
    setDecisionNote('');
  }

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
        <header>
          <h1
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {language === 'ar' ? 'طلبات إنشاء الحساب' : 'Signup requests'}
          </h1>
          <p
            style={{
              marginTop: '0.35rem',
              marginBottom: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {language === 'ar'
              ? 'راجع ووافق أو ارفض طلبات إنشاء حساب المستثمرين الواردة من صفحة التسجيل العامة.'
              : 'Review and approve or reject investor signup requests submitted from the public registration page.'}
          </p>
        </header>

        {/* Filters */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'الحالة' : 'Status'}
            </label>
            <select
              value={filters.status ?? 'pending'}
              onChange={event =>
                handleStatusFilterChange(
                  event.target.value === 'all'
                    ? 'all'
                    : (event.target.value as AdminSignupRequestFilters['status'])
                )
              }
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: '0.95rem',
              }}
            >
              <option value="all">{tAdminRequests('status.all', language)}</option>
              <option value="pending">{language === 'ar' ? 'قيد المراجعة' : 'Pending'}</option>
              <option value="approved">{tAdminRequests('status.approved', language)}</option>
              <option value="rejected">{tAdminRequests('status.rejected', language)}</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
            <label
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'بحث' : 'Search'}
            </label>
            <input
              type="search"
              placeholder={
                language === 'ar'
                  ? 'ابحث بالبريد الإلكتروني أو الاسم…'
                  : 'Search by email or name…'
              }
              value={filters.search ?? ''}
              onChange={event => handleSearchChange(event.target.value)}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.85rem',
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                fontSize: '0.95rem',
              }}
            />
          </div>
        </section>

        {/* List */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          {isLoading && (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {tAdminRequests('table.loading', language)}
            </div>
          )}

          {isError && !isLoading && (
            <div
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                color: palette.error,
                fontSize: typography.sizes.body,
              }}
            >
              {tAdminRequests('table.error', language)}
              <button
                type="button"
                onClick={() => refetch()}
                style={{
                  marginInlineStart: '0.75rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: radius.md,
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  cursor: 'pointer',
                }}
              >
                {'\u21BB'}
              </button>
            </div>
          )}

          {!isLoading && !isError && requests.length === 0 && (
            <div
              style={{
                padding: '2rem 1.5rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar'
                ? 'لا توجد طلبات إنشاء حساب حالياً.'
                : 'There are no signup requests at the moment.'}
            </div>
          )}

          {!isLoading && !isError && requests.length > 0 && (
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
              {requests.map(request => (
                <li
                  key={request.id}
                  style={{
                    borderRadius: radius.md,
                    border: `1px solid ${palette.neutralBorderMuted}`,
                    padding: '0.9rem 1rem',
                    background: request.status === 'pending'
                      ? palette.backgroundHighlight
                      : palette.backgroundBase,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <strong
                        style={{
                          fontSize: typography.sizes.body,
                          color: palette.textPrimary,
                        }}
                      >
                        {request.fullName || request.email}
                      </strong>
                      <span
                        style={{
                          fontSize: typography.sizes.caption,
                          color: palette.textSecondary,
                        }}
                      >
                        {request.email}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: typography.sizes.caption,
                        color: palette.textSecondary,
                      }}
                    >
                      {new Date(request.createdAt).toLocaleString(
                        language === 'ar' ? 'ar-SA' : 'en-US',
                        { dateStyle: 'medium', timeStyle: 'short' }
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontSize: typography.sizes.caption,
                        color: palette.textSecondary,
                      }}
                    >
                      {request.company || (language === 'ar' ? 'جهة فردية' : 'Individual')}
                    </span>
                    {request.message && (
                      <span
                        style={{
                          fontSize: typography.sizes.caption,
                          color: palette.textMuted,
                          maxWidth: '420px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {request.message}
                      </span>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <form
                      onSubmit={event => event.preventDefault()}
                      style={{
                        marginTop: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <textarea
                        rows={2}
                        placeholder={
                          language === 'ar'
                            ? 'أضف ملاحظة للقرار (اختياري)…'
                            : 'Add a decision note (optional)…'
                        }
                        value={decisionNote}
                        onChange={event => setDecisionNote(event.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 0.75rem',
                          borderRadius: radius.md,
                          border: `1px solid ${palette.neutralBorderMuted}`,
                          fontSize: typography.sizes.caption,
                          resize: 'vertical',
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="button"
                          onClick={event => handleReject(request, event)}
                          disabled={rejectMutation.isPending || approveMutation.isPending}
                          style={{
                            padding: '0.45rem 1.1rem',
                            borderRadius: radius.md,
                            border: '1px solid #DC2626',
                            background: '#FEF2F2',
                            color: '#B91C1C',
                            fontSize: typography.sizes.caption,
                            fontWeight: typography.weights.semibold,
                            cursor: 'pointer',
                          }}
                        >
                          {rejectMutation.isPending
                            ? language === 'ar'
                              ? 'جاري الرفض…'
                              : 'Rejecting…'
                            : tAdminRequests('detail.reject', language)}
                        </button>
                        <button
                          type="button"
                          onClick={event => handleApprove(request, event)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          style={{
                            padding: '0.45rem 1.1rem',
                            borderRadius: radius.md,
                            border: 'none',
                            background: palette.brandPrimaryStrong,
                            color: palette.textOnBrand,
                            fontSize: typography.sizes.caption,
                            fontWeight: typography.weights.semibold,
                            cursor: 'pointer',
                          }}
                        >
                          {approveMutation.isPending
                            ? language === 'ar'
                              ? 'جاري القبول…'
                              : 'Approving…'
                            : tAdminRequests('detail.approve', language)}
                        </button>
                      </div>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Simple pagination */}
        <section
          style={{
            padding: '0 0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: palette.textSecondary,
            fontSize: '0.9rem',
          }}
        >
          <span>
            {meta.total > 0
              ? `${meta.page} / ${meta.pageCount} (${meta.total})`
              : '0 / 0 (0)'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: meta.page <= 1
                  ? palette.backgroundSurface
                  : palette.backgroundBase,
                cursor: meta.page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {tAdminRequests('pagination.previous', language)}
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.hasNext}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: meta.hasNext
                  ? palette.backgroundBase
                  : palette.backgroundSurface,
                cursor: meta.hasNext ? 'pointer' : 'not-allowed',
              }}
            >
              {tAdminRequests('pagination.next', language)}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}


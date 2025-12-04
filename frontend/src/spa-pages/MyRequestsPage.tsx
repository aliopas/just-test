import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorRequests } from '../hooks/useInvestorRequests';
import { tRequestList } from '../locales/requestList';
import type { RequestStatus, RequestType } from '../types/request';
import { useNextNavigate } from '../utils/next-router';

export function MyRequestsPage() {
  const { language, direction } = useLanguage();
  const navigate = useNextNavigate();
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const [page, setPage] = useState(1);

  const { requests, meta, isLoading, isError, refetch } = useInvestorRequests({
    status: statusFilter,
    type: typeFilter,
    page,
  });

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
    const keyMap: Partial<Record<RequestStatus, string>> = {
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
    const key = keyMap[status];
    return key ? tRequestList(key as keyof typeof tRequestList, language) : status;
  };

  const getTypeLabel = (type: RequestType) => {
    const keyMap: Partial<Record<RequestType, string>> = {
      buy: 'filters.typeBuy',
      sell: 'filters.typeSell',
      partnership: 'filters.typePartnership',
      board_nomination: 'filters.typeBoardNomination',
      feedback: 'filters.typeFeedback',
    };
    const key = keyMap[type];
    return key ? tRequestList(key as keyof typeof tRequestList, language) : type;
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
          maxWidth: '1400px',
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
            <h1
              style={{
                margin: 0,
                fontSize: typography.sizes.heading,
                fontWeight: typography.weights.bold,
                color: palette.textPrimary,
              }}
            >
              {tRequestList('pageTitle', language)}
            </h1>
            <p
              style={{
                margin: '0.5rem 0 0 0',
                fontSize: typography.sizes.body,
                color: palette.textSecondary,
              }}
            >
              {tRequestList('pageSubtitle', language)}
            </p>
          </div>
          <button
            onClick={() => navigate('/requests/new')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: radius.md,
              background: palette.brandPrimary,
              color: palette.textOnBrand,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {tRequestList('emptyState.cta', language)}
          </button>
        </header>

        {/* Filters */}
        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            padding: '1rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          {/* Status filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: 600,
                color: palette.textPrimary,
              }}
            >
              {tRequestList('table.status', language)}
            </label>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as RequestStatus | 'all');
                setPage(1);
              }}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderSoft}`,
                background: palette.backgroundBase,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
                cursor: 'pointer',
                minWidth: '180px',
              }}
            >
              <option value="all">{tRequestList('filters.all', language)}</option>
              <option value="draft">{tRequestList('filters.draft', language)}</option>
              <option value="submitted">
                {tRequestList('filters.submitted', language)}
              </option>
              <option value="screening">
                {tRequestList('filters.screening', language)}
              </option>
              <option value="pending_info">
                {tRequestList('filters.pendingInfo', language)}
              </option>
              <option value="compliance_review">
                {tRequestList('filters.complianceReview', language)}
              </option>
              <option value="approved">
                {tRequestList('filters.approved', language)}
              </option>
              <option value="rejected">
                {tRequestList('filters.rejected', language)}
              </option>
              <option value="settling">
                {tRequestList('filters.settling', language)}
              </option>
              <option value="completed">
                {tRequestList('filters.completed', language)}
              </option>
            </select>
          </div>

          {/* Type filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label
              style={{
                fontSize: typography.sizes.caption,
                fontWeight: 600,
                color: palette.textPrimary,
              }}
            >
              {tRequestList('table.type', language)}
            </label>
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value as RequestType | 'all');
                setPage(1);
              }}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderSoft}`,
                background: palette.backgroundBase,
                color: palette.textPrimary,
                fontSize: typography.sizes.body,
                cursor: 'pointer',
                minWidth: '180px',
              }}
            >
              <option value="all">{tRequestList('filters.typeAll', language)}</option>
              <option value="buy">{tRequestList('filters.typeBuy', language)}</option>
              <option value="sell">{tRequestList('filters.typeSell', language)}</option>
              <option value="partnership">
                {tRequestList('filters.typePartnership', language)}
              </option>
              <option value="board_nomination">
                {tRequestList('filters.typeBoardNomination', language)}
              </option>
              <option value="feedback">
                {tRequestList('filters.typeFeedback', language)}
              </option>
            </select>
          </div>
        </section>

        {/* Content */}
        {isLoading ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: palette.textSecondary,
            }}
          >
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : isError ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: palette.error,
            }}
          >
            {language === 'ar'
              ? 'حدث خطأ أثناء تحميل الطلبات. حاول مرة أخرى.'
              : 'Failed to load requests. Please try again.'}
            <button
              onClick={() => refetch()}
              style={{
                marginTop: '1rem',
                padding: '0.65rem 1.25rem',
                borderRadius: radius.md,
                background: palette.brandPrimary,
                color: palette.textOnBrand,
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : requests.length === 0 ? (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: '0.5rem',
                fontSize: typography.sizes.subheading,
                color: palette.textPrimary,
              }}
            >
              {tRequestList('emptyState.title', language)}
            </h3>
            <p
              style={{
                margin: 0,
                marginBottom: '1.5rem',
                color: palette.textSecondary,
              }}
            >
              {tRequestList('emptyState.subtitle', language)}
            </p>
            <button
              onClick={() => navigate('/requests/new')}
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
              {tRequestList('emptyState.cta', language)}
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div
              style={{
                borderRadius: radius.lg,
                background: palette.backgroundBase,
                boxShadow: shadow.subtle,
                border: `1px solid ${palette.neutralBorderMuted}`,
                overflow: 'hidden',
              }}
            >
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: palette.backgroundSurface,
                        borderBottom: `1px solid ${palette.neutralBorderSoft}`,
                      }}
                    >
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'start',
                          fontSize: typography.sizes.caption,
                          fontWeight: 600,
                          color: palette.textSecondary,
                        }}
                      >
                        {tRequestList('table.requestNumber', language)}
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'start',
                          fontSize: typography.sizes.caption,
                          fontWeight: 600,
                          color: palette.textSecondary,
                        }}
                      >
                        {tRequestList('table.type', language)}
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'start',
                          fontSize: typography.sizes.caption,
                          fontWeight: 600,
                          color: palette.textSecondary,
                        }}
                      >
                        {tRequestList('table.amount', language)}
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'start',
                          fontSize: typography.sizes.caption,
                          fontWeight: 600,
                          color: palette.textSecondary,
                        }}
                      >
                        {tRequestList('table.status', language)}
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'start',
                          fontSize: typography.sizes.caption,
                          fontWeight: 600,
                          color: palette.textSecondary,
                        }}
                      >
                        {tRequestList('table.updatedAt', language)}
                      </th>
                      <th
                        style={{
                          padding: '1rem',
                          textAlign: 'start',
                          fontSize: typography.sizes.caption,
                          fontWeight: 600,
                          color: palette.textSecondary,
                        }}
                      >
                        {/* Actions column */}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(request => (
                      <tr
                        key={request.id}
                        style={{
                          borderBottom: `1px solid ${palette.neutralBorderMuted}`,
                          cursor: 'pointer',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = palette.backgroundSurface;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        onClick={() => navigate(`/requests/${request.id}`)}
                      >
                        <td
                          style={{
                            padding: '1rem',
                            fontSize: typography.sizes.body,
                            color: palette.textPrimary,
                            fontWeight: 600,
                          }}
                        >
                          #{request.requestNumber}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            fontSize: typography.sizes.body,
                            color: palette.textPrimary,
                          }}
                        >
                          {getTypeLabel(request.type)}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            fontSize: typography.sizes.body,
                            color: palette.textPrimary,
                          }}
                        >
                          {formatCurrency(request.amount, request.currency)}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            fontSize: typography.sizes.body,
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.35rem 0.75rem',
                              borderRadius: radius.pill,
                              background: `${getStatusColor(request.status)}20`,
                              color: getStatusColor(request.status),
                              fontSize: typography.sizes.caption,
                              fontWeight: 600,
                            }}
                          >
                            {getStatusLabel(request.status)}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            fontSize: typography.sizes.caption,
                            color: palette.textSecondary,
                          }}
                        >
                          {formatDateTime(request.updatedAt)}
                        </td>
                        <td
                          style={{
                            padding: '1rem',
                            fontSize: typography.sizes.body,
                            color: palette.brandPrimary,
                          }}
                        >
                          →
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {meta.pageCount > 1 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: radius.md,
                    background: page === 1 ? palette.neutralBorderMuted : palette.brandPrimary,
                    color: page === 1 ? palette.textSecondary : palette.textOnBrand,
                    border: 'none',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    opacity: page === 1 ? 0.6 : 1,
                  }}
                >
                  {tRequestList('pagination.previous', language)}
                </button>
                <span
                  style={{
                    fontSize: typography.sizes.body,
                    color: palette.textSecondary,
                  }}
                >
                  {language === 'ar'
                    ? `صفحة ${page} من ${meta.pageCount}`
                    : `Page ${page} of ${meta.pageCount}`}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(meta.pageCount, p + 1))}
                  disabled={!meta.hasNext}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: radius.md,
                    background: !meta.hasNext ? palette.neutralBorderMuted : palette.brandPrimary,
                    color: !meta.hasNext ? palette.textSecondary : palette.textOnBrand,
                    border: 'none',
                    cursor: !meta.hasNext ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    opacity: !meta.hasNext ? 0.6 : 1,
                  }}
                >
                  {tRequestList('pagination.next', language)}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

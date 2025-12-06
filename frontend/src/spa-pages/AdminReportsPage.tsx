import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useAdminRequestReportDirect } from '../hooks/useAdminRequestReportDirect';
import type { AdminRequestReportFilters } from '../types/admin-reports';
import type { RequestStatus, RequestType } from '../types/request';

export function AdminReportsPage() {
  const { language, direction } = useLanguage();

  const [filters, setFilters] = useState<AdminRequestReportFilters>({
    status: 'all',
    type: 'all',
  });

  const { data, isLoading, isError, refetch } = useAdminRequestReportDirect(filters);

  const requests = data?.requests ?? [];

  const handleFilterChange = (key: keyof AdminRequestReportFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleExport = () => {
    if (!data) return;

    const csv = [
      [
        language === 'ar' ? 'رقم الطلب' : 'Request Number',
        language === 'ar' ? 'الحالة' : 'Status',
        language === 'ar' ? 'النوع' : 'Type',
        language === 'ar' ? 'المبلغ' : 'Amount',
        language === 'ar' ? 'العملة' : 'Currency',
        language === 'ar' ? 'البريد الإلكتروني للمستثمر' : 'Investor Email',
        language === 'ar' ? 'اسم المستثمر' : 'Investor Name',
        language === 'ar' ? 'تاريخ الإنشاء' : 'Created At',
      ].join(','),
      ...requests.map((req) =>
        [
          req.requestNumber,
          req.status,
          req.type,
          req.amount,
          req.currency,
          req.investorEmail || '',
          req.investorName || '',
          req.createdAt,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `requests-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <header>
          <h1
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {language === 'ar' ? 'التقارير' : 'Reports'}
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
              ? 'تقرير شامل عن جميع الطلبات مع إمكانية التصدير.'
              : 'Comprehensive report of all requests with export capability.'}
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
              {language === 'ar' ? 'من تاريخ' : 'From Date'}
            </label>
            <input
              type="date"
              value={filters.from ?? ''}
              onChange={event => handleFilterChange('from', event.target.value)}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'إلى تاريخ' : 'To Date'}
            </label>
            <input
              type="date"
              value={filters.to ?? ''}
              onChange={event => handleFilterChange('to', event.target.value)}
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
              value={Array.isArray(filters.status) ? 'all' : (filters.status ?? 'all')}
              onChange={event =>
                handleFilterChange(
                  'status',
                  event.target.value === 'all' ? 'all' : [event.target.value as RequestStatus]
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
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="submitted">{language === 'ar' ? 'مقدم' : 'Submitted'}</option>
              <option value="approved">{language === 'ar' ? 'موافق عليه' : 'Approved'}</option>
              <option value="rejected">{language === 'ar' ? 'مرفوض' : 'Rejected'}</option>
              <option value="completed">{language === 'ar' ? 'مكتمل' : 'Completed'}</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'النوع' : 'Type'}
            </label>
            <select
              value={filters.type ?? 'all'}
              onChange={event =>
                handleFilterChange(
                  'type',
                  event.target.value === 'all' ? 'all' : (event.target.value as RequestType)
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
              <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
              <option value="buy">{language === 'ar' ? 'شراء' : 'Buy'}</option>
              <option value="sell">{language === 'ar' ? 'بيع' : 'Sell'}</option>
              <option value="partnership">{language === 'ar' ? 'شراكة' : 'Partnership'}</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'الحد الأدنى للمبلغ' : 'Min Amount'}
            </label>
            <input
              type="number"
              placeholder={language === 'ar' ? 'الحد الأدنى...' : 'Min...'}
              value={filters.minAmount ?? ''}
              onChange={event =>
                handleFilterChange('minAmount', event.target.value ? Number(event.target.value) : undefined)
              }
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label
              style={{
                fontSize: '0.85rem',
                color: palette.textSecondary,
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'الحد الأقصى للمبلغ' : 'Max Amount'}
            </label>
            <input
              type="number"
              placeholder={language === 'ar' ? 'الحد الأقصى...' : 'Max...'}
              value={filters.maxAmount ?? ''}
              onChange={event =>
                handleFilterChange('maxAmount', event.target.value ? Number(event.target.value) : undefined)
              }
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

          <button
            type="button"
            onClick={handleExport}
            disabled={!data || requests.length === 0}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '0.85rem',
              border: 'none',
              background: data && requests.length > 0 ? palette.brandPrimaryStrong : palette.backgroundAlt,
              color: data && requests.length > 0 ? palette.textOnBrand : palette.textMuted,
              cursor: data && requests.length > 0 ? 'pointer' : 'not-allowed',
              fontSize: typography.sizes.body,
              fontWeight: typography.weights.semibold,
            }}
          >
            {language === 'ar' ? 'تصدير CSV' : 'Export CSV'}
          </button>
        </section>

        {/* Summary */}
        {data && (
          <section
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {language === 'ar' ? 'ملخص التقرير' : 'Report Summary'}
                </h2>
                <p
                  style={{
                    marginTop: '0.35rem',
                    marginBottom: 0,
                    fontSize: typography.sizes.body,
                    color: palette.textSecondary,
                  }}
                >
                  {language === 'ar'
                    ? `إجمالي الطلبات: ${requests.length}`
                    : `Total Requests: ${requests.length}`}
                </p>
              </div>
              <div
                style={{
                  fontSize: typography.sizes.caption,
                  color: palette.textMuted,
                }}
              >
                {language === 'ar' ? 'تم الإنشاء في' : 'Generated at'}:{' '}
                {new Date(data.generatedAt).toLocaleString(
                  language === 'ar' ? 'ar-SA' : 'en-US',
                  { dateStyle: 'medium', timeStyle: 'short' }
                )}
              </div>
            </div>
          </section>
        )}

        {/* Table */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
            overflowX: 'auto',
          }}
        >
          {isLoading && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </div>
          )}

          {isError && !isLoading && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: palette.error,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar' ? 'حدث خطأ في جلب البيانات' : 'Error loading data'}
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
                padding: '2rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar' ? 'لا توجد طلبات' : 'No requests found'}
            </div>
          )}

          {!isLoading && !isError && requests.length > 0 && (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `2px solid ${palette.neutralBorderMuted}`,
                  }}
                >
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'start',
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: palette.textSecondary,
                    }}
                  >
                    {language === 'ar' ? 'رقم الطلب' : 'Request Number'}
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'start',
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: palette.textSecondary,
                    }}
                  >
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'start',
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: palette.textSecondary,
                    }}
                  >
                    {language === 'ar' ? 'النوع' : 'Type'}
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'start',
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: palette.textSecondary,
                    }}
                  >
                    {language === 'ar' ? 'المبلغ' : 'Amount'}
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'start',
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: palette.textSecondary,
                    }}
                  >
                    {language === 'ar' ? 'المستثمر' : 'Investor'}
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'start',
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: palette.textSecondary,
                    }}
                  >
                    {language === 'ar' ? 'تاريخ الإنشاء' : 'Created At'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    style={{
                      borderTop: `1px solid ${palette.neutralBorderMuted}`,
                    }}
                  >
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      {req.requestNumber}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      <span
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: radius.sm,
                          fontSize: typography.sizes.caption,
                          background:
                            req.status === 'approved' || req.status === 'completed'
                              ? palette.success + '22'
                              : req.status === 'rejected'
                                ? palette.error + '22'
                                : palette.warning + '22',
                          color:
                            req.status === 'approved' || req.status === 'completed'
                              ? palette.success
                              : req.status === 'rejected'
                                ? palette.error
                                : palette.warning,
                        }}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      {req.type}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      {req.amount > 0
                        ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
                            style: 'currency',
                            currency: req.currency,
                            maximumFractionDigits: 0,
                          }).format(req.amount)
                        : '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      {req.investorName || req.investorEmail || '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textSecondary,
                      }}
                    >
                      {new Date(req.createdAt).toLocaleDateString(
                        language === 'ar' ? 'ar-SA' : 'en-US'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

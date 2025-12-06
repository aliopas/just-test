import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import {
  useAdminInvestorsDirect,
  type InvestorListFilters,
  type InvestorListItem,
} from '../hooks/useAdminInvestorsDirect';

export function AdminInvestorsPage() {
  const { language, direction } = useLanguage();

  const [filters, setFilters] = useState<InvestorListFilters>({
    page: 1,
    limit: 25,
    status: 'all',
    kycStatus: 'all',
    search: '',
    sortBy: 'created_at',
    order: 'desc',
  });

  const { data, isLoading, isError, refetch } = useAdminInvestorsDirect(filters);

  const investors = data?.investors ?? [];
  const meta = data?.meta ?? {
    page: filters.page ?? 1,
    limit: filters.limit ?? 25,
    total: 0,
    pageCount: 0,
    hasNext: false,
    hasPrev: false,
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleStatusFilterChange = (status: InvestorListFilters['status']) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleKycStatusFilterChange = (kycStatus: InvestorListFilters['kycStatus']) => {
    setFilters(prev => ({ ...prev, kycStatus, page: 1 }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleSortChange = (sortBy: InvestorListFilters['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      order: prev.sortBy === sortBy && prev.order === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
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
            {language === 'ar' ? 'المستثمرون' : 'Investors'}
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
              ? 'إدارة قائمة المستثمرين المسجلين في النظام.'
              : 'Manage the list of registered investors in the system.'}
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
              {language === 'ar' ? 'حالة الحساب' : 'Account Status'}
            </label>
            <select
              value={filters.status ?? 'all'}
              onChange={event =>
                handleStatusFilterChange(
                  event.target.value === 'all'
                    ? 'all'
                    : (event.target.value as InvestorListFilters['status'])
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
              <option value="pending">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
              <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
              <option value="suspended">{language === 'ar' ? 'موقوف' : 'Suspended'}</option>
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
              {language === 'ar' ? 'حالة KYC' : 'KYC Status'}
            </label>
            <select
              value={filters.kycStatus ?? 'all'}
              onChange={event =>
                handleKycStatusFilterChange(
                  event.target.value === 'all'
                    ? 'all'
                    : (event.target.value as InvestorListFilters['kycStatus'])
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
              <option value="pending">{language === 'ar' ? 'قيد المراجعة' : 'Pending'}</option>
              <option value="in_review">{language === 'ar' ? 'قيد المراجعة' : 'In Review'}</option>
              <option value="approved">{language === 'ar' ? 'موافق عليه' : 'Approved'}</option>
              <option value="rejected">{language === 'ar' ? 'مرفوض' : 'Rejected'}</option>
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

          {!isLoading && !isError && investors.length === 0 && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar' ? 'لا يوجد مستثمرون' : 'No investors found'}
            </div>
          )}

          {!isLoading && !isError && investors.length > 0 && (
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
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSortChange('email')}
                  >
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    {filters.sortBy === 'email' && (filters.order === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'start',
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: palette.textSecondary,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSortChange('full_name')}
                  >
                    {language === 'ar' ? 'الاسم' : 'Name'}
                    {filters.sortBy === 'full_name' && (filters.order === 'asc' ? ' ↑' : ' ↓')}
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
                    {language === 'ar' ? 'حالة الحساب' : 'Account Status'}
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
                    {language === 'ar' ? 'حالة KYC' : 'KYC Status'}
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'start',
                      fontSize: typography.sizes.caption,
                      fontWeight: typography.weights.semibold,
                      color: palette.textSecondary,
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSortChange('created_at')}
                  >
                    {language === 'ar' ? 'تاريخ التسجيل' : 'Registration Date'}
                    {filters.sortBy === 'created_at' && (filters.order === 'asc' ? ' ↑' : ' ↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {investors.map((investor: InvestorListItem) => (
                  <tr
                    key={investor.id}
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
                      {investor.email}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      {investor.fullName || investor.preferredName || '—'}
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
                            investor.status === 'active'
                              ? palette.success + '22'
                              : investor.status === 'pending'
                                ? palette.warning + '22'
                                : palette.error + '22',
                          color:
                            investor.status === 'active'
                              ? palette.success
                              : investor.status === 'pending'
                                ? palette.warning
                                : palette.error,
                        }}
                      >
                        {investor.status === 'active'
                          ? language === 'ar'
                            ? 'نشط'
                            : 'Active'
                          : investor.status === 'pending'
                            ? language === 'ar'
                              ? 'قيد الانتظار'
                              : 'Pending'
                            : language === 'ar'
                              ? 'موقوف'
                              : 'Suspended'}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      {investor.kycStatus ? (
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: radius.sm,
                            fontSize: typography.sizes.caption,
                            background:
                              investor.kycStatus === 'approved'
                                ? palette.success + '22'
                                : investor.kycStatus === 'rejected'
                                  ? palette.error + '22'
                                  : palette.warning + '22',
                            color:
                              investor.kycStatus === 'approved'
                                ? palette.success
                                : investor.kycStatus === 'rejected'
                                  ? palette.error
                                  : palette.warning,
                          }}
                        >
                          {investor.kycStatus === 'approved'
                            ? language === 'ar'
                              ? 'موافق عليه'
                              : 'Approved'
                            : investor.kycStatus === 'rejected'
                              ? language === 'ar'
                                ? 'مرفوض'
                                : 'Rejected'
                              : investor.kycStatus === 'in_review'
                                ? language === 'ar'
                                  ? 'قيد المراجعة'
                                  : 'In Review'
                                : language === 'ar'
                                  ? 'قيد الانتظار'
                                  : 'Pending'}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textSecondary,
                      }}
                    >
                      {new Date(investor.createdAt).toLocaleDateString(
                        language === 'ar' ? 'ar-SA' : 'en-US'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {meta.pageCount > 1 && (
            <div
              style={{
                marginTop: '1.5rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <button
                type="button"
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={!meta.hasPrev}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: meta.hasPrev ? palette.backgroundSurface : palette.backgroundAlt,
                  color: meta.hasPrev ? palette.textPrimary : palette.textMuted,
                  cursor: meta.hasPrev ? 'pointer' : 'not-allowed',
                  fontSize: typography.sizes.body,
                }}
              >
                {language === 'ar' ? 'السابق' : 'Previous'}
              </button>
              <span
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: typography.sizes.body,
                  color: palette.textSecondary,
                }}
              >
                {language === 'ar' ? 'صفحة' : 'Page'} {meta.page} {language === 'ar' ? 'من' : 'of'}{' '}
                {meta.pageCount}
              </span>
              <button
                type="button"
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={!meta.hasNext}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: meta.hasNext ? palette.backgroundSurface : palette.backgroundAlt,
                  color: meta.hasNext ? palette.textPrimary : palette.textMuted,
                  cursor: meta.hasNext ? 'pointer' : 'not-allowed',
                  fontSize: typography.sizes.body,
                }}
              >
                {language === 'ar' ? 'التالي' : 'Next'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useAdminAuditLogsDirect } from '../hooks/useAdminAuditLogsDirect';
import type { AdminAuditLogFilters } from '../types/admin-audit';

export function AdminAuditLogPage() {
  const { language, direction } = useLanguage();

  const [filters, setFilters] = useState<AdminAuditLogFilters>({
    page: 1,
  });

  const { data, isLoading, isError, refetch } = useAdminAuditLogsDirect(filters);

  const logs = data?.logs ?? [];
  const meta = data?.meta ?? {
    page: filters.page ?? 1,
    limit: 25,
    total: 0,
    pageCount: 0,
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key: keyof AdminAuditLogFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined, page: 1 }));
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
            {language === 'ar' ? 'سجل التدقيق' : 'Audit Log'}
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
              ? 'سجل جميع الإجراءات والأنشطة في النظام.'
              : 'Log of all actions and activities in the system.'}
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
              {language === 'ar' ? 'الإجراء' : 'Action'}
            </label>
            <input
              type="text"
              placeholder={language === 'ar' ? 'ابحث بالإجراء...' : 'Search by action...'}
              value={filters.action ?? ''}
              onChange={event => handleFilterChange('action', event.target.value)}
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
              {language === 'ar' ? 'نوع المورد' : 'Resource Type'}
            </label>
            <input
              type="text"
              placeholder={language === 'ar' ? 'مثال: requests, users...' : 'e.g., requests, users...'}
              value={filters.resourceType ?? ''}
              onChange={event => handleFilterChange('resourceType', event.target.value)}
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

          {!isLoading && !isError && logs.length === 0 && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: palette.textSecondary,
                fontSize: typography.sizes.body,
              }}
            >
              {language === 'ar' ? 'لا توجد سجلات' : 'No logs found'}
            </div>
          )}

          {!isLoading && !isError && logs.length > 0 && (
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
                    {language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}
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
                    {language === 'ar' ? 'المستخدم' : 'User'}
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
                    {language === 'ar' ? 'الإجراء' : 'Action'}
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
                    {language === 'ar' ? 'المورد' : 'Resource'}
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
                    {language === 'ar' ? 'عنوان IP' : 'IP Address'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    style={{
                      borderTop: `1px solid ${palette.neutralBorderMuted}`,
                    }}
                  >
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textSecondary,
                      }}
                    >
                      {new Date(log.createdAt).toLocaleString(
                        language === 'ar' ? 'ar-SA' : 'en-US',
                        { dateStyle: 'medium', timeStyle: 'short' }
                      )}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      {log.actor.email || log.actor.name || '—'}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      <code
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: radius.sm,
                          background: palette.backgroundAlt,
                          color: palette.textPrimary,
                          fontSize: typography.sizes.caption,
                        }}
                      >
                        {log.action}
                      </code>
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1rem',
                        fontSize: typography.sizes.body,
                        color: palette.textPrimary,
                      }}
                    >
                      {log.targetType && log.targetId ? (
                        <span>
                          {log.targetType}: {log.targetId.substring(0, 8)}...
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
                      {log.ipAddress || '—'}
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
                disabled={meta.page <= 1}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: meta.page > 1 ? palette.backgroundSurface : palette.backgroundAlt,
                  color: meta.page > 1 ? palette.textPrimary : palette.textMuted,
                  cursor: meta.page > 1 ? 'pointer' : 'not-allowed',
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
                disabled={meta.page >= meta.pageCount}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: radius.md,
                  border: `1px solid ${palette.neutralBorderMuted}`,
                  background: meta.page < meta.pageCount ? palette.backgroundSurface : palette.backgroundAlt,
                  color: meta.page < meta.pageCount ? palette.textPrimary : palette.textMuted,
                  cursor: meta.page < meta.pageCount ? 'pointer' : 'not-allowed',
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

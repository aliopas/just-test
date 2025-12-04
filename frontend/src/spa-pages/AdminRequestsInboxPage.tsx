import React, { useState } from 'react';
import { useAdminRequests } from '../hooks/useAdminRequests';
import type { AdminRequestFilters } from '../types/admin';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { tAdminRequests } from '../locales/adminRequests';
import { AdminRequestsFilterBar } from '../components/admin/requests/AdminRequestsFilterBar';
import { AdminRequestsTable } from '../components/admin/requests/AdminRequestsTable';
import { AdminRequestsPagination } from '../components/admin/requests/AdminRequestsPagination';

export function AdminRequestsInboxPage() {
  const { language, direction } = useLanguage();

  const [filters, setFilters] = useState<AdminRequestFilters>({
    page: 1,
    status: 'all',
    type: 'all',
    category: 'all',
    sortBy: 'created_at',
    order: 'desc',
  });

  const {
    requests,
    meta,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdminRequests(filters);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      status: 'all',
      type: 'all',
      category: 'all',
      sortBy: 'created_at',
      order: 'desc',
    });
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
            {tAdminRequests('pageTitle', language)}
          </h1>
          <p
            style={{
              marginTop: '0.35rem',
              marginBottom: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {tAdminRequests('pageSubtitle', language)}
          </p>
        </header>

        {/* Filter Bar */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          <AdminRequestsFilterBar
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />
        </section>

        {/* Table */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: 'transparent',
          }}
        >
          <AdminRequestsTable
            requests={requests}
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            onRetry={() => refetch()}
          />
        </section>

        {/* Pagination */}
        <section
          style={{
            padding: '0 0.25rem 0.5rem',
          }}
        >
          <AdminRequestsPagination meta={meta} onPageChange={handlePageChange} />
        </section>
      </div>
    </div>
  );
}


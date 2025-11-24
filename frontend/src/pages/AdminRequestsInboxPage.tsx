import { useEffect, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { AdminRequestsFilterBar } from '../components/admin/requests/AdminRequestsFilterBar';
import { AdminRequestsTable } from '../components/admin/requests/AdminRequestsTable';
import { AdminRequestsPagination } from '../components/admin/requests/AdminRequestsPagination';
import { useAdminRequests } from '../hooks/useAdminRequests';
import type { AdminRequestFilters } from '../types/admin';
import { tAdminRequests } from '../locales/adminRequests';

// Create QueryClient outside component to avoid recreating it on every render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

const defaultFilters: AdminRequestFilters = {
  page: 1,
  status: 'all',
  type: 'all',
  sortBy: 'created_at',
  order: 'desc',
};

function AdminRequestsInboxPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [filters, setFilters] = useState<AdminRequestFilters>(defaultFilters);

  const { requests, meta, isLoading, isFetching, isError, error, refetch } =
    useAdminRequests(filters);

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
      <header>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            margin: 0,
          }}
        >
          {tAdminRequests('pageTitle', language)}
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--color-text-secondary)',
            fontSize: '1rem',
            maxWidth: '46rem',
          }}
        >
          {tAdminRequests('pageSubtitle', language)}
        </p>
      </header>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          background: 'var(--color-background-surface)',
          borderRadius: '1.5rem',
          padding: '1.5rem',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.08)',
        }}
      >
        <AdminRequestsFilterBar
          filters={filters}
          onChange={next => setFilters(next)}
          onReset={() => setFilters(defaultFilters)}
        />

        <AdminRequestsTable
          requests={requests}
          isLoading={isLoading}
          isFetching={isFetching}
          error={isError ? error : undefined}
          onRetry={() => refetch()}
        />

        <AdminRequestsPagination
          meta={meta}
          onPageChange={page =>
            setFilters(current => ({
              ...current,
              page,
            }))
          }
        />
      </section>
    </div>
  );
}

export function AdminRequestsInboxPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AdminRequestsInboxPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}




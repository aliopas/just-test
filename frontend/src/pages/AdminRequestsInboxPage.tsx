import React, { useEffect, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { AdminRequestsFilterBar } from '../components/admin/requests/AdminRequestsFilterBar';
import { AdminRequestsTable } from '../components/admin/requests/AdminRequestsTable';
import { AdminRequestsPagination } from '../components/admin/requests/AdminRequestsPagination';
import { useAdminRequests } from '../hooks/useAdminRequests';
import type { AdminRequestFilters, RequestCategory } from '../types/admin';
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
  category: 'all',
  sortBy: 'created_at',
  order: 'desc',
};

function AdminRequestsInboxPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AdminRequestFilters>(defaultFilters);
  const [activeCategory, setActiveCategory] = useState<RequestCategory>('all');

  // Update filters when category changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: activeCategory,
      page: 1, // Reset to first page when category changes
    }));
  }, [activeCategory]);

  const { requests, meta, isLoading, isFetching, isError, error, refetch } =
    useAdminRequests(filters);

  // Clear cache on mount to ensure fresh data
  useEffect(() => {
    // Clear all admin requests cache
    queryClient.removeQueries({ queryKey: ['adminRequests'] });
    // Force refetch after a short delay to ensure cache is cleared
    const timeoutId = setTimeout(() => {
      refetch();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [queryClient, refetch]); // Run once on mount

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

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '2px solid var(--color-neutral-border)',
          background: 'var(--color-background-surface)',
          borderRadius: '1.5rem 1.5rem 0 0',
          padding: '0 1.5rem',
          direction,
        }}
      >
        <CategoryTab
          category="all"
          activeCategory={activeCategory}
          onClick={() => setActiveCategory('all')}
          language={language}
        />
        <CategoryTab
          category="financial"
          activeCategory={activeCategory}
          onClick={() => setActiveCategory('financial')}
          language={language}
        />
        <CategoryTab
          category="non-financial"
          activeCategory={activeCategory}
          onClick={() => setActiveCategory('non-financial')}
          language={language}
        />
      </div>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          background: 'var(--color-background-surface)',
          borderRadius: '0 0 1.5rem 1.5rem',
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

// Default export for Next.js page validation (not used, App Router uses named export)
export default AdminRequestsInboxPage;

// Prevent static generation - this page uses client-side hooks and state
// Prevent static generation - this page uses client-side hooks and state
// In Pages Router, we need to use getServerSideProps instead of export const dynamic
export async function getServerSideProps() {
  return {
    props: {},
  };
}

interface CategoryTabProps {
  category: RequestCategory;
  activeCategory: RequestCategory;
  onClick: () => void;
  language: 'ar' | 'en';
}

function CategoryTab({ category, activeCategory, onClick, language }: CategoryTabProps) {
  const isActive = activeCategory === category;
  
  const labels: Record<RequestCategory, { ar: string; en: string }> = {
    'all': { ar: 'الكل', en: 'All' },
    'financial': { ar: 'الطلبات المالية', en: 'Financial Requests' },
    'non-financial': { ar: 'الطلبات غير المالية', en: 'Non-Financial Requests' },
  };

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '1rem 1.5rem',
        border: 'none',
        background: 'transparent',
        color: isActive
          ? 'var(--color-brand-primary-strong)'
          : 'var(--color-text-secondary)',
        fontWeight: isActive ? 700 : 600,
        fontSize: '1rem',
        cursor: 'pointer',
        borderBottom: isActive
          ? '3px solid var(--color-brand-primary-strong)'
          : '3px solid transparent',
        marginBottom: '-2px',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {labels[category][language]}
    </button>
  );
}




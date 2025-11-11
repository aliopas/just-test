import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { AdminInvestorCreateForm } from '../components/admin/users/AdminInvestorCreateForm';
import { AdminUsersFilterBar } from '../components/admin/users/AdminUsersFilterBar';
import { AdminUsersTable } from '../components/admin/users/AdminUsersTable';
import { AdminUsersPagination } from '../components/admin/users/AdminUsersPagination';
import {
  useAdminUsers,
  useCreateAdminUserMutation,
} from '../hooks/useAdminUsers';
import type {
  AdminCreateUserPayload,
  AdminUserFilters,
  AdminUserListMeta,
} from '../types/admin-users';
import { tAdminUsers } from '../locales/adminUsers';
import { ApiError } from '../utils/api-client';

const queryClient = new QueryClient();

const defaultFilters: AdminUserFilters = {
  page: 1,
  status: 'all',
  kycStatus: 'all',
  search: '',
};

function AdminInvestorsPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [filters, setFilters] =
    useState<AdminUserFilters>(defaultFilters);

  const queryFilters = useMemo(() => ({ ...filters }), [filters]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminUsers(queryFilters);

  const createMutation = useCreateAdminUserMutation();

  useEffect(() => {
    if (!isError) return;
    const message =
      error instanceof Error
        ? error.message
        : tAdminUsers('table.error', language);
    pushToast({
      message,
      variant: 'error',
    });
  }, [isError, error, pushToast, language]);

  const users = data?.users ?? [];
  const meta: AdminUserListMeta =
    data?.meta ?? {
      page: filters.page ?? 1,
      limit: 25,
      total: 0,
      pageCount: 0,
      hasNext: false,
    };

  const handleCreate = async (payload: AdminCreateUserPayload) => {
    try {
      await createMutation.mutateAsync(payload);
      pushToast({
        message: tAdminUsers('toast.created', language),
        variant: 'success',
      });
      setFilters(current => ({
        ...current,
        page: 1,
      }));
    } catch (mutationError) {
      const message =
        mutationError instanceof ApiError
          ? mutationError.message
          : mutationError instanceof Error
            ? mutationError.message
            : tAdminUsers('toast.error', language);
      pushToast({
        message,
        variant: 'error',
      });
    }
  };

  const handleFiltersChange = (next: AdminUserFilters) => {
    setFilters(next);
  };

  const handleResetFilters = () => {
    setFilters(() => ({ ...defaultFilters }));
  };

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
          {tAdminUsers('page.title', language)}
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--color-text-secondary)',
            fontSize: '1rem',
            maxWidth: '48rem',
          }}
        >
          {tAdminUsers('page.subtitle', language)}
        </p>
      </header>

      <AdminInvestorCreateForm
        onSubmit={handleCreate}
        submitting={createMutation.isPending}
      />

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          background: 'var(--color-background-surface)',
          borderRadius: '1.5rem',
          padding: '1.75rem',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
        }}
      >
        <AdminUsersFilterBar
          filters={filters}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        <AdminUsersTable
          users={users}
          isLoading={isLoading || isFetching}
          isError={isError}
          onRetry={refetch}
        />

        <AdminUsersPagination
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

export function AdminInvestorsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AdminInvestorsPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}



import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useInvestorRequests } from '../hooks/useInvestorRequests';
import { RequestList } from '../components/request/RequestList';
import { RequestDetailsDrawer } from '../components/request/RequestDetailsDrawer';
import type { InvestorRequest, RequestListFilters } from '../types/request';
import { tRequestList } from '../locales/requestList';

const queryClient = new QueryClient();

const filterOptions: Array<{
  key: RequestListFilters['status'];
  labelKey: Parameters<typeof tRequestList>[0];
}> = [
  { key: 'all', labelKey: 'filters.all' },
  { key: 'draft', labelKey: 'filters.draft' },
  { key: 'submitted', labelKey: 'filters.submitted' },
  { key: 'screening', labelKey: 'filters.screening' },
  { key: 'pending_info', labelKey: 'filters.pendingInfo' },
  { key: 'compliance_review', labelKey: 'filters.complianceReview' },
  { key: 'approved', labelKey: 'filters.approved' },
  { key: 'settling', labelKey: 'filters.settling' },
  { key: 'completed', labelKey: 'filters.completed' },
  { key: 'rejected', labelKey: 'filters.rejected' },
];

function MyRequestsPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [filters, setFilters] = useState<RequestListFilters>({
    page: 1,
    status: 'all',
  });
  const [selectedRequest, setSelectedRequest] = useState<InvestorRequest | null>(
    null
  );

  const { requests, meta, isLoading, isFetching, isError, error, refetch } =
    useInvestorRequests(filters);

  useEffect(() => {
    if (isError) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to load requests. Please try again.';
      pushToast({ message, variant: 'error' });
    }
  }, [isError, error, pushToast]);

  useEffect(() => {
    if (
      selectedRequest &&
      !requests.some(request => request.id === selectedRequest.id)
    ) {
      setSelectedRequest(null);
    }
  }, [requests, selectedRequest]);

  const handleFilterChange = (status: RequestListFilters['status']) => {
    setFilters(current => ({
      status,
      page: 1,
    }));
    setSelectedRequest(null);
  };

  const handlePageChange = (nextPage: number) => {
    setFilters(current => ({
      ...current,
      page: nextPage,
    }));
  };

  const selectedId = selectedRequest?.id ?? null;

  const pagination = useMemo(
    () => ({
      canGoBack: (filters.page ?? 1) > 1,
      canGoForward: meta.hasNext,
    }),
    [filters.page, meta.hasNext]
  );

  return (
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        minHeight: '100vh',
        background: 'var(--color-background-base)',
        direction,
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'relative',
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
          {tRequestList('pageTitle', language)}
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--color-text-secondary)',
            fontSize: '1rem',
            maxWidth: '40rem',
          }}
        >
          {tRequestList('pageSubtitle', language)}
        </p>
      </header>

      <section
        style={{
          background: 'var(--color-background-surface)',
          borderRadius: '1.5rem',
          border: '1px solid var(--color-border)',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {filterOptions.map(option => (
            <button
              key={option.key ?? 'all'}
              type='button'
              onClick={() => handleFilterChange(option.key)}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '999px',
                border:
                  filters.status === option.key
                    ? '1px solid var(--color-brand-primary-strong)'
                    : '1px solid var(--color-brand-secondary-soft)',
                background:
                  filters.status === option.key ? 'var(--color-brand-primary-strong)' : '#FFFFFF',
                color: filters.status === option.key ? '#FFFFFF' : 'var(--color-brand-accent-deep)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tRequestList(option.labelKey, language)}
            </button>
          ))}
        </div>

        <RequestList
          requests={requests}
          isLoading={isLoading}
          isFetching={isFetching}
          onSelect={setSelectedRequest}
          selectedRequestId={selectedId}
          onCreateNew={() => {
            if (typeof window !== 'undefined') {
              window.location.assign('/app/new-request');
            }
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            color: 'var(--color-text-secondary)',
            fontSize: '0.9rem',
          }}
        >
          <span>
            {meta.total > 0
              ? `${meta.page} / ${meta.pageCount} (${meta.total} total)`
              : '0 / 0'}
          </span>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
            }}
          >
            <button
              type='button'
              onClick={() => handlePageChange((filters.page ?? 1) - 1)}
              disabled={!pagination.canGoBack}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '0.85rem',
                border: '1px solid var(--color-brand-secondary-soft)',
                background: pagination.canGoBack ? '#FFFFFF' : 'var(--color-background-surface)',
                color: 'var(--color-brand-accent-deep)',
                cursor: pagination.canGoBack ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              {tRequestList('pagination.previous', language)}
            </button>

            <button
              type='button'
              onClick={() => handlePageChange((filters.page ?? 1) + 1)}
              disabled={!pagination.canGoForward}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '0.85rem',
                border: '1px solid var(--color-brand-secondary-soft)',
                background: pagination.canGoForward ? '#FFFFFF' : 'var(--color-background-surface)',
                color: 'var(--color-brand-accent-deep)',
                cursor: pagination.canGoForward ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              {tRequestList('pagination.next', language)}
            </button>
          </div>
        </div>
      </section>

      <button
        type='button'
        onClick={() => refetch()}
        style={{
          alignSelf: direction === 'rtl' ? 'flex-start' : 'flex-end',
          padding: '0.6rem 1.3rem',
          borderRadius: '999px',
          border: '1px solid var(--color-brand-secondary-soft)',
          background: 'var(--color-background-surface)',
          color: 'var(--color-brand-accent-deep)',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        âŸ³
      </button>

      {selectedRequest && (
        <RequestDetailsDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}

export function MyRequestsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <MyRequestsPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}




import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import type {
  InvestorRequest,
  RequestListFilters,
  RequestType,
} from '../types/request';

const queryClient = new QueryClient();

type NonFinancialRequestType = Extract<
  RequestType,
  'partnership' | 'board_nomination' | 'feedback'
>;

const statusFilterOptions: Array<{
  key: RequestListFilters['status'];
  labelAr: string;
  labelEn: string;
}> = [
  { key: 'all', labelAr: 'الكل', labelEn: 'All' },
  { key: 'draft', labelAr: 'مسودات', labelEn: 'Drafts' },
  { key: 'submitted', labelAr: 'مرسلة', labelEn: 'Submitted' },
  { key: 'screening', labelAr: 'تحت المراجعة', labelEn: 'Screening' },
  { key: 'pending_info', labelAr: 'بانتظار معلومات', labelEn: 'Pending info' },
  {
    key: 'compliance_review',
    labelAr: 'مراجعة التزام',
    labelEn: 'Compliance review',
  },
  { key: 'approved', labelAr: 'معتمدة', labelEn: 'Approved' },
  { key: 'settling', labelAr: 'قيد التسوية', labelEn: 'Settling' },
  { key: 'completed', labelAr: 'مكتملة', labelEn: 'Completed' },
  { key: 'rejected', labelAr: 'مرفوضة', labelEn: 'Rejected' },
];

const typeFilterOptions: Array<{
  key: NonFinancialRequestType | 'all';
  labelAr: string;
  labelEn: string;
}> = [
  { key: 'all', labelAr: 'الكل (غير مالي)', labelEn: 'All non-financial' },
  { key: 'partnership', labelAr: 'شراكة', labelEn: 'Partnership' },
  {
    key: 'board_nomination',
    labelAr: 'ترشيح مجلس الإدارة',
    labelEn: 'Board nomination',
  },
  { key: 'feedback', labelAr: 'ملاحظات', labelEn: 'Feedback' },
];

function NonFinancialRequestsPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<RequestListFilters>({
    page: 1,
    status: 'all',
  });

  const [typeFilter, setTypeFilter] = useState<NonFinancialRequestType | 'all'>(
    'all'
  );

  const [selectedRequest, setSelectedRequest] = useState<InvestorRequest | null>(
    null
  );

  // نستخدم نفس API العام ثم نفلتر الطلبات غير المالية في الواجهة
  const {
    requests: allRequests,
    meta,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useInvestorRequests(filters);

  useEffect(() => {
    if (!isError) return;

    const message =
      error instanceof Error
        ? error.message
        : language === 'ar'
          ? 'تعذر تحميل الطلبات غير المالية. حاول مرة أخرى.'
          : 'Unable to load non-financial requests. Please try again.';
    pushToast({ message, variant: 'error' });
  }, [isError, error, language, pushToast]);

  useEffect(() => {
    if (
      selectedRequest &&
      !allRequests.some(request => request.id === selectedRequest.id)
    ) {
      setSelectedRequest(null);
    }
  }, [allRequests, selectedRequest]);

  const visibleRequests = useMemo(() => {
    const base = allRequests.filter(request =>
      ['partnership', 'board_nomination', 'feedback'].includes(
        request.type as string
      )
    ) as InvestorRequest[];

    if (typeFilter === 'all') {
      return base;
    }

    return base.filter(request => request.type === typeFilter);
  }, [allRequests, typeFilter]);

  const handleStatusFilterChange = (status: RequestListFilters['status']) => {
    setFilters(current => ({
      ...current,
      status,
      page: 1,
    }));
    setSelectedRequest(null);
  };

  const handleTypeFilterChange = (nextType: NonFinancialRequestType | 'all') => {
    setTypeFilter(nextType);
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

  const pageTitle =
    language === 'ar'
      ? 'طلبات المستثمر غير المالية'
      : 'Non-financial investor requests';

  const pageSubtitle =
    language === 'ar'
      ? 'تابع طلبات الشراكة، وترشيح مجلس الإدارة، والملاحظات في مساحة مستقلة عن الطلبات المالية.'
      : 'Track partnership, board nomination, and feedback requests in a space separate from financial requests.';

  const handleCreateNew = () => {
    // حدد نوع الطلب غير المالي بناءً على الفلتر الحالي إن أمكن
    const targetType =
      typeFilter === 'partnership' ||
      typeFilter === 'board_nomination' ||
      typeFilter === 'feedback'
        ? typeFilter
        : 'partnership';

    // نستخدم نفس صفحة إنشاء الطلب لكن مع نوع غير مالي محدد في الـ query string
    navigate(`/requests/new?type=${targetType}`);
  };

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
          {pageTitle}
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--color-text-secondary)',
            fontSize: '1rem',
            maxWidth: '40rem',
          }}
        >
          {pageSubtitle}
        </p>
        <div
          style={{
            marginTop: '1.25rem',
            display: 'flex',
            justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
          }}
        >
          <button
            type="button"
            onClick={handleCreateNew}
            style={{
              padding: '0.75rem 1.6rem',
              borderRadius: '999px',
              border: 'none',
              background: 'var(--color-brand-primary-strong)',
              color: 'var(--color-text-on-brand)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {language === 'ar'
              ? 'إرسال طلب غير مالي جديد'
              : 'Submit new non-financial request'}
          </button>
        </div>
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
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginInlineEnd: '0.5rem',
              }}
            >
              {language === 'ar' ? 'الحالة:' : 'Status:'}
            </span>
            {statusFilterOptions.map(option => (
              <button
                key={option.key ?? 'all'}
                type="button"
                onClick={() => handleStatusFilterChange(option.key)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '999px',
                  border:
                    filters.status === option.key
                      ? '1px solid var(--color-brand-primary-strong)'
                      : '1px solid var(--color-brand-secondary-soft)',
                  background:
                    filters.status === option.key
                      ? 'var(--color-brand-primary-strong)'
                      : '#FFFFFF',
                  color:
                    filters.status === option.key
                      ? '#FFFFFF'
                      : 'var(--color-brand-accent-deep)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {language === 'ar' ? option.labelAr : option.labelEn}
              </button>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                marginInlineEnd: '0.5rem',
              }}
            >
              {language === 'ar' ? 'النوع:' : 'Type:'}
            </span>
            {typeFilterOptions.map(option => (
              <button
                key={option.key ?? 'all'}
                type="button"
                onClick={() => handleTypeFilterChange(option.key)}
                style={{
                  padding: '0.55rem 1.1rem',
                  borderRadius: '999px',
                  border:
                    typeFilter === option.key
                      ? '1px solid var(--color-brand-primary-strong)'
                      : '1px solid var(--color-brand-secondary-soft)',
                  background:
                    typeFilter === option.key
                      ? 'var(--color-brand-primary-strong)'
                      : '#FFFFFF',
                  color:
                    typeFilter === option.key
                      ? '#FFFFFF'
                      : 'var(--color-brand-accent-deep)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {language === 'ar' ? option.labelAr : option.labelEn}
              </button>
            ))}
          </div>
        </div>

        <RequestList
          requests={visibleRequests}
          isLoading={isLoading}
          isFetching={isFetching}
          onSelect={setSelectedRequest}
          selectedRequestId={selectedId}
          onCreateNew={handleCreateNew}
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
              type="button"
              onClick={() => handlePageChange((filters.page ?? 1) - 1)}
              disabled={!pagination.canGoBack}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '0.85rem',
                border: '1px solid var(--color-brand-secondary-soft)',
                background: pagination.canGoBack
                  ? '#FFFFFF'
                  : 'var(--color-background-surface)',
                color: 'var(--color-brand-accent-deep)',
                cursor: pagination.canGoBack ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>

            <button
              type="button"
              onClick={() => handlePageChange((filters.page ?? 1) + 1)}
              disabled={!pagination.canGoForward}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: '0.85rem',
                border: '1px solid var(--color-brand-secondary-soft)',
                background: pagination.canGoForward
                  ? '#FFFFFF'
                  : 'var(--color-background-surface)',
                color: 'var(--color-brand-accent-deep)',
                cursor: pagination.canGoForward ? 'pointer' : 'not-allowed',
                fontWeight: 600,
              }}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      </section>

      <button
        type="button"
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
        {'\u21BB'}
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

export function NonFinancialRequestsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <NonFinancialRequestsPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

// Default export used only for legacy Next.js pages directory validation.
// We export a simple stub that does not rely on React Router, React Query, or
// any browser-only APIs so that static generation in Netlify succeeds.
export default function NonFinancialRequestsPageStub() {
  return null;
}



import { useEffect, useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { AdminNewsFilterBar } from '../components/admin/news/AdminNewsFilterBar';
import { AdminNewsTable } from '../components/admin/news/AdminNewsTable';
import { AdminNewsPagination } from '../components/admin/news/AdminNewsPagination';
import { AdminNewsFormDrawer } from '../components/admin/news/AdminNewsFormDrawer';
import {
  useAdminNewsDetail,
  useAdminNewsList,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  usePublishScheduledMutation,
  useNewsImagePresignMutation,
  useApproveNewsMutation,
  useRejectNewsMutation,
} from '../hooks/useAdminNews';
import type { AdminNewsItem, AdminNewsListFilters, NewsStatus } from '../types/news';
import { tAdminNews } from '../locales/adminNews';
import { ApiError } from '../utils/api-client';

const queryClient = new QueryClient();

const defaultFilters: AdminNewsListFilters = {
  page: 1,
  status: 'all',
  search: '',
};

type DrawerState = {
  mode: 'create' | 'edit';
  open: boolean;
  news: AdminNewsItem | null;
};

function AdminNewsPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [filters, setFilters] = useState<AdminNewsListFilters>(defaultFilters);
  const [drawer, setDrawer] = useState<DrawerState>({
    mode: 'create',
    open: false,
    news: null,
  });

  const queryFilters = useMemo(() => ({ ...filters }), [filters]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useAdminNewsList(queryFilters);

  const createMutation = useCreateNewsMutation();
  const updateMutation = useUpdateNewsMutation();
  const deleteMutation = useDeleteNewsMutation();
  const publishMutation = usePublishScheduledMutation();
  const presignMutation = useNewsImagePresignMutation();
  const approveMutation = useApproveNewsMutation();
  const rejectMutation = useRejectNewsMutation();

  const detailQuery = useAdminNewsDetail(
    drawer.open && drawer.mode === 'edit' ? drawer.news?.id ?? null : null
  );

  useEffect(() => {
    if (!isError) return;
    const message =
      error instanceof Error ? error.message : tAdminNews('table.error', language);
    pushToast({
      message,
      variant: 'error',
    });
  }, [isError, error, pushToast, language]);

  const items = data?.news ?? [];
  const meta = data?.meta ?? {
    page: filters.page ?? 1,
    limit: 10,
    total: data?.news.length ?? 0,
    pageCount: 1,
    hasNext: false,
  };

  const selectedNews =
    drawer.news && drawer.news.id
      ? detailQuery.data ?? drawer.news
      : drawer.news;
  const isDetailLoading =
    drawer.mode === 'edit' && drawer.open
      ? detailQuery.isFetching || detailQuery.isLoading
      : false;

  const handleCreate = () => {
    setDrawer({
      mode: 'create',
      open: true,
      news: null,
    });
  };

  const handleEdit = (item: AdminNewsItem) => {
    setDrawer({
      mode: 'edit',
      open: true,
      news: item,
    });
  };

  const handleCloseDrawer = () => {
    setDrawer(current => ({ ...current, open: false }));
  };

  const performDelete = async (item: AdminNewsItem) => {
    await deleteMutation.mutateAsync(item.id);
    pushToast({
      message: tAdminNews('toast.deleted', language),
      variant: 'success',
    });
    setDrawer(current =>
      current.news && current.news.id === item.id
        ? { ...current, open: false }
        : current
    );
  };

  const handleDelete = async (item: AdminNewsItem) => {
    const confirmDelete =
      language === 'ar'
        ? 'Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø­Ø°Ù Ù‡Ø°Ø§ Ø§Ù„Ø®Ø¨Ø±ØŸ'
        : 'Are you sure you want to delete this news item?';
    if (!window.confirm(confirmDelete)) {
      return;
    }
    try {
      await performDelete(item);
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminNews('toast.saveError', language);
      pushToast({
        message,
        variant: 'error',
      });
    }
  };

  const handleSubmit = async (payload: {
    title: string;
    slug: string;
    bodyMd: string;
    status: NewsStatus;
    coverKey: string | null;
    scheduledAt: string | null;
    publishedAt: string | null;
  }) => {
    try {
      if (drawer.mode === 'create') {
        await createMutation.mutateAsync(payload);
        pushToast({
          message: tAdminNews('toast.created', language),
          variant: 'success',
        });
      } else if (drawer.news) {
        await updateMutation.mutateAsync({
          id: drawer.news.id,
          input: payload,
        });
        pushToast({
          message: tAdminNews('toast.updated', language),
          variant: 'success',
        });
      }
      setDrawer(current => ({ ...current, open: false }));
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminNews('toast.saveError', language);
      pushToast({
        message,
        variant: 'error',
      });
    }
  };

  const handlePublishScheduled = async () => {
    try {
      const result = await publishMutation.mutateAsync();
      pushToast({
        message:
          result.count > 0
            ? `${tAdminNews('toast.published', language)} (${result.count})`
            : tAdminNews('toast.published', language),
        variant: 'success',
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminNews('toast.publishError', language);
      pushToast({
        message,
        variant: 'error',
      });
      throw mutationError;
    }
  };

  const handleApprove = (item: AdminNewsItem) => {
    const promptText = tAdminNews('prompt.approveComment', language);
    const commentInput = window.prompt(promptText, '');
    if (commentInput === null) {
      return;
    }
    const trimmed = commentInput.trim();
    approveMutation.mutate(
      {
        id: item.id,
        comment: trimmed.length > 0 ? trimmed : undefined,
      },
      {
        onSuccess: () => {
          pushToast({
            message: tAdminNews('toast.approved', language),
            variant: 'success',
          });
        },
        onError: mutationError => {
          const message =
            mutationError instanceof Error
              ? mutationError.message
              : tAdminNews('toast.approveError', language);
          pushToast({
            message,
            variant: 'error',
          });
        },
      }
    );
  };

  const handleReject = (item: AdminNewsItem) => {
    const promptText = tAdminNews('prompt.rejectComment', language);
    const commentInput = window.prompt(promptText, '');
    if (commentInput === null) {
      return;
    }
    const trimmed = commentInput.trim();
    if (!trimmed) {
      pushToast({
        message: tAdminNews('toast.reviewCommentRequired', language),
        variant: 'error',
      });
      return;
    }

    rejectMutation.mutate(
      {
        id: item.id,
        comment: trimmed,
      },
      {
        onSuccess: () => {
          pushToast({
            message: tAdminNews('toast.rejected', language),
            variant: 'success',
          });
        },
        onError: mutationError => {
          let message =
            mutationError instanceof Error
              ? mutationError.message
              : tAdminNews('toast.rejectError', language);
          if (mutationError instanceof ApiError && mutationError.status === 400) {
            message = tAdminNews('toast.reviewCommentRequired', language);
          }
          pushToast({
            message,
            variant: 'error',
          });
        },
      }
    );
  };

  const handlePresign = async (file: File) => {
    try {
      return await presignMutation.mutateAsync({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : tAdminNews('toast.presignError', language);
      pushToast({
        message,
        variant: 'error',
      });
      throw mutationError;
    }
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
          {tAdminNews('pageTitle', language)}
        </h1>
        <p
          style={{
            marginTop: '0.5rem',
            color: 'var(--color-text-secondary)',
            fontSize: '1rem',
            maxWidth: '48rem',
          }}
        >
          {tAdminNews('pageSubtitle', language)}
        </p>
      </header>

      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          background: 'var(--color-background-surface)',
          borderRadius: '1.5rem',
          padding: '1.75rem',
          boxShadow: '0 30px 60px rgba(15, 23, 42, 0.08)',
        }}
      >
        <AdminNewsFilterBar
          status={filters.status ?? 'all'}
          onStatusChange={status =>
            setFilters(current => ({
              ...current,
              status,
              page: 1,
            }))
          }
          search={filters.search ?? ''}
          onSearchChange={term =>
            setFilters(current => ({
              ...current,
              search: term,
              page: 1,
            }))
          }
          onCreate={handleCreate}
          onPublishScheduled={handlePublishScheduled}
          isPublishPending={publishMutation.isPending}
        />

        <AdminNewsTable
          items={items}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
          isApprovePending={approveMutation.isPending}
          isRejectPending={rejectMutation.isPending}
        />

        <AdminNewsPagination
          meta={meta}
          onPageChange={page =>
            setFilters(current => ({
              ...current,
              page,
            }))
          }
        />
      </section>

      <AdminNewsFormDrawer
        open={drawer.open}
        mode={drawer.mode}
        news={selectedNews}
        isLoadingDetail={isDetailLoading}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
        onDelete={
          drawer.mode === 'edit' && drawer.news
            ? () => performDelete(drawer.news as AdminNewsItem)
            : undefined
        }
        deleting={deleteMutation.isPending}
        onPresignImage={handlePresign}
      />
    </div>
  );
}

export function AdminNewsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AdminNewsPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}




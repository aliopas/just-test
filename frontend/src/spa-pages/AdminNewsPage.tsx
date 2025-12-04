import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { tAdminNews } from '../locales/adminNews';
import type { AdminNewsItem, AdminNewsListFilters } from '../types/news';
import {
  useAdminNewsList,
  useAdminNewsDetail,
  useApproveNewsMutation,
  useRejectNewsMutation,
  useCreateNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useNewsImagePresignMutation,
  useNewsAttachmentPresignMutation,
  usePublishScheduledMutation,
} from '../hooks/useAdminNews';
import { AdminNewsTable } from '../components/admin/news/AdminNewsTable';
import { AdminNewsFormDrawer } from '../components/admin/news/AdminNewsFormDrawer';

export function AdminNewsPage() {
  const { language, direction } = useLanguage();

  const [filters, setFilters] = useState<AdminNewsListFilters>({
    page: 1,
    status: 'all',
    audience: 'all',
    search: '',
  });

  const { data, isLoading, isError, refetch } = useAdminNewsList(filters);
  const approveMutation = useApproveNewsMutation();
  const rejectMutation = useRejectNewsMutation();
  const createMutation = useCreateNewsMutation();
  const updateMutation = useUpdateNewsMutation();
  const deleteMutation = useDeleteNewsMutation();
  const imagePresignMutation = useNewsImagePresignMutation();
  const attachmentPresignMutation = useNewsAttachmentPresignMutation();
  const publishScheduledMutation = usePublishScheduledMutation();

  const newsItems = data?.news ?? [];
  const meta = data?.meta ?? {
    page: filters.page ?? 1,
    limit: 10,
    total: 0,
    pageCount: 0,
    hasNext: false,
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  const detailQuery = useAdminNewsDetail(selectedNewsId);

  const handleStatusFilterChange = (status: AdminNewsListFilters['status']) => {
    setFilters(prev => ({
      ...prev,
      status,
      page: 1,
    }));
  };

  const handleAudienceFilterChange = (audience: AdminNewsListFilters['audience']) => {
    setFilters(prev => ({
      ...prev,
      audience,
      page: 1,
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const handleCreateClick = () => {
    setDrawerMode('create');
    setSelectedNewsId(null);
    setDrawerOpen(true);
  };

  const handleEdit = (item: AdminNewsItem) => {
    setDrawerMode('edit');
    setSelectedNewsId(item.id);
    setDrawerOpen(true);
  };

  const handleDelete = async (item: AdminNewsItem) => {
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من حذف هذا الخبر نهائيًا؟'
        : 'Are you sure you want to permanently delete this news item?'
    );
    if (!confirmed) return;

    await deleteMutation.mutateAsync(item.id);
  };

  const handleApprove = async (item: AdminNewsItem) => {
    const comment = window.prompt(
      language === 'ar'
        ? 'يمكنك إضافة تعليق للموافقة (اختياري):'
        : 'You can add an approval comment (optional):'
    ) ?? undefined;

    await approveMutation.mutateAsync({
      id: item.id,
      comment,
    });
  };

  const handleReject = async (item: AdminNewsItem) => {
    const comment = window.prompt(
      language === 'ar'
        ? 'يرجى إدخال سبب الرفض (مطلوب):'
        : 'Please enter a rejection reason (required):'
    );

    if (!comment || comment.trim().length === 0) {
      return;
    }

    await rejectMutation.mutateAsync({
      id: item.id,
      comment,
    });
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleDrawerSubmit: Parameters<
    typeof AdminNewsFormDrawer
  >[0]['onSubmit'] = async values => {
    if (drawerMode === 'create') {
      await createMutation.mutateAsync(values);
    } else if (drawerMode === 'edit' && selectedNewsId) {
      await updateMutation.mutateAsync({ id: selectedNewsId, input: values });
    }

    setDrawerOpen(false);
  };

  const handleDrawerDelete = async () => {
    if (!selectedNewsId) return;
    await deleteMutation.mutateAsync(selectedNewsId);
    setDrawerOpen(false);
  };

  const handlePublishScheduled = async () => {
    await publishScheduledMutation.mutateAsync();
  };

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;

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
        <header
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: typography.sizes.heading,
              fontWeight: typography.weights.bold,
              color: palette.textPrimary,
            }}
          >
            {tAdminNews('pageTitle', language)}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: typography.sizes.body,
              color: palette.textSecondary,
            }}
          >
            {tAdminNews('pageSubtitle', language)}
          </p>
        </header>

        {/* Filters + actions */}
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
              {tAdminNews('form.status', language)}
            </label>
            <select
              value={filters.status ?? 'all'}
              onChange={event =>
                handleStatusFilterChange(
                  event.target.value as AdminNewsListFilters['status']
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
              <option value="all">{tAdminNews('list.status.all', language)}</option>
              <option value="draft">{tAdminNews('list.status.draft', language)}</option>
              <option value="pending_review">
                {tAdminNews('list.status.pending_review', language)}
              </option>
              <option value="scheduled">
                {tAdminNews('list.status.scheduled', language)}
              </option>
              <option value="published">
                {tAdminNews('list.status.published', language)}
              </option>
              <option value="rejected">
                {tAdminNews('list.status.rejected', language)}
              </option>
              <option value="archived">
                {tAdminNews('list.status.archived', language)}
              </option>
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
              {tAdminNews('form.audience.label', language)}
            </label>
            <select
              value={filters.audience ?? 'all'}
              onChange={event =>
                handleAudienceFilterChange(
                  event.target.value as AdminNewsListFilters['audience']
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
              <option value="all">{tAdminNews('list.audience.all', language)}</option>
              <option value="public">
                {tAdminNews('form.audience.public', language)}
              </option>
              <option value="investor_internal">
                {tAdminNews('form.audience.investor_internal', language)}
              </option>
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
              placeholder={tAdminNews('list.searchPlaceholder', language)}
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

          <div
            style={{
              marginInlineStart: 'auto',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: palette.backgroundSurface,
                color: palette.textSecondary,
                fontSize: '0.9rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {'\u21BB '}
              {language === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
            <button
              type="button"
              onClick={handlePublishScheduled}
              disabled={publishScheduledMutation.isPending}
              style={{
                padding: '0.6rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.brandPrimaryStrong}`,
                background: publishScheduledMutation.isPending
                  ? palette.backgroundSurface
                  : palette.brandPrimaryStrong,
                color: publishScheduledMutation.isPending
                  ? palette.textSecondary
                  : palette.textOnBrand,
                fontSize: '0.9rem',
                cursor: publishScheduledMutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {tAdminNews('list.actions.publishScheduled', language)}
            </button>
            <button
              type="button"
              onClick={handleCreateClick}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: radius.md,
                border: 'none',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontSize: '0.9rem',
                fontWeight: typography.weights.semibold,
                cursor: 'pointer',
              }}
            >
              {tAdminNews('list.actions.new', language)}
            </button>
          </div>
        </section>

        {/* List */}
        <section
          style={{
            padding: '1.25rem 1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          <AdminNewsTable
            items={newsItems}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onApprove={handleApprove}
            onReject={handleReject}
            isApprovePending={approveMutation.isPending}
            isRejectPending={rejectMutation.isPending}
          />
        </section>

        {/* Simple pagination */}
        <section
          style={{
            padding: '0 0.25rem 0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: palette.textSecondary,
            fontSize: '0.9rem',
          }}
        >
          <span>
            {meta.total > 0
              ? `${meta.page} / ${meta.pageCount} (${meta.total})`
              : '0 / 0 (0)'}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handlePageChange(meta.page - 1)}
              disabled={meta.page <= 1}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: meta.page <= 1
                  ? palette.backgroundSurface
                  : palette.backgroundBase,
                cursor: meta.page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(meta.page + 1)}
              disabled={!meta.hasNext}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: radius.md,
                border: `1px solid ${palette.neutralBorderMuted}`,
                background: meta.hasNext
                  ? palette.backgroundBase
                  : palette.backgroundSurface,
                cursor: meta.hasNext ? 'pointer' : 'not-allowed',
              }}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </button>
          </div>
        </section>
      </div>

      <AdminNewsFormDrawer
        open={drawerOpen}
        mode={drawerMode}
        news={drawerMode === 'edit' ? detailQuery.data ?? null : null}
        isLoadingDetail={drawerMode === 'edit' && detailQuery.isLoading}
        onClose={handleDrawerClose}
        onSubmit={handleDrawerSubmit}
        submitting={isMutating}
        onDelete={drawerMode === 'edit' ? handleDrawerDelete : undefined}
        deleting={deleteMutation.isPending}
        onPresignImage={async file => {
          const result = await imagePresignMutation.mutateAsync({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          });
          return result;
        }}
        onPresignAttachment={async file => {
          const result = await attachmentPresignMutation.mutateAsync({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          });
          return result;
        }}
      />
    </div>
  );
}


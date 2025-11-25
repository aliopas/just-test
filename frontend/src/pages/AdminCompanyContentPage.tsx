import { useState, useMemo, useEffect } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { palette } from '../styles/theme';
import {
  useAdminCompanyProfiles,
  useAdminCompanyProfileDetail,
  useCreateCompanyProfileMutation,
  useUpdateCompanyProfileMutation,
  useDeleteCompanyProfileMutation,
  useAdminCompanyClients,
  useAdminCompanyClientDetail,
  useCreateCompanyClientMutation,
  useUpdateCompanyClientMutation,
  useDeleteCompanyClientMutation,
  useAdminCompanyResources,
  useAdminCompanyResourceDetail,
  useCreateCompanyResourceMutation,
  useUpdateCompanyResourceMutation,
  useDeleteCompanyResourceMutation,
  useCompanyContentImagePresignMutation,
  type CompanyProfile,
  type CompanyClient,
  type CompanyResource,
} from '../hooks/useAdminCompanyContent';
import { CompanyProfilesTable } from '../components/admin/company-content/CompanyProfilesTable';
import { CompanyProfileFormDrawer } from '../components/admin/company-content/CompanyProfileFormDrawer';
import { CompanyClientsTable } from '../components/admin/company-content/CompanyClientsTable';
import { CompanyClientFormDrawer } from '../components/admin/company-content/CompanyClientFormDrawer';
import { CompanyResourcesTable } from '../components/admin/company-content/CompanyResourcesTable';
import { CompanyResourceFormDrawer } from '../components/admin/company-content/CompanyResourceFormDrawer';
import { ApiError } from '../utils/api-client';

const queryClient = new QueryClient();

type ContentTab = 
  | 'profiles'
  | 'clients'
  | 'resources'
  | 'strengths'
  | 'partnership'
  | 'market-value'
  | 'goals';

const TABS: Array<{ id: ContentTab; labelAr: string; labelEn: string }> = [
  { id: 'profiles', labelAr: 'البروفايل التعريفي', labelEn: 'Company Profile' },
  { id: 'clients', labelAr: 'العملاء', labelEn: 'Clients' },
  { id: 'resources', labelAr: 'الموارد المالية', labelEn: 'Financial Resources' },
  { id: 'strengths', labelAr: 'نقاط القوة', labelEn: 'Strengths' },
  { id: 'partnership', labelAr: 'معلومات الشراكة', labelEn: 'Partnership Info' },
  { id: 'market-value', labelAr: 'القيمة السوقية', labelEn: 'Market Value' },
  { id: 'goals', labelAr: 'الأهداف', labelEn: 'Goals' },
];

type DrawerState = {
  mode: 'create' | 'edit';
  open: boolean;
  profile: CompanyProfile | null;
  client: CompanyClient | null;
  resource: CompanyResource | null;
};

function AdminCompanyContentPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<ContentTab>('profiles');
  const [drawer, setDrawer] = useState<DrawerState>({
    mode: 'create',
    open: false,
    profile: null,
    client: null,
    resource: null,
  });

  const activeTabLabel = TABS.find((tab) => tab.id === activeTab);
  const isArabic = language === 'ar';

  // Profiles hooks
  const { data: profilesData, isLoading: isLoadingProfiles, isError: isErrorProfiles, refetch: refetchProfiles } = useAdminCompanyProfiles();
  const profiles = profilesData?.profiles ?? [];
  const createMutation = useCreateCompanyProfileMutation();
  const updateMutation = useUpdateCompanyProfileMutation();
  const deleteMutation = useDeleteCompanyProfileMutation();

  // Clients hooks
  const { data: clientsData, isLoading: isLoadingClients, isError: isErrorClients, refetch: refetchClients } = useAdminCompanyClients();
  const clients = clientsData?.clients ?? [];
  const createClientMutation = useCreateCompanyClientMutation();
  const updateClientMutation = useUpdateCompanyClientMutation();
  const deleteClientMutation = useDeleteCompanyClientMutation();

  // Resources hooks
  const { data: resourcesData, isLoading: isLoadingResources, isError: isErrorResources, refetch: refetchResources } = useAdminCompanyResources();
  const resources = resourcesData?.resources ?? [];
  const createResourceMutation = useCreateCompanyResourceMutation();
  const updateResourceMutation = useUpdateCompanyResourceMutation();
  const deleteResourceMutation = useDeleteCompanyResourceMutation();

  const presignMutation = useCompanyContentImagePresignMutation();

  const detailQuery = useAdminCompanyProfileDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'profiles' ? drawer.profile?.id ?? null : null
  );
  const clientDetailQuery = useAdminCompanyClientDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'clients' ? drawer.client?.id ?? null : null
  );
  const resourceDetailQuery = useAdminCompanyResourceDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'resources' ? drawer.resource?.id ?? null : null
  );

  const selectedProfile = useMemo(() => {
    if (drawer.profile && drawer.profile.id && drawer.mode === 'edit') {
      return detailQuery.data ?? drawer.profile;
    }
    return drawer.profile;
  }, [drawer.profile, drawer.mode, detailQuery.data]);

  const selectedClient = useMemo(() => {
    if (drawer.client && drawer.client.id && drawer.mode === 'edit') {
      return clientDetailQuery.data ?? drawer.client;
    }
    return drawer.client;
  }, [drawer.client, drawer.mode, clientDetailQuery.data]);

  const selectedResource = useMemo(() => {
    if (drawer.resource && drawer.resource.id && drawer.mode === 'edit') {
      return resourceDetailQuery.data ?? drawer.resource;
    }
    return drawer.resource;
  }, [drawer.resource, drawer.mode, resourceDetailQuery.data]);

  const handleCreate = () => {
    if (activeTab === 'profiles') {
      setDrawer({ mode: 'create', open: true, profile: null, client: null, resource: null });
    } else if (activeTab === 'clients') {
      setDrawer({ mode: 'create', open: true, profile: null, client: null, resource: null });
    } else if (activeTab === 'resources') {
      setDrawer({ mode: 'create', open: true, profile: null, client: null, resource: null });
    }
  };

  const handleEdit = (item: CompanyProfile | CompanyClient | CompanyResource) => {
    if (activeTab === 'profiles') {
      setDrawer({ mode: 'edit', open: true, profile: item as CompanyProfile, client: null, resource: null });
    } else if (activeTab === 'clients') {
      setDrawer({ mode: 'edit', open: true, profile: null, client: item as CompanyClient, resource: null });
    } else if (activeTab === 'resources') {
      setDrawer({ mode: 'edit', open: true, profile: null, client: null, resource: item as CompanyResource });
    }
  };

  const handleCloseDrawer = () => {
    setDrawer((current) => ({ ...current, open: false }));
  };

  const handleSubmit = async (values: {
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    iconKey: string | null;
    displayOrder: number;
    isActive: boolean;
  }) => {
    try {
      if (drawer.mode === 'create') {
        await createMutation.mutateAsync(values);
        pushToast({
          message: isArabic ? 'تم إضافة الملف التعريفي بنجاح' : 'Profile created successfully',
          variant: 'success',
        });
      } else if (drawer.profile?.id) {
        await updateMutation.mutateAsync({ id: drawer.profile.id, payload: values });
        pushToast({
          message: isArabic ? 'تم تحديث الملف التعريفي بنجاح' : 'Profile updated successfully',
          variant: 'success',
        });
      }
      refetchProfiles();
      handleCloseDrawer();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : isArabic
              ? 'حدث خطأ أثناء الحفظ'
              : 'An error occurred while saving';
      pushToast({
        message,
        variant: 'error',
      });
      throw error;
    }
  };

  const handleDelete = async () => {
    if (!drawer.profile?.id) return;
    if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الملف التعريفي؟' : 'Are you sure you want to delete this profile?')) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(drawer.profile.id);
      pushToast({
        message: isArabic ? 'تم حذف الملف التعريفي بنجاح' : 'Profile deleted successfully',
        variant: 'success',
      });
      refetchProfiles();
      handleCloseDrawer();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : isArabic
              ? 'حدث خطأ أثناء الحذف'
              : 'An error occurred while deleting';
      pushToast({
        message,
        variant: 'error',
      });
    }
  };

  const handlePresignImage = async (file: File, purpose: 'icon' | 'logo' = 'icon') => {
    const result = await presignMutation.mutateAsync({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      purpose,
    });

    // Upload to presigned URL
    const headers = new Headers();
    headers.set('Content-Type', file.type || 'application/octet-stream');

    const uploadResponse = await fetch(result.uploadUrl, {
      method: 'PUT',
      headers,
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    return { storageKey: result.storageKey };
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        minHeight: '100vh',
        background: palette.backgroundBase,
        direction,
      }}
    >
      <header style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: palette.textPrimary,
            margin: 0,
            marginBottom: '0.5rem',
          }}
        >
          {isArabic ? 'إدارة المحتوى العام' : 'Company Content Management'}
        </h1>
        <p
          style={{
            margin: 0,
            color: palette.textSecondary,
            fontSize: '1rem',
            maxWidth: '48rem',
          }}
        >
          {isArabic
            ? 'إدارة محتوى الصفحة الرئيسية: البروفايل، العملاء، الموارد، نقاط القوة، معلومات الشراكة، القيمة السوقية، والأهداف'
            : 'Manage homepage content: profiles, clients, resources, strengths, partnership info, market value, and goals'}
        </p>
      </header>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: `2px solid ${palette.neutralBorderSoft}`,
          marginBottom: '2rem',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              border: 'none',
              borderBottom: activeTab === tab.id ? `3px solid ${palette.brandPrimaryStrong}` : '3px solid transparent',
              background: 'transparent',
              color: activeTab === tab.id ? palette.brandPrimaryStrong : palette.textSecondary,
              fontWeight: activeTab === tab.id ? 700 : 600,
              fontSize: '1rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = palette.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = palette.textSecondary;
              }
            }}
          >
            {isArabic ? tab.labelAr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          background: palette.backgroundSurface,
          borderRadius: '1.5rem',
          padding: '2rem',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
        }}
      >
        {activeTab === 'profiles' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary }}>
                {isArabic ? 'الملفات التعريفية' : 'Company Profiles'}
              </h2>
              <button
                type="button"
                onClick={handleCreate}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                {isArabic ? '+ إضافة ملف تعريف جديد' : '+ Add New Profile'}
              </button>
            </div>
            <CompanyProfilesTable
              profiles={profiles}
              isLoading={isLoadingProfiles}
              isError={isErrorProfiles}
              onRetry={refetchProfiles}
              onEdit={handleEdit}
              onDelete={async (profile) => {
                if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الملف التعريفي؟' : 'Are you sure you want to delete this profile?')) {
                  try {
                    await deleteMutation.mutateAsync(profile.id);
                    pushToast({
                      message: isArabic ? 'تم حذف الملف التعريفي بنجاح' : 'Profile deleted successfully',
                      variant: 'success',
                    });
                    refetchProfiles();
                  } catch (error) {
                    pushToast({
                      message: error instanceof Error ? error.message : isArabic ? 'حدث خطأ أثناء الحذف' : 'An error occurred',
                      variant: 'error',
                    });
                  }
                }
              }}
            />
          </div>
        )}

        {activeTab === 'clients' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary }}>
                {isArabic ? 'العملاء' : 'Company Clients'}
              </h2>
              <button
                type="button"
                onClick={handleCreate}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                {isArabic ? '+ إضافة عميل جديد' : '+ Add New Client'}
              </button>
            </div>
            <CompanyClientsTable
              clients={clients}
              isLoading={isLoadingClients}
              isError={isErrorClients}
              onRetry={refetchClients}
              onEdit={handleEdit}
              onDelete={async (client) => {
                if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this client?')) {
                  try {
                    await deleteClientMutation.mutateAsync(client.id);
                    pushToast({
                      message: isArabic ? 'تم حذف العميل بنجاح' : 'Client deleted successfully',
                      variant: 'success',
                    });
                    refetchClients();
                  } catch (error) {
                    pushToast({
                      message: error instanceof Error ? error.message : isArabic ? 'حدث خطأ أثناء الحذف' : 'An error occurred',
                      variant: 'error',
                    });
                  }
                }
              }}
            />
          </div>
        )}

        {activeTab === 'resources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary }}>
                {isArabic ? 'الموارد المالية' : 'Financial Resources'}
              </h2>
              <button
                type="button"
                onClick={handleCreate}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                {isArabic ? '+ إضافة مورد جديد' : '+ Add New Resource'}
              </button>
            </div>
            <CompanyResourcesTable
              resources={resources}
              isLoading={isLoadingResources}
              isError={isErrorResources}
              onRetry={refetchResources}
              onEdit={handleEdit}
              onDelete={async (resource) => {
                if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المورد؟' : 'Are you sure you want to delete this resource?')) {
                  try {
                    await deleteResourceMutation.mutateAsync(resource.id);
                    pushToast({
                      message: isArabic ? 'تم حذف المورد بنجاح' : 'Resource deleted successfully',
                      variant: 'success',
                    });
                    refetchResources();
                  } catch (error) {
                    pushToast({
                      message: error instanceof Error ? error.message : isArabic ? 'حدث خطأ أثناء الحذف' : 'An error occurred',
                      variant: 'error',
                    });
                  }
                }
              }}
            />
          </div>
        )}

        {activeTab !== 'profiles' && activeTab !== 'clients' && activeTab !== 'resources' && (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: palette.textSecondary,
            }}
          >
            <p style={{ fontSize: '1.1rem', margin: 0 }}>
              {isArabic
                ? `إدارة ${activeTabLabel?.labelAr ?? ''} - قيد التطوير`
                : `Manage ${activeTabLabel?.labelEn ?? ''} - Under Development`}
            </p>
          </div>
        )}
      </div>

      {/* Form Drawers */}
      <CompanyProfileFormDrawer
        open={drawer.open && activeTab === 'profiles'}
        mode={drawer.mode}
        profile={selectedProfile}
        isLoadingDetail={drawer.mode === 'edit' && drawer.open && activeTab === 'profiles' ? detailQuery.isFetching || detailQuery.isLoading : false}
        onClose={handleCloseDrawer}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        submitting={createMutation.isPending || updateMutation.isPending}
        deleting={deleteMutation.isPending}
        onPresignImage={(file) => handlePresignImage(file, 'icon')}
      />

      <CompanyClientFormDrawer
        open={drawer.open && activeTab === 'clients'}
        mode={drawer.mode}
        client={selectedClient}
        isLoadingDetail={drawer.mode === 'edit' && drawer.open && activeTab === 'clients' ? clientDetailQuery.isFetching || clientDetailQuery.isLoading : false}
        onClose={handleCloseDrawer}
        onSubmit={async (values) => {
          try {
            if (drawer.mode === 'create') {
              await createClientMutation.mutateAsync(values);
              pushToast({
                message: isArabic ? 'تم إضافة العميل بنجاح' : 'Client created successfully',
                variant: 'success',
              });
            } else if (drawer.client?.id) {
              await updateClientMutation.mutateAsync({ id: drawer.client.id, payload: values });
              pushToast({
                message: isArabic ? 'تم تحديث العميل بنجاح' : 'Client updated successfully',
                variant: 'success',
              });
            }
            refetchClients();
            handleCloseDrawer();
          } catch (error) {
            const message =
              error instanceof ApiError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : isArabic
                    ? 'حدث خطأ أثناء الحفظ'
                    : 'An error occurred while saving';
            pushToast({
              message,
              variant: 'error',
            });
            throw error;
          }
        }}
        onDelete={async () => {
          if (!drawer.client?.id) return;
          if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا العميل؟' : 'Are you sure you want to delete this client?')) {
            return;
          }
          try {
            await deleteClientMutation.mutateAsync(drawer.client.id);
            pushToast({
              message: isArabic ? 'تم حذف العميل بنجاح' : 'Client deleted successfully',
              variant: 'success',
            });
            refetchClients();
            handleCloseDrawer();
          } catch (error) {
            const message =
              error instanceof ApiError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : isArabic
                    ? 'حدث خطأ أثناء الحذف'
                    : 'An error occurred while deleting';
            pushToast({
              message,
              variant: 'error',
            });
          }
        }}
        submitting={createClientMutation.isPending || updateClientMutation.isPending}
        deleting={deleteClientMutation.isPending}
        onPresignImage={(file) => handlePresignImage(file, 'logo')}
      />

      <CompanyResourceFormDrawer
        open={drawer.open && activeTab === 'resources'}
        mode={drawer.mode}
        resource={selectedResource}
        isLoadingDetail={drawer.mode === 'edit' && drawer.open && activeTab === 'resources' ? resourceDetailQuery.isFetching || resourceDetailQuery.isLoading : false}
        onClose={handleCloseDrawer}
        onSubmit={async (values) => {
          try {
            if (drawer.mode === 'create') {
              await createResourceMutation.mutateAsync(values);
              pushToast({
                message: isArabic ? 'تم إضافة المورد بنجاح' : 'Resource created successfully',
                variant: 'success',
              });
            } else if (drawer.resource?.id) {
              await updateResourceMutation.mutateAsync({ id: drawer.resource.id, payload: values });
              pushToast({
                message: isArabic ? 'تم تحديث المورد بنجاح' : 'Resource updated successfully',
                variant: 'success',
              });
            }
            refetchResources();
            handleCloseDrawer();
          } catch (error) {
            const message =
              error instanceof ApiError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : isArabic
                    ? 'حدث خطأ أثناء الحفظ'
                    : 'An error occurred while saving';
            pushToast({
              message,
              variant: 'error',
            });
            throw error;
          }
        }}
        onDelete={async () => {
          if (!drawer.resource?.id) return;
          if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا المورد؟' : 'Are you sure you want to delete this resource?')) {
            return;
          }
          try {
            await deleteResourceMutation.mutateAsync(drawer.resource.id);
            pushToast({
              message: isArabic ? 'تم حذف المورد بنجاح' : 'Resource deleted successfully',
              variant: 'success',
            });
            refetchResources();
            handleCloseDrawer();
          } catch (error) {
            const message =
              error instanceof ApiError
                ? error.message
                : error instanceof Error
                  ? error.message
                  : isArabic
                    ? 'حدث خطأ أثناء الحذف'
                    : 'An error occurred while deleting';
            pushToast({
              message,
              variant: 'error',
            });
          }
        }}
        submitting={createResourceMutation.isPending || updateResourceMutation.isPending}
        deleting={deleteResourceMutation.isPending}
        onPresignImage={(file) => handlePresignImage(file, 'icon')}
      />
    </div>
  );
}

export function AdminCompanyContentPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <AdminCompanyContentPageInner />
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}


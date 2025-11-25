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
  useAdminCompanyStrengths,
  useAdminCompanyStrengthDetail,
  useCreateCompanyStrengthMutation,
  useUpdateCompanyStrengthMutation,
  useDeleteCompanyStrengthMutation,
  useAdminPartnershipInfo,
  useAdminPartnershipInfoDetail,
  useCreatePartnershipInfoMutation,
  useUpdatePartnershipInfoMutation,
  useDeletePartnershipInfoMutation,
  useAdminMarketValue,
  useAdminMarketValueDetail,
  useCreateMarketValueMutation,
  useUpdateMarketValueMutation,
  useDeleteMarketValueMutation,
  useAdminCompanyGoals,
  useAdminCompanyGoalDetail,
  useCreateCompanyGoalMutation,
  useUpdateCompanyGoalMutation,
  useDeleteCompanyGoalMutation,
  useCompanyContentImagePresignMutation,
  type CompanyProfile,
  type CompanyClient,
  type CompanyResource,
  type CompanyStrength,
  type PartnershipInfo,
  type MarketValue,
  type CompanyGoal,
} from '../hooks/useAdminCompanyContent';
import { CompanyProfilesTable } from '../components/admin/company-content/CompanyProfilesTable';
import { CompanyProfileFormDrawer } from '../components/admin/company-content/CompanyProfileFormDrawer';
import { CompanyClientsTable } from '../components/admin/company-content/CompanyClientsTable';
import { CompanyClientFormDrawer } from '../components/admin/company-content/CompanyClientFormDrawer';
import { CompanyResourcesTable } from '../components/admin/company-content/CompanyResourcesTable';
import { CompanyResourceFormDrawer } from '../components/admin/company-content/CompanyResourceFormDrawer';
import { CompanyStrengthsTable } from '../components/admin/company-content/CompanyStrengthsTable';
import { CompanyStrengthFormDrawer } from '../components/admin/company-content/CompanyStrengthFormDrawer';
import { PartnershipInfoTable } from '../components/admin/company-content/PartnershipInfoTable';
import { PartnershipInfoFormDrawer } from '../components/admin/company-content/PartnershipInfoFormDrawer';
import { MarketValueTable } from '../components/admin/company-content/MarketValueTable';
import { MarketValueFormDrawer } from '../components/admin/company-content/MarketValueFormDrawer';
import { CompanyGoalsTable } from '../components/admin/company-content/CompanyGoalsTable';
import { CompanyGoalFormDrawer } from '../components/admin/company-content/CompanyGoalFormDrawer';
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
  strength: CompanyStrength | null;
  partnership: PartnershipInfo | null;
  marketValue: MarketValue | null;
  goal: CompanyGoal | null;
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
    strength: null,
    partnership: null,
    marketValue: null,
    goal: null,
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

  // Strengths hooks
  const { data: strengthsData, isLoading: isLoadingStrengths, isError: isErrorStrengths, refetch: refetchStrengths } = useAdminCompanyStrengths();
  const strengths = strengthsData?.strengths ?? [];
  const createStrengthMutation = useCreateCompanyStrengthMutation();
  const updateStrengthMutation = useUpdateCompanyStrengthMutation();
  const deleteStrengthMutation = useDeleteCompanyStrengthMutation();

  // Partnership Info hooks
  const { data: partnershipData, isLoading: isLoadingPartnership, isError: isErrorPartnership, refetch: refetchPartnership } = useAdminPartnershipInfo();
  const partnershipInfo = partnershipData?.partnershipInfo ?? [];
  const createPartnershipMutation = useCreatePartnershipInfoMutation();
  const updatePartnershipMutation = useUpdatePartnershipInfoMutation();
  const deletePartnershipMutation = useDeletePartnershipInfoMutation();

  // Market Value hooks
  const { data: marketValueData, isLoading: isLoadingMarketValue, isError: isErrorMarketValue, refetch: refetchMarketValue } = useAdminMarketValue();
  const marketValue = marketValueData?.marketValue ?? null;
  const createMarketValueMutation = useCreateMarketValueMutation();
  const updateMarketValueMutation = useUpdateMarketValueMutation();
  const deleteMarketValueMutation = useDeleteMarketValueMutation();

  // Goals hooks
  const { data: goalsData, isLoading: isLoadingGoals, isError: isErrorGoals, refetch: refetchGoals } = useAdminCompanyGoals();
  const goals = goalsData?.goals ?? [];
  const createGoalMutation = useCreateCompanyGoalMutation();
  const updateGoalMutation = useUpdateCompanyGoalMutation();
  const deleteGoalMutation = useDeleteCompanyGoalMutation();

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
  const strengthDetailQuery = useAdminCompanyStrengthDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'strengths' ? drawer.strength?.id ?? null : null
  );
  const partnershipDetailQuery = useAdminPartnershipInfoDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'partnership' ? drawer.partnership?.id ?? null : null
  );
  const marketValueDetailQuery = useAdminMarketValueDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'market-value' ? drawer.marketValue?.id ?? null : null
  );
  const goalDetailQuery = useAdminCompanyGoalDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'goals' ? drawer.goal?.id ?? null : null
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

  const selectedStrength = useMemo(() => {
    if (drawer.strength && drawer.strength.id && drawer.mode === 'edit') {
      return strengthDetailQuery.data ?? drawer.strength;
    }
    return drawer.strength;
  }, [drawer.strength, drawer.mode, strengthDetailQuery.data]);

  const selectedPartnership = useMemo(() => {
    if (drawer.partnership && drawer.partnership.id && drawer.mode === 'edit') {
      return partnershipDetailQuery.data ?? drawer.partnership;
    }
    return drawer.partnership;
  }, [drawer.partnership, drawer.mode, partnershipDetailQuery.data]);

  const selectedMarketValue = useMemo(() => {
    if (drawer.marketValue && drawer.marketValue.id && drawer.mode === 'edit') {
      return marketValueDetailQuery.data ?? drawer.marketValue;
    }
    return drawer.marketValue;
  }, [drawer.marketValue, drawer.mode, marketValueDetailQuery.data]);

  const selectedGoal = useMemo(() => {
    if (drawer.goal && drawer.goal.id && drawer.mode === 'edit') {
      return goalDetailQuery.data ?? drawer.goal;
    }
    return drawer.goal;
  }, [drawer.goal, drawer.mode, goalDetailQuery.data]);

  const handleCreate = () => {
    const empty = { profile: null, client: null, resource: null, strength: null, partnership: null, marketValue: null, goal: null };
    if (activeTab === 'profiles') {
      setDrawer({ mode: 'create', open: true, ...empty });
    } else if (activeTab === 'clients') {
      setDrawer({ mode: 'create', open: true, ...empty });
    } else if (activeTab === 'resources') {
      setDrawer({ mode: 'create', open: true, ...empty });
    } else if (activeTab === 'strengths') {
      setDrawer({ mode: 'create', open: true, ...empty });
    } else if (activeTab === 'partnership') {
      setDrawer({ mode: 'create', open: true, ...empty });
    } else if (activeTab === 'market-value') {
      setDrawer({ mode: 'create', open: true, ...empty });
    } else if (activeTab === 'goals') {
      setDrawer({ mode: 'create', open: true, ...empty });
    }
  };

  const handleEdit = (item: CompanyProfile | CompanyClient | CompanyResource | CompanyStrength | PartnershipInfo | MarketValue | CompanyGoal) => {
    const empty = { profile: null, client: null, resource: null, strength: null, partnership: null, marketValue: null, goal: null };
    if (activeTab === 'profiles') {
      setDrawer({ mode: 'edit', open: true, ...empty, profile: item as CompanyProfile });
    } else if (activeTab === 'clients') {
      setDrawer({ mode: 'edit', open: true, ...empty, client: item as CompanyClient });
    } else if (activeTab === 'resources') {
      setDrawer({ mode: 'edit', open: true, ...empty, resource: item as CompanyResource });
    } else if (activeTab === 'strengths') {
      setDrawer({ mode: 'edit', open: true, ...empty, strength: item as CompanyStrength });
    } else if (activeTab === 'partnership') {
      setDrawer({ mode: 'edit', open: true, ...empty, partnership: item as PartnershipInfo });
    } else if (activeTab === 'market-value') {
      setDrawer({ mode: 'edit', open: true, ...empty, marketValue: item as MarketValue });
    } else if (activeTab === 'goals') {
      setDrawer({ mode: 'edit', open: true, ...empty, goal: item as CompanyGoal });
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

        {activeTab === 'strengths' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary }}>
                {isArabic ? 'نقاط القوة' : 'Company Strengths'}
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
                {isArabic ? '+ إضافة نقطة قوة جديدة' : '+ Add New Strength'}
              </button>
            </div>
            <CompanyStrengthsTable
              strengths={strengths}
              isLoading={isLoadingStrengths}
              isError={isErrorStrengths}
              onRetry={refetchStrengths}
              onEdit={handleEdit}
              onDelete={async (strength) => {
                if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه النقطة؟' : 'Are you sure you want to delete this strength?')) {
                  try {
                    await deleteStrengthMutation.mutateAsync(strength.id);
                    pushToast({
                      message: isArabic ? 'تم حذف النقطة بنجاح' : 'Strength deleted successfully',
                      variant: 'success',
                    });
                    refetchStrengths();
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

        {activeTab === 'partnership' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary }}>
                {isArabic ? 'معلومات الشراكة' : 'Partnership Info'}
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
                {isArabic ? '+ إضافة معلومات شراكة جديدة' : '+ Add Partnership Info'}
              </button>
            </div>
            <PartnershipInfoTable
              partnershipInfo={partnershipInfo}
              isLoading={isLoadingPartnership}
              isError={isErrorPartnership}
              onRetry={refetchPartnership}
              onEdit={handleEdit}
              onDelete={async (info) => {
                if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه المعلومات؟' : 'Are you sure you want to delete this info?')) {
                  try {
                    await deletePartnershipMutation.mutateAsync(info.id);
                    pushToast({
                      message: isArabic ? 'تم حذف المعلومات بنجاح' : 'Partnership info deleted successfully',
                      variant: 'success',
                    });
                    refetchPartnership();
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

        {activeTab === 'market-value' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary }}>
                {isArabic ? 'القيمة السوقية' : 'Market Value'}
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
                {isArabic ? '+ إضافة قيمة سوقية' : '+ Add Market Value'}
              </button>
            </div>
            <MarketValueTable
              marketValue={marketValue}
              isLoading={isLoadingMarketValue}
              isError={isErrorMarketValue}
              onRetry={refetchMarketValue}
              onEdit={() => {
                if (marketValue) handleEdit(marketValue);
              }}
              onDelete={async () => {
                if (!marketValue) return;
                if (window.confirm(isArabic ? 'هل أنت متأكد من حذف القيمة السوقية؟' : 'Are you sure you want to delete market value?')) {
                  try {
                    await deleteMarketValueMutation.mutateAsync(marketValue.id);
                    pushToast({
                      message: isArabic ? 'تم حذف القيمة السوقية بنجاح' : 'Market value deleted successfully',
                      variant: 'success',
                    });
                    refetchMarketValue();
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

        {activeTab === 'goals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary }}>
                {isArabic ? 'الأهداف' : 'Company Goals'}
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
                {isArabic ? '+ إضافة هدف جديد' : '+ Add New Goal'}
              </button>
            </div>
            <CompanyGoalsTable
              goals={goals}
              isLoading={isLoadingGoals}
              isError={isErrorGoals}
              onRetry={refetchGoals}
              onEdit={handleEdit}
              onDelete={async (goal) => {
                if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الهدف؟' : 'Are you sure you want to delete this goal?')) {
                  try {
                    await deleteGoalMutation.mutateAsync(goal.id);
                    pushToast({
                      message: isArabic ? 'تم حذف الهدف بنجاح' : 'Goal deleted successfully',
                      variant: 'success',
                    });
                    refetchGoals();
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

      <CompanyStrengthFormDrawer
        open={drawer.open && activeTab === 'strengths'}
        mode={drawer.mode}
        strength={selectedStrength}
        isLoadingDetail={drawer.mode === 'edit' && drawer.open && activeTab === 'strengths' ? strengthDetailQuery.isFetching || strengthDetailQuery.isLoading : false}
        onClose={handleCloseDrawer}
        onSubmit={async (values) => {
          try {
            if (drawer.mode === 'create') {
              await createStrengthMutation.mutateAsync(values);
              pushToast({
                message: isArabic ? 'تم إضافة النقطة بنجاح' : 'Strength created successfully',
                variant: 'success',
              });
            } else if (drawer.strength?.id) {
              await updateStrengthMutation.mutateAsync({ id: drawer.strength.id, payload: values });
              pushToast({
                message: isArabic ? 'تم تحديث النقطة بنجاح' : 'Strength updated successfully',
                variant: 'success',
              });
            }
            refetchStrengths();
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
          if (!drawer.strength?.id) return;
          if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه النقطة؟' : 'Are you sure you want to delete this strength?')) {
            return;
          }
          try {
            await deleteStrengthMutation.mutateAsync(drawer.strength.id);
            pushToast({
              message: isArabic ? 'تم حذف النقطة بنجاح' : 'Strength deleted successfully',
              variant: 'success',
            });
            refetchStrengths();
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
        submitting={createStrengthMutation.isPending || updateStrengthMutation.isPending}
        deleting={deleteStrengthMutation.isPending}
        onPresignImage={(file) => handlePresignImage(file, 'icon')}
      />

      <PartnershipInfoFormDrawer
        open={drawer.open && activeTab === 'partnership'}
        mode={drawer.mode}
        partnershipInfo={selectedPartnership}
        isLoadingDetail={drawer.mode === 'edit' && drawer.open && activeTab === 'partnership' ? partnershipDetailQuery.isFetching || partnershipDetailQuery.isLoading : false}
        onClose={handleCloseDrawer}
        onSubmit={async (values) => {
          try {
            if (drawer.mode === 'create') {
              await createPartnershipMutation.mutateAsync(values);
              pushToast({
                message: isArabic ? 'تم إضافة المعلومات بنجاح' : 'Partnership info created successfully',
                variant: 'success',
              });
            } else if (drawer.partnership?.id) {
              await updatePartnershipMutation.mutateAsync({ id: drawer.partnership.id, payload: values });
              pushToast({
                message: isArabic ? 'تم تحديث المعلومات بنجاح' : 'Partnership info updated successfully',
                variant: 'success',
              });
            }
            refetchPartnership();
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
          if (!drawer.partnership?.id) return;
          if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه المعلومات؟' : 'Are you sure you want to delete this info?')) {
            return;
          }
          try {
            await deletePartnershipMutation.mutateAsync(drawer.partnership.id);
            pushToast({
              message: isArabic ? 'تم حذف المعلومات بنجاح' : 'Partnership info deleted successfully',
              variant: 'success',
            });
            refetchPartnership();
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
        submitting={createPartnershipMutation.isPending || updatePartnershipMutation.isPending}
        deleting={deletePartnershipMutation.isPending}
        onPresignImage={(file) => handlePresignImage(file, 'icon')}
      />

      <MarketValueFormDrawer
        open={drawer.open && activeTab === 'market-value'}
        mode={drawer.mode}
        marketValue={selectedMarketValue}
        isLoadingDetail={drawer.mode === 'edit' && drawer.open && activeTab === 'market-value' ? marketValueDetailQuery.isFetching || marketValueDetailQuery.isLoading : false}
        onClose={handleCloseDrawer}
        onSubmit={async (values) => {
          try {
            if (drawer.mode === 'create') {
              await createMarketValueMutation.mutateAsync(values);
              pushToast({
                message: isArabic ? 'تم إضافة القيمة السوقية بنجاح' : 'Market value created successfully',
                variant: 'success',
              });
            } else if (drawer.marketValue?.id) {
              await updateMarketValueMutation.mutateAsync({ id: drawer.marketValue.id, payload: values });
              pushToast({
                message: isArabic ? 'تم تحديث القيمة السوقية بنجاح' : 'Market value updated successfully',
                variant: 'success',
              });
            }
            refetchMarketValue();
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
          if (!drawer.marketValue?.id) return;
          if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف القيمة السوقية؟' : 'Are you sure you want to delete market value?')) {
            return;
          }
          try {
            await deleteMarketValueMutation.mutateAsync(drawer.marketValue.id);
            pushToast({
              message: isArabic ? 'تم حذف القيمة السوقية بنجاح' : 'Market value deleted successfully',
              variant: 'success',
            });
            refetchMarketValue();
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
        submitting={createMarketValueMutation.isPending || updateMarketValueMutation.isPending}
        deleting={deleteMarketValueMutation.isPending}
      />

      <CompanyGoalFormDrawer
        open={drawer.open && activeTab === 'goals'}
        mode={drawer.mode}
        goal={selectedGoal}
        isLoadingDetail={drawer.mode === 'edit' && drawer.open && activeTab === 'goals' ? goalDetailQuery.isFetching || goalDetailQuery.isLoading : false}
        onClose={handleCloseDrawer}
        onSubmit={async (values) => {
          try {
            if (drawer.mode === 'create') {
              await createGoalMutation.mutateAsync(values);
              pushToast({
                message: isArabic ? 'تم إضافة الهدف بنجاح' : 'Goal created successfully',
                variant: 'success',
              });
            } else if (drawer.goal?.id) {
              await updateGoalMutation.mutateAsync({ id: drawer.goal.id, payload: values });
              pushToast({
                message: isArabic ? 'تم تحديث الهدف بنجاح' : 'Goal updated successfully',
                variant: 'success',
              });
            }
            refetchGoals();
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
          if (!drawer.goal?.id) return;
          if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الهدف؟' : 'Are you sure you want to delete this goal?')) {
            return;
          }
          try {
            await deleteGoalMutation.mutateAsync(drawer.goal.id);
            pushToast({
              message: isArabic ? 'تم حذف الهدف بنجاح' : 'Goal deleted successfully',
              variant: 'success',
            });
            refetchGoals();
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
        submitting={createGoalMutation.isPending || updateGoalMutation.isPending}
        deleting={deleteGoalMutation.isPending}
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


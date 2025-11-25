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
  useAdminCompanyPartners,
  useAdminCompanyPartnerDetail,
  useCreateCompanyPartnerMutation,
  useUpdateCompanyPartnerMutation,
  useDeleteCompanyPartnerMutation,
  useCompanyContentImagePresignMutation,
  type CompanyProfile,
  type CompanyPartner,
} from '../hooks/useAdminCompanyContent';
import { CompanyProfilesTable } from '../components/admin/company-content/CompanyProfilesTable';
import { CompanyProfileFormDrawer } from '../components/admin/company-content/CompanyProfileFormDrawer';
import { CompanyPartnersTable } from '../components/admin/company-content/CompanyPartnersTable';
import { CompanyPartnerFormDrawer } from '../components/admin/company-content/CompanyPartnerFormDrawer';
import { ApiError } from '../utils/api-client';

const queryClient = new QueryClient();

type ContentTab = 
  | 'profiles'
  | 'partners'
  | 'clients'
  | 'resources'
  | 'strengths'
  | 'partnership'
  | 'market-value'
  | 'goals';

const TABS: Array<{ id: ContentTab; labelAr: string; labelEn: string }> = [
  { id: 'profiles', labelAr: 'البروفايل التعريفي', labelEn: 'Company Profile' },
  { id: 'partners', labelAr: 'الشركاء', labelEn: 'Partners' },
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
  partner: CompanyPartner | null;
};

function AdminCompanyContentPageInner() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<ContentTab>('profiles');
  const [drawer, setDrawer] = useState<DrawerState>({
    mode: 'create',
    open: false,
    profile: null,
    partner: null,
  });

  const activeTabLabel = TABS.find((tab) => tab.id === activeTab);
  const isArabic = language === 'ar';

  // Profiles hooks
  const { data: profilesData, isLoading: isLoadingProfiles, isError: isErrorProfiles, refetch: refetchProfiles } = useAdminCompanyProfiles();
  const profiles = profilesData?.profiles ?? [];
  const createMutation = useCreateCompanyProfileMutation();
  const updateMutation = useUpdateCompanyProfileMutation();
  const deleteMutation = useDeleteCompanyProfileMutation();

  // Partners hooks
  const { data: partnersData, isLoading: isLoadingPartners, isError: isErrorPartners, refetch: refetchPartners } = useAdminCompanyPartners();
  const partners = partnersData?.partners ?? [];
  const createPartnerMutation = useCreateCompanyPartnerMutation();
  const updatePartnerMutation = useUpdateCompanyPartnerMutation();
  const deletePartnerMutation = useDeleteCompanyPartnerMutation();

  const presignMutation = useCompanyContentImagePresignMutation();

  const detailQuery = useAdminCompanyProfileDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'profiles' ? drawer.profile?.id ?? null : null
  );
  const partnerDetailQuery = useAdminCompanyPartnerDetail(
    drawer.open && drawer.mode === 'edit' && activeTab === 'partners' ? drawer.partner?.id ?? null : null
  );

  const selectedProfile = useMemo(() => {
    if (drawer.profile && drawer.profile.id && drawer.mode === 'edit') {
      return detailQuery.data ?? drawer.profile;
    }
    return drawer.profile;
  }, [drawer.profile, drawer.mode, detailQuery.data]);

  const selectedPartner = useMemo(() => {
    if (drawer.partner && drawer.partner.id && drawer.mode === 'edit') {
      return partnerDetailQuery.data ?? drawer.partner;
    }
    return drawer.partner;
  }, [drawer.partner, drawer.mode, partnerDetailQuery.data]);

  const handleCreate = () => {
    if (activeTab === 'profiles') {
      setDrawer({ mode: 'create', open: true, profile: null, partner: null });
    } else if (activeTab === 'partners') {
      setDrawer({ mode: 'create', open: true, profile: null, partner: null });
    }
  };

  const handleEdit = (item: CompanyProfile | CompanyPartner) => {
    if (activeTab === 'profiles') {
      setDrawer({ mode: 'edit', open: true, profile: item as CompanyProfile, partner: null });
    } else if (activeTab === 'partners') {
      setDrawer({ mode: 'edit', open: true, profile: null, partner: item as CompanyPartner });
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

  const handlePresignImage = async (file: File) => {
    const result = await presignMutation.mutateAsync({
      fileName: file.name,
      contentType: file.type,
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
            ? 'إدارة محتوى الصفحة الرئيسية: البروفايل، الشركاء، العملاء، الموارد، نقاط القوة، معلومات الشراكة، القيمة السوقية، والأهداف'
            : 'Manage homepage content: profiles, partners, clients, resources, strengths, partnership info, market value, and goals'}
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

        {activeTab === 'partners' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: palette.textPrimary }}>
                {isArabic ? 'الشركاء' : 'Company Partners'}
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
                {isArabic ? '+ إضافة شريك جديد' : '+ Add New Partner'}
              </button>
            </div>
            <CompanyPartnersTable
              partners={partners}
              isLoading={isLoadingPartners}
              isError={isErrorPartners}
              onRetry={refetchPartners}
              onEdit={handleEdit}
              onDelete={async (partner) => {
                if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الشريك؟' : 'Are you sure you want to delete this partner?')) {
                  try {
                    await deletePartnerMutation.mutateAsync(partner.id);
                    pushToast({
                      message: isArabic ? 'تم حذف الشريك بنجاح' : 'Partner deleted successfully',
                      variant: 'success',
                    });
                    refetchPartners();
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

        {activeTab !== 'profiles' && activeTab !== 'partners' && (
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
        onPresignImage={handlePresignImage}
      />

      <CompanyPartnerFormDrawer
        open={drawer.open && activeTab === 'partners'}
        mode={drawer.mode}
        partner={selectedPartner}
        isLoadingDetail={drawer.mode === 'edit' && drawer.open && activeTab === 'partners' ? partnerDetailQuery.isFetching || partnerDetailQuery.isLoading : false}
        onClose={handleCloseDrawer}
        onSubmit={async (values) => {
          try {
            if (drawer.mode === 'create') {
              await createPartnerMutation.mutateAsync(values);
              pushToast({
                message: isArabic ? 'تم إضافة الشريك بنجاح' : 'Partner created successfully',
                variant: 'success',
              });
            } else if (drawer.partner?.id) {
              await updatePartnerMutation.mutateAsync({ id: drawer.partner.id, payload: values });
              pushToast({
                message: isArabic ? 'تم تحديث الشريك بنجاح' : 'Partner updated successfully',
                variant: 'success',
              });
            }
            refetchPartners();
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
          if (!drawer.partner?.id) return;
          if (!window.confirm(isArabic ? 'هل أنت متأكد من حذف هذا الشريك؟' : 'Are you sure you want to delete this partner?')) {
            return;
          }
          try {
            await deletePartnerMutation.mutateAsync(drawer.partner.id);
            pushToast({
              message: isArabic ? 'تم حذف الشريك بنجاح' : 'Partner deleted successfully',
              variant: 'success',
            });
            refetchPartners();
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
        submitting={createPartnerMutation.isPending || updatePartnerMutation.isPending}
        deleting={deletePartnerMutation.isPending}
        onPresignImage={handlePresignImage}
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


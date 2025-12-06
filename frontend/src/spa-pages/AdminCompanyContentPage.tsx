import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import {
  useCreateCompanyProfileMutation,
  useUpdateCompanyProfileMutation,
  useDeleteCompanyProfileMutation,
  useCompanyContentImagePresignMutation,
  useCreateCompanyPartnerMutation,
  useUpdateCompanyPartnerMutation,
  useDeleteCompanyPartnerMutation,
  useCreateCompanyClientMutation,
  useUpdateCompanyClientMutation,
  useDeleteCompanyClientMutation,
  useCreateMarketValueMutation,
  useUpdateMarketValueMutation,
  useDeleteMarketValueMutation,
  useCreateCompanyGoalMutation,
  useUpdateCompanyGoalMutation,
  useDeleteCompanyGoalMutation,
} from '../hooks/useAdminCompanyContent';
import {
  useCompanyProfiles,
  useCompanyPartners,
  useCompanyClients,
  useMarketValue,
  useCompanyGoals,
} from '../hooks/useSupabaseTables';
import { CompanyProfilesTable } from '../components/admin/company-content/CompanyProfilesTable';
import { CompanyProfileFormDrawer } from '../components/admin/company-content/CompanyProfileFormDrawer';
import { CompanyPartnersTable } from '../components/admin/company-content/CompanyPartnersTable';
import { CompanyPartnerFormDrawer } from '../components/admin/company-content/CompanyPartnerFormDrawer';
import { CompanyClientsTable } from '../components/admin/company-content/CompanyClientsTable';
import { CompanyClientFormDrawer } from '../components/admin/company-content/CompanyClientFormDrawer';
import { MarketValueTable } from '../components/admin/company-content/MarketValueTable';
import { MarketValueFormDrawer } from '../components/admin/company-content/MarketValueFormDrawer';
import { CompanyGoalsTable } from '../components/admin/company-content/CompanyGoalsTable';
import { CompanyGoalFormDrawer } from '../components/admin/company-content/CompanyGoalFormDrawer';

export function AdminCompanyContentPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  const [activeTab, setActiveTab] = useState<'profiles' | 'partners' | 'clients' | 'marketValue' | 'goals'>('profiles');

  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [profileDrawerMode, setProfileDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  const {
    data: profilesData,
    isLoading: isLoadingProfiles,
    isError: isErrorProfiles,
    refetch: refetchProfiles,
  } = useCompanyProfiles();

  const createProfile = useCreateCompanyProfileMutation();
  const updateProfile = useUpdateCompanyProfileMutation();
  const deleteProfile = useDeleteCompanyProfileMutation();
  const presignImage = useCompanyContentImagePresignMutation();

  const profiles = (profilesData ?? []).map((p) => ({
    id: p.id,
    titleAr: p.title_ar,
    titleEn: p.title_en,
    contentAr: p.content_ar,
    contentEn: p.content_en,
    iconKey: p.icon_key,
    displayOrder: p.display_order,
    isActive: p.is_active,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  // Partners
  const [isPartnerDrawerOpen, setIsPartnerDrawerOpen] = useState(false);
  const [partnerDrawerMode, setPartnerDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const {
    data: partnersData,
    isLoading: isLoadingPartners,
    isError: isErrorPartners,
    refetch: refetchPartners,
  } = useCompanyPartners();

  const createPartner = useCreateCompanyPartnerMutation();
  const updatePartner = useUpdateCompanyPartnerMutation();
  const deletePartner = useDeleteCompanyPartnerMutation();

  const partners = (partnersData ?? []).map((p) => ({
    id: p.id,
    nameAr: p.name_ar,
    nameEn: p.name_en,
    logoKey: p.logo_key,
    descriptionAr: p.description_ar,
    descriptionEn: p.description_en,
    websiteUrl: p.website_url,
    displayOrder: p.display_order,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  }));

  // Clients / business model
  const [isClientDrawerOpen, setIsClientDrawerOpen] = useState(false);
  const [clientDrawerMode, setClientDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const {
    data: clientsData,
    isLoading: isLoadingClients,
    isError: isErrorClients,
    refetch: refetchClients,
  } = useCompanyClients();

  const createClient = useCreateCompanyClientMutation();
  const updateClient = useUpdateCompanyClientMutation();
  const deleteClient = useDeleteCompanyClientMutation();

  const clients = (clientsData ?? []).map((c) => ({
    id: c.id,
    nameAr: c.name_ar,
    nameEn: c.name_en,
    logoKey: c.logo_key,
    descriptionAr: c.description_ar,
    descriptionEn: c.description_en,
    displayOrder: c.display_order,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
  }));

  // Market value
  const [isMarketDrawerOpen, setIsMarketDrawerOpen] = useState(false);
  const [marketDrawerMode, setMarketDrawerMode] = useState<'create' | 'edit'>('create');

  const {
    data: marketData,
    isLoading: isLoadingMarket,
    isError: isErrorMarket,
    refetch: refetchMarket,
  } = useMarketValue();

  const createMarket = useCreateMarketValueMutation();
  const updateMarket = useUpdateMarketValueMutation();
  const deleteMarket = useDeleteMarketValueMutation();

  const marketValue = marketData ? {
    id: marketData.id,
    value: marketData.value,
    currency: marketData.currency,
    valuationDate: marketData.valuation_date,
    source: marketData.source,
    isVerified: marketData.is_verified,
    verifiedAt: marketData.verified_at,
    createdAt: marketData.created_at,
    updatedAt: marketData.updated_at,
  } : null;

  // Goals
  const [isGoalDrawerOpen, setIsGoalDrawerOpen] = useState(false);
  const [goalDrawerMode, setGoalDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);

  const {
    data: goalsData,
    isLoading: isLoadingGoals,
    isError: isErrorGoals,
    refetch: refetchGoals,
  } = useCompanyGoals();

  const createGoal = useCreateCompanyGoalMutation();
  const updateGoal = useUpdateCompanyGoalMutation();
  const deleteGoal = useDeleteCompanyGoalMutation();

  const goals = (goalsData ?? []).map((g) => ({
    id: g.id,
    titleAr: g.title_ar,
    titleEn: g.title_en,
    descriptionAr: g.description_ar,
    descriptionEn: g.description_en,
    targetDate: g.target_date,
    iconKey: g.icon_key,
    displayOrder: g.display_order,
    createdAt: g.created_at,
    updatedAt: g.updated_at,
  }));

  const openCreateProfile = () => {
    setActiveTab('profiles');
    setProfileDrawerMode('create');
    setSelectedProfileId(null);
    setIsProfileDrawerOpen(true);
  };

  const openEditProfile = (profileId: string) => {
    setProfileDrawerMode('edit');
    setSelectedProfileId(profileId);
    setIsProfileDrawerOpen(true);
  };

  const selectedProfile =
    selectedProfileId != null
      ? profiles.find((p) => p.id === selectedProfileId) ?? null
      : null;

  const selectedPartner =
    selectedPartnerId != null
      ? partners.find((p) => p.id === selectedPartnerId) ?? null
      : null;

  const selectedClient =
    selectedClientId != null
      ? clients.find((c) => c.id === selectedClientId) ?? null
      : null;

  const selectedGoal =
    selectedGoalId != null
      ? goals.find((g) => g.id === selectedGoalId) ?? null
      : null;

  async function handleSubmitProfile(values: {
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    iconKey: string | null;
    displayOrder: number;
    isActive: boolean;
  }) {
    if (profileDrawerMode === 'create') {
      await createProfile.mutateAsync(values);
    } else if (profileDrawerMode === 'edit' && selectedProfileId) {
      await updateProfile.mutateAsync({ id: selectedProfileId, payload: values });
    }
  }

  async function handleDeleteProfile() {
    if (!selectedProfileId) return;
    await deleteProfile.mutateAsync(selectedProfileId);
  }

  async function handlePresignImage(file: File) {
    const result = await presignImage.mutateAsync({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      purpose: 'icon',
    });
    return { storageKey: result.storageKey };
  }

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
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: typography.sizes.heading,
                fontWeight: typography.weights.bold,
                color: palette.textPrimary,
              }}
            >
              {isArabic ? 'إدارة المحتوى العام' : 'Company public content'}
            </h1>
            <p
              style={{
                marginTop: '0.35rem',
                marginBottom: 0,
                fontSize: typography.sizes.body,
                color: palette.textSecondary,
              }}
            >
              {isArabic
                ? 'تحكم في البروفايل التعريفي والأقسام الظاهرة في صفحة الهبوط العامة للمستثمرين.'
                : 'Manage the public company profile and sections shown on the investor landing page.'}
            </p>
          </div>
          {/* primary actions change per tab, handled below */}
        </header>

        {/* Tabs */}
        <nav
          style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            borderBottom: `1px solid ${palette.neutralBorderMuted}`,
            paddingBottom: '0.5rem',
          }}
        >
          {(
            [
              { id: 'profiles', ar: 'البروفايل التعريفي', en: 'Profile' },
              { id: 'partners', ar: 'الشركاء', en: 'Partners' },
              { id: 'clients', ar: 'نموذج العمل / العملاء', en: 'Business model & clients' },
              { id: 'marketValue', ar: 'القيمة السوقية', en: 'Market value' },
              { id: 'goals', ar: 'الأهداف الاستراتيجية', en: 'Strategic goals' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: radius.md,
                  border: isActive
                    ? `1px solid ${palette.brandPrimaryStrong}`
                    : `1px solid transparent`,
                  background: isActive
                    ? `${palette.brandPrimaryStrong}10`
                    : 'transparent',
                  color: isActive ? palette.brandPrimaryStrong : palette.textSecondary,
                  fontSize: typography.sizes.caption,
                  fontWeight: isActive
                    ? typography.weights.semibold
                    : typography.weights.medium,
                  cursor: 'pointer',
                }}
              >
                {isArabic ? tab.ar : tab.en}
              </button>
            );
          })}
        </nav>

        {/* Active tab content */}
        {activeTab === 'profiles' && (
          <section
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <div
              style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {isArabic ? 'البروفايل التعريفي للشركة' : 'Company profile sections'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: '0.25rem',
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic
                    ? 'هذه الملفات التعريفية تستخدم في صفحة الهبوط العامة ضمن قسم "عن باكورة".'
                    : 'These profile entries are used on the public landing page in the “About Bakurah” section.'}
                </p>
              </div>
              <button
                type="button"
                onClick={openCreateProfile}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: radius.md,
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: typography.weights.semibold,
                  fontSize: typography.sizes.body,
                  cursor: 'pointer',
                }}
              >
                {isArabic ? 'إضافة ملف تعريفي جديد' : 'Add new profile'}
              </button>
            </div>

            <CompanyProfilesTable
              profiles={profiles}
              isLoading={isLoadingProfiles}
              isError={isErrorProfiles}
              onRetry={() => refetchProfiles()}
              onEdit={(profile) => openEditProfile(profile.id)}
              onDelete={(profile) => {
                setSelectedProfileId(profile.id);
                setProfileDrawerMode('edit');
                setIsProfileDrawerOpen(true);
              }}
            />
          </section>
        )}

        {activeTab === 'partners' && (
          <section
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <div
              style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {isArabic ? 'شركاء باكورة' : 'Bakurah partners'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: '0.25rem',
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic
                    ? 'الشعارات والشركاء الاستراتيجيون الظاهرون في قسم "شركاؤنا" في الصفحة العامة.'
                    : 'Logos and strategic partners shown in the “Our partners” section on the public site.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPartnerDrawerMode('create');
                  setSelectedPartnerId(null);
                  setIsPartnerDrawerOpen(true);
                }}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: radius.md,
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: typography.weights.semibold,
                  fontSize: typography.sizes.body,
                  cursor: 'pointer',
                }}
              >
                {isArabic ? 'إضافة شريك جديد' : 'Add partner'}
              </button>
            </div>

            <CompanyPartnersTable
              partners={partners}
              isLoading={isLoadingPartners}
              isError={isErrorPartners}
              onRetry={() => refetchPartners()}
              onEdit={(partner) => {
                setSelectedPartnerId(partner.id);
                setPartnerDrawerMode('edit');
                setIsPartnerDrawerOpen(true);
              }}
              onDelete={(partner) => {
                setSelectedPartnerId(partner.id);
                setPartnerDrawerMode('edit');
                setIsPartnerDrawerOpen(true);
              }}
            />
          </section>
        )}

        {activeTab === 'clients' && (
          <section
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <div
              style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {isArabic ? 'نموذج العمل / العملاء' : 'Business model & clients'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: '0.25rem',
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic
                    ? 'بطاقات تشرح شرائح العملاء، القنوات، والعرض الاستثماري، وتظهر في صفحة الهبوط.'
                    : 'Cards that explain customer segments, channels and investment offering, used on the landing page.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setClientDrawerMode('create');
                  setSelectedClientId(null);
                  setIsClientDrawerOpen(true);
                }}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: radius.md,
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: typography.weights.semibold,
                  fontSize: typography.sizes.body,
                  cursor: 'pointer',
                }}
              >
                {isArabic ? 'إضافة عنصر جديد' : 'Add item'}
              </button>
            </div>

            <CompanyClientsTable
              clients={clients}
              isLoading={isLoadingClients}
              isError={isErrorClients}
              onRetry={() => refetchClients()}
              onEdit={(client) => {
                setSelectedClientId(client.id);
                setClientDrawerMode('edit');
                setIsClientDrawerOpen(true);
              }}
              onDelete={(client) => {
                setSelectedClientId(client.id);
                setClientDrawerMode('edit');
                setIsClientDrawerOpen(true);
              }}
            />
          </section>
        )}

        {activeTab === 'marketValue' && (
          <section
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <div
              style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {isArabic ? 'القيمة السوقية' : 'Market value'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: '0.25rem',
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic
                    ? 'تظهر هذه القيمة في الواجهة العامة لعرض التقييم الحالي لـ "باكورة".'
                    : 'This value is shown publicly to highlight Bakurah’s current valuation.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMarketDrawerMode(marketValue ? 'edit' : 'create');
                  setIsMarketDrawerOpen(true);
                }}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: radius.md,
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: typography.weights.semibold,
                  fontSize: typography.sizes.body,
                  cursor: 'pointer',
                }}
              >
                {marketValue
                  ? isArabic
                    ? 'تعديل القيمة السوقية'
                    : 'Edit market value'
                  : isArabic
                    ? 'إضافة قيمة سوقية'
                    : 'Add market value'}
              </button>
            </div>

            <MarketValueTable
              marketValue={marketValue}
              isLoading={isLoadingMarket}
              isError={isErrorMarket}
              onRetry={() => refetchMarket()}
              onEdit={() => {
                setMarketDrawerMode(marketValue ? 'edit' : 'create');
                setIsMarketDrawerOpen(true);
              }}
              onDelete={async () => {
                if (!marketValue) return;
                await deleteMarket.mutateAsync(marketValue.id);
              }}
            />
          </section>
        )}

        {activeTab === 'goals' && (
          <section
            style={{
              padding: '1.25rem 1.5rem',
              borderRadius: radius.lg,
              background: palette.backgroundBase,
              boxShadow: shadow.subtle,
              border: `1px solid ${palette.neutralBorderMuted}`,
            }}
          >
            <div
              style={{
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: typography.sizes.subheading,
                    fontWeight: typography.weights.semibold,
                    color: palette.textPrimary,
                  }}
                >
                  {isArabic ? 'الأهداف الاستراتيجية' : 'Strategic goals'}
                </h2>
                <p
                  style={{
                    margin: 0,
                    marginTop: '0.25rem',
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {isArabic
                    ? 'الأهداف متوسطة وطويلة المدى التي تظهر للمستثمر لتوضيح توجه باكورة.'
                    : 'Medium and long-term goals shown to investors to communicate Bakurah’s direction.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setGoalDrawerMode('create');
                  setSelectedGoalId(null);
                  setIsGoalDrawerOpen(true);
                }}
                style={{
                  padding: '0.7rem 1.4rem',
                  borderRadius: radius.md,
                  border: 'none',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: typography.weights.semibold,
                  fontSize: typography.sizes.body,
                  cursor: 'pointer',
                }}
              >
                {isArabic ? 'إضافة هدف جديد' : 'Add goal'}
              </button>
            </div>

            <CompanyGoalsTable
              goals={goals}
              isLoading={isLoadingGoals}
              isError={isErrorGoals}
              onRetry={() => refetchGoals()}
              onEdit={(goal) => {
                setSelectedGoalId(goal.id);
                setGoalDrawerMode('edit');
                setIsGoalDrawerOpen(true);
              }}
              onDelete={(goal) => {
                setSelectedGoalId(goal.id);
                setGoalDrawerMode('edit');
                setIsGoalDrawerOpen(true);
              }}
            />
          </section>
        )}
      </div>

      <CompanyProfileFormDrawer
        open={isProfileDrawerOpen}
        mode={profileDrawerMode}
        profile={selectedProfile}
        isLoadingDetail={false}
        onClose={() => setIsProfileDrawerOpen(false)}
        onSubmit={handleSubmitProfile}
        onDelete={selectedProfile ? handleDeleteProfile : undefined}
        submitting={createProfile.isPending || updateProfile.isPending}
        deleting={deleteProfile.isPending}
        onPresignImage={handlePresignImage}
      />

      <CompanyPartnerFormDrawer
        open={isPartnerDrawerOpen}
        mode={partnerDrawerMode}
        partner={selectedPartner}
        isLoadingDetail={false}
        onClose={() => setIsPartnerDrawerOpen(false)}
        onSubmit={async (values) => {
          if (partnerDrawerMode === 'create') {
            await createPartner.mutateAsync(values);
          } else if (partnerDrawerMode === 'edit' && selectedPartnerId) {
            await updatePartner.mutateAsync({ id: selectedPartnerId, payload: values });
          }
        }}
        onDelete={selectedPartner ? async () => {
          await deletePartner.mutateAsync(selectedPartner.id);
          setIsPartnerDrawerOpen(false);
        } : undefined}
        submitting={createPartner.isPending || updatePartner.isPending}
        deleting={deletePartner.isPending}
        onPresignImage={handlePresignImage}
      />

      <CompanyClientFormDrawer
        open={isClientDrawerOpen}
        mode={clientDrawerMode}
        client={selectedClient}
        isLoadingDetail={false}
        onClose={() => setIsClientDrawerOpen(false)}
        onSubmit={async (values) => {
          if (clientDrawerMode === 'create') {
            await createClient.mutateAsync(values);
          } else if (clientDrawerMode === 'edit' && selectedClientId) {
            await updateClient.mutateAsync({ id: selectedClientId, payload: values });
          }
        }}
        onDelete={selectedClient ? async () => {
          await deleteClient.mutateAsync(selectedClient.id);
          setIsClientDrawerOpen(false);
        } : undefined}
        submitting={createClient.isPending || updateClient.isPending}
        deleting={deleteClient.isPending}
        onPresignImage={handlePresignImage}
      />

      <MarketValueFormDrawer
        open={isMarketDrawerOpen}
        mode={marketDrawerMode}
        marketValue={marketValue}
        isLoadingDetail={false}
        onClose={() => setIsMarketDrawerOpen(false)}
        onSubmit={async (values) => {
          if (marketDrawerMode === 'create') {
            await createMarket.mutateAsync(values);
          } else if (marketDrawerMode === 'edit' && marketValue) {
            await updateMarket.mutateAsync({ id: marketValue.id, payload: values });
          }
        }}
        onDelete={marketValue ? async () => {
          await deleteMarket.mutateAsync(marketValue.id);
          setIsMarketDrawerOpen(false);
        } : undefined}
        submitting={createMarket.isPending || updateMarket.isPending}
        deleting={deleteMarket.isPending}
      />

      <CompanyGoalFormDrawer
        open={isGoalDrawerOpen}
        mode={goalDrawerMode}
        goal={selectedGoal}
        isLoadingDetail={false}
        onClose={() => setIsGoalDrawerOpen(false)}
        onSubmit={async (values) => {
          if (goalDrawerMode === 'create') {
            await createGoal.mutateAsync(values);
          } else if (goalDrawerMode === 'edit' && selectedGoalId) {
            await updateGoal.mutateAsync({ id: selectedGoalId, payload: values });
          }
        }}
        onDelete={selectedGoal ? async () => {
          await deleteGoal.mutateAsync(selectedGoal.id);
          setIsGoalDrawerOpen(false);
        } : undefined}
        submitting={createGoal.isPending || updateGoal.isPending}
        deleting={deleteGoal.isPending}
        onPresignImage={handlePresignImage}
      />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { CompanyContentCard } from './CompanyContentCard';
import { CompanyContentModal } from './CompanyContentModal';
import { palette } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';
import {
  usePublicCompanyProfiles,
  usePublicCompanyPartners,
  usePublicCompanyClients,
  usePublicCompanyResources,
  usePublicCompanyStrengths,
  usePublicPartnershipInfo,
  usePublicMarketValue,
  usePublicCompanyGoals,
} from '../../hooks/usePublicContent';
import { SectionSkeleton } from './SectionSkeleton';

interface SectionCard {
  id: string;
  title: string;
  description?: string | null;
  iconKey?: string | null;
  displayOrder?: number;
  onClick?: () => void;
}

interface ContentSection {
  id: string;
  title: string;
  cards: SectionCard[];
  displayOrder: number;
}

export function CompanyContentSection() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  // Fetch all content
  const { data: profilesData, isLoading: isLoadingProfiles, isError: isErrorProfiles } = usePublicCompanyProfiles();
  const { data: partnersData, isLoading: isLoadingPartners, isError: isErrorPartners } = usePublicCompanyPartners();
  const { data: clientsData, isLoading: isLoadingClients, isError: isErrorClients } = usePublicCompanyClients();
  const { data: resourcesData, isLoading: isLoadingResources, isError: isErrorResources } = usePublicCompanyResources();
  const { data: strengthsData, isLoading: isLoadingStrengths, isError: isErrorStrengths } = usePublicCompanyStrengths();
  const { data: partnershipData, isLoading: isLoadingPartnership, isError: isErrorPartnership } = usePublicPartnershipInfo();
  const { data: marketValueData, isLoading: isLoadingMarketValue, isError: isErrorMarketValue } = usePublicMarketValue();
  const { data: goalsData, isLoading: isLoadingGoals, isError: isErrorGoals } = usePublicCompanyGoals();

  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const isLoading =
    isLoadingProfiles ||
    isLoadingPartners ||
    isLoadingClients ||
    isLoadingResources ||
    isLoadingStrengths ||
    isLoadingPartnership ||
    isLoadingMarketValue ||
    isLoadingGoals;

  const hasError =
    isErrorProfiles ||
    isErrorPartners ||
    isErrorClients ||
    isErrorResources ||
    isErrorStrengths ||
    isErrorPartnership ||
    isErrorMarketValue ||
    isErrorGoals;

  // Build separate sections for each content type according to requirements
  const sections = useMemo<ContentSection[]>(() => {
    const sectionsList: ContentSection[] = [];
    const profiles = profilesData?.profiles ?? [];
    const partners = partnersData?.partners ?? [];
    const clients = clientsData?.clients ?? [];
    const resources = resourcesData?.resources ?? [];
    const strengths = strengthsData?.strengths ?? [];
    const partnershipInfo = partnershipData?.partnershipInfo ?? [];
    const marketValue = marketValueData?.marketValue;
    const goals = goalsData?.goals ?? [];

    // 1. بروفايل تعريفي عن الشركة وعملائنا وشركائنا
    // Combined section: Profiles + Partners + Clients
    const profileCards: SectionCard[] = [];
    let minOrder1 = Infinity;

    // Add profiles
    profiles.forEach((profile) => {
      profileCards.push({
        id: `profile-${profile.id}`,
        title: profile.title,
        description: profile.content.substring(0, 100) + (profile.content.length > 100 ? '...' : ''),
        iconKey: profile.iconKey,
        displayOrder: profile.displayOrder,
        onClick: () => setSelectedSection(`profile-${profile.id}`),
      });
      minOrder1 = Math.min(minOrder1, profile.displayOrder);
    });

    // Add partners
    partners.forEach((partner) => {
      profileCards.push({
        id: `partner-${partner.id}`,
        title: partner.name,
        description: partner.description
          ? partner.description.substring(0, 100) + (partner.description.length > 100 ? '...' : '')
          : null,
        iconKey: partner.logoKey,
        displayOrder: partner.displayOrder,
        onClick: () => setSelectedSection(`partner-${partner.id}`),
      });
      minOrder1 = Math.min(minOrder1, partner.displayOrder);
    });

    // Add clients (as part of partners/clients section)
    clients.forEach((client) => {
      profileCards.push({
        id: `client-${client.id}`,
        title: client.name,
        description: client.description
          ? client.description.substring(0, 100) + (client.description.length > 100 ? '...' : '')
          : null,
        iconKey: client.logoKey,
        displayOrder: client.displayOrder,
        onClick: () => setSelectedSection(`client-${client.id}`),
      });
      minOrder1 = Math.min(minOrder1, client.displayOrder);
    });

    if (profileCards.length > 0) {
      // Sort all cards by displayOrder
      profileCards.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

      sectionsList.push({
        id: 'company-profile',
        title: isArabic
          ? 'بروفايل تعريفي عن الشركة وعملائنا وشركائنا'
          : 'Company Profile, Partners & Clients',
        cards: profileCards,
        displayOrder: minOrder1 === Infinity ? 0 : minOrder1,
      });
    }

    // 2. نموذج العمل التجاري للشركة (Business Model)
    // Note: Clients are also shown here separately as business model examples
    if (clients.length > 0) {
      const businessModelCards: SectionCard[] = clients
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((client) => ({
          id: `business-model-${client.id}`,
          title: client.name,
          description: client.description
            ? client.description.substring(0, 100) + (client.description.length > 100 ? '...' : '')
            : null,
          iconKey: client.logoKey,
          displayOrder: client.displayOrder,
          onClick: () => setSelectedSection(`client-${client.id}`),
        }));

      const minDisplayOrder = Math.min(...clients.map((c) => c.displayOrder), Infinity);
      sectionsList.push({
        id: 'business-model',
        title: isArabic ? 'نموذج العمل التجاري للشركة' : 'Company Business Model',
        cards: businessModelCards,
        displayOrder: minDisplayOrder === Infinity ? 1 : minDisplayOrder,
      });
    }

    // 3. الموارد المالية
    if (resources.length > 0) {
      const resourceCards: SectionCard[] = resources
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((resource) => {
          const description = resource.description
            ? resource.description.substring(0, 100) + (resource.description.length > 100 ? '...' : '')
            : resource.value
              ? new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
                  style: 'currency',
                  currency: resource.currency,
                  maximumFractionDigits: 0,
                }).format(resource.value)
              : null;

          return {
            id: `resource-${resource.id}`,
            title: resource.title,
            description,
            iconKey: resource.iconKey,
            displayOrder: resource.displayOrder,
            onClick: () => setSelectedSection(`resource-${resource.id}`),
          };
        });

      const minDisplayOrder = Math.min(...resources.map((r) => r.displayOrder), Infinity);
      sectionsList.push({
        id: 'resources',
        title: isArabic ? 'الموارد المالية' : 'Financial Resources',
        cards: resourceCards,
        displayOrder: minDisplayOrder === Infinity ? 2 : minDisplayOrder,
      });
    }

    // 4. نقاط قوة الشركة
    if (strengths.length > 0) {
      const strengthCards: SectionCard[] = strengths
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((strength) => ({
          id: `strength-${strength.id}`,
          title: strength.title,
          description: strength.description
            ? strength.description.substring(0, 100) + (strength.description.length > 100 ? '...' : '')
            : null,
          iconKey: strength.iconKey,
          displayOrder: strength.displayOrder,
          onClick: () => setSelectedSection(`strength-${strength.id}`),
        }));

      const minDisplayOrder = Math.min(...strengths.map((s) => s.displayOrder), Infinity);
      sectionsList.push({
        id: 'strengths',
        title: isArabic ? 'نقاط قوة الشركة' : 'Company Strengths',
        cards: strengthCards,
        displayOrder: minDisplayOrder === Infinity ? 3 : minDisplayOrder,
      });
    }

    // 5. كيف تكون شريك في باكورة
    if (partnershipInfo.length > 0) {
      const partnershipCards: SectionCard[] = partnershipInfo
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((info) => ({
          id: `partnership-${info.id}`,
          title: info.title,
          description: info.content.substring(0, 120) + (info.content.length > 120 ? '...' : ''),
          iconKey: info.iconKey,
          displayOrder: info.displayOrder,
          onClick: () => setSelectedSection(`partnership-${info.id}`),
        }));

      const minDisplayOrder = Math.min(...partnershipInfo.map((i) => i.displayOrder), Infinity);
      sectionsList.push({
        id: 'partnership',
        title: isArabic ? 'كيف تكون شريك في باكورة' : 'How to Become a Partner in Bacura',
        cards: partnershipCards,
        displayOrder: minDisplayOrder === Infinity ? 4 : minDisplayOrder,
      });
    }

    // 6. القيمة السوقية المعتمدة للشركة
    if (marketValue) {
      const formattedValue = new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: marketValue.currency,
        maximumFractionDigits: 0,
      }).format(marketValue.value);

      const formattedDate = new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
        dateStyle: 'medium',
      }).format(new Date(marketValue.valuationDate));

      sectionsList.push({
        id: 'market-value',
        title: isArabic ? 'القيمة السوقية المعتمدة للشركة' : 'Company Verified Market Value',
        cards: [
          {
            id: 'market-value',
            title: isArabic ? 'القيمة السوقية المعتمدة' : 'Verified Market Value',
            description: `${formattedValue} (${formattedDate})`,
            iconKey: null,
            displayOrder: 500,
            onClick: () => setSelectedSection('market-value'),
          },
        ],
        displayOrder: 500,
      });
    }

    // 7. الأهداف العامة للشركة
    if (goals.length > 0) {
      const goalCards: SectionCard[] = goals
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((goal) => {
          const description = goal.description
            ? goal.description.substring(0, 100) + (goal.description.length > 100 ? '...' : '')
            : goal.targetDate
              ? new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
                  dateStyle: 'medium',
                }).format(new Date(goal.targetDate))
              : null;

          return {
            id: `goal-${goal.id}`,
            title: goal.title,
            description,
            iconKey: goal.iconKey,
            displayOrder: goal.displayOrder,
            onClick: () => setSelectedSection(`goal-${goal.id}`),
          };
        });

      const minDisplayOrder = Math.min(...goals.map((g) => g.displayOrder), Infinity);
      sectionsList.push({
        id: 'goals',
        title: isArabic ? 'الأهداف العامة للشركة' : 'Company General Goals',
        cards: goalCards,
        displayOrder: minDisplayOrder === Infinity ? 6 : minDisplayOrder,
      });
    }

    // Sort sections by displayOrder
    return sectionsList.sort((a, b) => a.displayOrder - b.displayOrder);
  }, [
    profilesData,
    partnersData,
    clientsData,
    resourcesData,
    strengthsData,
    partnershipData,
    marketValueData,
    goalsData,
    language,
    isArabic,
  ]);

  if (isLoading) {
    return <SectionSkeleton />;
  }

  if (hasError) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '4rem 2rem',
          textAlign: 'center',
          direction,
        }}
      >
        <div
          style={{
            padding: '3rem 2rem',
            borderRadius: '1.5rem',
            background: palette.backgroundSurface,
            border: `2px dashed ${palette.brandSecondaryMuted}`,
            color: palette.textSecondary,
          }}
        >
          <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.7 }}>
            {isArabic
              ? 'حدث خطأ في تحميل البيانات. يرجى المحاولة مرة أخرى لاحقاً.'
              : 'Failed to load content. Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '4rem 2rem',
          textAlign: 'center',
          direction,
        }}
      >
        <div
          style={{
            padding: '3rem 2rem',
            borderRadius: '1.5rem',
            background: palette.backgroundSurface,
            border: `2px dashed ${palette.brandSecondaryMuted}`,
            color: palette.textSecondary,
          }}
        >
          <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: 1.7 }}>
            {isArabic
              ? 'لا توجد بيانات متاحة للعرض حالياً.'
              : 'No content available to display at the moment.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '3rem 2rem',
        direction,
      }}
    >
      {sections.map((section) => (
        <section
          key={section.id}
          style={{
            marginBottom: '6rem',
            padding: '0',
            borderRadius: '0',
            border: 'none',
            background: 'transparent',
            boxShadow: 'none',
            position: 'relative',
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: '3rem',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: palette.textPrimary,
              textAlign: 'center',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            {section.title}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem 2rem',
            }}
          >
            {section.cards.map((card) => (
              <CompanyContentCard
                key={card.id}
                id={card.id}
                title={card.title}
                description={card.description}
                iconKey={card.iconKey}
                onClick={card.onClick}
                language={language}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Modal for section details */}
      <CompanyContentModal
        sectionId={selectedSection}
        isOpen={selectedSection !== null}
        onClose={() => setSelectedSection(null)}
      />
    </div>
  );
}

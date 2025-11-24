import { useMemo, useState } from 'react';
import { CompanyContentCard } from './CompanyContentCard';
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
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '../../utils/supabase-storage';
import { OptimizedImage } from '../OptimizedImage';
import { SectionSkeleton } from './SectionSkeleton';

interface SectionCard {
  id: string;
  title: string;
  description?: string | null;
  iconKey?: string | null;
  onClick?: () => void;
}

export function CompanyContentSection() {
  const { language, direction } = useLanguage();

  // Fetch all content
  const { data: profilesData, isLoading: isLoadingProfiles } = usePublicCompanyProfiles();
  const { data: partnersData, isLoading: isLoadingPartners } = usePublicCompanyPartners();
  const { data: clientsData, isLoading: isLoadingClients } = usePublicCompanyClients();
  const { data: resourcesData, isLoading: isLoadingResources } = usePublicCompanyResources();
  const { data: strengthsData, isLoading: isLoadingStrengths } = usePublicCompanyStrengths();
  const { data: partnershipData, isLoading: isLoadingPartnership } = usePublicPartnershipInfo();
  const { data: marketValueData, isLoading: isLoadingMarketValue } = usePublicMarketValue();
  const { data: goalsData, isLoading: isLoadingGoals } = usePublicCompanyGoals();

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

  // Build section cards - aggregate all items into cards
  const sections = useMemo<SectionCard[]>(() => {
    const cards: SectionCard[] = [];
    const profiles = profilesData?.profiles ?? [];
    const partners = partnersData?.partners ?? [];
    const clients = clientsData?.clients ?? [];
    const resources = resourcesData?.resources ?? [];
    const strengths = strengthsData?.strengths ?? [];
    const partnershipInfo = partnershipData?.partnershipInfo ?? [];
    const marketValue = marketValueData?.marketValue;
    const goals = goalsData?.goals ?? [];

    // 1. Company Profile (all profiles)
    profiles.forEach((profile) => {
      cards.push({
        id: `profile-${profile.id}`,
        title: profile.title,
        description: profile.content.substring(0, 100) + (profile.content.length > 100 ? '...' : ''),
        iconKey: profile.iconKey,
        onClick: () => setSelectedSection(`profile-${profile.id}`),
      });
    });

    // 2. Partners & Clients (combined as one section if they exist)
    if (partners.length > 0 || clients.length > 0) {
      cards.push({
        id: 'partners-clients',
        title: language === 'ar' ? 'عملائنا وشركائنا' : 'Our Partners & Clients',
        description:
          language === 'ar'
            ? `${partners.length} شريك و ${clients.length} عميل`
            : `${partners.length} partners and ${clients.length} clients`,
        iconKey: null,
        onClick: () => setSelectedSection('partners-clients'),
      });
    }

    // 3. Resources (all resources - Business Model + Financial Resources)
    resources.forEach((resource) => {
      const description = resource.description
        ? resource.description.substring(0, 100) + (resource.description.length > 100 ? '...' : '')
        : resource.value
          ? new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
              style: 'currency',
              currency: resource.currency,
              maximumFractionDigits: 0,
            }).format(resource.value)
          : null;

      cards.push({
        id: `resource-${resource.id}`,
        title: resource.title,
        description,
        iconKey: resource.iconKey,
        onClick: () => setSelectedSection(`resource-${resource.id}`),
      });
    });

    // 4. Company Strengths (all strengths)
    strengths.forEach((strength) => {
      cards.push({
        id: `strength-${strength.id}`,
        title: strength.title,
        description: strength.description
          ? strength.description.substring(0, 100) + (strength.description.length > 100 ? '...' : '')
          : null,
        iconKey: strength.iconKey,
        onClick: () => setSelectedSection(`strength-${strength.id}`),
      });
    });

    // 5. Partnership Info (all partnership info items)
    partnershipInfo.forEach((info) => {
      cards.push({
        id: `partnership-${info.id}`,
        title: info.title,
        description: info.content.substring(0, 120) + (info.content.length > 120 ? '...' : ''),
        iconKey: info.iconKey,
        onClick: () => setSelectedSection(`partnership-${info.id}`),
      });
    });

    // 6. Market Value (single card)
    if (marketValue) {
      const formattedValue = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: marketValue.currency,
        maximumFractionDigits: 0,
      }).format(marketValue.value);

      const formattedDate = new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
        dateStyle: 'medium',
      }).format(new Date(marketValue.valuationDate));

      cards.push({
        id: 'market-value',
        title: language === 'ar' ? 'القيمة السوقية المعتمدة' : 'Verified Market Value',
        description: `${formattedValue} (${formattedDate})`,
        iconKey: null,
        onClick: () => setSelectedSection('market-value'),
      });
    }

    // 7. Company Goals (all goals)
    goals.forEach((goal) => {
      const description = goal.description
        ? goal.description.substring(0, 100) + (goal.description.length > 100 ? '...' : '')
        : goal.targetDate
          ? new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
              dateStyle: 'medium',
            }).format(new Date(goal.targetDate))
          : null;

      cards.push({
        id: `goal-${goal.id}`,
        title: goal.title,
        description,
        iconKey: goal.iconKey,
        onClick: () => setSelectedSection(`goal-${goal.id}`),
      });
    });

    // Sort by display order if available (for now, maintain insertion order)
    return cards;
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
  ]);

  if (isLoading) {
    return <SectionSkeleton />;
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        direction,
      }}
    >
      <h2
        style={{
          margin: 0,
          marginBottom: '2rem',
          fontSize: '2.25rem',
          fontWeight: 700,
          color: palette.textPrimary,
          textAlign: 'center',
          background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondaryMuted})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {language === 'ar' ? 'معلومات عن الشركة' : 'Company Information'}
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {sections.map((section) => (
          <CompanyContentCard
            key={section.id}
            id={section.id}
            title={section.title}
            description={section.description}
            iconKey={section.iconKey}
            onClick={section.onClick}
            language={language}
          />
        ))}
      </div>

      {/* TODO: Add modal for section details */}
    </section>
  );
}


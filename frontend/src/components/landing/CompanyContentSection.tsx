import { useMemo, useState } from 'react';
import { CompanyContentCard } from './CompanyContentCard';
import { CompanyContentModal } from './CompanyContentModal';
import { palette } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';
import {
  usePublicCompanyProfiles,
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

function getSectionIcon(sectionId: string, color: string): JSX.Element | null {
  const iconProps = {
    width: 72,
    height: 72,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;

  switch (sectionId) {
    case 'company-profile':
      return (
        <svg {...iconProps}>
          <circle cx="32" cy="20" r="10" fill={`${color}20`} stroke="none" />
          <path d="M16 52C16 42 24 36 32 36C40 36 48 42 48 52" />
          <circle cx="17" cy="24" r="4" />
          <circle cx="47" cy="24" r="4" />
        </svg>
      );
    case 'business-model':
      return (
        <svg {...iconProps}>
          <rect x="12" y="30" width="10" height="22" />
          <rect x="28" y="20" width="10" height="32" />
          <rect x="44" y="10" width="10" height="42" />
          <path d="M12 14L30 6L52 14" />
        </svg>
      );
    case 'resources':
      return (
        <svg {...iconProps}>
          <path d="M14 24H50V48C50 52.4183 46.4183 56 42 56H22C17.5817 56 14 52.4183 14 48V24Z" />
          <path d="M22 16H42L50 24H14L22 16Z" />
          <path d="M26 34H38" />
          <path d="M26 42H38" />
        </svg>
      );
    case 'strengths':
      return (
        <svg {...iconProps}>
          <path d="M12 36L28 50L52 14" />
          <path d="M20 40L28 32" />
          <path d="M40 24L48 16" />
        </svg>
      );
    case 'partnership':
      return (
        <svg {...iconProps}>
          <path d="M20 50L32 38L44 50" />
          <circle cx="32" cy="24" r="10" />
          <path d="M12 18C12 14.6863 14.6863 12 18 12H22" />
          <path d="M52 18C52 14.6863 49.3137 12 46 12H42" />
        </svg>
      );
    case 'market-value':
      return (
        <svg {...iconProps}>
          <path d="M14 44L26 32L38 40L50 22" />
          <path d="M10 54H54" />
          <path d="M14 30V14" />
          <path d="M26 24V10" />
          <path d="M38 28V12" />
          <path d="M50 18V8" />
        </svg>
      );
    case 'goals':
      return (
        <svg {...iconProps}>
          <circle cx="32" cy="32" r="20" />
          <circle cx="32" cy="32" r="10" />
          <path d="M32 12V6" />
          <path d="M32 58V52" />
          <path d="M12 32H6" />
          <path d="M58 32H52" />
        </svg>
      );
    default:
      return null;
  }
}

export function CompanyContentSection() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  // Fetch all content from general content management group
  const { data: profilesData, isLoading: isLoadingProfiles, isError: isErrorProfiles } = usePublicCompanyProfiles();
  const { data: clientsData, isLoading: isLoadingClients, isError: isErrorClients } = usePublicCompanyClients();
  const { data: resourcesData, isLoading: isLoadingResources, isError: isErrorResources } = usePublicCompanyResources();
  const { data: strengthsData, isLoading: isLoadingStrengths, isError: isErrorStrengths } = usePublicCompanyStrengths();
  const { data: partnershipData, isLoading: isLoadingPartnership, isError: isErrorPartnership } = usePublicPartnershipInfo();
  const { data: marketValueData, isLoading: isLoadingMarketValue, isError: isErrorMarketValue } = usePublicMarketValue();
  const { data: goalsData, isLoading: isLoadingGoals, isError: isErrorGoals } = usePublicCompanyGoals();

  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const isLoading =
    isLoadingProfiles ||
    isLoadingClients ||
    isLoadingResources ||
    isLoadingStrengths ||
    isLoadingPartnership ||
    isLoadingMarketValue ||
    isLoadingGoals;

  const hasError =
    isErrorProfiles ||
    isErrorClients ||
    isErrorResources ||
    isErrorStrengths ||
    isErrorPartnership ||
    isErrorMarketValue ||
    isErrorGoals;

  // Build separate sections for each content type according to general content management group
  // Sections: Profiles, Business Model (Clients), Resources, Strengths, Partnership Info, Market Value, Goals
  const sections = useMemo<ContentSection[]>(() => {
    const sectionsList: ContentSection[] = [];
    const profiles = profilesData?.profiles ?? [];
    const clients = clientsData?.clients ?? [];
    const resources = resourcesData?.resources ?? [];
    const strengths = strengthsData?.strengths ?? [];
    const partnershipInfo = partnershipData?.partnershipInfo ?? [];
    const marketValue = marketValueData?.marketValue;
    const goals = goalsData?.goals ?? [];

    // 1. البروفايل التعريفي (Company Profile)
    if (profiles.length > 0) {
      const profileCards: SectionCard[] = profiles
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((profile) => ({
          id: `profile-${profile.id}`,
          title: profile.title,
          description: profile.content.substring(0, 100) + (profile.content.length > 100 ? '...' : ''),
          iconKey: profile.iconKey,
          displayOrder: profile.displayOrder,
          onClick: () => setSelectedSection(`profile-${profile.id}`),
        }));

      const minDisplayOrder = Math.min(...profiles.map((p) => p.displayOrder), Infinity);
      sectionsList.push({
        id: 'company-profile',
        title: isArabic ? 'البروفايل التعريفي' : 'Company Profile',
        cards: profileCards,
        displayOrder: minDisplayOrder === Infinity ? 0 : minDisplayOrder,
      });
    }

    // 2. نموذج العمل التجاري (Business Model - Clients)
    if (clients.length > 0) {
      const businessModelCards: SectionCard[] = clients
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((client) => ({
          id: `client-${client.id}`,
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
        title: isArabic ? 'نموذج العمل التجاري' : 'Business Model',
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
          <div
            style={{
              width: '96px',
              height: '96px',
              margin: '0 auto 2rem',
              borderRadius: '24px',
              background: `${palette.brandSecondarySoft}20`,
              border: `2px solid ${palette.brandSecondarySoft}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={section.title}
          >
            {getSectionIcon(section.id, palette.brandPrimaryStrong)}
          </div>

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

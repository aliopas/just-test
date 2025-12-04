import React, { useMemo, useState } from 'react';
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
  type PublicCompanyProfile,
  type PublicCompanyClient,
  type PublicCompanyResource,
  type PublicCompanyStrength,
  type PublicPartnershipInfo,
  type PublicMarketValue,
  type PublicCompanyGoal,
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
    width: 80,
    height: 80,
    viewBox: '0 0 64 64',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: color,
    strokeWidth: 2.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: {
      filter: 'drop-shadow(0 2px 4px rgba(45, 111, 163, 0.15))',
      transition: 'all 0.3s ease',
    },
  } as const;

  switch (sectionId) {
    case 'company-profile':
      return (
        <svg {...iconProps}>
          <defs>
            <linearGradient id={`${sectionId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="20" r="10" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2" />
          <path d="M16 52C16 42 24 36 32 36C40 36 48 42 48 52" stroke={color} strokeWidth="2.5" />
          <circle cx="17" cy="24" r="4" fill={color} opacity="0.6" />
          <circle cx="47" cy="24" r="4" fill={color} opacity="0.6" />
        </svg>
      );
    case 'business-model':
      return (
        <svg {...iconProps}>
          <defs>
            <linearGradient id={`${sectionId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect x="12" y="30" width="10" height="22" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2.5" rx="2" />
          <rect x="28" y="20" width="10" height="32" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2.5" rx="2" />
          <rect x="44" y="10" width="10" height="42" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2.5" rx="2" />
          <path d="M12 14L30 6L52 14" stroke={color} strokeWidth="2.5" fill="none" />
        </svg>
      );
    case 'resources':
      return (
        <svg {...iconProps}>
          <defs>
            <linearGradient id={`${sectionId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M14 24H50V48C50 52.4183 46.4183 56 42 56H22C17.5817 56 14 52.4183 14 48V24Z" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2.5" />
          <path d="M22 16H42L50 24H14L22 16Z" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2.5" />
          <path d="M26 34H38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M26 42H38" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'strengths':
      return (
        <svg {...iconProps}>
          <defs>
            <linearGradient id={`${sectionId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="24" fill={`url(#${sectionId}-gradient)`} opacity="0.3" />
          <path d="M12 36L28 50L52 14" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 40L28 32" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M40 24L48 16" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'partnership':
      return (
        <svg {...iconProps}>
          <defs>
            <linearGradient id={`${sectionId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M20 50L32 38L44 50" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="32" cy="24" r="10" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2.5" />
          <path d="M12 18C12 14.6863 14.6863 12 18 12H22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M52 18C52 14.6863 49.3137 12 46 12H42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'market-value':
      return (
        <svg {...iconProps}>
          <defs>
            <linearGradient id={`${sectionId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <path d="M14 44L26 32L38 40L50 22" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="14" cy="44" r="3" fill={color} opacity="0.7" />
          <circle cx="26" cy="32" r="3" fill={color} opacity="0.7" />
          <circle cx="38" cy="40" r="3" fill={color} opacity="0.7" />
          <circle cx="50" cy="22" r="3" fill={color} opacity="0.7" />
          <path d="M10 54H54" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 30V14" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M26 24V10" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M38 28V12" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M50 18V8" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'goals':
      return (
        <svg {...iconProps}>
          <defs>
            <linearGradient id={`${sectionId}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
            <radialGradient id={`${sectionId}-radial`} cx="50%" cy="50%">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="20" fill={`url(#${sectionId}-radial)`} stroke={color} strokeWidth="2.5" />
          <circle cx="32" cy="32" r="10" fill={`url(#${sectionId}-gradient)`} stroke={color} strokeWidth="2.5" />
          <path d="M32 12V6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 58V52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M12 32H6" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <path d="M58 32H52" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
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
  const {
    data: profilesData,
    isLoading: isLoadingProfiles,
    isError: isErrorProfiles,
  } = usePublicCompanyProfiles();
  const {
    data: clientsData,
    isLoading: isLoadingClients,
    isError: isErrorClients,
  } = usePublicCompanyClients();
  const {
    data: resourcesData,
    isLoading: isLoadingResources,
    isError: isErrorResources,
  } = usePublicCompanyResources();
  const {
    data: strengthsData,
    isLoading: isLoadingStrengths,
    isError: isErrorStrengths,
  } = usePublicCompanyStrengths();
  const {
    data: partnershipData,
    isLoading: isLoadingPartnership,
    isError: isErrorPartnership,
  } = usePublicPartnershipInfo();
  const {
    data: marketValueData,
    isLoading: isLoadingMarketValue,
    isError: isErrorMarketValue,
  } = usePublicMarketValue();
  const {
    data: goalsData,
    isLoading: isLoadingGoals,
    isError: isErrorGoals,
  } = usePublicCompanyGoals();

  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Check if any query is still loading
  const isLoading =
    isLoadingProfiles ||
    isLoadingClients ||
    isLoadingResources ||
    isLoadingStrengths ||
    isLoadingPartnership ||
    isLoadingMarketValue ||
    isLoadingGoals;

  // Check if any query has an error
  const hasAnyError =
    isErrorProfiles ||
    isErrorClients ||
    isErrorResources ||
    isErrorStrengths ||
    isErrorPartnership ||
    isErrorMarketValue ||
    isErrorGoals;

  // Check if we have at least some data loaded (partial success)
  const hasPartialData =
    ((profilesData as { profiles?: PublicCompanyProfile[] } | undefined)?.profiles?.length ?? 0) > 0 ||
    ((clientsData as { clients?: PublicCompanyClient[] } | undefined)?.clients?.length ?? 0) > 0 ||
    ((resourcesData as { resources?: PublicCompanyResource[] } | undefined)?.resources?.length ?? 0) > 0 ||
    ((strengthsData as { strengths?: PublicCompanyStrength[] } | undefined)?.strengths?.length ?? 0) > 0 ||
    ((partnershipData as { partnershipInfo?: PublicPartnershipInfo[] } | undefined)?.partnershipInfo?.length ?? 0) > 0 ||
    (marketValueData as { marketValue?: PublicMarketValue | null } | undefined)?.marketValue !== null ||
    ((goalsData as { goals?: PublicCompanyGoal[] } | undefined)?.goals?.length ?? 0) > 0;

  // Build separate sections for each content type according to general content management group
  // Sections: Profiles, Business Model (Clients), Resources, Strengths, Partnership Info, Market Value, Goals
  const sections = useMemo<ContentSection[]>(() => {
    const sectionsList: ContentSection[] = [];
    const profiles: PublicCompanyProfile[] = (profilesData as { profiles?: PublicCompanyProfile[] } | undefined)?.profiles ?? [];
    const clients: PublicCompanyClient[] = (clientsData as { clients?: PublicCompanyClient[] } | undefined)?.clients ?? [];
    const resources: PublicCompanyResource[] = (resourcesData as { resources?: PublicCompanyResource[] } | undefined)?.resources ?? [];
    const strengths: PublicCompanyStrength[] = (strengthsData as { strengths?: PublicCompanyStrength[] } | undefined)?.strengths ?? [];
    const partnershipInfo: PublicPartnershipInfo[] = (partnershipData as { partnershipInfo?: PublicPartnershipInfo[] } | undefined)?.partnershipInfo ?? [];
    const marketValue: PublicMarketValue | null | undefined = (marketValueData as { marketValue?: PublicMarketValue | null } | undefined)?.marketValue;
    const goals: PublicCompanyGoal[] = (goalsData as { goals?: PublicCompanyGoal[] } | undefined)?.goals ?? [];

    // 1. البروفايل التعريفي (Company Profile)
    if (profiles.length > 0) {
      const profileCards: SectionCard[] = profiles
        .sort((a: PublicCompanyProfile, b: PublicCompanyProfile) => a.displayOrder - b.displayOrder)
        .map((profile: PublicCompanyProfile) => ({
          id: `profile-${profile.id}`,
          title: profile.title,
          description: profile.content.substring(0, 100) + (profile.content.length > 100 ? '...' : ''),
          iconKey: profile.iconKey,
          displayOrder: profile.displayOrder,
          onClick: () => setSelectedSection(`profile-${profile.id}`),
        }));

      const minDisplayOrder = Math.min(...profiles.map((p: PublicCompanyProfile) => p.displayOrder), Infinity);
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
        .sort((a: PublicCompanyClient, b: PublicCompanyClient) => a.displayOrder - b.displayOrder)
        .map((client: PublicCompanyClient) => ({
          id: `client-${client.id}`,
          title: client.name,
          description: client.description
            ? client.description.substring(0, 100) + (client.description.length > 100 ? '...' : '')
            : null,
          iconKey: client.logoKey,
          displayOrder: client.displayOrder,
          onClick: () => setSelectedSection(`client-${client.id}`),
        }));

      const minDisplayOrder = Math.min(...clients.map((c: PublicCompanyClient) => c.displayOrder), Infinity);
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
        .sort((a: PublicCompanyResource, b: PublicCompanyResource) => a.displayOrder - b.displayOrder)
        .map((resource: PublicCompanyResource) => {
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

      const minDisplayOrder = Math.min(...resources.map((r: PublicCompanyResource) => r.displayOrder), Infinity);
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
        .sort((a: PublicCompanyStrength, b: PublicCompanyStrength) => a.displayOrder - b.displayOrder)
        .map((strength: PublicCompanyStrength) => ({
          id: `strength-${strength.id}`,
          title: strength.title,
          description: strength.description
            ? strength.description.substring(0, 100) + (strength.description.length > 100 ? '...' : '')
            : null,
          iconKey: strength.iconKey,
          displayOrder: strength.displayOrder,
          onClick: () => setSelectedSection(`strength-${strength.id}`),
        }));

      const minDisplayOrder = Math.min(...strengths.map((s: PublicCompanyStrength) => s.displayOrder), Infinity);
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
        .sort((a: PublicPartnershipInfo, b: PublicPartnershipInfo) => a.displayOrder - b.displayOrder)
        .map((info: PublicPartnershipInfo) => ({
          id: `partnership-${info.id}`,
          title: info.title,
          description: info.content.substring(0, 120) + (info.content.length > 120 ? '...' : ''),
          iconKey: info.iconKey,
          displayOrder: info.displayOrder,
          onClick: () => setSelectedSection(`partnership-${info.id}`),
        }));

      const minDisplayOrder = Math.min(...partnershipInfo.map((i: PublicPartnershipInfo) => i.displayOrder), Infinity);
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
        .sort((a: PublicCompanyGoal, b: PublicCompanyGoal) => a.displayOrder - b.displayOrder)
        .map((goal: PublicCompanyGoal) => {
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

      const minDisplayOrder = Math.min(...goals.map((g: PublicCompanyGoal) => g.displayOrder), Infinity);
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

  // Show loading skeleton only if we're loading and have no data at all
  if (isLoading && !hasPartialData) {
    return React.createElement(SectionSkeleton);
  }

  // Show error/empty state only if we have no sections AND we're not loading
  if (sections.length === 0 && !isLoading) {
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
            {hasAnyError
              ? isArabic
                ? 'حدث خطأ في تحميل بعض البيانات. قد تظهر بعض الأقسام بشكل محدود.'
                : 'Failed to load some content. Some sections may appear limited.'
              : isArabic
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
              width: '120px',
              height: '120px',
              margin: '0 auto 2.5rem',
              borderRadius: '28px',
              background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}15 0%, ${palette.brandSecondarySoft}25 100%)`,
              border: `3px solid ${palette.brandPrimaryStrong}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: `
                0 8px 24px rgba(45, 111, 163, 0.12),
                0 4px 12px rgba(45, 111, 163, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.05)';
              e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimaryStrong}25 0%, ${palette.brandSecondarySoft}35 100%)`;
              e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}60`;
              e.currentTarget.style.boxShadow = `
                0 16px 40px rgba(45, 111, 163, 0.2),
                0 8px 20px rgba(45, 111, 163, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.2)
              `;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimaryStrong}15 0%, ${palette.brandSecondarySoft}25 100%)`;
              e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}30`;
              e.currentTarget.style.boxShadow = `
                0 8px 24px rgba(45, 111, 163, 0.12),
                0 4px 12px rgba(45, 111, 163, 0.08),
                inset 0 1px 0 rgba(255, 255, 255, 0.1)
              `;
            }}
            aria-label={section.title}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getSectionIcon(section.id, palette.brandPrimaryStrong)}
              {/* Decorative glow effect */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '32px',
                  background: `radial-gradient(circle at center, ${palette.brandPrimaryStrong}20 0%, transparent 70%)`,
                  opacity: 0,
                  transition: 'opacity 0.4s ease',
                  pointerEvents: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0';
                }}
              />
            </div>
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

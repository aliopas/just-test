import React, { useMemo, useState } from 'react';
import { CompanyContentCard } from './CompanyContentCard';
import { CompanyContentModal } from './CompanyContentModal';
import { palette } from '../../styles/theme';
import { useLanguage } from '../../context/LanguageContext';
import {
  useCompanyProfiles,
  useCompanyClients,
  useCompanyResources,
  useCompanyStrengths,
  usePartnershipInfo,
  useMarketValue,
  useCompanyGoals,
  type CompanyProfile,
  type CompanyClient,
  type CompanyResource,
  type CompanyStrength,
  type PartnershipInfo,
  type MarketValue,
  type CompanyGoal,
} from '../../hooks/useSupabaseTables';
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

function getSectionIcon(sectionId: string, color: string): React.ReactElement | null {
  const iconProps = {
    width: 56,
    height: 56,
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

  // Fetch all content directly from Supabase using new hooks
  const {
    data: profiles,
    isLoading: isLoadingProfiles,
    isError: isErrorProfiles,
  } = useCompanyProfiles();
  const {
    data: clients,
    isLoading: isLoadingClients,
    isError: isErrorClients,
  } = useCompanyClients();
  const {
    data: resources,
    isLoading: isLoadingResources,
    isError: isErrorResources,
  } = useCompanyResources();
  const {
    data: strengths,
    isLoading: isLoadingStrengths,
    isError: isErrorStrengths,
  } = useCompanyStrengths();
  const {
    data: partnershipInfo,
    isLoading: isLoadingPartnership,
    isError: isErrorPartnership,
  } = usePartnershipInfo();
  const {
    data: marketValue,
    isLoading: isLoadingMarketValue,
    isError: isErrorMarketValue,
  } = useMarketValue();
  const {
    data: goals,
    isLoading: isLoadingGoals,
    isError: isErrorGoals,
  } = useCompanyGoals();

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
    (profiles?.length ?? 0) > 0 ||
    (clients?.length ?? 0) > 0 ||
    (resources?.length ?? 0) > 0 ||
    (strengths?.length ?? 0) > 0 ||
    (partnershipInfo?.length ?? 0) > 0 ||
    marketValue !== null ||
    (goals?.length ?? 0) > 0;

  // Build separate sections for each content type according to general content management group
  // Sections: Profiles, Business Model (Clients), Resources, Strengths, Partnership Info, Market Value, Goals
  const sections = useMemo<ContentSection[]>(() => {
    const sectionsList: ContentSection[] = [];
    const profilesList: CompanyProfile[] = profiles ?? [];
    const clientsList: CompanyClient[] = clients ?? [];
    const resourcesList: CompanyResource[] = resources ?? [];
    const strengthsList: CompanyStrength[] = strengths ?? [];
    const partnershipInfoList: PartnershipInfo[] = partnershipInfo ?? [];
    const marketValueData: MarketValue | null = marketValue;
    const goalsList: CompanyGoal[] = goals ?? [];

    // 1. البروفايل التعريفي (Company Profile)
    if (profilesList.length > 0) {
      const profileCards: SectionCard[] = profilesList
        .sort((a, b) => a.display_order - b.display_order)
        .map((profile) => {
          const title = isArabic ? profile.title_ar : profile.title_en;
          const content = isArabic ? profile.content_ar : profile.content_en;
          return {
            id: `profile-${profile.id}`,
            title,
            description: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            iconKey: profile.icon_key,
            displayOrder: profile.display_order,
            onClick: () => setSelectedSection(`profile-${profile.id}`),
          };
        });

      const minDisplayOrder = Math.min(...profilesList.map((p) => p.display_order), Infinity);
      sectionsList.push({
        id: 'company-profile',
        title: isArabic ? 'البروفايل التعريفي' : 'Company Profile',
        cards: profileCards,
        displayOrder: minDisplayOrder === Infinity ? 0 : minDisplayOrder,
      });
    }

    // 2. نموذج العمل التجاري (Business Model - Clients)
    if (clientsList.length > 0) {
      const businessModelCards: SectionCard[] = clientsList
        .sort((a, b) => a.display_order - b.display_order)
        .map((client) => {
          const name = isArabic ? client.name_ar : client.name_en;
          const description = isArabic ? client.description_ar : client.description_en;
          return {
            id: `client-${client.id}`,
            title: name,
            description: description
              ? description.substring(0, 100) + (description.length > 100 ? '...' : '')
              : null,
            iconKey: client.logo_key,
            displayOrder: client.display_order,
            onClick: () => setSelectedSection(`client-${client.id}`),
          };
        });

      const minDisplayOrder = Math.min(...clientsList.map((c) => c.display_order), Infinity);
      sectionsList.push({
        id: 'business-model',
        title: isArabic ? 'نموذج العمل التجاري' : 'Business Model',
        cards: businessModelCards,
        displayOrder: minDisplayOrder === Infinity ? 1 : minDisplayOrder,
      });
    }

    // 3. الموارد المالية
    if (resourcesList.length > 0) {
      const resourceCards: SectionCard[] = resourcesList
        .sort((a, b) => a.display_order - b.display_order)
        .map((resource) => {
          const title = isArabic ? resource.title_ar : resource.title_en;
          const description = isArabic ? resource.description_ar : resource.description_en;
          const displayDescription = description
            ? description.substring(0, 100) + (description.length > 100 ? '...' : '')
            : resource.value
              ? new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
                  style: 'currency',
                  currency: resource.currency,
                  maximumFractionDigits: 0,
                }).format(Number(resource.value))
              : null;

          return {
            id: `resource-${resource.id}`,
            title,
            description: displayDescription,
            iconKey: resource.icon_key,
            displayOrder: resource.display_order,
            onClick: () => setSelectedSection(`resource-${resource.id}`),
          };
        });

      const minDisplayOrder = Math.min(...resourcesList.map((r) => r.display_order), Infinity);
      sectionsList.push({
        id: 'resources',
        title: isArabic ? 'الموارد المالية' : 'Financial Resources',
        cards: resourceCards,
        displayOrder: minDisplayOrder === Infinity ? 2 : minDisplayOrder,
      });
    }

    // 4. نقاط قوة الشركة
    if (strengthsList.length > 0) {
      const strengthCards: SectionCard[] = strengthsList
        .sort((a, b) => a.display_order - b.display_order)
        .map((strength) => {
          const title = isArabic ? strength.title_ar : strength.title_en;
          const description = isArabic ? strength.description_ar : strength.description_en;
          return {
            id: `strength-${strength.id}`,
            title,
            description: description
              ? description.substring(0, 100) + (description.length > 100 ? '...' : '')
              : null,
            iconKey: strength.icon_key,
            displayOrder: strength.display_order,
            onClick: () => setSelectedSection(`strength-${strength.id}`),
          };
        });

      const minDisplayOrder = Math.min(...strengthsList.map((s) => s.display_order), Infinity);
      sectionsList.push({
        id: 'strengths',
        title: isArabic ? 'نقاط قوة الشركة' : 'Company Strengths',
        cards: strengthCards,
        displayOrder: minDisplayOrder === Infinity ? 3 : minDisplayOrder,
      });
    }

    // 5. كيف تكون شريك في باكورة
    if (partnershipInfoList.length > 0) {
      const partnershipCards: SectionCard[] = partnershipInfoList
        .sort((a, b) => a.display_order - b.display_order)
        .map((info) => {
          const title = isArabic ? info.title_ar : info.title_en;
          const content = isArabic ? info.content_ar : info.content_en;
          return {
            id: `partnership-${info.id}`,
            title,
            description: content.substring(0, 120) + (content.length > 120 ? '...' : ''),
            iconKey: info.icon_key,
            displayOrder: info.display_order,
            onClick: () => setSelectedSection(`partnership-${info.id}`),
          };
        });

      const minDisplayOrder = Math.min(...partnershipInfoList.map((i) => i.display_order), Infinity);
      sectionsList.push({
        id: 'partnership',
        title: isArabic ? 'كيف تكون شريك في باكورة' : 'How to Become a Partner in Bacura',
        cards: partnershipCards,
        displayOrder: minDisplayOrder === Infinity ? 4 : minDisplayOrder,
      });
    }

    // 6. القيمة السوقية المعتمدة للشركة
    if (marketValueData) {
      const formattedValue = new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: marketValueData.currency,
        maximumFractionDigits: 0,
      }).format(Number(marketValueData.value));

      const formattedDate = new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
        dateStyle: 'medium',
      }).format(new Date(marketValueData.valuation_date));

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
    if (goalsList.length > 0) {
      const goalCards: SectionCard[] = goalsList
        .sort((a, b) => a.display_order - b.display_order)
        .map((goal) => {
          const title = isArabic ? goal.title_ar : goal.title_en;
          const description = isArabic ? goal.description_ar : goal.description_en;
          const displayDescription = description
            ? description.substring(0, 100) + (description.length > 100 ? '...' : '')
            : goal.target_date
              ? new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
                  dateStyle: 'medium',
                }).format(new Date(goal.target_date))
              : null;

          return {
            id: `goal-${goal.id}`,
            title,
            description: displayDescription,
            iconKey: goal.icon_key,
            displayOrder: goal.display_order,
            onClick: () => setSelectedSection(`goal-${goal.id}`),
          };
        });

      const minDisplayOrder = Math.min(...goalsList.map((g) => g.display_order), Infinity);
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
    profiles,
    clients,
    resources,
    strengths,
    partnershipInfo,
    marketValue,
    goals,
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
              display: 'flex',
              flexDirection: isArabic ? 'row-reverse' : 'row',
              alignItems: 'center',
              gap: '1.5rem',
              marginBottom: '3rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                flexShrink: 0,
                borderRadius: '20px',
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
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
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
                    borderRadius: '24px',
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
            <h2
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 700,
                color: palette.textPrimary,
                letterSpacing: isArabic ? 0 : '-0.02em',
                flex: 1,
                minWidth: '200px',
              }}
            >
              {section.title}
            </h2>
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

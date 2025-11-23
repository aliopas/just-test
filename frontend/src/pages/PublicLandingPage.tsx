import { Link } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useInvestorNewsList } from '../hooks/useInvestorNews';
import { resolveCoverUrl, NEWS_IMAGES_BUCKET, PROJECT_IMAGES_BUCKET } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';
import { usePublicProjects } from '../hooks/usePublicProjects';
import { useHomepageSections, type HomepageSection } from '../hooks/useHomepageSections';

// Animated Icon Components
const NetworkIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: 'float 3s ease-in-out infinite',
    }}
  >
    <style>
      {`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}
    </style>
    <circle cx="32" cy="20" r="6" fill={palette.brandPrimaryStrong} opacity="0.9">
      <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="16" cy="40" r="5" fill={palette.brandPrimaryStrong} opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="48" cy="40" r="5" fill={palette.brandPrimaryStrong} opacity="0.8">
      <animate attributeName="opacity" values="0.8;1;0.8" dur="2.3s" repeatCount="indefinite" />
    </circle>
    <line x1="32" y1="20" x2="16" y2="40" stroke={palette.brandPrimaryStrong} strokeWidth="2" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2s" repeatCount="indefinite" />
    </line>
    <line x1="32" y1="20" x2="48" y2="40" stroke={palette.brandPrimaryStrong} strokeWidth="2" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2.2s" repeatCount="indefinite" />
    </line>
    <line x1="16" y1="40" x2="48" y2="40" stroke={palette.brandPrimaryStrong} strokeWidth="2" opacity="0.4">
      <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2.4s" repeatCount="indefinite" />
    </line>
  </svg>
);

const AnalyticsIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: 'pulse 2s ease-in-out infinite',
    }}
  >
    <style>
      {`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}
    </style>
    <rect x="12" y="40" width="8" height="16" fill={palette.brandPrimaryStrong} opacity="0.8">
      <animate attributeName="height" values="16;24;16" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="y" values="40;32;40" dur="1.5s" repeatCount="indefinite" />
    </rect>
    <rect x="24" y="32" width="8" height="24" fill={palette.brandPrimaryStrong} opacity="0.9">
      <animate attributeName="height" values="24;32;24" dur="1.8s" repeatCount="indefinite" />
      <animate attributeName="y" values="32;24;32" dur="1.8s" repeatCount="indefinite" />
    </rect>
    <rect x="36" y="20" width="8" height="36" fill={palette.brandPrimaryStrong}>
      <animate attributeName="height" values="36;44;36" dur="2s" repeatCount="indefinite" />
      <animate attributeName="y" values="20;12;20" dur="2s" repeatCount="indefinite" />
    </rect>
    <rect x="48" y="28" width="8" height="28" fill={palette.brandPrimaryStrong} opacity="0.85">
      <animate attributeName="height" values="28;36;28" dur="1.7s" repeatCount="indefinite" />
      <animate attributeName="y" values="28;20;28" dur="1.7s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const JourneyIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: 'rotate 4s linear infinite',
    }}
  >
    <style>
      {`
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
    </style>
    <circle cx="32" cy="32" r="20" stroke={palette.brandPrimaryStrong} strokeWidth="2" fill="none" opacity="0.3" />
    <circle cx="32" cy="12" r="4" fill={palette.brandPrimaryStrong}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 32 32;360 32 32"
        dur="4s"
        repeatCount="indefinite"
      />
    </circle>
    <path
      d="M 32 12 L 32 32 L 52 32"
      stroke={palette.brandPrimaryStrong}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      opacity="0.6"
    >
      <animate
        attributeName="stroke-dasharray"
        values="0,100;50,50;100,0"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const heroSectionStyle: React.CSSProperties = {
  padding: '4rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  textAlign: 'center',
  background: `linear-gradient(135deg, ${palette.brandSecondarySoft}, ${palette.backgroundSurface})`,
};

const sectionStyle: React.CSSProperties = {
  padding: '3rem 2rem',
  maxWidth: '960px',
  margin: '0 auto',
  display: 'grid',
  gap: '1.5rem',
};

// Mobile responsive styles
const mobileStyles = `
  @media (max-width: 640px) {
    header {
      padding: 1rem !important;
      gap: 1rem !important;
    }
    
    header .desktop-nav {
      display: none !important;
    }
    
    header .mobile-menu-button {
      display: block !important;
    }
    
    .hero-section {
      padding: 2rem 1rem !important;
    }
    
    .hero-section h1 {
      font-size: 1.75rem !important;
      line-height: 1.2 !important;
    }
    
    .hero-section p {
      font-size: 1rem !important;
    }
    
    section {
      padding: 2rem 1rem !important;
    }
    
    .section-title {
      font-size: 1.5rem !important;
    }
    
    .feature-card,
    .project-card,
    .news-card {
      padding: 1.5rem 1rem !important;
    }
    
    footer {
      padding: 2rem 1rem !important;
    }
    
    footer > div {
      grid-template-columns: 1fr !important;
      gap: 1.5rem !important;
    }
  }
  
  @media (min-width: 641px) and (max-width: 1024px) {
    header {
      padding: 1.25rem 1.5rem !important;
    }
    
    .hero-section {
      padding: 3rem 1.5rem !important;
    }
    
    section {
      padding: 2.5rem 1.5rem !important;
    }
  }
`;

const featureCardStyle: React.CSSProperties = {
  padding: '1.75rem',
  borderRadius: '1rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundSurface,
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
};

const navLinkStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: palette.textSecondary,
  textDecoration: 'none',
  transition: 'color 0.2s ease',
};


const timelineCardStyle: React.CSSProperties = {
  padding: '1.5rem',
  borderRadius: '1.25rem',
  border: `1px solid ${palette.neutralBorder}`,
  background: palette.backgroundSurface,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

// Default icons for sections
function DefaultSectionIcon({ type }: { type: HomepageSection['type'] }) {
  const iconSize = 32;
  const iconColor = palette.brandPrimaryStrong;

  const icons: Record<HomepageSection['type'], JSX.Element> = {
    company_profile: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    business_model: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12H15V22" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    financial_resources: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    company_strengths: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    become_partner: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    market_value: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    company_goals: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6V12L16 14" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  };

  return icons[type] || icons.company_profile;
}

// Section Modal Component
interface SectionModalProps {
  section: HomepageSection | null;
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
}

function SectionModal({ section, isOpen, onClose, isArabic }: SectionModalProps) {
  const { direction } = useLanguage();
  const container = document.getElementById('drawer-root') ?? document.body;

  if (!isOpen || !section) {
    return null;
  }

  const title = isArabic ? section.titleAr : section.titleEn;
  const content = isArabic ? section.contentAr : section.contentEn;
  const IconComponent = section.iconSvg ? (
    <div
      dangerouslySetInnerHTML={{ __html: section.iconSvg }}
      style={{
        width: '64px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  ) : (
    <DefaultSectionIcon type={section.type} />
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
        direction,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: palette.backgroundSurface,
          borderRadius: '1.5rem',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        <style>
          {`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
          `}
        </style>
        {/* Header */}
        <div
          style={{
            padding: '2rem',
            borderBottom: `1px solid ${palette.neutralBorderSoft}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '80px',
                height: '80px',
                borderRadius: '1rem',
                background: `${palette.brandSecondarySoft}40`,
                flexShrink: 0,
              }}
            >
              {IconComponent}
            </div>
            <h2
              id="section-modal-title"
              style={{
                margin: 0,
                fontSize: '1.75rem',
                fontWeight: 700,
                color: palette.textPrimary,
              }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={isArabic ? 'إغلاق' : 'Close'}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
              background: palette.backgroundSurface,
              color: palette.textPrimary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = palette.backgroundAlt;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = palette.backgroundSurface;
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div
          style={{
            padding: '2.5rem',
            color: palette.textSecondary,
            lineHeight: 1.8,
            fontSize: '1rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {content}
        </div>
      </div>
    </div>,
    container
  );
}

export function PublicLandingPage() {
  const { language, setLanguage } = useLanguage();
  const isArabic = language === 'ar';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<HomepageSection | null>(null);
  const {
    data: newsResponse,
    isLoading: isNewsLoading,
    isError: isNewsError,
    isFetching: isNewsFetching,
  } = useInvestorNewsList({ page: 1, limit: 3 });
  const newsItems = useMemo(() => newsResponse?.news ?? [], [newsResponse]);
  
  const {
    data: projectsResponse,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = usePublicProjects();
  const projects = useMemo(() => projectsResponse?.projects ?? [], [projectsResponse]);

  const {
    data: homepageSectionsResponse,
    isLoading: isSectionsLoading,
    isError: isSectionsError,
  } = useHomepageSections();
  const homepageSections = useMemo(
    () => homepageSectionsResponse?.sections ?? [],
    [homepageSectionsResponse]
  );

  // Close mobile menu or modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openSection) {
          setOpenSection(null);
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, openSection]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (openSection) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [openSection]);

  const heroTitle = isArabic
    ? 'باكورة التقنيات'
    : 'Bakura tec';

  const ctaLabel = isArabic ? 'تسجيل الدخول إلى البوابة' : 'Sign in to the portal';

  const featureTitle = isArabic ? 'لماذا باكورة؟' : 'Why Bakura tec?';

  const features = isArabic
    ? [
        {
          title: 'شبكة استثمارية موثوقة',
          description:
            'نربطك بقادة التقنيات الناشئة عبر شبكة من الخبراء والمستثمرين المعتمدين.',
          icon: NetworkIcon,
        },
        {
          title: 'تحليلات وتقارير عميقة',
          description:
            'حزم معلوماتية دقيقة تساعدك على اتخاذ قرارات استثمارية أكثر ثقة.',
          icon: AnalyticsIcon,
        },
        {
          title: 'رحلة استثمار متكاملة',
          description:
            'من التعرف على الفرص إلى إغلاق الصفقة، ندعمك بأدوات ذكية ومسار واضح.',
          icon: JourneyIcon,
        },
      ]
    : [
        {
          title: 'Curated investment network',
          description:
            'Connect with vetted founders, sector experts, and co-investors aligned with your thesis.',
          icon: NetworkIcon,
        },
        {
          title: 'Insight-rich analytics',
          description:
            'Get data-driven reports that help you evaluate opportunities with confidence.',
          icon: AnalyticsIcon,
        },
        {
          title: 'End-to-end investor journey',
          description:
            'Streamlined workflows that guide you from discovery to deal completion.',
          icon: JourneyIcon,
        },
      ];

  const navLinks = [
    {
      id: 'newsroom',
      label: isArabic ? 'الأخبار' : 'Newsroom',
    },
  ];


  const journeySteps = isArabic
    ? [
        {
          phase: '01',
          title: 'اكتشف الفرص',
          description:
            'شاشات ذكية، تنبيهات قطاعات، وملخصات مختصرة تساعدك على فرز السوق خلال دقائق.',
        },
        {
          phase: '02',
          title: 'عمّق التحليل',
          description:
            'تقارير تدقيق، مقاييس التشغيل، وحوارات مباشرة مع الخبراء الداخليين.',
        },
        {
          phase: '03',
          title: 'نسّق الصفقة',
          description:
            'مسار موحّد للتفاوض، الفحص النافي للجهالة، وإدارة المستندات مع الفرق القانونية.',
        },
        {
          phase: '04',
          title: 'تابع الأثر',
          description:
            'لوحات تحكم تفاعلية تقيس التقدم، وتغذّي قرارات إعادة الاستثمار.',
        },
      ]
    : [
        {
          phase: '01',
          title: 'Discover',
          description:
            'Sector alerts, curated deal rooms, and rapid screeners surface the right pipeline.',
        },
        {
          phase: '02',
          title: 'Evaluate',
          description:
            'Deep dives, operator briefs, and direct access to domain specialists.',
        },
        {
          phase: '03',
          title: 'Execute',
          description:
            'Guided workflows for negotiation, diligence, and document orchestration.',
        },
        {
          phase: '04',
          title: 'Amplify',
          description:
            'Performance dashboards keep stakeholders aligned post-investment.',
        },
      ];


  const footerColumns = isArabic
    ? [
        {
          title: 'الدعم',
          links: [
            { label: 'تواصل معنا', href: 'mailto:hello@bakurah.sa' },
            { label: 'خليك مستثمر وطلب تسجيلك الان', href: '/register' },
            { label: 'المركز الإعلامي', href: '#newsroom' },
          ],
        },
      ]
    : [
        {
          title: 'Support',
          links: [
            { label: 'Contact', href: 'mailto:hello@bakurah.sa' },
            { label: 'Book a walkthrough', href: '/register' },
            { label: 'Newsroom', href: '#newsroom' },
          ],
        },
      ];

  const newsTitle = isArabic ? 'أحدث القصص الإخبارية' : 'Latest newsroom highlights';
  const newsEmptyMessage = isArabic
    ? 'لم يتم نشر أخبار جديدة بعد. تابع باكورة التقنيات للاطلاع على آخر المستجدات.'
    : 'No newsroom updates are available yet. Follow Bakura tec for upcoming announcements.';
  const newsErrorMessage = isArabic
    ? 'تعذر تحميل الأخبار حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
    : 'We could not load the newsroom feed right now. Please try again soon.';
  const readMoreLabel = isArabic ? 'تعرّف على التفاصيل بعد تسجيل الدخول' : 'Sign in to read more';
  const publishedLabel = isArabic ? 'تاريخ النشر' : 'Published';
  const primaryCtaLabel = isArabic ? 'اطلب دعوة' : 'Request platform access';
  const secondaryCtaLabel = isArabic ? 'جرّب العرض التفاعلي' : 'Explore the interactive tour';
  const journeyTitle = isArabic ? 'رحلة المستثمر داخل باكورة' : 'The Bakura tec investor journey';
  const journeySubtitle = isArabic
    ? 'أدوات متكاملة تغطي سلسلة القيمة من الاكتشاف وحتى المتابعة.'
    : 'Integrated workflows that span discovery, diligence, execution, and monitoring.';
  const languageToggleLabel = isArabic ? 'English' : 'العربية';
  const languageToggleAriaLabel = isArabic
    ? 'التبديل إلى اللغة الإنجليزية'
    : 'Switch interface to Arabic';
  const newsroomCtaLabel = isArabic
    ? 'اطلب الوصول الكامل للنشرة'
    : 'Get full newsroom access';

  const renderNewsContent = () => {
    if (isNewsLoading && newsItems.length === 0) {
      return Array.from({ length: 3 }).map((_, index) => (
        <article
          key={`news-skeleton-${index}`}
          style={{
            borderRadius: '1.25rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'pulse 1.6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              paddingBottom: '56.25%',
              background: `${palette.neutralBorderSoft}40`,
            }}
          />
          <div
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div
              style={{
                height: '0.875rem',
                width: '40%',
                borderRadius: '999px',
                background: `${palette.neutralBorderSoft}80`,
              }}
            />
            <div
              style={{
                height: '1.4rem',
                width: '85%',
                borderRadius: '0.5rem',
                background: `${palette.neutralBorderSoft}66`,
              }}
            />
            <div
              style={{
                height: '3.5rem',
                borderRadius: '0.5rem',
                background: `${palette.neutralBorderSoft}4D`,
              }}
            />
            <div
              style={{
                height: '2.5rem',
                width: '45%',
                borderRadius: '0.75rem',
                background: `${palette.neutralBorderSoft}66`,
                marginTop: '0.5rem',
              }}
            />
          </div>
        </article>
      ));
    }

    if (isNewsError) {
      return (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: '3rem 2rem',
            borderRadius: '1.25rem',
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            background: palette.backgroundSurface,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '1rem',
            lineHeight: 1.7,
          }}
        >
          {newsErrorMessage}
        </div>
      );
    }

    if (newsItems.length === 0) {
      return (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: '3rem 2rem',
            borderRadius: '1.25rem',
            border: `1px dashed ${palette.brandSecondaryMuted}`,
            background: palette.backgroundSurface,
            textAlign: 'center',
            color: palette.textSecondary,
            fontSize: '1rem',
            lineHeight: 1.7,
          }}
        >
          {newsEmptyMessage}
        </div>
      );
    }

    return newsItems.map(item => {
      const coverUrl = resolveCoverUrl(item.coverKey, NEWS_IMAGES_BUCKET);
      const publishedAt = new Date(item.publishedAt).toLocaleDateString(
        isArabic ? 'ar-SA' : 'en-GB',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }
      );
      const excerpt =
        item.excerpt ??
        (isArabic
          ? 'للاطلاع على تفاصيل هذا الخبر، الرجاء تسجيل الدخول إلى بوابة باكورة.'
          : 'Sign in to the Bakura tec portal to read the full story.');

      return (
        <article
          key={item.id}
          className="news-card"
          style={{
            borderRadius: '1.25rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(4, 44, 84, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(4, 44, 84, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(4, 44, 84, 0.08)';
          }}
          onClick={() => window.location.href = '/login'}
        >
          {coverUrl && (
            <div style={{ position: 'relative' }}>
              <OptimizedImage
                src={coverUrl}
                alt={item.title}
                aspectRatio={16 / 9}
                objectFit="cover"
              />
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  ...(isArabic ? { right: '1rem' } : { left: '1rem' }),
                  padding: '0.4rem 0.85rem',
                  borderRadius: '999px',
                  background: `${palette.backgroundSurface}E6`,
                  backdropFilter: 'blur(8px)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: palette.brandPrimaryStrong,
                  letterSpacing: '0.05em',
                  zIndex: 1,
                }}
              >
                {isArabic ? 'خبر باكورة' : 'Bakura tec News'}
              </div>
            </div>
          )}
          <div
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              flexGrow: 1,
              textAlign: isArabic ? 'right' : 'left',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
                color: palette.textSecondary,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <span>{publishedLabel}</span>
              <time dateTime={item.publishedAt}>{publishedAt}</time>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.4rem',
                fontWeight: 700,
                color: palette.textPrimary,
                lineHeight: 1.3,
                marginBottom: '0.5rem',
              }}
            >
              {item.title}
            </h3>
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.7,
                fontSize: '0.95rem',
                flexGrow: 1,
              }}
            >
              {excerpt}
            </p>
            <div style={{ marginTop: '1.25rem' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  borderRadius: '0.75rem',
                  background: palette.brandPrimaryStrong,
                  color: palette.textOnBrand,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = palette.brandPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = palette.brandPrimaryStrong;
                }}
              >
                {readMoreLabel}
                <span
                  aria-hidden
                  style={{
                    transform: isArabic ? 'scaleX(-1)' : 'none',
                    fontSize: '1.1rem',
                  }}
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </article>
      );
    });
  };

  return (
    <>
      <style>{mobileStyles}</style>
      <SectionModal
        section={openSection}
        isOpen={openSection !== null}
        onClose={() => setOpenSection(null)}
        isArabic={isArabic}
      />
      <div
        style={{
          minHeight: '100vh',
          background: palette.backgroundBase,
          color: palette.textPrimary,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          padding: '1.5rem 2rem',
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: palette.backgroundBase,
          borderBottom: `1px solid ${palette.neutralBorderSoft}`,
        }}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flex: '1 1 220px',
            minWidth: 0,
          }}
        >
          <Logo size={64} showWordmark={false} aria-hidden />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
              textAlign: isArabic ? 'right' : 'left',
              minWidth: 0,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '1.25rem', whiteSpace: 'nowrap' }}>{heroTitle}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="mobile-menu-button"
          aria-label={isArabic ? 'فتح القائمة' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          style={{
            display: 'none',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            color: palette.textPrimary,
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <nav
          role="navigation"
          aria-label={isArabic ? 'روابط رئيسية' : 'Primary navigation'}
          style={{
            display: 'flex',
            gap: '1.25rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            flex: '2 1 320px',
          }}
          className="desktop-nav"
        >
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(item.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                ...navLinkStyle,
                textAlign: 'center',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            flexWrap: 'wrap',
            flex: '1 1 auto',
          }}
          className="desktop-nav"
        >
          <button
            type="button"
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
            aria-label={languageToggleAriaLabel}
            style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '999px',
              border: `1px solid ${palette.neutralBorderSoft}`,
              background: palette.backgroundSurface,
              color: palette.textSecondary,
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            {languageToggleLabel}
          </button>
          <Link
            to="/register"
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '999px',
              border: `1px solid ${palette.brandSecondaryMuted}`,
              color: palette.brandPrimaryStrong,
              background: `${palette.brandSecondarySoft}40`,
              fontWeight: 600,
              textDecoration: 'none',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {primaryCtaLabel}
          </Link>
          <Link
            to="/login"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '999px',
              border: `1px solid ${palette.brandPrimaryStrong}`,
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              fontWeight: 600,
              textDecoration: 'none',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      <nav
        className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
        dir={isArabic ? 'rtl' : 'ltr'}
        aria-label={isArabic ? 'القائمة الرئيسية' : 'Main navigation'}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: `1px solid ${palette.neutralBorderSoft}`,
          }}
        >
          <Logo size={48} showWordmark={false} aria-hidden />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label={isArabic ? 'إغلاق القائمة' : 'Close menu'}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
              background: palette.backgroundSurface,
              color: palette.textPrimary,
              cursor: 'pointer',
              minWidth: '44px',
              minHeight: '44px',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {navLinks.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                setIsMobileMenuOpen(false);
                const element = document.getElementById(item.id);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                ...navLinkStyle,
                padding: '1rem 1.25rem',
                minHeight: '48px',
                width: '100%',
                textAlign: isArabic ? 'right' : 'left',
              }}
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
            aria-label={languageToggleAriaLabel}
            style={{
              ...navLinkStyle,
              padding: '1rem 1.25rem',
              minHeight: '48px',
              width: '100%',
              textAlign: isArabic ? 'right' : 'left',
            }}
          >
            {languageToggleLabel}
          </button>
          <Link
            to="/register"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...navLinkStyle,
              padding: '1rem 1.25rem',
              minHeight: '48px',
              width: '100%',
              textAlign: 'center',
              borderColor: palette.brandSecondaryMuted,
              color: palette.brandPrimaryStrong,
              background: `${palette.brandSecondarySoft}40`,
            }}
          >
            {primaryCtaLabel}
          </Link>
          <Link
            to="/login"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              ...navLinkStyle,
              padding: '1rem 1.25rem',
              minHeight: '48px',
              width: '100%',
              textAlign: 'center',
              borderColor: palette.brandPrimaryStrong,
              background: palette.brandPrimaryStrong,
              color: palette.textOnBrand,
              marginTop: '0.5rem',
            }}
          >
            {ctaLabel}
          </Link>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        <section style={heroSectionStyle} className="hero-section" dir={isArabic ? 'rtl' : 'ltr'}>
          <div
            style={{
              width: '100%',
              maxWidth: '1200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                textAlign: isArabic ? 'right' : 'left',
                maxWidth: '800px',
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: '2.75rem',
                  fontWeight: 800,
                  lineHeight: 1.15,
                }}
                className="section-title"
              >
                {heroTitle}
              </h1>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  justifyContent: isArabic ? 'flex-end' : 'flex-start',
                }}
              >
                <Link
                  to="/register"
                  style={{
                    padding: '0.85rem 1.75rem',
                    borderRadius: '1rem',
                    background: palette.brandPrimaryStrong,
                    color: palette.textOnBrand,
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '1rem',
                  }}
                >
                  {primaryCtaLabel}
                </Link>
                <Link
                  to="/login"
                  style={{
                    padding: '0.85rem 1.5rem',
                    borderRadius: '1rem',
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    color: palette.textPrimary,
                    fontWeight: 600,
                    textDecoration: 'none',
                    background: palette.backgroundSurface,
                  }}
                >
                  {secondaryCtaLabel}
                </Link>
              </div>
            </div>
          </div>

          {/* Homepage Sections with Icons */}
          {!isSectionsLoading && !isSectionsError && homepageSections.length > 0 && (
            <div
              style={{
                width: '100%',
                maxWidth: '1200px',
                marginTop: '4rem',
                paddingTop: '3rem',
                borderTop: `1px solid ${palette.neutralBorderSoft}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: '2rem',
                  fontSize: '2rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                  textAlign: 'center',
                }}
                className="section-title"
              >
                {isArabic ? 'معلومات عن الشركة' : 'Company Information'}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gap: '1.5rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                }}
              >
                {homepageSections.map((section) => {
                  const title = isArabic ? section.titleAr : section.titleEn;
                  const IconComponent = section.iconSvg ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: section.iconSvg }}
                      style={{
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    />
                  ) : (
                    <DefaultSectionIcon type={section.type} />
                  );

                  return (
                    <div
                      key={section.id}
                      style={{
                        ...featureCardStyle,
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)';
                      }}
                      onClick={() => {
                        setOpenSection(section);
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '64px',
                          height: '64px',
                          borderRadius: '1rem',
                          background: `${palette.brandSecondarySoft}40`,
                          marginBottom: '0.5rem',
                        }}
                      >
                        {IconComponent}
                      </div>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          color: palette.textPrimary,
                          lineHeight: 1.4,
                        }}
                      >
                        {title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Features Section with Animated Icons */}
        <section
          style={{
            ...sectionStyle,
            padding: '4rem 2rem',
            maxWidth: '1200px',
            background: palette.backgroundBase,
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 700,
                color: palette.textPrimary,
                marginBottom: '0.75rem',
              }}
              className="section-title"
            >
              {featureTitle}
            </h2>
          </div>
          <div
            style={{
              display: 'grid',
              gap: '2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            }}
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="feature-card"
                  style={{
                    ...featureCardStyle,
                    padding: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.25rem',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 16px 32px rgba(15, 23, 42, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(15, 23, 42, 0.08)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '80px',
                      height: '80px',
                      borderRadius: '1rem',
                      background: `${palette.brandSecondarySoft}40`,
                      marginBottom: '0.5rem',
                    }}
                  >
                    <IconComponent />
                  </div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: palette.textPrimary,
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '1rem',
                      color: palette.textSecondary,
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Projects Section - Replaces capabilities and journey sections */}
        <section id="projects" style={sectionStyle} dir={isArabic ? 'rtl' : 'ltr'}>
          <div
            style={{
              textAlign: 'center',
              marginBottom: '2.5rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 700,
              }}
              className="section-title"
            >
              {isArabic ? 'المشاريع الاستثمارية المتاحة' : 'Available Investment Projects'}
            </h2>
            <p
              style={{
                margin: '0.75rem auto 0',
                maxWidth: '720px',
                color: palette.textSecondary,
                lineHeight: 1.7,
              }}
            >
              {isArabic
                ? 'استكشف فرص الاستثمار المتاحة مع تفاصيل تكاليف التشغيل والفوائد السنوية لكل سهم'
                : 'Explore available investment opportunities with operating costs and annual benefits per share'}
            </p>
          </div>
          
          {isProjectsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: palette.textSecondary }}>
              {isArabic ? 'جاري تحميل المشاريع...' : 'Loading projects...'}
            </div>
          ) : isProjectsError ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: palette.textSecondary }}>
              {isArabic ? 'حدث خطأ في تحميل المشاريع' : 'Failed to load projects'}
            </div>
          ) : projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: palette.textSecondary }}>
              {isArabic ? 'لا توجد مشاريع متاحة حالياً' : 'No projects available at the moment'}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gap: '2rem',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              }}
            >
              {projects.map((project) => {
                const costPerShare = project.operatingCostPerShare;
                const benefitPerShare = project.annualBenefitPerShare;
                const projectCoverUrl = resolveCoverUrl(
                  project.coverKey,
                  PROJECT_IMAGES_BUCKET
                );
                const lastUpdated = new Date(project.updatedAt).toLocaleDateString(
                  isArabic ? 'ar-SA' : 'en-GB',
                  {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }
                );
                return (
                  <article
                    key={project.id}
                    className="project-card"
                    style={{
                      ...featureCardStyle,
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                    }}
                  >
                    {projectCoverUrl && (
                      <div
                        style={{
                          borderRadius: '0.9rem',
                          overflow: 'hidden',
                          border: `1px solid ${palette.neutralBorderSoft}`,
                        }}
                      >
                        <OptimizedImage
                          src={projectCoverUrl}
                          alt={project.name}
                          aspectRatio={16 / 9}
                          objectFit="cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3
                        style={{
                          marginTop: 0,
                          marginBottom: '0.5rem',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                        }}
                      >
                        {isArabic && project.nameAr ? project.nameAr : project.name}
                      </h3>
                      {project.description && (
                        <p
                          style={{
                            margin: 0,
                            color: palette.textSecondary,
                            lineHeight: 1.6,
                            fontSize: '0.95rem',
                          }}
                        >
                          {isArabic && project.descriptionAr ? project.descriptionAr : project.description}
                        </p>
                      )}
                    </div>
                    
                    <div
                      style={{
                        display: 'grid',
                        gap: '1rem',
                        gridTemplateColumns: '1fr 1fr',
                        marginTop: 'auto',
                        paddingTop: '1.5rem',
                        borderTop: `1px solid ${palette.neutralBorderSoft}`,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: palette.textSecondary,
                            marginBottom: '0.25rem',
                          }}
                        >
                          {isArabic ? 'سعر السهم' : 'Share Price'}
                        </div>
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: palette.textPrimary,
                          }}
                        >
                          {project.sharePrice.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: palette.textSecondary,
                            marginBottom: '0.25rem',
                          }}
                        >
                          {isArabic ? 'إجمالي الأسهم' : 'Total Shares'}
                        </div>
                        <div
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: palette.textPrimary,
                          }}
                        >
                          {project.totalShares.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: palette.textSecondary,
                            marginBottom: '0.25rem',
                          }}
                        >
                          {isArabic ? 'تكلفة التشغيل للسهم' : 'Operating Cost/Share'}
                        </div>
                        <div
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: palette.textPrimary,
                          }}
                        >
                          {costPerShare.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: '0.875rem',
                            color: palette.textSecondary,
                            marginBottom: '0.25rem',
                          }}
                        >
                          {isArabic ? 'الفوائد السنوية للسهم' : 'Annual Benefit/Share'}
                        </div>
                        <div
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: palette.brandPrimaryStrong,
                          }}
                        >
                          {benefitPerShare.toLocaleString()} {isArabic ? 'ريال' : 'SAR'}
                        </div>
                      </div>
                    </div>
                    
                    <div
                      style={{
                        marginTop: '1rem',
                        paddingTop: '1rem',
                        borderTop: `1px solid ${palette.neutralBorderSoft}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.875rem',
                          color: palette.textSecondary,
                        }}
                      >
                        <span>
                          {isArabic ? 'آخر تحديث:' : 'Last Updated:'}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            color: palette.textPrimary,
                          }}
                        >
                          {lastUpdated}
                        </span>
                      </div>
                    </div>
                    
                    <Link
                      to="/register"
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1.5rem',
                        borderRadius: '0.75rem',
                        background: palette.brandPrimaryStrong,
                        color: palette.textOnBrand,
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'block',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = palette.brandPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = palette.brandPrimaryStrong;
                      }}
                    >
                      {isArabic ? 'سجل للاستثمار' : 'Register to Invest'}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section
          style={{
            ...sectionStyle,
            padding: '4rem 2rem',
            maxWidth: '1200px',
            background: palette.backgroundBase,
          }}
          dir={isArabic ? 'rtl' : 'ltr'}
          id="newsroom"
        >
          <div
            style={{
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 700,
                color: palette.textPrimary,
                marginBottom: '0.75rem',
              }}
              className="section-title"
            >
              {newsTitle}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: '1.05rem',
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {isArabic
                ? 'تابع آخر التحديثات والأخبار لباكورة التقنيات'
                : 'Stay updated with the latest news and updates from Bakura tec'}
            </p>
          </div>
          {isNewsFetching && newsItems.length > 0 && !isNewsError && (
            <div
              style={{
                textAlign: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <span
                style={{
                  color: palette.textSecondary,
                  fontSize: '0.9rem',
                }}
              >
                {isArabic ? 'يتم تحديث النشرة الإخبارية…' : 'Refreshing newsroom feed…'}
              </span>
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gap: '2rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
          >
            {renderNewsContent()}
          </div>
          <div
            style={{
              marginTop: '3rem',
              textAlign: 'center',
              borderRadius: '1.5rem',
              border: `1px solid ${palette.neutralBorderSoft}`,
              padding: '2rem',
              background: palette.backgroundSurface,
            }}
          >
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.6,
              }}
            >
              {isArabic
                ? 'النشرة الكاملة تحتوي على تقارير داخلية وإشعارات لحظية حول القطاعات المفضلة لديك.'
                : 'Access the full newsroom for insider reports and instant alerts on your focus sectors.'}
            </p>
            <Link
              to="/register"
              style={{
                display: 'inline-flex',
                marginTop: '1rem',
                padding: '0.85rem 1.5rem',
                borderRadius: '999px',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {newsroomCtaLabel}
            </Link>
          </div>
        </section>

      </main>

      <footer
        style={{
          padding: '3rem 2rem',
          background: palette.backgroundSurface,
        }}
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gap: '2rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <Logo size={48} showWordmark={false} aria-hidden />
            <p
              style={{
                margin: 0,
                color: palette.textSecondary,
                lineHeight: 1.7,
              }}
            >
              {isArabic
                ? 'باكورة التقنيات تربط المستثمرين بقادة الابتكار في المنطقة وتوفر أدوات تحليل عميقة لاتخاذ القرار.'
                : 'Bakura tec connects investors with emerging innovators through rich intelligence and guided workflows.'}
            </p>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4
                style={{
                  marginTop: 0,
                  marginBottom: '1rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                }}
              >
                {column.title}
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {column.links.map((link) =>
                  link.href.startsWith('/') ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      style={{
                        color: palette.textSecondary,
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{
                        color: palette.textSecondary,
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            color: palette.textSecondary,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <div>
            {isArabic
              ? '© ' + new Date().getFullYear().toString() + ' باكورة التقنيات. جميع الحقوق محفوظة.'
              : `© ${new Date().toLocaleDateString(undefined, { year: 'numeric' })} Bakura tec. All rights reserved.`}
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            {isArabic ? 'تم التطوير بواسطة حاضنة باكورة التقنيات الرقمية' : 'Developed by Bacura Technologies Team'}
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}




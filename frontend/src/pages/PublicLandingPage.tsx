import { Link } from 'react-router-dom';
import { useMemo, useState, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useInvestorNewsList } from '../hooks/useInvestorNews';
import { resolveCoverUrl, NEWS_IMAGES_BUCKET, PROJECT_IMAGES_BUCKET } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';
import { usePublicProjects } from '../hooks/usePublicProjects';
import { useHomepageSections, type HomepageSection } from '../hooks/useHomepageSections';
import { ScrollToTopButton } from '../components/landing/ScrollToTopButton';
import { StatisticsSection } from '../components/landing/StatisticsSection';
import { SectionSkeleton } from '../components/landing/SectionSkeleton';

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
  padding: '3rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '2rem',
  textAlign: 'center',
  background: `linear-gradient(180deg, ${palette.brandSecondarySoft}08 0%, ${palette.backgroundSurface} 50%, ${palette.backgroundBase} 100%)`,
  position: 'relative',
  overflow: 'hidden',
};

const sectionStyle: React.CSSProperties = {
  padding: '4rem 2rem',
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gap: '2rem',
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
    
    .hero-section h2 {
      font-size: 1.5rem !important;
    }
    
    .hero-section h1 {
      font-size: 1.5rem !important;
      line-height: 1.4 !important;
    }
    
    .hero-section p {
      font-size: 1rem !important;
    }
    
    .partnership-banner {
      padding: 1.5rem 1.25rem !important;
      margin-bottom: 2rem !important;
    }
    
    .partnership-banner h1 {
      font-size: 1.25rem !important;
    }
    
    .partnership-banner p {
      font-size: 0.95rem !important;
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
    
    /* Homepage sections grid responsive */
    .homepage-sections-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 1rem !important;
    }
    
    .homepage-section-card {
      min-height: 160px !important;
      padding: 1.25rem 1rem !important;
    }
    
    .homepage-section-icon {
      width: 64px !important;
      height: 64px !important;
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
    
    /* Homepage sections grid for tablets */
    .homepage-sections-grid {
      grid-template-columns: repeat(3, 1fr) !important;
    }
  }
  
  @media (min-width: 1025px) {
    /* Homepage sections grid for desktop */
    .homepage-sections-grid {
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
    }
  }
`;

const featureCardStyle: React.CSSProperties = {
  padding: '1.75rem',
  borderRadius: '1.25rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundSurface,
  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

// Default icons for sections with enhanced animations
function DefaultSectionIcon({ type }: { type: HomepageSection['type'] }) {
  const iconSize = 48;
  const iconColor = palette.brandPrimaryStrong;
  const iconStyle: React.CSSProperties = {
    width: iconSize,
    height: iconSize,
    animation: 'float 3s ease-in-out infinite',
  };

  const icons: Record<HomepageSection['type'], JSX.Element> = {
    company_profile: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={iconStyle}>
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
          `}
        </style>
        <circle cx="32" cy="24" r="10" fill={iconColor} opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <path d="M16 48C16 40 22 36 32 36C42 36 48 40 48 48" stroke={iconColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="2.5s" repeatCount="indefinite" />
        </path>
        <circle cx="20" cy="20" r="3" fill={iconColor} opacity="0.6">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="44" cy="20" r="3" fill={iconColor} opacity="0.6">
          <animate attributeName="r" values="3;4;3" dur="2.3s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    business_model: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={iconStyle}>
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
          `}
        </style>
        <path d="M8 24L32 8L56 24V48C56 50.1217 55.1571 52.1566 53.6569 53.6569C52.1566 55.1571 50.1217 56 48 56H16C13.8783 56 11.8434 55.1571 10.3431 53.6569C8.84285 52.1566 8 50.1217 8 48V24Z" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M24 56V32H40V56" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
        </path>
        <circle cx="32" cy="20" r="2" fill={iconColor} opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    financial_resources: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={iconStyle}>
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
          `}
        </style>
        <path d="M32 8V56M44 16H26C24.3431 16 22.7531 16.5268 21.4645 17.4645C20.1758 18.4021 19.2594 19.6954 18.8425 21.1547C18.4256 22.614 18.5289 24.1538 19.1371 25.5557C19.7453 26.9576 20.8273 28.1381 22.2143 28.9046C23.6013 29.671 25.2159 30 26.8571 30H37.1429C38.7841 30 40.3987 30.329 41.7857 31.0954C43.1727 31.8619 44.2547 33.0424 44.8629 34.4443C45.4711 35.8462 45.5744 37.386 45.1575 38.8453C44.7406 40.3046 43.8242 41.5979 42.5355 42.5355C41.2469 43.4732 39.6569 44 38 44H20" stroke={iconColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-dasharray" values="0,100;50,50;100,0" dur="3s" repeatCount="indefinite" />
        </path>
        <circle cx="32" cy="8" r="3" fill={iconColor} opacity="0.9">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="32" cy="56" r="3" fill={iconColor} opacity="0.9">
          <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    company_strengths: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={iconStyle}>
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(5deg); }
            }
          `}
        </style>
        <path d="M32 8L38.18 22.52L54 25.08L42 36.28L44.36 52L32 45.54L19.64 52L22 36.28L10 25.08L25.82 22.52L32 8Z" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={iconColor} fillOpacity="0.1">
          <animate attributeName="fill-opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
        </path>
        <circle cx="32" cy="32" r="2" fill={iconColor} opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    become_partner: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={iconStyle}>
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
          `}
        </style>
        <path d="M44 56V52C44 49.8783 43.1571 47.8434 41.6569 46.3431C40.1566 44.8429 38.1217 44 36 44H12C9.87827 44 7.84344 44.8429 6.34315 46.3431C4.84285 47.8434 4 49.8783 4 52V56" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
        </path>
        <circle cx="24" cy="28" r="8" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="r" values="8;9;8" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <path d="M60 56V52C59.9986 50.2274 59.4088 48.5017 58.3228 47.1046C57.2368 45.7074 55.7202 44.7031 54 44.26" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M48 8.26C49.7208 8.70062 51.2374 9.70492 52.3234 11.1021C53.4094 12.4993 53.9992 14.225 54 16C54 18.1217 53.1571 20.1566 51.6569 21.6569C50.1566 23.1571 48.1217 24 46 24" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
        </path>
        <circle cx="24" cy="28" r="3" fill={iconColor} opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    market_value: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={iconStyle}>
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
          `}
        </style>
        <path d="M32 8L12 20L32 32L52 20L32 8Z" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill={iconColor} fillOpacity="0.1">
          <animate attributeName="fill-opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M12 48L32 56L52 48" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M12 32L32 40L52 32" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2.2s" repeatCount="indefinite" />
        </path>
        <circle cx="32" cy="20" r="2" fill={iconColor} opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="32" cy="36" r="2" fill={iconColor} opacity="0.8">
          <animate attributeName="opacity" values="0.8;1;0.8" dur="1.7s" repeatCount="indefinite" />
        </circle>
        <circle cx="32" cy="52" r="2" fill={iconColor} opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="1.6s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
    company_goals: (
      <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={iconStyle}>
        <style>
          {`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-8px) rotate(5deg); }
            }
            @keyframes rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <circle cx="32" cy="32" r="24" stroke={iconColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <animate attributeName="stroke-width" values="2.5;3;2.5" dur="2s" repeatCount="indefinite" />
        </circle>
        <path d="M32 20V32L40 38" stroke={iconColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <animate attributeName="stroke-width" values="3;3.5;3" dur="2s" repeatCount="indefinite" />
        </path>
        <circle cx="32" cy="32" r="3" fill={iconColor} opacity="0.9">
          <animate attributeName="opacity" values="0.9;1;0.9" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="32" cy="32" r="2" fill={iconColor} opacity="0.6">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 32 32;360 32 32"
            dur="8s"
            repeatCount="indefinite"
          />
          <animate attributeName="cx" values="32;36;32;28;32" dur="4s" repeatCount="indefinite" />
          <animate attributeName="cy" values="32;28;32;36;32" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
    ),
  };

  return icons[type] || icons.company_profile;
}

// Animated Icon Components for Modal
const AnimatedSparkleIcon = ({ delay = 0 }: { delay?: number }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: `scale 2s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      opacity: 0.3,
    }}
  >
    <circle cx="32" cy="32" r="8" fill={palette.brandPrimaryStrong}>
      <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
    </circle>
    <path d="M32 16L36 28L48 28L38 36L42 48L32 40L22 48L26 36L16 28L28 28L32 16Z" fill={palette.brandSecondaryMuted} opacity="0.5">
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 32 32;360 32 32"
        dur="8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

const AnimatedCircleIcon = ({ delay = 0, size = 16 }: { delay?: number; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: `pulse 2.5s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      opacity: 0.25,
    }}
  >
    <circle cx="32" cy="32" r="12" stroke={palette.brandPrimaryStrong} strokeWidth="2">
      <animate attributeName="r" values="12;16;12" dur="2.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="32" cy="32" r="6" fill={palette.brandSecondaryMuted}>
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const AnimatedDiamondIcon = ({ delay = 0 }: { delay?: number }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{
      animation: `rotate 6s linear infinite`,
      animationDelay: `${delay}s`,
      opacity: 0.2,
    }}
  >
    <rect x="20" y="20" width="24" height="24" transform="rotate(45 32 32)" fill={palette.brandPrimaryStrong}>
      <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite" />
    </rect>
  </svg>
);

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
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '1rem',
        direction,
        animation: 'fadeInOverlay 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <style>
        {`
          @keyframes fadeInOverlay {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          @keyframes rotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-15px);
            }
          }
          @keyframes scale {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
          }
          @keyframes slide {
            0% {
              transform: translateX(-20px);
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              transform: translateX(20px);
              opacity: 0;
            }
          }
        `}
      </style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(135deg, ${palette.backgroundSurface} 0%, ${palette.backgroundAlt} 100%)`,
          borderRadius: '2rem',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: `
            0 25px 80px rgba(15, 23, 42, 0.4),
            0 0 0 1px ${palette.neutralBorderSoft}40,
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
      >
        {/* Decorative Background Elements */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '200px',
            background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}15 0%, ${palette.brandSecondarySoft}10 50%, transparent 100%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.brandSecondarySoft}20 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-15%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${palette.brandPrimaryStrong}15 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'pulse 5s ease-in-out infinite',
          }}
        />

        {/* Header */}
        <div
          style={{
            padding: '2.5rem',
            position: 'relative',
            zIndex: 1,
            background: `linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%)`,
            borderBottom: `1px solid ${palette.neutralBorderSoft}30`,
            overflow: 'hidden',
          }}
        >
          {/* Animated Icons in Header */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              [isArabic ? 'left' : 'right']: '1rem',
              opacity: 0.1,
              zIndex: 0,
              animation: 'float 4s ease-in-out infinite',
            }}
          >
            <AnimatedSparkleIcon delay={0} />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              [isArabic ? 'right' : 'left']: '1rem',
              opacity: 0.08,
              zIndex: 0,
              animation: 'float 3.5s ease-in-out infinite',
              animationDelay: '1s',
            }}
          >
            <AnimatedCircleIcon delay={0.5} size={20} />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
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
                  width: '96px',
                  height: '96px',
                  borderRadius: '1.5rem',
                  background: `linear-gradient(135deg, ${palette.brandSecondarySoft}40, ${palette.brandPrimaryStrong}20)`,
                  flexShrink: 0,
                  boxShadow: `
                    0 8px 24px rgba(15, 23, 42, 0.12),
                    0 0 0 1px ${palette.brandPrimaryStrong}20,
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: 'float 3s ease-in-out infinite',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                  e.currentTarget.style.boxShadow = `
                    0 12px 32px rgba(15, 23, 42, 0.2),
                    0 0 0 1px ${palette.brandPrimaryStrong}40,
                    inset 0 1px 0 rgba(255, 255, 255, 0.3)
                  `;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                  e.currentTarget.style.boxShadow = `
                    0 8px 24px rgba(15, 23, 42, 0.12),
                    0 0 0 1px ${palette.brandPrimaryStrong}20,
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                  `;
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '-50%',
                    left: '-50%',
                    width: '200%',
                    height: '200%',
                    background: `linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)`,
                    animation: 'shimmer 3s infinite',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {IconComponent}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h2
                  id="section-modal-title"
                  style={{
                    margin: 0,
                    marginBottom: '0.5rem',
                    fontSize: '2rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondaryMuted})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    lineHeight: 1.3,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {title}
                </h2>
                <div
                  style={{
                    width: '60px',
                    height: '4px',
                    borderRadius: '2px',
                    background: `linear-gradient(90deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondaryMuted})`,
                    marginTop: '0.75rem',
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={isArabic ? 'إغلاق' : 'Close'}
              style={{
                padding: '0.75rem',
                borderRadius: '1rem',
                border: `1.5px solid ${palette.neutralBorderSoft}`,
                background: `linear-gradient(135deg, ${palette.backgroundSurface}, ${palette.backgroundAlt})`,
                color: palette.textPrimary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandSecondarySoft}20, ${palette.brandPrimaryStrong}10)`;
                e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}40`;
                e.currentTarget.style.transform = 'scale(1.1) rotate(90deg)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${palette.backgroundSurface}, ${palette.backgroundAlt})`;
                e.currentTarget.style.borderColor = palette.neutralBorderSoft;
                e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.08)';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        {/* Content */}
        <div
          style={{
            padding: '3rem 2.5rem',
            color: palette.textSecondary,
            lineHeight: 1.9,
            fontSize: '1.05rem',
            whiteSpace: 'pre-wrap',
            position: 'relative',
            zIndex: 1,
            background: `linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.02) 100%)`,
            overflow: 'hidden',
          }}
        >
          {/* Animated Decorative Icons */}
          <div
            style={{
              position: 'absolute',
              top: '2rem',
              [isArabic ? 'left' : 'right']: '2rem',
              width: '60px',
              height: '60px',
              opacity: 0.15,
              zIndex: 0,
              animation: 'rotate 20s linear infinite',
            }}
          >
            <svg width="60" height="60" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="28" stroke={palette.brandPrimaryStrong} strokeWidth="2" strokeDasharray="4 4" />
              <circle cx="32" cy="32" r="20" stroke={palette.brandSecondaryMuted} strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="32" cy="32" r="12" stroke={palette.brandPrimaryStrong} strokeWidth="1" />
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '3rem',
              [isArabic ? 'right' : 'left']: '3rem',
              width: '48px',
              height: '48px',
              opacity: 0.12,
              zIndex: 0,
              animation: 'bounce 3s ease-in-out infinite',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 8L40 24L56 24L44 36L48 52L32 44L16 52L20 36L8 24L24 24L32 8Z" fill={palette.brandPrimaryStrong} />
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              [isArabic ? 'right' : 'left']: '1rem',
              transform: 'translateY(-50%)',
              width: '40px',
              height: '40px',
              opacity: 0.1,
              zIndex: 0,
              animation: 'scale 2s ease-in-out infinite',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="16" y="16" width="32" height="32" rx="4" stroke={palette.brandSecondaryMuted} strokeWidth="2" />
              <rect x="24" y="24" width="16" height="16" rx="2" fill={palette.brandPrimaryStrong} />
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '36px',
              height: '36px',
              opacity: 0.08,
              zIndex: 0,
              animation: 'slide 4s ease-in-out infinite',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 12L44 20V32L32 40L20 32V20L32 12Z" fill={palette.brandPrimaryStrong} />
              <path d="M32 24L38 28V36L32 40L26 36V28L32 24Z" fill={palette.brandSecondaryMuted} />
            </svg>
          </div>

          {/* Floating Icons */}
          <div
            style={{
              position: 'absolute',
              top: '4rem',
              [isArabic ? 'right' : 'left']: '4rem',
              width: '32px',
              height: '32px',
              opacity: 0.2,
              zIndex: 0,
              animation: 'float 4s ease-in-out infinite',
              animationDelay: '0.5s',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="12" fill={palette.brandPrimaryStrong} />
              <circle cx="32" cy="32" r="6" fill={palette.backgroundSurface} />
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '5rem',
              [isArabic ? 'left' : 'right']: '5rem',
              width: '28px',
              height: '28px',
              opacity: 0.18,
              zIndex: 0,
              animation: 'float 3.5s ease-in-out infinite',
              animationDelay: '1s',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 8L36 24L52 24L40 32L44 48L32 40L20 48L24 32L12 24L28 24L32 8Z" fill={palette.brandSecondaryMuted} />
            </svg>
          </div>
          <div
            style={{
              position: 'absolute',
              top: '6rem',
              [isArabic ? 'left' : 'right']: '6rem',
              width: '24px',
              height: '24px',
              opacity: 0.15,
              zIndex: 0,
              animation: 'rotate 15s linear infinite',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="20" width="24" height="24" rx="2" stroke={palette.brandPrimaryStrong} strokeWidth="2" />
              <rect x="28" y="28" width="8" height="8" rx="1" fill={palette.brandSecondaryMuted} />
            </svg>
          </div>

          <div
            style={{
              position: 'relative',
              paddingLeft: isArabic ? 0 : '1.5rem',
              paddingRight: isArabic ? '1.5rem' : 0,
              borderLeft: isArabic ? 'none' : `3px solid ${palette.brandPrimaryStrong}30`,
              borderRight: isArabic ? `3px solid ${palette.brandPrimaryStrong}30` : 'none',
              zIndex: 1,
            }}
          >
            {/* Inline Animated Icons */}
            <div
              style={{
                position: 'absolute',
                top: '-0.5rem',
                [isArabic ? 'right' : 'left']: '-2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                zIndex: 0,
              }}
            >
              <AnimatedSparkleIcon delay={0} />
              <AnimatedCircleIcon delay={0.3} size={14} />
              <AnimatedDiamondIcon delay={0.6} />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: '-0.5rem',
                [isArabic ? 'left' : 'right']: '-2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                zIndex: 0,
              }}
            >
              <AnimatedCircleIcon delay={0.2} size={12} />
              <AnimatedSparkleIcon delay={0.5} />
              <AnimatedDiamondIcon delay={0.8} />
            </div>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                [isArabic ? 'left' : 'right']: '-1.5rem',
                transform: 'translateY(-50%)',
                zIndex: 0,
              }}
            >
              <AnimatedCircleIcon delay={0.4} size={16} />
            </div>
            {content}
          </div>
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

  // Memoize text content to avoid recalculation
  const heroTitle = useMemo(
    () => (isArabic ? 'شركاء باكورة' : 'Bakura tec'),
    [isArabic]
  );

  const partnershipBanner = useMemo(
    () =>
      isArabic
        ? 'شركاء باكورة'
        : 'Platform Exclusively for Bakura Partners - Advanced tools and exclusive investment opportunities',
    [isArabic]
  );

  const partnershipDescription = useMemo(
    () =>
      isArabic
        ? 'نرحب بشركائنا في منصة شركاء باكورة، حيث نوفر بيئة متكاملة للاستثمار وإدارة المحافظ الاستثمارية مع أدوات تحليلية متقدمة وفرص استثمارية حصرية.'
        : 'Welcome to Bakura tec platform, where we provide an integrated environment for investment and portfolio management with advanced analytical tools and exclusive investment opportunities.',
    [isArabic]
  );

  const ctaLabel = useMemo(
    () => (isArabic ? 'تسجيل الدخول' : 'Sign in'),
    [isArabic]
  );

  const featureTitle = useMemo(
    () => (isArabic ? 'لماذا باكورة؟' : 'Why Bakura tec?'),
    [isArabic]
  );

  const features = useMemo(
    () =>
      isArabic
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
          ],
    [isArabic]
  );

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
    ? 'لم يتم نشر أخبار جديدة بعد. تابع شركاء باكورة للاطلاع على آخر المستجدات.'
    : 'No newsroom updates are available yet. Follow Bakura tec for upcoming announcements.';
  const newsErrorMessage = isArabic
    ? 'تعذر تحميل الأخبار حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
    : 'We could not load the newsroom feed right now. Please try again soon.';
  const readMoreLabel = isArabic ? 'تعرّف على التفاصيل بعد تسجيل الدخول' : 'Sign in to read more';
  const publishedLabel = isArabic ? 'تاريخ النشر' : 'Published';
  const primaryCtaLabel = isArabic ? 'كن شريك باكورة' : 'Become a Bakurah Partner';
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
            borderRadius: '1.5rem',
            border: `1.5px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
            e.currentTarget.style.boxShadow = '0 24px 48px rgba(15, 23, 42, 0.12), 0 8px 16px rgba(15, 23, 42, 0.08)';
            e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}30`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)';
            e.currentTarget.style.borderColor = palette.neutralBorderSoft;
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
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.875rem',
                  background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`,
                  color: palette.textOnBrand,
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimary}, ${palette.brandPrimaryStrong})`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.15)';
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
          background: `${palette.backgroundBase}E6`,
          backdropFilter: 'blur(12px)',
          borderBottom: `1.5px solid ${palette.neutralBorderSoft}`,
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
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
              padding: '0.75rem 1.5rem',
              borderRadius: '0.875rem',
              border: `1.5px solid ${palette.brandSecondaryMuted}`,
              color: palette.brandPrimaryStrong,
              background: `${palette.brandSecondarySoft}30`,
              fontWeight: 600,
              textDecoration: 'none',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${palette.brandSecondarySoft}50`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${palette.brandSecondarySoft}30`;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {primaryCtaLabel}
          </Link>
          <Link
            to="/login"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.875rem',
              border: `1.5px solid ${palette.brandPrimaryStrong}`,
              background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`,
              color: palette.textOnBrand,
              fontWeight: 600,
              textDecoration: 'none',
              minHeight: '44px',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimary}, ${palette.brandPrimaryStrong})`;
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.15)';
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
            {/* Partnership Banner */}
            <div
              className="partnership-banner"
              style={{
                width: '100%',
                padding: '2rem 2rem',
                borderRadius: '1.75rem',
                background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}12, ${palette.brandSecondarySoft}20, ${palette.brandPrimaryStrong}08)`,
                border: `2px solid ${palette.brandPrimaryStrong}25`,
                marginBottom: '2.5rem',
                boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08), 0 4px 16px rgba(15, 23, 42, 0.04)',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)',
              }}
            >
              {/* Decorative background elements */}
              <div
                style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-10%',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `${palette.brandPrimaryStrong}10`,
                  filter: 'blur(40px)',
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '-50%',
                  left: '-10%',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: `${palette.brandSecondarySoft}15`,
                  filter: 'blur(40px)',
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    marginBottom: '1.25rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      color: palette.brandPrimaryStrong,
                      flexShrink: 0,
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  >
                    <style>
                      {`
                        @keyframes pulse {
                          0%, 100% { opacity: 1; transform: scale(1); }
                          50% { opacity: 0.8; transform: scale(1.05); }
                        }
                      `}
                    </style>
                    <path
                      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: palette.brandPrimaryStrong,
                      lineHeight: 1.3,
                    }}
                  >
                    {partnershipBanner}
                  </h1>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '1.1rem',
                    color: palette.textSecondary,
                    lineHeight: 1.7,
                    maxWidth: '800px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                >
                  {partnershipDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Homepage Sections with Icons */}
          {isSectionsLoading && <SectionSkeleton />}
          {!isSectionsLoading && !isSectionsError && homepageSections.length > 0 && (
            <div
              style={{
                width: '100%',
                maxWidth: '1200px',
                marginTop: '2.5rem',
                paddingTop: '2rem',
                borderTop: `1px solid ${palette.neutralBorderSoft}`,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  marginBottom: '3rem',
                  fontSize: '2.25rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                  textAlign: 'center',
                  background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondaryMuted})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                }}
                className="section-title"
              >
                {isArabic ? 'معلومات عن الشركة' : 'Company Information'}
              </h2>
              <div
                className="homepage-sections-grid"
                style={{
                  display: 'grid',
                  gap: '1.5rem',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
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
                      className="homepage-section-card"
                      style={{
                        ...featureCardStyle,
                        padding: '2rem 1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.25rem',
                        alignItems: 'center',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        minHeight: '200px',
                        border: `1.5px solid ${palette.neutralBorderSoft}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 20px 48px rgba(15, 23, 42, 0.12), 0 8px 16px rgba(15, 23, 42, 0.08)';
                        e.currentTarget.style.background = `${palette.brandSecondarySoft}15`;
                        e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)';
                        e.currentTarget.style.background = palette.backgroundSurface;
                        e.currentTarget.style.borderColor = palette.neutralBorderSoft;
                      }}
                      onClick={() => {
                        setOpenSection(section);
                      }}
                    >
                      <div
                        className="homepage-section-icon"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '88px',
                          height: '88px',
                          borderRadius: '1.5rem',
                          background: `linear-gradient(135deg, ${palette.brandSecondarySoft}50, ${palette.brandPrimaryStrong}20)`,
                          marginBottom: '0.75rem',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)';
                          e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandSecondarySoft}70, ${palette.brandPrimaryStrong}30)`;
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                          e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandSecondarySoft}50, ${palette.brandPrimaryStrong}20)`;
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
                        }}
                      >
                        {IconComponent}
                      </div>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          color: palette.textPrimary,
                          lineHeight: 1.5,
                          minHeight: '2.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
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
                fontSize: '2.25rem',
                fontWeight: 700,
                color: palette.textPrimary,
                marginBottom: '1rem',
                background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondaryMuted})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
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
                    padding: '2.5rem 2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: `1.5px solid ${palette.neutralBorderSoft}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 24px 48px rgba(15, 23, 42, 0.12), 0 8px 16px rgba(15, 23, 42, 0.08)';
                    e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}30`;
                    e.currentTarget.style.background = `${palette.brandSecondarySoft}08`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)';
                    e.currentTarget.style.borderColor = palette.neutralBorderSoft;
                    e.currentTarget.style.background = palette.backgroundSurface;
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '96px',
                      height: '96px',
                      borderRadius: '1.5rem',
                      background: `linear-gradient(135deg, ${palette.brandSecondarySoft}50, ${palette.brandPrimaryStrong}20)`,
                      marginBottom: '0.75rem',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.08)';
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

        {/* Statistics Section */}
        <StatisticsSection />

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
                fontSize: '2.25rem',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondaryMuted})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
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
                      border: `1.5px solid ${palette.neutralBorderSoft}`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 24px 48px rgba(15, 23, 42, 0.12), 0 8px 16px rgba(15, 23, 42, 0.08)';
                      e.currentTarget.style.borderColor = `${palette.brandPrimaryStrong}30`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)';
                      e.currentTarget.style.borderColor = palette.neutralBorderSoft;
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
                        padding: '1rem 1.75rem',
                        borderRadius: '0.875rem',
                        background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`,
                        color: palette.textOnBrand,
                        fontWeight: 600,
                        textDecoration: 'none',
                        textAlign: 'center',
                        display: 'block',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimary}, ${palette.brandPrimaryStrong})`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`;
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.15)';
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
                fontSize: '2.25rem',
                fontWeight: 700,
                color: palette.textPrimary,
                marginBottom: '1rem',
                background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandSecondaryMuted})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
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
                ? 'تابع آخر التحديثات والأخبار لشركاء باكورة'
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
              borderRadius: '1.75rem',
              border: `1.5px solid ${palette.neutralBorderSoft}`,
              padding: '2.5rem 2rem',
              background: `linear-gradient(135deg, ${palette.backgroundSurface}, ${palette.brandSecondarySoft}05)`,
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)',
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
                marginTop: '1.25rem',
                padding: '1rem 1.75rem',
                borderRadius: '0.875rem',
                background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`,
                color: palette.textOnBrand,
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimary}, ${palette.brandPrimaryStrong})`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(15, 23, 42, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `linear-gradient(135deg, ${palette.brandPrimaryStrong}, ${palette.brandPrimary})`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.15)';
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
                ? 'شركاء باكورة تربط المستثمرين بقادة الابتكار في المنطقة وتوفر أدوات تحليل عميقة لاتخاذ القرار.'
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
              ? '© ' + new Date().getFullYear().toString() + ' شركاء باكورة. جميع الحقوق محفوظة.'
              : `© ${new Date().toLocaleDateString(undefined, { year: 'numeric' })} Bakura tec. All rights reserved.`}
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            {isArabic ? 'تم التطوير بواسطة حاضنة باكورة التقنيات الرقمية' : 'Developed by Bacura Technologies Team'}
          </div>
        </div>
      </footer>
      <ScrollToTopButton />
    </div>
    </>
  );
}




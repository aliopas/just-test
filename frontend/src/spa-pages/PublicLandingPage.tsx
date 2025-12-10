import React, { useMemo } from 'react';
import { CompanyContentSection } from '../components/landing/CompanyContentSection';
import { StatisticsSection } from '../components/landing/StatisticsSection';
import { PublicNewsSection } from '../components/landing/PublicNewsSection';
import { ScrollToTopButton } from '../components/landing/ScrollToTopButton';
import { AppFooter } from '../components/AppFooter';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import {
  useCompanyProfiles,
  usePartnershipInfo,
} from '../hooks/useSupabaseTables';
import { useIsMobile } from '../hooks/useMediaQuery';
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '../utils/supabase-storage';
import { OptimizedImage } from '../components/OptimizedImage';

export function PublicLandingPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';
  const isMobile = useIsMobile();

  // Public, admin-managed content for hero and header
  const { data: profiles } = useCompanyProfiles();
  const { data: partnershipInfo } = usePartnershipInfo();

  const mainProfile = profiles && profiles.length > 0 
    ? profiles.sort((a, b) => a.display_order - b.display_order)[0]
    : null;
  const mainPartnership = partnershipInfo && partnershipInfo.length > 0
    ? partnershipInfo.sort((a, b) => a.display_order - b.display_order)[0]
    : null;

  const mainProfileIconUrl = useMemo(() => {
    if (!mainProfile?.icon_key) return null;
    return getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, mainProfile.icon_key);
  }, [mainProfile?.icon_key]);


  const heroTitle = isArabic
    ? 'منصة شركاء باكورة'
    : 'Bacura Partners Platform';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${palette.backgroundBase} 0%, ${palette.backgroundAlt} 40%, #ffffff 100%)`,
        color: palette.textPrimary,
        direction,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: `1px solid ${palette.neutralBorderSoft}`,
          background: palette.backgroundSurface,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '1rem' : '1rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              flexWrap: 'wrap',
            }}
          >
            <Logo size={isMobile ? 48 : 56} showWordmark={false} aria-hidden />
            <div>
              <div
                style={{
                  fontSize: isMobile ? '1.1rem' : '1.25rem',
                  fontWeight: 700,
                  letterSpacing: isArabic ? 0 : '0.02em',
                }}
              >
                {isArabic ? 'منصة شركاء باكورة' : 'Bacura Partners Platform'}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: isMobile ? '0.5rem' : '0.75rem',
              flexWrap: 'wrap',
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <a
              href="/login"
              style={{
                padding: isMobile ? '0.65rem 1rem' : '0.55rem 1.3rem',
                borderRadius: '999px',
                border: `1px solid ${palette.neutralBorderSoft}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: isMobile ? '0.85rem' : '0.9rem',
                flex: isMobile ? 1 : 'none',
                textAlign: 'center',
                minHeight: isMobile ? '44px' : 'auto',
              }}
            >
              {isArabic ? 'تسجيل الدخول' : 'Sign in'}
            </a>
            <a
              href="/register"
              style={{
                padding: isMobile ? '0.65rem 1rem' : '0.55rem 1.4rem',
                borderRadius: '999px',
                border: 'none',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: isMobile ? '0.85rem' : '0.9rem',
                flex: isMobile ? 1 : 'none',
                textAlign: 'center',
                minHeight: isMobile ? '44px' : 'auto',
              }}
            >
              {isArabic ? '  كن شريك باكورة ' : 'Create investor account'}
            </a>
          </div>
        </div>
      </header>

      {/* Hero + main content */}
      <main
        style={{
          flex: 1,
          paddingBottom: '4rem',
        }}
      >
        {/* Hero */}
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '1.5rem 1rem' : '2.5rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '1.25rem' : '1.75rem',
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: isMobile ? '1.75rem' : '2.4rem',
                lineHeight: 1.3,
                fontWeight: 800,
                letterSpacing: isArabic ? 0 : '-0.05em',
              }}
            >
              {heroTitle}
            </h1>
          </div>

          {/* Primary CTA: investment request */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            <a
              href="/requests/new"
              style={{
                padding: '0.85rem 1.8rem',
                borderRadius: '999px',
                border: 'none',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {isArabic ? 'قدّم طلب استثمار الآن' : 'Submit an investment request'}
            </a>
            <a
              href="/dashboard"
              style={{
                padding: '0.8rem 1.4rem',
                borderRadius: '999px',
                border: `1px solid ${palette.neutralBorderSoft}`,
                background: 'transparent',
                color: palette.textSecondary,
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            >
              {isArabic ? 'استعرض تجربة المستثمر' : 'Preview investor experience'}
            </a>
          </div>
        </section>

        {/* Company Profile Section - First profile displayed as intro section */}
        {mainProfile && (
          <section
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: isMobile ? '2rem 1rem' : '3rem 1.5rem',
            }}
          >
            <div
              style={{
                background: palette.backgroundSurface,
                borderRadius: isMobile ? '1rem' : '1.5rem',
                padding: isMobile ? '1.5rem' : '2.5rem',
                border: `1px solid ${palette.neutralBorderSoft}`,
                boxShadow: `0 4px 16px ${palette.neutralBorderSoft}20`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {mainProfileIconUrl && (
                  <div
                    style={{
                      width: isMobile ? '64px' : '80px',
                      height: isMobile ? '64px' : '80px',
                      borderRadius: '1rem',
                      background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}15 0%, ${palette.brandSecondarySoft}25 100%)`,
                      border: `2px solid ${palette.brandPrimaryStrong}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      padding: '0.75rem',
                      overflow: 'hidden',
                    }}
                  >
                    <OptimizedImage
                      src={mainProfileIconUrl}
                      alt={isArabic ? mainProfile.title_ar : mainProfile.title_en}
                      aspectRatio={1}
                      objectFit="contain"
                      style={{
                        background: 'transparent',
                      }}
                    />
                  </div>
                )}
                <h2
                  style={{
                    margin: 0,
                    fontSize: isMobile ? '1.5rem' : '2rem',
                    fontWeight: 700,
                    color: palette.textPrimary,
                    letterSpacing: isArabic ? 0 : '-0.02em',
                  }}
                >
                  {isArabic ? mainProfile.title_ar : mainProfile.title_en}
                </h2>
              </div>
              <div
                style={{
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  lineHeight: 1.8,
                  color: palette.textSecondary,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {isArabic ? mainProfile.content_ar : mainProfile.content_en}
              </div>
            </div>
          </section>
        )}

        {/* Statistics & company public content from Supabase */}
        <section
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 1.5rem',
          }}
        >
          <StatisticsSection />
        </section>

        {/* Public News Section */}
        <PublicNewsSection />

        <section
          style={{
            maxWidth: '1200px',
            margin: '2.5rem auto 0',
            padding: '0 1.5rem',
          }}
        >
          <CompanyContentSection excludeProfile={true} />
        </section>
      </main>

      <ScrollToTopButton />
      <AppFooter />
    </div>
  );
}

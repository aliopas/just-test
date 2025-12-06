import React from 'react';
import { CompanyContentSection } from '../components/landing/CompanyContentSection';
import { StatisticsSection } from '../components/landing/StatisticsSection';
import { ScrollToTopButton } from '../components/landing/ScrollToTopButton';
import { AppFooter } from '../components/AppFooter';
import { Logo } from '../components/Logo';
import { palette } from '../styles/theme';
import { useLanguage } from '../context/LanguageContext';
import {
  useCompanyProfiles,
  usePartnershipInfo,
} from '../hooks/useSupabaseTables';

export function PublicLandingPage() {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  // Public, admin-managed content for hero and header
  const { data: profiles } = useCompanyProfiles();
  const { data: partnershipInfo } = usePartnershipInfo();

  const mainProfile = profiles && profiles.length > 0 
    ? profiles.sort((a, b) => a.display_order - b.display_order)[0]
    : null;
  const mainPartnership = partnershipInfo && partnershipInfo.length > 0
    ? partnershipInfo.sort((a, b) => a.display_order - b.display_order)[0]
    : null;

  const headerSubtitle =
    mainProfile && (isArabic ? mainProfile.content_ar : mainProfile.content_en).length > 0
      ? `${(isArabic ? mainProfile.content_ar : mainProfile.content_en).slice(0, 110)}${
          (isArabic ? mainProfile.content_ar : mainProfile.content_en).length > 110 ? '…' : ''
        }`
      : isArabic
        ? 'بوابة موحدة لاستقبال المستثمرين وتقديم طلبات الاستثمار.'
        : 'Unified portal for investor onboarding and investment requests.';

  const heroTitle =
    mainPartnership && (isArabic ? mainPartnership.title_ar : mainPartnership.title_en).length > 0
      ? (isArabic ? mainPartnership.title_ar : mainPartnership.title_en)
      : isArabic
        ? 'كن شريكًا في باكورة'
        : 'Become a partner in Bakura';

  const heroDescription =
    mainProfile && (isArabic ? mainProfile.content_ar : mainProfile.content_en).length > 0
      ? (isArabic ? mainProfile.content_ar : mainProfile.content_en)
      : isArabic
        ? 'قدّم طلب الاستثمار الخاص بك وتابع أخبار الشركة، المشاريع، والتقارير في مكان واحد مصمم للمستثمرين.'
        : 'Submit your investment request and follow company news, projects, and reports in a single portal built for investors.';

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
            padding: '1rem 1.5rem',
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
            <Logo size={56} showWordmark={false} aria-hidden />
            <div>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  letterSpacing: isArabic ? 0 : '0.02em',
                }}
              >
                {isArabic ? 'شركاء باكورة' : 'Bacura Partners'}
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: palette.textSecondary,
                }}
              >
                {headerSubtitle}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/login"
              style={{
                padding: '0.55rem 1.3rem',
                borderRadius: '999px',
                border: `1px solid ${palette.neutralBorderSoft}`,
                background: palette.backgroundSurface,
                color: palette.textPrimary,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {isArabic ? 'تسجيل الدخول' : 'Sign in'}
            </a>
            <a
              href="/register"
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '999px',
                border: 'none',
                background: palette.brandPrimaryStrong,
                color: palette.textOnBrand,
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
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
            padding: '2.5rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
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
                fontSize: '2.4rem',
                lineHeight: 1.3,
                fontWeight: 800,
                letterSpacing: isArabic ? 0 : '-0.05em',
              }}
            >
              {heroTitle}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '1.05rem',
                lineHeight: 1.8,
                color: palette.textSecondary,
              }}
            >
              {heroDescription}
            </p>
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
              href="/home"
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

        <section
          style={{
            maxWidth: '1200px',
            margin: '2.5rem auto 0',
            padding: '0 1.5rem',
          }}
        >
          <CompanyContentSection />
        </section>
      </main>

      <ScrollToTopButton />
      <AppFooter />
    </div>
  );
}

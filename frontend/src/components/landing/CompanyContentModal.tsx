import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { palette } from '../../styles/theme';
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

interface CompanyContentModalProps {
  sectionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanyContentModal({ sectionId, isOpen, onClose }: CompanyContentModalProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  // Fetch all content
  const { data: profilesData } = usePublicCompanyProfiles();
  const { data: partnersData } = usePublicCompanyPartners();
  const { data: clientsData } = usePublicCompanyClients();
  const { data: resourcesData } = usePublicCompanyResources();
  const { data: strengthsData } = usePublicCompanyStrengths();
  const { data: partnershipData } = usePublicPartnershipInfo();
  const { data: marketValueData } = usePublicMarketValue();
  const { data: goalsData } = usePublicCompanyGoals();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Find the selected content
  const content = useMemo(() => {
    if (!sectionId) return null;

    // Profile
    if (sectionId.startsWith('profile-')) {
      const id = sectionId.replace('profile-', '');
      const profile = profilesData?.profiles.find((p) => p.id === id);
      if (!profile) return null;
      return {
        type: 'profile' as const,
        title: profile.title,
        content: profile.content,
        iconKey: profile.iconKey,
      };
    }

    // Partner
    if (sectionId.startsWith('partner-')) {
      const id = sectionId.replace('partner-', '');
      const partners = partnersData?.partners ?? [];
      const partner = partners.find((p) => p.id === id);
      if (!partner) {
        console.warn(`Partner with id "${id}" not found. Available partners:`, partners.map((p) => p.id));
        return null;
      }
      return {
        type: 'partner' as const,
        name: partner.name,
        description: partner.description,
        logoKey: partner.logoKey,
        websiteUrl: partner.websiteUrl,
      };
    }

    // Client (Business Model)
    if (sectionId.startsWith('client-')) {
      const id = sectionId.replace('client-', '');
      const clients = clientsData?.clients ?? [];
      const client = clients.find((c) => c.id === id);
      if (!client) {
        console.warn(`Client with id "${id}" not found. Available clients:`, clients.map((c) => c.id));
        return null;
      }
      return {
        type: 'client' as const,
        name: client.name,
        description: client.description,
        logoKey: client.logoKey,
      };
    }

    // Partners & Clients (legacy - kept for backward compatibility)
    if (sectionId === 'partners-clients') {
      const partners = partnersData?.partners ?? [];
      const clients = clientsData?.clients ?? [];
      return {
        type: 'partners-clients' as const,
        partners,
        clients,
      };
    }

    // Resource
    if (sectionId.startsWith('resource-')) {
      const id = sectionId.replace('resource-', '');
      const resource = resourcesData?.resources.find((r) => r.id === id);
      if (!resource) return null;
      return {
        type: 'resource' as const,
        title: resource.title,
        description: resource.description,
        value: resource.value,
        currency: resource.currency,
        iconKey: resource.iconKey,
      };
    }

    // Strength
    if (sectionId.startsWith('strength-')) {
      const id = sectionId.replace('strength-', '');
      const strength = strengthsData?.strengths.find((s) => s.id === id);
      if (!strength) return null;
      return {
        type: 'strength' as const,
        title: strength.title,
        description: strength.description,
        iconKey: strength.iconKey,
      };
    }

    // Partnership Info
    if (sectionId.startsWith('partnership-')) {
      const id = sectionId.replace('partnership-', '');
      const info = partnershipData?.partnershipInfo.find((p) => p.id === id);
      if (!info) return null;
      return {
        type: 'partnership' as const,
        title: info.title,
        content: info.content,
        steps: info.steps,
        iconKey: info.iconKey,
      };
    }

    // Market Value
    if (sectionId === 'market-value') {
      const marketValue = marketValueData?.marketValue;
      if (!marketValue) return null;
      return {
        type: 'market-value' as const,
        value: marketValue.value,
        currency: marketValue.currency,
        valuationDate: marketValue.valuationDate,
        source: marketValue.source,
        isVerified: marketValue.isVerified,
        verifiedAt: marketValue.verifiedAt,
      };
    }

    // Goal
    if (sectionId.startsWith('goal-')) {
      const id = sectionId.replace('goal-', '');
      const goal = goalsData?.goals.find((g) => g.id === id);
      if (!goal) return null;
      return {
        type: 'goal' as const,
        title: goal.title,
        description: goal.description,
        targetDate: goal.targetDate,
        iconKey: goal.iconKey,
      };
    }

    return null;
  }, [
    sectionId,
    profilesData,
    partnersData,
    clientsData,
    resourcesData,
    strengthsData,
    partnershipData,
    marketValueData,
    goalsData,
  ]);

  // Get icon URL - handle different content types (must be before any conditional returns)
  const iconUrl = useMemo(() => {
    if (!content) return null;
    if ((content.type === 'client' || content.type === 'partner') && 'logoKey' in content && content.logoKey) {
      return getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, content.logoKey);
    }
    if ('iconKey' in content && content.iconKey) {
      return getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, content.iconKey);
    }
    return null;
  }, [content]);

  // Get title - must be before any conditional returns
  const title = useMemo(() => {
    if (!content) return '';
    switch (content.type) {
      case 'profile':
        return content.title;
      case 'partner':
        return content.name;
      case 'client':
        return content.name;
      case 'partners-clients':
        return isArabic ? 'عملائنا وشركائنا' : 'Our Partners & Clients';
      case 'resource':
        return content.title;
      case 'strength':
        return content.title;
      case 'partnership':
        return content.title;
      case 'market-value':
        return isArabic ? 'القيمة السوقية المعتمدة' : 'Verified Market Value';
      case 'goal':
        return content.title;
      default:
        return '';
    }
  }, [content, isArabic]);

  if (!isOpen) {
    return null;
  }

  const container = document.getElementById('drawer-root') ?? document.body;

  // If no content found, show error message
  if (!content) {
    return createPortal(
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: palette.backgroundSurface,
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            direction,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: '1rem',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: palette.textPrimary,
            }}
          >
            {isArabic ? 'خطأ في تحميل المحتوى' : 'Error Loading Content'}
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: '1.5rem',
              color: palette.textSecondary,
            }}
          >
            {isArabic
              ? 'لم يتم العثور على المحتوى المطلوب. يرجى المحاولة مرة أخرى.'
              : 'The requested content could not be found. Please try again.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: palette.brandPrimaryStrong,
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>,
      container
    );
  }

  let modalContent: React.ReactNode = null;

  switch (content.type) {
    case 'profile':
      modalContent = (
        <div>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.9,
              color: palette.textPrimary,
              fontSize: '1.1rem',
              padding: '1.5rem',
              borderRadius: '1rem',
              background: palette.backgroundBase,
            }}
          >
            {content.content}
          </div>
        </div>
      );
      break;

    case 'partners-clients':
      modalContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {content.partners.length > 0 && (
            <div>
              <h3
                style={{
                  margin: 0,
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                }}
              >
                {isArabic ? 'شركاؤنا' : 'Our Partners'}
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {content.partners.map((partner) => {
                  const logoUrl = partner.logoKey
                    ? getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, partner.logoKey)
                    : null;
                  return (
                    <div
                      key={partner.id}
                      style={{
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        border: `1px solid ${palette.neutralBorderSoft}`,
                        background: palette.backgroundSurface,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      {logoUrl && (
                        <div style={{ width: '120px', height: '80px' }}>
                          <OptimizedImage
                            src={logoUrl}
                            alt={partner.name}
                            aspectRatio={3 / 2}
                            objectFit="contain"
                          />
                        </div>
                      )}
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: palette.textPrimary,
                        }}
                      >
                        {partner.name}
                      </h4>
                      {partner.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            color: palette.textSecondary,
                          }}
                        >
                          {partner.description}
                        </p>
                      )}
                      {partner.websiteUrl && (
                        <a
                          href={partner.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '0.85rem',
                            color: palette.brandPrimaryStrong,
                            textDecoration: 'none',
                          }}
                        >
                          {isArabic ? 'زيارة الموقع' : 'Visit Website'}
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {content.clients.length > 0 && (
            <div>
              <h3
                style={{
                  margin: 0,
                  marginBottom: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                }}
              >
                {isArabic ? 'عملاؤنا' : 'Our Clients'}
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {content.clients.map((client) => {
                  const logoUrl = client.logoKey
                    ? getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, client.logoKey)
                    : null;
                  return (
                    <div
                      key={client.id}
                      style={{
                        padding: '1.5rem',
                        borderRadius: '1rem',
                        border: `1px solid ${palette.neutralBorderSoft}`,
                        background: palette.backgroundSurface,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      {logoUrl && (
                        <div style={{ width: '120px', height: '80px' }}>
                          <OptimizedImage
                            src={logoUrl}
                            alt={client.name}
                            aspectRatio={3 / 2}
                            objectFit="contain"
                          />
                        </div>
                      )}
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: palette.textPrimary,
                        }}
                      >
                        {client.name}
                      </h4>
                      {client.description && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: '0.9rem',
                            color: palette.textSecondary,
                          }}
                        >
                          {client.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
      break;

    case 'client':
      const clientLogoUrl = content.logoKey
        ? getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, content.logoKey)
        : null;
      modalContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', minHeight: '200px' }}>
          {clientLogoUrl && (
            <div style={{ width: '200px', height: '120px' }}>
              <OptimizedImage
                src={clientLogoUrl}
                alt={content.name}
                aspectRatio={3 / 2}
                objectFit="contain"
              />
            </div>
          )}
          {content.description ? (
            <div
              style={{
                margin: 0,
                lineHeight: 1.9,
                color: palette.textPrimary,
                textAlign: 'center',
                maxWidth: '700px',
                whiteSpace: 'pre-wrap',
                fontSize: '1.1rem',
                padding: '1.5rem',
                borderRadius: '1rem',
                background: palette.backgroundBase,
              }}
            >
              {content.description}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                lineHeight: 1.8,
                color: palette.textSecondary,
                textAlign: 'center',
                maxWidth: '600px',
                fontStyle: 'italic',
                fontSize: '1rem',
              }}
            >
              {isArabic ? 'لا يوجد وصف متاح' : 'No description available'}
            </p>
          )}
        </div>
      );
      break;

    case 'partner':
      const partnerLogoUrl = content.logoKey
        ? getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, content.logoKey)
        : null;
      modalContent = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', minHeight: '200px' }}>
          {partnerLogoUrl && (
            <div style={{ width: '200px', height: '120px' }}>
              <OptimizedImage
                src={partnerLogoUrl}
                alt={content.name}
                aspectRatio={3 / 2}
                objectFit="contain"
              />
            </div>
          )}
          {content.description ? (
            <div
              style={{
                margin: 0,
                lineHeight: 1.9,
                color: palette.textPrimary,
                textAlign: 'center',
                maxWidth: '700px',
                whiteSpace: 'pre-wrap',
                fontSize: '1.1rem',
                padding: '1.5rem',
                borderRadius: '1rem',
                background: palette.backgroundBase,
              }}
            >
              {content.description}
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                lineHeight: 1.8,
                color: palette.textSecondary,
                textAlign: 'center',
                maxWidth: '600px',
                fontStyle: 'italic',
                fontSize: '1rem',
              }}
            >
              {isArabic ? 'لا يوجد وصف متاح' : 'No description available'}
            </p>
          )}
          {content.websiteUrl && (
            <a
              href={content.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '1.1rem',
                color: palette.brandPrimaryStrong,
                textDecoration: 'none',
                fontWeight: 600,
                marginTop: '0.5rem',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                background: `${palette.brandPrimaryStrong}10`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${palette.brandPrimaryStrong}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${palette.brandPrimaryStrong}10`;
              }}
            >
              {isArabic ? 'زيارة الموقع' : 'Visit Website'} →
            </a>
          )}
        </div>
      );
      break;

    case 'resource':
      modalContent = (
        <div>
          {content.description && (
            <div
              style={{
                margin: 0,
                marginBottom: '1.5rem',
                lineHeight: 1.9,
                color: palette.textPrimary,
                fontSize: '1.1rem',
                padding: '1.5rem',
                borderRadius: '1rem',
                background: palette.backgroundBase,
                whiteSpace: 'pre-wrap',
              }}
            >
              {content.description}
            </div>
          )}
          {content.value !== null && (
            <div
              style={{
                padding: '2rem',
                borderRadius: '1rem',
                background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}15, ${palette.brandSecondarySoft}10)`,
                marginTop: '1rem',
                textAlign: 'center',
                border: `2px solid ${palette.brandPrimaryStrong}30`,
              }}
            >
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: palette.brandPrimaryStrong,
                  marginBottom: '0.5rem',
                }}
              >
                {new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
                  style: 'currency',
                  currency: content.currency,
                  maximumFractionDigits: 0,
                }).format(content.value)}
              </div>
            </div>
          )}
        </div>
      );
      break;

    case 'strength':
      modalContent = (
        <div>
          {content.description && (
            <div
              style={{
                margin: 0,
                lineHeight: 1.9,
                color: palette.textPrimary,
                whiteSpace: 'pre-wrap',
                fontSize: '1.1rem',
                padding: '1.5rem',
                borderRadius: '1rem',
                background: palette.backgroundBase,
              }}
            >
              {content.description}
            </div>
          )}
        </div>
      );
      break;

    case 'partnership':
      modalContent = (
        <div>
          <div
            style={{
              whiteSpace: 'pre-wrap',
              lineHeight: 1.9,
              color: palette.textPrimary,
              marginBottom: '2rem',
              fontSize: '1.1rem',
              padding: '1.5rem',
              borderRadius: '1rem',
              background: palette.backgroundBase,
            }}
          >
            {content.content}
          </div>
          {content.steps && content.steps.length > 0 && (
            <div>
              <h4
                style={{
                  margin: 0,
                  marginBottom: '1.5rem',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: palette.textPrimary,
                }}
              >
                {isArabic ? 'الخطوات' : 'Steps'}
              </h4>
              <ol
                style={{
                  paddingInlineStart: '1.5rem',
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {content.steps.map((step, index) => (
                  <li
                    key={index}
                    style={{
                      lineHeight: 1.9,
                      color: palette.textPrimary,
                      fontSize: '1.05rem',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      background: palette.backgroundBase,
                      listStylePosition: 'outside',
                    }}
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      );
      break;

    case 'market-value':
      const formattedValue = new Intl.NumberFormat(isArabic ? 'ar-SA' : 'en-US', {
        style: 'currency',
        currency: content.currency,
        maximumFractionDigits: 0,
      }).format(content.value);

      const formattedDate = new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
        dateStyle: 'long',
      }).format(new Date(content.valuationDate));

      const verifiedDate = content.verifiedAt
        ? new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
            dateStyle: 'long',
          }).format(new Date(content.verifiedAt))
        : null;

      modalContent = (
        <div>
          <div
            style={{
              padding: '2rem',
              borderRadius: '1rem',
              background: palette.backgroundBase,
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '3rem',
                fontWeight: 700,
                color: palette.brandPrimaryStrong,
                marginBottom: '0.5rem',
              }}
            >
              {formattedValue}
            </div>
            <div
              style={{
                fontSize: '1rem',
                color: palette.textSecondary,
              }}
            >
              {isArabic ? `تاريخ التقييم: ${formattedDate}` : `Valuation Date: ${formattedDate}`}
            </div>
          </div>
          {content.source && (
            <div
              style={{
                padding: '1rem',
                borderRadius: '0.75rem',
                background: palette.backgroundSurface,
                marginBottom: '1rem',
              }}
            >
              <strong style={{ color: palette.textPrimary }}>
                {isArabic ? 'المصدر: ' : 'Source: '}
              </strong>
              <span style={{ color: palette.textSecondary }}>{content.source}</span>
            </div>
          )}
          {content.isVerified && verifiedDate && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem',
                borderRadius: '0.75rem',
                background: palette.backgroundHighlight,
              }}
            >
              <span
                style={{
                  fontSize: '1.5rem',
                }}
              >
                ✓
              </span>
              <span style={{ color: palette.textSecondary }}>
                {isArabic
                  ? `تم التحقق في ${verifiedDate}`
                  : `Verified on ${verifiedDate}`}
              </span>
            </div>
          )}
        </div>
      );
      break;

    case 'goal':
      const formattedTargetDate = content.targetDate
        ? new Intl.DateTimeFormat(isArabic ? 'ar-SA' : 'en-US', {
            dateStyle: 'long',
          }).format(new Date(content.targetDate))
        : null;

      modalContent = (
        <div>
          {content.description && (
            <div
              style={{
                margin: 0,
                marginBottom: formattedTargetDate ? '1.5rem' : 0,
                lineHeight: 1.9,
                color: palette.textPrimary,
                whiteSpace: 'pre-wrap',
                fontSize: '1.1rem',
                padding: '1.5rem',
                borderRadius: '1rem',
                background: palette.backgroundBase,
              }}
            >
              {content.description}
            </div>
          )}
          {formattedTargetDate && (
            <div
              style={{
                padding: '1.5rem',
                borderRadius: '1rem',
                background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}15, ${palette.brandSecondarySoft}10)`,
                marginTop: '1rem',
                border: `2px solid ${palette.brandPrimaryStrong}30`,
              }}
            >
              <strong style={{ color: palette.textPrimary, fontSize: '1.1rem' }}>
                {isArabic ? 'التاريخ المستهدف: ' : 'Target Date: '}
              </strong>
              <span style={{ color: palette.textPrimary, fontSize: '1.1rem', fontWeight: 600 }}>
                {formattedTargetDate}
              </span>
            </div>
          )}
        </div>
      );
      break;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
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
            from { opacity: 0; }
            to { opacity: 1; }
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
        `}
      </style>
      <div
        style={{
          background: palette.backgroundSurface,
          borderRadius: '1.5rem',
          padding: '2.5rem',
          maxWidth: '800px',
          maxHeight: '90vh',
          width: '100%',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.3)',
          animation: 'slideUp 0.3s ease-out',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={isArabic ? 'إغلاق' : 'Close'}
          style={{
            position: 'absolute',
            top: '1rem',
            [isArabic ? 'left' : 'right']: '1rem',
            padding: '0.5rem',
            borderRadius: '0.75rem',
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundSurface,
            color: palette.textPrimary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = palette.backgroundBase;
            e.currentTarget.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = palette.backgroundSurface;
            e.currentTarget.style.transform = 'rotate(0deg)';
          }}
        >
          <svg
            width="20"
            height="20"
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

        {/* Icon */}
        {iconUrl && content.type !== 'client' && content.type !== 'partner' && (
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '1rem',
              overflow: 'hidden',
              marginBottom: '1.5rem',
            }}
          >
            <OptimizedImage
              src={iconUrl}
              alt={title || ''}
              aspectRatio={1}
              objectFit="contain"
              style={{
                background: palette.backgroundBase,
              }}
            />
          </div>
        )}

        {/* Title */}
        <h2
          id="content-modal-title"
          style={{
            margin: 0,
            marginBottom: '1.5rem',
            fontSize: '2rem',
            fontWeight: 700,
            color: palette.textPrimary,
          }}
        >
          {title}
        </h2>

        {/* Content */}
        <div>{modalContent}</div>
      </div>
    </div>,
    container
  );
}


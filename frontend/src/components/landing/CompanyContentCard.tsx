import { useMemo } from 'react';
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '../../utils/supabase-storage';
import { OptimizedImage } from '../OptimizedImage';
import { palette } from '../../styles/theme';

interface CompanyContentCardProps {
  id: string;
  title: string;
  description?: string | null;
  iconKey?: string | null;
  onClick?: () => void;
  language: 'ar' | 'en';
}

export function CompanyContentCard({
  id,
  title,
  description,
  iconKey,
  onClick,
  language,
}: CompanyContentCardProps) {
  const iconUrl = useMemo(() => {
    if (!iconKey) return null;
    return getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, iconKey);
  }, [iconKey]);

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '2.5rem',
        borderRadius: '1.5rem',
        border: `3px solid ${palette.neutralBorder}`,
        background: palette.backgroundSurface,
        boxShadow: `
          0 6px 20px rgba(15, 23, 42, 0.1),
          0 3px 10px rgba(15, 23, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.08)
        `,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'start',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        direction,
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.borderColor = palette.brandPrimaryStrong;
          e.currentTarget.style.borderWidth = '4px';
          e.currentTarget.style.background = `linear-gradient(135deg, ${palette.backgroundSurface} 0%, ${palette.brandPrimaryStrong}05 100%)`;
          e.currentTarget.style.boxShadow = `
            0 16px 40px rgba(15, 23, 42, 0.15),
            0 8px 20px rgba(15, 23, 42, 0.1),
            0 0 0 1px ${palette.brandPrimaryStrong}20
          `;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = palette.neutralBorder;
        e.currentTarget.style.borderWidth = '3px';
        e.currentTarget.style.background = palette.backgroundSurface;
        e.currentTarget.style.boxShadow = `
          0 6px 20px rgba(15, 23, 42, 0.1),
          0 3px 10px rgba(15, 23, 42, 0.06),
          inset 0 1px 0 rgba(255, 255, 255, 0.08)
        `;
      }}
    >
      {iconUrl && (
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            flexShrink: 0,
            background: `linear-gradient(135deg, ${palette.brandPrimaryStrong}15, ${palette.brandSecondarySoft}10)`,
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${palette.brandPrimaryStrong}20`,
          }}
        >
          <OptimizedImage
            src={iconUrl}
            alt={title}
            aspectRatio={1}
            objectFit="contain"
            style={{
              background: 'transparent',
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 800,
            color: palette.textPrimary,
            lineHeight: 1.4,
            letterSpacing: '-0.01em',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              margin: 0,
              fontSize: '1.05rem',
              color: palette.textSecondary,
              lineHeight: 1.75,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontWeight: 400,
              letterSpacing: '0.01em',
            }}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  );
}

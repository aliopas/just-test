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
        padding: '1.75rem',
        borderRadius: '1.25rem',
        border: `1px solid ${palette.neutralBorderSoft}`,
        background: palette.backgroundSurface,
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'start',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        direction,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow =
            '0 8px 24px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(15, 23, 42, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow =
          '0 4px 16px rgba(15, 23, 42, 0.06), 0 2px 8px rgba(15, 23, 42, 0.04)';
      }}
    >
      {iconUrl && (
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '1rem',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          <OptimizedImage
            src={iconUrl}
            alt={title}
            aspectRatio={1}
            objectFit="contain"
            style={{
              background: palette.backgroundBase,
            }}
          />
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        <h3
          style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: 700,
            color: palette.textPrimary,
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              margin: 0,
              fontSize: '0.95rem',
              color: palette.textSecondary,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}
      </div>
    </button>
  );
}


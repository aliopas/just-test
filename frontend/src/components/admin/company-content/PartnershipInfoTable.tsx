import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { PartnershipInfo } from '../../../hooks/useAdminCompanyContent';
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '../../../utils/supabase-storage';
import { OptimizedImage } from '../../OptimizedImage';

interface PartnershipInfoTableProps {
  partnershipInfo: PartnershipInfo[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (info: PartnershipInfo) => void;
  onDelete: (info: PartnershipInfo) => void;
}

export function PartnershipInfoTable({
  partnershipInfo,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
}: PartnershipInfoTableProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  if (isLoading) {
    return (
      <div style={stateStyle}>
        <span>{isArabic ? 'جاري التحميل...' : 'Loading...'}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={stateStyle}>
        <span>{isArabic ? 'حدث خطأ في التحميل' : 'Error loading partnership info'}</span>
        <button type="button" onClick={onRetry} style={retryButtonStyle}>
          ↻
        </button>
      </div>
    );
  }

  if (partnershipInfo.length === 0) {
    return (
      <div style={emptyStyle}>
        <h3 style={emptyTitleStyle}>
          {isArabic ? 'لا توجد معلومات شراكة' : 'No partnership info found'}
        </h3>
        <p style={emptySubtitleStyle}>
          {isArabic ? 'ابدأ بإضافة معلومات شراكة جديدة' : 'Start by adding new partnership info'}
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '800px',
          direction,
          background: palette.backgroundSurface,
          borderRadius: '1rem',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.06)',
        }}
      >
        <thead>
          <tr style={{ background: palette.backgroundAlt }}>
            <th style={thStyle}>{isArabic ? 'الأيقونة' : 'Icon'}</th>
            <th style={thStyle}>{isArabic ? 'العنوان' : 'Title'}</th>
            <th style={thStyle}>{isArabic ? 'عدد الخطوات' : 'Steps Count'}</th>
            <th style={thStyle}>{isArabic ? 'الترتيب' : 'Order'}</th>
            <th style={thStyle}>{isArabic ? 'تاريخ التحديث' : 'Updated'}</th>
            <th style={thStyle}>{isArabic ? 'الإجراءات' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          {partnershipInfo.map((info) => {
            const title = isArabic ? info.titleAr : info.titleEn;
            const steps = isArabic ? info.stepsAr : info.stepsEn;
            const iconUrl = info.iconKey
              ? getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, info.iconKey)
              : null;

            return (
              <tr key={info.id} style={trStyle}>
                <td style={tdStyle}>
                  {iconUrl ? (
                    <OptimizedImage
                      src={iconUrl}
                      alt={title}
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ color: palette.textSecondary }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <strong style={{ color: palette.textPrimary }}>{title}</strong>
                </td>
                <td style={tdStyle}>
                  {steps && steps.length > 0 ? steps.length : 0}
                </td>
                <td style={tdStyle}>{info.displayOrder}</td>
                <td style={tdStyle}>
                  {new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(info.updatedAt))}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(info)}
                      style={actionButtonStyle}
                      title={isArabic ? 'تعديل' : 'Edit'}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(info)}
                      style={{ ...actionButtonStyle, color: '#EF4444' }}
                      title={isArabic ? 'حذف' : 'Delete'}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const stateStyle: React.CSSProperties = {
  padding: '2rem',
  textAlign: 'center',
  color: palette.textSecondary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '1rem',
};

const retryButtonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
  border: `1px solid ${palette.neutralBorderSoft}`,
  background: palette.backgroundSurface,
  color: palette.textPrimary,
  cursor: 'pointer',
  fontSize: '1.2rem',
};

const emptyStyle: React.CSSProperties = {
  padding: '3rem 2rem',
  textAlign: 'center',
  color: palette.textSecondary,
};

const emptyTitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  fontWeight: 700,
  margin: 0,
  marginBottom: '0.5rem',
  color: palette.textPrimary,
};

const emptySubtitleStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  margin: 0,
};

const thStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'start',
  fontSize: '0.875rem',
  fontWeight: 700,
  color: palette.textSecondary,
  borderBottom: `1px solid ${palette.neutralBorderSoft}`,
};

const trStyle: React.CSSProperties = {
  borderBottom: `1px solid ${palette.neutralBorderSoft}`,
  transition: 'background 0.2s ease',
};

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '0.95rem',
  color: palette.textPrimary,
};

const actionButtonStyle: React.CSSProperties = {
  padding: '0.5rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '1.2rem',
  transition: 'transform 0.2s ease',
  minWidth: '36px',
  minHeight: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};


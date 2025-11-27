import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { CompanyPartner } from '../../../hooks/useAdminCompanyContent';
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '../../../utils/supabase-storage';
import { OptimizedImage } from '../../OptimizedImage';
import { TableSkeleton } from './TableSkeleton';

interface CompanyPartnersTableProps {
  partners: CompanyPartner[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (partner: CompanyPartner) => void;
  onDelete: (partner: CompanyPartner) => void;
}

export function CompanyPartnersTable({
  partners,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
}: CompanyPartnersTableProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  if (isLoading) {
    return <TableSkeleton rows={5} columns={5} />;
  }

  if (isError) {
    return (
      <div style={stateStyle}>
        <span>{isArabic ? 'حدث خطأ في التحميل' : 'Error loading partners'}</span>
        <button type="button" onClick={onRetry} style={retryButtonStyle}>
          ↻
        </button>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div style={emptyStyle}>
        <h3 style={emptyTitleStyle}>
          {isArabic ? 'لا يوجد شركاء' : 'No partners found'}
        </h3>
        <p style={emptySubtitleStyle}>
          {isArabic ? 'ابدأ بإضافة شريك جديد' : 'Start by adding a new partner'}
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
            <th style={thStyle}>{isArabic ? 'الشعار' : 'Logo'}</th>
            <th style={thStyle}>{isArabic ? 'الاسم' : 'Name'}</th>
            <th style={thStyle}>{isArabic ? 'الموقع الإلكتروني' : 'Website'}</th>
            <th style={thStyle}>{isArabic ? 'الترتيب' : 'Order'}</th>
            <th style={thStyle}>{isArabic ? 'تاريخ التحديث' : 'Updated'}</th>
            <th style={thStyle}>{isArabic ? 'الإجراءات' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => {
            const name = isArabic ? partner.nameAr : partner.nameEn;
            const logoUrl = partner.logoKey
              ? getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, partner.logoKey)
              : null;

            return (
              <tr key={partner.id} style={trStyle}>
                <td style={tdStyle}>
                  {logoUrl ? (
                    <OptimizedImage
                      src={logoUrl}
                      alt={name}
                      style={{ width: '60px', height: '40px', objectFit: 'contain' }}
                    />
                  ) : (
                    <span style={{ color: palette.textSecondary }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <strong style={{ color: palette.textPrimary }}>{name}</strong>
                </td>
                <td style={tdStyle}>
                  {partner.websiteUrl ? (
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: palette.brandPrimaryStrong,
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                      }}
                    >
                      {partner.websiteUrl.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    <span style={{ color: palette.textSecondary }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>{partner.displayOrder}</td>
                <td style={tdStyle}>
                  {new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(partner.updatedAt))}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(partner)}
                      style={actionButtonStyle}
                      title={isArabic ? 'تعديل' : 'Edit'}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(partner)}
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
  transition: 'background-color 0.2s ease, transform 0.1s ease',
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
  transition: 'transform 0.15s ease, background-color 0.15s ease, opacity 0.15s ease',
  minWidth: '36px',
  minHeight: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};


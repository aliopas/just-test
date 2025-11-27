import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { MarketValue } from '../../../hooks/useAdminCompanyContent';
import { TableSkeleton } from './TableSkeleton';

interface MarketValueTableProps {
  marketValue: MarketValue | null;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function MarketValueTable({
  marketValue,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
}: MarketValueTableProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  if (isLoading) {
    return <TableSkeleton rows={1} columns={5} />;
  }

  if (isError) {
    return (
      <div style={stateStyle}>
        <span>{isArabic ? 'حدث خطأ في التحميل' : 'Error loading market value'}</span>
        <button type="button" onClick={onRetry} style={retryButtonStyle}>
          ↻
        </button>
      </div>
    );
  }

  if (!marketValue) {
    return (
      <div style={emptyStyle}>
        <h3 style={emptyTitleStyle}>
          {isArabic ? 'لا توجد قيمة سوقية' : 'No market value set'}
        </h3>
        <p style={emptySubtitleStyle}>
          {isArabic ? 'ابدأ بإضافة القيمة السوقية' : 'Start by adding market value'}
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
            <th style={thStyle}>{isArabic ? 'القيمة' : 'Value'}</th>
            <th style={thStyle}>{isArabic ? 'العملة' : 'Currency'}</th>
            <th style={thStyle}>{isArabic ? 'تاريخ التقييم' : 'Valuation Date'}</th>
            <th style={thStyle}>{isArabic ? 'المصدر' : 'Source'}</th>
            <th style={thStyle}>{isArabic ? 'حالة التحقق' : 'Verified'}</th>
            <th style={thStyle}>{isArabic ? 'الإجراءات' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          <tr style={trStyle}>
            <td style={tdStyle}>
              <strong style={{ color: palette.textPrimary, fontSize: '1.1rem' }}>
                {new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
                  style: 'currency',
                  currency: marketValue.currency,
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(marketValue.value)}
              </strong>
            </td>
            <td style={tdStyle}>{marketValue.currency}</td>
            <td style={tdStyle}>
              {new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
                dateStyle: 'medium',
              }).format(new Date(marketValue.valuationDate))}
            </td>
            <td style={tdStyle}>
              {marketValue.source || '—'}
            </td>
            <td style={tdStyle}>
              <span
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  background: marketValue.isVerified ? '#10B981' : '#6B7280',
                  color: '#FFFFFF',
                }}
              >
                {marketValue.isVerified ? (isArabic ? '✓ مؤكد' : '✓ Verified') : (isArabic ? 'غير مؤكد' : 'Unverified')}
              </span>
            </td>
            <td style={tdStyle}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={onEdit}
                  style={actionButtonStyle}
                  title={isArabic ? 'تعديل' : 'Edit'}
                >
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  style={{ ...actionButtonStyle, color: '#EF4444' }}
                  title={isArabic ? 'حذف' : 'Delete'}
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
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


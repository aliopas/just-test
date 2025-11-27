import { useMemo } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { palette } from '../../../styles/theme';
import type { CompanyStrength } from '../../../hooks/useAdminCompanyContent';
import { getStoragePublicUrl, COMPANY_CONTENT_IMAGES_BUCKET } from '../../../utils/supabase-storage';
import { OptimizedImage } from '../../OptimizedImage';
import { OrderControls } from './OrderControls';
import { DraggableTableRow } from './DraggableTableRow';
import { useDragAndDropOrder } from './useDragAndDropOrder';
import { TableSkeleton } from './TableSkeleton';

interface CompanyStrengthsTableProps {
  strengths: CompanyStrength[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onEdit: (strength: CompanyStrength) => void;
  onDelete: (strength: CompanyStrength) => void;
  onOrderChange?: (strengthId: string, newOrder: number) => void;
}

export function CompanyStrengthsTable({
  strengths,
  isLoading,
  isError,
  onRetry,
  onEdit,
  onDelete,
  onOrderChange,
}: CompanyStrengthsTableProps) {
  const { language, direction } = useLanguage();
  const isArabic = language === 'ar';

  const sortedStrengths = useMemo(() => {
    return [...strengths].sort((a, b) => a.displayOrder - b.displayOrder);
  }, [strengths]);

  const { draggedId, handleDragEnd } = useDragAndDropOrder(strengths, onOrderChange);

  if (isLoading) {
    return <TableSkeleton rows={5} columns={6} />;
  }

  if (isError) {
    return (
      <div style={stateStyle}>
        <span>{isArabic ? 'حدث خطأ في التحميل' : 'Error loading strengths'}</span>
        <button type="button" onClick={onRetry} style={retryButtonStyle}>
          ↻
        </button>
      </div>
    );
  }

  if (strengths.length === 0) {
    return (
      <div style={emptyStyle}>
        <h3 style={emptyTitleStyle}>
          {isArabic ? 'لا توجد نقاط قوة' : 'No strengths found'}
        </h3>
        <p style={emptySubtitleStyle}>
          {isArabic ? 'ابدأ بإضافة نقطة قوة جديدة' : 'Start by adding a new strength'}
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
            <th style={thStyle}>{isArabic ? 'الوصف' : 'Description'}</th>
            <th style={thStyle}>{isArabic ? 'الترتيب' : 'Order'}</th>
            <th style={thStyle}>{isArabic ? 'تاريخ التحديث' : 'Updated'}</th>
            <th style={thStyle}>{isArabic ? 'الإجراءات' : 'Actions'}</th>
          </tr>
        </thead>
        <tbody>
          {sortedStrengths.map((strength) => {
            const title = isArabic ? strength.titleAr : strength.titleEn;
            const description = isArabic ? strength.descriptionAr : strength.descriptionEn;
            const iconUrl = strength.iconKey
              ? getStoragePublicUrl(COMPANY_CONTENT_IMAGES_BUCKET, strength.iconKey)
              : null;

            return (
              <DraggableTableRow
                key={strength.id}
                id={strength.id}
                onDragEnd={handleDragEnd}
                isDragging={draggedId === strength.id}
                style={trStyle}
              >
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '1.2rem',
                        color: palette.textSecondary,
                        cursor: 'move',
                        userSelect: 'none',
                      }}
                      title={isArabic ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'}
                    >
                      ⋮⋮
                    </span>
                    {iconUrl ? (
                      <OptimizedImage
                        src={iconUrl}
                        alt={title}
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ color: palette.textSecondary }}>—</span>
                    )}
                  </div>
                </td>
                <td style={tdStyle}>
                  <strong style={{ color: palette.textPrimary }}>{title}</strong>
                </td>
                <td style={tdStyle}>
                  <span style={{ color: palette.textSecondary, fontSize: '0.9rem' }}>
                    {description ? (description.length > 50 ? `${description.substring(0, 50)}...` : description) : '—'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {onOrderChange ? (
                    <OrderControls
                      currentOrder={strength.displayOrder}
                      minOrder={0}
                      maxOrder={strengths.length - 1}
                      onOrderChange={(newOrder) => onOrderChange(strength.id, newOrder)}
                    />
                  ) : (
                    strength.displayOrder
                  )}
                </td>
                <td style={tdStyle}>
                  {new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(new Date(strength.updatedAt))}
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onEdit(strength)}
                      style={actionButtonStyle}
                      title={isArabic ? 'تعديل' : 'Edit'}
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(strength)}
                      style={{ ...actionButtonStyle, color: '#EF4444' }}
                      title={isArabic ? 'حذف' : 'Delete'}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </DraggableTableRow>
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


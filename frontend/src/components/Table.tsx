import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette } from '../styles/theme';

interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  headerStyle?: React.CSSProperties;
  cellStyle?: React.CSSProperties;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  emptyMessage,
  className = '',
}: TableProps<T>) {
  const { language, direction } = useLanguage();

  if (data.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: palette.textSecondary,
          background: palette.backgroundAlt,
          borderRadius: '0.75rem',
          border: `1px dashed ${palette.neutralBorderSoft}`,
        }}
      >
        {emptyMessage || (language === 'ar' ? 'لا توجد بيانات' : 'No data available')}
      </div>
    );
  }

  return (
    <div className={`table-responsive ${className}`}>
      {/* Desktop Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          direction,
        }}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{
                  padding: '0.75rem 1rem',
                  textAlign: direction === 'rtl' ? 'right' : 'left',
                  borderBottom: `2px solid ${palette.neutralBorder}`,
                  fontWeight: 600,
                  color: palette.textPrimary,
                  background: palette.backgroundAlt,
                  ...column.headerStyle,
                }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              style={{
                borderBottom: `1px solid ${palette.neutralBorderSoft}`,
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = palette.backgroundAlt;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: direction === 'rtl' ? 'right' : 'left',
                    color: palette.textPrimary,
                    ...column.cellStyle,
                  }}
                >
                  {column.render
                    ? column.render(item)
                    : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Cards */}
      <div className="table-cards">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="table-card"
            style={{
              border: `1px solid ${palette.neutralBorderSoft}`,
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              background: palette.backgroundSurface,
            }}
          >
            {columns.map((column) => (
              <div
                key={column.key}
                className="table-card-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: `1px solid ${palette.neutralBorderSoft}`,
                }}
              >
                <span
                  className="table-card-label"
                  style={{
                    fontWeight: 600,
                    color: palette.textSecondary,
                    fontSize: '0.875rem',
                  }}
                >
                  {column.label}
                </span>
                <span
                  className="table-card-value"
                  style={{
                    color: palette.textPrimary,
                    textAlign: direction === 'rtl' ? 'left' : 'right',
                  }}
                >
                  {column.render
                    ? column.render(item)
                    : item[column.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}


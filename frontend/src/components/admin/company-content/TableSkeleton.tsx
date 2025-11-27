import { palette } from '../../../styles/theme';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: '800px',
          background: palette.backgroundSurface,
          borderRadius: '1rem',
          overflow: 'hidden',
        }}
      >
        <thead>
          <tr style={{ background: palette.backgroundAlt }}>
            {Array.from({ length: columns }).map((_, index) => (
              <th
                key={index}
                style={{
                  padding: '1rem',
                  textAlign: 'start',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: palette.textSecondary,
                  borderBottom: `1px solid ${palette.neutralBorderSoft}`,
                }}
              >
                <div
                  style={{
                    height: '16px',
                    width: '60%',
                    background: palette.backgroundAlt,
                    borderRadius: '4px',
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr
              key={rowIndex}
              style={{
                borderBottom: `1px solid ${palette.neutralBorderSoft}`,
              }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td
                  key={colIndex}
                  style={{
                    padding: '1rem',
                    fontSize: '0.95rem',
                  }}
                >
                  <div
                    style={{
                      height: '20px',
                      width: colIndex === 0 ? '40px' : colIndex === columns - 1 ? '80px' : '70%',
                      background: palette.backgroundAlt,
                      borderRadius: '4px',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: `${rowIndex * 0.1 + colIndex * 0.05}s`,
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
}


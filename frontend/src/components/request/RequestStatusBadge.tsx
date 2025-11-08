import { useLanguage } from '../../context/LanguageContext';
import type { RequestStatus } from '../../types/request';
import { getStatusColor, getStatusLabel } from '../../utils/requestStatus';

interface RequestStatusBadgeProps {
  status: RequestStatus;
}

export function RequestStatusBadge({ status }: RequestStatusBadgeProps) {
  const { language } = useLanguage();
  const color = getStatusColor(status);
  const label = getStatusLabel(status, language);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.25rem 0.85rem',
        borderRadius: '999px',
        background: `${color}1a`,
        color,
        fontSize: '0.82rem',
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: '0.6rem',
          height: '0.6rem',
          borderRadius: '999px',
          backgroundColor: color,
          display: 'inline-flex',
        }}
      />
      {label}
    </span>
  );
}


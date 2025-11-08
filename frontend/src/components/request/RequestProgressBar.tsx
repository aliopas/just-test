import { getStatusColor, getStatusProgress } from '../../utils/requestStatus';
import type { RequestStatus } from '../../types/request';

interface RequestProgressBarProps {
  status: RequestStatus;
}

export function RequestProgressBar({ status }: RequestProgressBarProps) {
  const progress = getStatusProgress(status);
  const color = getStatusColor(status);

  return (
    <div
      style={{
        width: '100%',
        background: '#E2E8F0',
        borderRadius: '999px',
        height: '0.5rem',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${progress}%`,
          background: color,
          height: '100%',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
}


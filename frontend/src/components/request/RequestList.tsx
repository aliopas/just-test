import type { InvestorRequest } from '../../types/request';
import { RequestListItem } from './RequestListItem';
import { RequestListEmpty } from './RequestListEmpty';

interface RequestListProps {
  requests: InvestorRequest[];
  isLoading?: boolean;
  isFetching?: boolean;
  onSelect: (request: InvestorRequest) => void;
  selectedRequestId?: string | null;
  onCreateNew?: () => void;
}

export function RequestList({
  requests,
  isLoading = false,
  isFetching = false,
  onSelect,
  selectedRequestId,
  onCreateNew,
}: RequestListProps) {
  if (!isLoading && requests.length === 0) {
    return <RequestListEmpty onCreateNew={onCreateNew} />;
  }

  const displaySkeleton = isLoading && requests.length === 0;
  const displayRequests = !displaySkeleton ? requests : [];

  return (
    <div
      style={{
        display: 'grid',
        gap: '1.5rem',
      }}
    >
      {displaySkeleton
        ? Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              style={{
                borderRadius: '1.25rem',
                border: '1px solid #E2E8F0',
                background:
                  'linear-gradient(90deg, #F8FAFC 0%, #F1F5F9 50%, #F8FAFC 100%)',
                height: '140px',
              }}
            />
          ))
        : displayRequests.map(request => (
            <RequestListItem
              key={request.id}
              request={request}
              onSelect={onSelect}
              isSelected={selectedRequestId === request.id}
            />
          ))}
      {isFetching && requests.length > 0 && (
        <div
          style={{
            textAlign: 'center',
            color: '#64748B',
            fontSize: '0.85rem',
          }}
        >
          Loading…
        </div>
      )}
    </div>
  );
}


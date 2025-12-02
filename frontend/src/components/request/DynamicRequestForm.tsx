import { useState, useEffect } from 'react';
import { useNextLocation } from '../../utils/next-router';
import { useLanguage } from '../../context/LanguageContext';
import { RequestTypeSelector, type RequestTypeOption } from './RequestTypeSelector';
import { NewRequestForm } from './NewRequestForm';
import { PartnershipRequestForm } from './PartnershipRequestForm';
import { BoardNominationRequestForm } from './BoardNominationRequestForm';
import { FeedbackRequestForm } from './FeedbackRequestForm';

interface DynamicRequestFormProps {
  quickAmounts?: number[];
  isQuickAmountsLoading?: boolean;
}

export function DynamicRequestForm({
  quickAmounts,
  isQuickAmountsLoading,
}: DynamicRequestFormProps) {
  const { language } = useLanguage();
  const location = useNextLocation();

  const getInitialType = (): RequestTypeOption => {
    try {
      const params = new URLSearchParams(location.search || '');
      const typeParam = params.get('type') as RequestTypeOption | null;
      const allowed: RequestTypeOption[] = [
        'buy',
        'sell',
        'partnership',
        'board_nomination',
        'feedback',
      ];
      return typeParam && allowed.includes(typeParam) ? typeParam : 'buy';
    } catch {
      return 'buy';
    }
  };

  const [selectedType, setSelectedType] = useState<RequestTypeOption>(getInitialType);
  const [key, setKey] = useState(0);

  // Reset form when type changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [selectedType]);

  const handleSuccess = () => {
    setKey(prev => prev + 1);
  };

  const renderForm = () => {
    switch (selectedType) {
      case 'buy':
      case 'sell':
        return (
          <NewRequestForm
            key={key}
            quickAmounts={quickAmounts}
            isQuickAmountsLoading={isQuickAmountsLoading}
            defaultType={selectedType}
            hideTypeSelector={true}
          />
        );
      case 'partnership':
        return <PartnershipRequestForm key={key} onSuccess={handleSuccess} />;
      case 'board_nomination':
        return <BoardNominationRequestForm key={key} onSuccess={handleSuccess} />;
      case 'feedback':
        return <FeedbackRequestForm key={key} onSuccess={handleSuccess} />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <RequestTypeSelector value={selectedType} onChange={setSelectedType} />
      {renderForm()}
    </div>
  );
}


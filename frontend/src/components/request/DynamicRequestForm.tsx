import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { RequestTypeSelector, type RequestTypeOption } from './RequestTypeSelector';
import { NewRequestForm } from './NewRequestForm';

interface DynamicRequestFormProps {
  quickAmounts?: number[];
  isQuickAmountsLoading?: boolean;
}

export function DynamicRequestForm({
  quickAmounts,
  isQuickAmountsLoading,
}: DynamicRequestFormProps) {
  const { language } = useLanguage();
  const [selectedType, setSelectedType] = useState<RequestTypeOption>('buy');

  const renderForm = () => {
    switch (selectedType) {
      case 'buy':
      case 'sell':
        return (
          <NewRequestForm
            quickAmounts={quickAmounts}
            isQuickAmountsLoading={isQuickAmountsLoading}
            defaultType={selectedType}
            hideTypeSelector={true}
          />
        );
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


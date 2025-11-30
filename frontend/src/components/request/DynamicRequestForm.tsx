import { useState, useEffect } from 'react';
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
  const [key, setKey] = useState(0);

  // Reset form when type changes
  useEffect(() => {
    setKey(prev => prev + 1);
  }, [selectedType]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <RequestTypeSelector value={selectedType} onChange={setSelectedType} />

      <NewRequestForm
        key={key}
        quickAmounts={quickAmounts}
        isQuickAmountsLoading={isQuickAmountsLoading}
        defaultType={selectedType}
        hideTypeSelector={true}
      />
    </div>
  );
}


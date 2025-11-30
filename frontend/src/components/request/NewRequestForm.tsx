import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NewRequestFormValues } from '../../schemas/newRequestSchema';
import { newRequestFormSchema, calculateTotalAmount, SHARE_PRICE } from '../../schemas/newRequestSchema';
import { useLanguage } from '../../context/LanguageContext';
import { tRequest } from '../../locales/newRequest';
import { UploadDropzone } from './UploadDropzone';
import { useToast } from '../../context/ToastContext';
import { useCreateRequest } from '../../hooks/useCreateRequest';
import { analytics } from '../../utils/analytics';
import type { RequestType } from '../../types/request';

interface NewRequestFormProps {
  quickAmounts?: number[];
  isQuickAmountsLoading?: boolean;
  suggestedCurrency?: never; // Removed
  defaultType?: 'buy' | 'sell' | 'partnership' | 'board_nomination' | 'feedback';
  hideTypeSelector?: boolean;
}

export function NewRequestForm({
  quickAmounts = [],
  isQuickAmountsLoading = false,
  defaultType = 'buy',
  hideTypeSelector = false,
}: NewRequestFormProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createRequest = useCreateRequest();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<NewRequestFormValues>({
    resolver: zodResolver(newRequestFormSchema),
    defaultValues: {
      type: defaultType,
      numberOfShares: 1,
      notes: '',
      documents: [],
    },
  });

  // Update type when defaultType changes
  useEffect(() => {
    setValue('type', defaultType);
  }, [defaultType, setValue]);

  const numberOfShares = watch('numberOfShares');
  const totalAmount = useMemo(() => {
    if (!numberOfShares || numberOfShares <= 0) return 0;
    return calculateTotalAmount(numberOfShares);
  }, [numberOfShares]);

  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const onSubmit = handleSubmit(async values => {
    try {
      const calculatedAmount = calculateTotalAmount(values.numberOfShares);
      
      const result = await createRequest.mutateAsync({
        type: values.type as RequestType,
        amount: calculatedAmount,
        currency: 'SAR', // Fixed currency
        targetPrice: undefined,
        expiryAt: undefined,
        notes: values.notes ?? undefined,
      });

      // Set requestId to enable file uploads
      setCreatedRequestId(result.requestId);

      analytics.track('request_created', {
        type: values.type,
        amount: calculatedAmount,
        numberOfShares: values.numberOfShares,
      });

      pushToast({
        message: tRequest('status.success', language),
        variant: 'success',
      });

      // Don't reset form yet - wait for file uploads
      // Files will be uploaded automatically via UploadDropzone
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : tRequest('status.error', language);

      pushToast({
        message,
        variant: 'error',
      });
    }
  });

  useEffect(() => {
    if (createRequest.isError) {
      pushToast({
        message: tRequest('status.error', language),
        variant: 'error',
      });
    }
  }, [createRequest.isError, language, pushToast]);

  const selectedType = watch('type');

  return (
    <form
      onSubmit={onSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        direction,
      }}
    >
      {/* Info box showing share price */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.45rem',
          padding: '0.85rem 1rem',
          borderRadius: '0.85rem',
          border: '1px solid var(--color-brand-secondary-soft)',
          background: 'var(--color-background-alt)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              fontSize: '0.9rem',
            }}
          >
            {language === 'ar' ? 'معلومات السهم' : 'Share Information'}
          </span>
        </div>
        <div
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          {language === 'ar' 
            ? `قيمة السهم الواحد: ${SHARE_PRICE.toLocaleString('ar-SA')} ريال سعودي`
            : `Share price: ${SHARE_PRICE.toLocaleString('en-US')} SAR per share`}
        </div>
      </div>

      <div style={gridStyle}>
        {!hideTypeSelector && (
          <Field label={tRequest('form.type', language)} error={errors.type?.message}>
            <select
              {...register('type')}
              style={selectStyle}
              aria-label={tRequest('form.type', language)}
            >
              <option value="buy">{language === 'ar' ? 'شراء' : 'Buy'}</option>
              <option value="sell">{language === 'ar' ? 'بيع' : 'Sell'}</option>
            </select>
          </Field>
        )}

        <Field
          label={language === 'ar' ? 'عدد الأسهم' : 'Number of Shares'}
          error={errors.numberOfShares?.message}
        >
          <input
            type="number"
            min="1"
            step="1"
            {...register('numberOfShares')}
            style={inputStyle}
            placeholder={language === 'ar' ? 'أدخل عدد الأسهم' : 'Enter number of shares'}
          />
        </Field>
      </div>

      {/* Hidden input to maintain form type when hideTypeSelector is true */}
      {hideTypeSelector && <input type="hidden" {...register('type')} />}

      {/* Display calculated total amount */}
      {numberOfShares > 0 && (
        <div
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '0.85rem',
            border: '1px solid var(--color-brand-secondary-soft)',
            background: 'var(--color-background-alt)',
            display: 'flex',
            flexDirection: direction === 'rtl' ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              fontSize: '0.95rem',
            }}
          >
            {language === 'ar' ? 'المبلغ الإجمالي:' : 'Total Amount:'}
          </span>
          <span
            style={{
              fontWeight: 700,
              color: 'var(--color-brand-primary)',
              fontSize: '1.1rem',
            }}
          >
            {totalAmount.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')} {language === 'ar' ? 'ريال' : 'SAR'}
          </span>
        </div>
      )}

      <Field
        label={tRequest('form.notes', language)}
        error={errors.notes?.message}
      >
        <textarea
          {...register('notes')}
          style={{ ...inputStyle, minHeight: '6rem', resize: 'vertical' }}
          placeholder={
            language === 'ar'
              ? 'أدخل ملاحظات إضافية (اختياري)'
              : 'Additional notes (optional)'
          }
        />
      </Field>

      <UploadDropzone
        requestId={createdRequestId}
        onFilesChange={files => {
          setValue('documents', files, { shouldDirty: true });
        }}
        onUploadComplete={() => {
          // After files are uploaded, reset form
          reset({
            type: watch('type'),
            numberOfShares: 1,
            notes: '',
            documents: [],
          });
          setCreatedRequestId(null);
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="submit"
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '0.85rem',
            border: 'none',
            background: 'var(--color-brand-primary)',
            color: 'var(--color-text-on-brand)',
            fontWeight: 700,
          cursor: createRequest.isPending ? 'progress' : 'pointer',
          opacity: createRequest.isPending ? 0.7 : 1,
          }}
        disabled={createRequest.isPending}
        >
          {createRequest.isPending
            ? tRequest('status.submitting', language)
            : tRequest('form.submit', language)}
        </button>

        <button
          type="button"
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '0.85rem',
            border: '1px solid var(--color-brand-secondary-soft)',
            background: 'var(--color-background-surface)',
            color: 'var(--color-brand-accent-deep)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() =>
            reset({
              type: selectedType,
              numberOfShares: 1,
              notes: '',
              documents: [],
            })
          }
          disabled={!isDirty || createRequest.isPending}
        >
          {tRequest('form.reset', language)}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

const Field = ({ label, error, children }: FieldProps) => (
  <label
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.45rem',
    }}
  >
    <span
      style={{
        fontWeight: 600,
        fontSize: '0.95rem',
        color: 'var(--color-text-primary)',
      }}
    >
      {label}
    </span>
    {children}
    {error && (
      <span
        style={{
          color: '#DC2626',
          fontSize: '0.85rem',
        }}
      >
        {error}
      </span>
    )}
  </label>
);

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1rem',
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-border-muted)',
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
};




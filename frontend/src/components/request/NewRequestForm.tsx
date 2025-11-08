import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NewRequestFormValues } from '../../schemas/newRequestSchema';
import { newRequestFormSchema } from '../../schemas/newRequestSchema';
import { useLanguage } from '../../context/LanguageContext';
import { tRequest } from '../../locales/newRequest';
import { UploadDropzone } from './UploadDropzone';
import { useToast } from '../../context/ToastContext';
import { useCreateRequest } from '../../hooks/useCreateRequest';
import { analytics } from '../../utils/analytics';
import type { RequestType, RequestCurrency } from '../../types/request';

const currencyOptions: RequestCurrency[] = ['SAR', 'USD', 'EUR'];

export function NewRequestForm() {
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
      type: 'buy',
      amount: 0,
      currency: 'SAR',
      targetPrice: undefined,
      expiryAt: undefined,
      notes: '',
      documents: [],
    },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      await createRequest.mutateAsync({
        type: values.type as RequestType,
        amount: values.amount,
        currency: values.currency as RequestCurrency,
        targetPrice:
          typeof values.targetPrice === 'number' ? values.targetPrice : undefined,
        expiryAt: values.expiryAt ?? undefined,
        notes: values.notes ?? undefined,
      });

      analytics.track('request_created', {
        type: values.type,
        amount: values.amount,
      });

      pushToast({
        message: tRequest('status.success', language),
        variant: 'success',
      });
      reset({
        type: values.type,
        amount: 0,
        currency: values.currency,
        targetPrice: undefined,
        expiryAt: undefined,
        notes: '',
        documents: [],
      });
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

      <div style={gridStyle}>
        <Field
          label={tRequest('form.amount', language)}
          error={errors.amount?.message}
        >
          <input
            type="number"
            step="0.01"
            {...register('amount')}
            style={inputStyle}
            placeholder={language === 'ar' ? 'المبلغ الإجمالي' : 'Total amount'}
          />
        </Field>

        <Field
          label={tRequest('form.currency', language)}
          error={errors.currency?.message}
        >
          <select {...register('currency')} style={selectStyle}>
            {currencyOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={gridStyle}>
        <Field
          label={tRequest('form.targetPrice', language)}
          error={errors.targetPrice?.message as string | undefined}
        >
          <input
            type="number"
            step="0.01"
            {...register('targetPrice')}
            style={inputStyle}
            placeholder={
              language === 'ar' ? 'سعر مستهدف (اختياري)' : 'Optional target price'
            }
          />
        </Field>
        <Field
          label={tRequest('form.expiry', language)}
          error={errors.expiryAt?.message}
        >
          <input
            type="date"
            {...register('expiryAt')}
            style={inputStyle}
            min={new Date().toISOString().split('T')[0]}
          />
        </Field>
      </div>

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
        onFilesChange={files => {
          setValue('documents', files, { shouldDirty: true });
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
            background: '#2D6FA3',
            color: '#FFFFFF',
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
            border: '1px solid #CBD5F5',
            background: '#FFFFFF',
            color: '#1E3A5F',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() =>
            reset({
              type: selectedType,
              amount: 0,
              currency: watch('currency'),
              targetPrice: undefined,
              expiryAt: undefined,
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
        color: '#111418',
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
  border: '1px solid #D1D5DB',
  background: '#FFFFFF',
  color: '#111418',
  fontSize: '0.95rem',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
};


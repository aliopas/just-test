import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PartnershipRequestFormValues } from '../../schemas/partnershipRequestSchema';
import { partnershipRequestSchema } from '../../schemas/partnershipRequestSchema';
import { useLanguage } from '../../context/LanguageContext';
import { UploadDropzone } from './UploadDropzone';
import { useToast } from '../../context/ToastContext';
import { useCreateRequest } from '../../hooks/useCreateRequest';
import { analytics } from '../../utils/analytics';
import type { RequestType } from '../../types/request';

interface PartnershipRequestFormProps {
  onSuccess?: () => void;
}

export function PartnershipRequestForm({ onSuccess }: PartnershipRequestFormProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createRequest = useCreateRequest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnershipRequestFormValues>({
    resolver: zodResolver(partnershipRequestSchema),
    defaultValues: {
      type: 'partnership',
      partnershipType: 'strategic',
    },
  });

  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const onSubmit = handleSubmit(async values => {
    try {
      // Build metadata object
      const metadata: Record<string, unknown> = {
        companyName: values.companyName.trim(),
        partnershipType: values.partnershipType,
        contactPerson: values.contactPerson.trim(),
        contactEmail: values.contactEmail.trim(),
      };
      
      // Add optional fields only if they have values
      if (values.partnershipDetails && values.partnershipDetails.trim()) {
        metadata.partnershipDetails = values.partnershipDetails.trim();
      }
      
      if (values.contactPhone && values.contactPhone.trim() !== '') {
        metadata.contactPhone = values.contactPhone.trim();
      }

      const result = await createRequest.mutateAsync({
        type: 'partnership' as RequestType,
        // For partnership requests, amount and currency are optional
        // Only include them if investmentAmount is provided and valid
        ...(values.investmentAmount && values.investmentAmount > 0
          ? {
              amount: values.investmentAmount,
              currency: 'SAR' as const,
            }
          : {}),
        metadata: metadata,
        notes: values.partnershipDetails || undefined,
      });

      setCreatedRequestId(result.requestId);

      analytics.track('request_created', {
        type: 'partnership',
        amount: values.investmentAmount,
      });

      pushToast({
        message: language === 'ar' ? 'تم إنشاء طلب الشراكة بنجاح' : 'Partnership request created successfully',
        variant: 'success',
      });

      if (onSuccess) {
        onSuccess();
      } else {
        reset();
      }
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : language === 'ar' ? 'حدث خطأ أثناء إنشاء الطلب' : 'An error occurred while creating the request';

      pushToast({
        message,
        variant: 'error',
      });
    }
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--color-border)',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
  };

  const Field = ({
    label,
    error,
    children,
  }: {
    label: string;
    error?: string;
    children: React.ReactNode;
  }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <label style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{label}</label>
      {children}
      {error && (
        <span style={{ color: 'var(--color-error)', fontSize: '0.875rem' }}>{error}</span>
      )}
    </div>
  );

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
      <Field
        label={language === 'ar' ? 'اسم الشركة' : 'Company Name'}
        error={errors.companyName?.message}
      >
        <input
          type="text"
          {...register('companyName')}
          style={inputStyle}
          placeholder={language === 'ar' ? 'أدخل اسم الشركة' : 'Enter company name'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'نوع الشراكة' : 'Partnership Type'}
        error={errors.partnershipType?.message}
      >
        <select {...register('partnershipType')} style={selectStyle}>
          <option value="strategic">{language === 'ar' ? 'استراتيجية' : 'Strategic'}</option>
          <option value="financial">{language === 'ar' ? 'مالية' : 'Financial'}</option>
          <option value="technical">{language === 'ar' ? 'تقنية' : 'Technical'}</option>
          <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
        </select>
      </Field>

      <Field
        label={language === 'ar' ? 'مبلغ الاستثمار (ريال سعودي)' : 'Investment Amount (SAR)'}
        error={errors.investmentAmount?.message}
      >
        <input
          type="number"
          min="1000"
          step="1000"
          {...register('investmentAmount')}
          style={inputStyle}
          placeholder={language === 'ar' ? 'أدخل مبلغ الاستثمار' : 'Enter investment amount'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'تفاصيل الشراكة' : 'Partnership Details'}
        error={errors.partnershipDetails?.message}
      >
        <textarea
          {...register('partnershipDetails')}
          style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
          placeholder={language === 'ar' ? 'أدخل تفاصيل الشراكة' : 'Enter partnership details'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'اسم الشخص المسؤول' : 'Contact Person Name'}
        error={errors.contactPerson?.message}
      >
        <input
          type="text"
          {...register('contactPerson')}
          style={inputStyle}
          placeholder={language === 'ar' ? 'أدخل اسم الشخص المسؤول' : 'Enter contact person name'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
        error={errors.contactEmail?.message}
      >
        <input
          type="email"
          {...register('contactEmail')}
          style={inputStyle}
          placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}
        error={errors.contactPhone?.message}
      >
        <input
          type="tel"
          {...register('contactPhone')}
          style={inputStyle}
          placeholder={language === 'ar' ? '+966xxxxxxxxx' : '+966xxxxxxxxx'}
        />
      </Field>

      <Field label={language === 'ar' ? 'المرفقات' : 'Attachments'}>
        <UploadDropzone requestId={createdRequestId} />
      </Field>

      <div
        style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: direction === 'rtl' ? 'flex-start' : 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-border)',
            background: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
        </button>
        <button
          type="submit"
          disabled={createRequest.isPending}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            border: 'none',
            background: 'var(--color-brand-primary)',
            color: '#FFFFFF',
            cursor: createRequest.isPending ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            opacity: createRequest.isPending ? 0.6 : 1,
          }}
        >
          {createRequest.isPending
            ? language === 'ar'
              ? 'جاري الإرسال...'
              : 'Submitting...'
            : language === 'ar'
              ? 'إرسال الطلب'
              : 'Submit Request'}
        </button>
      </div>
    </form>
  );
}


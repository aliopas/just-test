import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCreatePartnershipRequest } from '../../hooks/useCreatePartnershipRequest';
import { UploadDropzone } from './UploadDropzone';

const partnershipFormSchema = z.object({
  projectId: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().uuid().safeParse(val).success,
      'Invalid project ID format (must be UUID)'
    )
    .transform((val) => (val === '' ? undefined : val)),
  proposedAmount: z
    .union([
      z.coerce
        .number()
        .positive('Proposed amount must be greater than zero'),
      z.literal(''),
    ])
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  partnershipPlan: z
    .string()
    .trim()
    .min(50, 'Partnership plan must be at least 50 characters')
    .max(5000, 'Partnership plan must be 5000 characters or fewer'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
});

type PartnershipFormValues = z.infer<typeof partnershipFormSchema>;

interface PartnershipRequestFormProps {
  onSuccess?: (requestId: string) => void;
}

export function PartnershipRequestForm({ onSuccess }: PartnershipRequestFormProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createPartnership = useCreatePartnershipRequest();
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnershipFormValues>({
    resolver: zodResolver(partnershipFormSchema),
    defaultValues: {
      projectId: '',
      proposedAmount: undefined,
      partnershipPlan: '',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      const result = await createPartnership.mutateAsync({
        projectId: values.projectId?.trim() || undefined,
        proposedAmount: values.proposedAmount ?? undefined,
        partnershipPlan: values.partnershipPlan.trim(),
        notes: values.notes?.trim() || undefined,
      });

      setCreatedRequestId(result.requestId);
      onSuccess?.(result.requestId);

      pushToast({
        message:
          language === 'ar'
            ? 'تم إنشاء طلب الشراكة بنجاح'
            : 'Partnership request created successfully',
        variant: 'success',
      });
    } catch (error: unknown) {
      console.error('Failed to create partnership request:', error);
      
      let message: string;
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error
      ) {
        const errorObj = error as { message: unknown; details?: unknown };
        message = String(errorObj.message);
        
        // Check if it's a validation error with details
        if (
          errorObj.details &&
          typeof errorObj.details === 'object' &&
          Array.isArray(errorObj.details)
        ) {
          const details = errorObj.details as Array<{
            field?: string;
            message?: string;
          }>;
          const fieldMessages = details
            .map(d => d.message || d.field)
            .filter(Boolean)
            .join(', ');
          if (fieldMessages) {
            message = `${message}: ${fieldMessages}`;
          }
        }
      } else {
        message =
          language === 'ar'
            ? 'فشل إنشاء طلب الشراكة. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
            : 'Failed to create partnership request. Please check your data and try again.';
      }

      pushToast({
        message,
        variant: 'error',
      });
    }
  });

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
      <div style={gridStyle}>
        <Field
          label={language === 'ar' ? 'المشروع (اختياري)' : 'Project (Optional)'}
          error={errors.projectId?.message}
        >
          <input
            type="text"
            {...register('projectId')}
            style={inputStyle}
            placeholder={
              language === 'ar'
                ? 'معرف المشروع (UUID)'
                : 'Project ID (UUID)'
            }
          />
        </Field>

        <Field
          label={
            language === 'ar' ? 'المبلغ المقترح (اختياري)' : 'Proposed Amount (Optional)'
          }
          error={errors.proposedAmount?.message}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            {...register('proposedAmount')}
            style={inputStyle}
            placeholder={language === 'ar' ? 'المبلغ بالريال' : 'Amount in SAR'}
          />
        </Field>
      </div>

      <Field
        label={language === 'ar' ? 'خطة الشراكة *' : 'Partnership Plan *'}
        error={errors.partnershipPlan?.message}
      >
        <textarea
          {...register('partnershipPlan')}
          style={{ ...inputStyle, minHeight: '8rem', resize: 'vertical' }}
          placeholder={
            language === 'ar'
              ? 'اكتب خطة الشراكة بالتفصيل (50 حرف على الأقل)'
              : 'Describe your partnership plan in detail (at least 50 characters)'
          }
          required
        />
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-text-muted)',
            marginTop: '0.25rem',
          }}
        >
          {language === 'ar'
            ? 'الحد الأدنى: 50 حرف | الحد الأقصى: 5000 حرف'
            : 'Min: 50 characters | Max: 5000 characters'}
        </div>
      </Field>

      <Field
        label={language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
        error={errors.notes?.message}
      >
        <textarea
          {...register('notes')}
          style={{ ...inputStyle, minHeight: '4rem', resize: 'vertical' }}
          placeholder={
            language === 'ar'
              ? 'ملاحظات إضافية (اختياري)'
              : 'Additional notes (optional)'
          }
        />
      </Field>

      <UploadDropzone
        requestId={createdRequestId}
        onUploadComplete={() => {
          reset();
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
            cursor: createPartnership.isPending ? 'progress' : 'pointer',
            opacity: createPartnership.isPending ? 0.7 : 1,
          }}
          disabled={createPartnership.isPending}
        >
          {createPartnership.isPending
            ? language === 'ar'
              ? 'جاري الإرسال...'
              : 'Submitting...'
            : language === 'ar'
            ? 'إرسال'
            : 'Submit'}
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


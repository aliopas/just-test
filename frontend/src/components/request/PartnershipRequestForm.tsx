import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCreatePartnershipRequest } from '../../hooks/useCreatePartnershipRequest';
import { usePublicProjects } from '../../hooks/usePublicProjects';
import { UploadDropzone } from './UploadDropzone';
import { useState } from 'react';

const partnershipFormSchema = z.object({
  projectId: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === '') return true;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(val.trim());
      },
      {
        message: 'Invalid project ID format (must be UUID)',
      }
    )
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
  proposedAmount: z
    .union([
      z.literal(''),
      z.string().trim(),
      z.coerce.number().positive('Proposed amount must be greater than zero'),
    ])
    .optional()
    .transform((val) => {
      if (val === '' || val === undefined || val === null) return undefined;
      if (typeof val === 'string' && val.trim() === '') return undefined;
      if (typeof val === 'number') return val;
      // Try to parse string to number
      const parsed = Number.parseFloat(String(val));
      return Number.isNaN(parsed) ? undefined : parsed;
    }),
  partnershipPlan: z
    .string()
    .trim()
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
});

type PartnershipFormValues = z.infer<typeof partnershipFormSchema>;

// Form input type (before transformation)
type PartnershipFormInput = {
  projectId?: string;
  proposedAmount?: string | number;
  partnershipPlan?: string;
  notes?: string;
};

export function PartnershipRequestForm() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createPartnership = useCreatePartnershipRequest();
  const { data: projectsData, isLoading: isLoadingProjects } = usePublicProjects();
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnershipFormInput>({
    resolver: zodResolver(partnershipFormSchema),
    defaultValues: {
      projectId: '',
      proposedAmount: '',
      partnershipPlan: '',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        // Parse the form values through the schema to get the transformed values
        const parsed = partnershipFormSchema.parse(values);
        
        const result = await createPartnership.mutateAsync({
          projectId: parsed.projectId,
          proposedAmount: parsed.proposedAmount,
          partnershipPlan: parsed.partnershipPlan,
          notes: parsed.notes,
        });

        setCreatedRequestId(result.requestId);

        pushToast({
          message:
            language === 'ar'
              ? 'تم إنشاء طلب الشراكة بنجاح'
              : 'Partnership request created successfully',
          variant: 'success',
        });
      } catch (error: unknown) {
        console.error('Failed to create partnership request:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        let message: string;
        
        if (
          typeof error === 'object' &&
          error !== null &&
          'payload' in error &&
          typeof (error as { payload: unknown }).payload === 'object' &&
          (error as { payload: unknown }).payload !== null
        ) {
          const apiError = error as { message: string; payload?: { error?: { message?: string; details?: string } } };
          const errorPayload = apiError.payload?.error;
          
          if (errorPayload?.details) {
            message = `${errorPayload.message || apiError.message || 'Error'}: ${errorPayload.details}`;
          } else if (errorPayload?.message) {
            message = errorPayload.message;
          } else {
            message = apiError.message || 'Failed to create partnership request';
          }
        } else if (
          typeof error === 'object' &&
          error !== null &&
          'message' in error
        ) {
          message = String((error as { message: unknown }).message);
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
    },
    (validationErrors) => {
      const errorFields = Object.keys(validationErrors);
      if (errorFields.length > 0) {
        setTimeout(() => {
          const firstErrorField = errorFields[0];
          const errorElement = document.querySelector(
            `[name="${firstErrorField}"]`
          ) as HTMLElement;
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorElement.focus();
          }
        }, 100);

        pushToast({
          message:
            language === 'ar'
              ? 'يرجى التحقق من البيانات المدخلة وإصلاح الأخطاء المميزة باللون الأحمر'
              : 'Please check the entered data and fix the errors highlighted in red',
          variant: 'error',
        });
      }
    }
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
      <div style={gridStyle}>
        <Field
          label={language === 'ar' ? 'المشروع (اختياري)' : 'Project (Optional)'}
          error={
            errors.projectId?.message
              ? language === 'ar'
                ? 'صيغة معرف المشروع غير صحيحة (يجب أن يكون UUID)'
                : errors.projectId.message
              : undefined
          }
        >
          <select
            {...register('projectId', {
              setValueAs: (value: string) => {
                const trimmed = value?.trim() || '';
                return trimmed === '' ? '' : trimmed;
              },
            })}
            style={{
              ...inputStyle,
              borderColor: errors.projectId ? '#DC2626' : undefined,
              cursor: isLoadingProjects ? 'wait' : 'pointer',
            }}
            disabled={isLoadingProjects}
          >
            <option value="">
              {isLoadingProjects
                ? language === 'ar'
                  ? 'جاري تحميل المشاريع...'
                  : 'Loading projects...'
                : language === 'ar'
                ? 'اختر مشروع (اختياري)'
                : 'Select a project (optional)'}
            </option>
            {projectsData?.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {language === 'ar' && project.nameAr
                  ? project.nameAr
                  : project.name}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={
            language === 'ar' ? 'المبلغ المقترح (اختياري)' : 'Proposed Amount (Optional)'
          }
          error={
            errors.proposedAmount?.message
              ? language === 'ar'
                ? 'المبلغ المقترح يجب أن يكون أكبر من الصفر'
                : errors.proposedAmount.message
              : undefined
          }
        >
          <input
            type="number"
            min="0"
            step="0.01"
            {...register('proposedAmount')}
            style={{
              ...inputStyle,
              borderColor: errors.proposedAmount ? '#DC2626' : undefined,
            }}
            placeholder={language === 'ar' ? 'المبلغ بالريال' : 'Amount in SAR'}
          />
        </Field>
      </div>

      <Field
        label={language === 'ar' ? 'خطة الشراكة (اختياري)' : 'Partnership Plan (Optional)'}
        error={errors.partnershipPlan?.message}
      >
        <textarea
          {...register('partnershipPlan')}
          style={{
            ...inputStyle,
            minHeight: '8rem',
            resize: 'vertical',
            borderColor: errors.partnershipPlan ? '#DC2626' : undefined,
          }}
          placeholder={
            language === 'ar'
              ? 'اكتب خطة الشراكة بالتفصيل (اختياري)'
              : 'Describe your partnership plan in detail (optional)'
          }
        />
      </Field>

      <Field
        label={language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
        error={
          errors.notes?.message
            ? language === 'ar'
              ? 'الملاحظات يجب أن تكون 1000 حرف أو أقل'
              : errors.notes.message
            : undefined
        }
      >
        <textarea
          {...register('notes')}
          style={{
            ...inputStyle,
            minHeight: '4rem',
            resize: 'vertical',
            borderColor: errors.notes ? '#DC2626' : undefined,
          }}
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


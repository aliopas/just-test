import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z, type ZodIssue } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCreatePartnershipRequest } from '../../hooks/useCreatePartnershipRequest';
import { usePublicProjects } from '../../hooks/usePublicProjects';
import { UploadDropzone } from './UploadDropzone';

const partnershipFormSchema = z.object({
  projectId: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        // If empty or undefined, it's valid (optional field)
        if (!val || val.trim() === '') return true;
        // If has value, must be valid UUID
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
      return typeof val === 'number' ? val : undefined;
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
    .transform((val) => (!val || val === '' ? undefined : val)),
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
  const { data: projectsData, isLoading: isLoadingProjects } = usePublicProjects();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnershipFormValues>({
    resolver: zodResolver(partnershipFormSchema, {
      errorMap: (issue: ZodIssue, ctx: { defaultError: string }) => {
        // Custom error messages
        if (issue.code === z.ZodIssueCode.custom) {
          // Handle projectId errors specifically
          if (issue.path[0] === 'projectId') {
            return {
              message:
                language === 'ar'
                  ? 'صيغة معرف المشروع غير صحيحة (يجب أن يكون UUID)'
                  : 'Invalid project ID format (must be UUID)',
            };
          }
          return { message: issue.message || ctx.defaultError };
        }
        if (issue.code === z.ZodIssueCode.too_small) {
          if (issue.path[0] === 'partnershipPlan') {
            return {
              message:
                language === 'ar'
                  ? 'خطة الشراكة يجب أن تكون 50 حرف على الأقل'
                  : 'Partnership plan must be at least 50 characters',
            };
          }
        }
        if (issue.code === z.ZodIssueCode.too_big) {
          if (issue.path[0] === 'partnershipPlan') {
            return {
              message:
                language === 'ar'
                  ? 'خطة الشراكة يجب أن تكون 5000 حرف أو أقل'
                  : 'Partnership plan must be 5000 characters or fewer',
            };
          }
        }
        return { message: ctx.defaultError };
      },
    }),
    mode: 'onSubmit', // Only validate on submit to reduce errors while typing
    reValidateMode: 'onChange', // Re-validate on change after first submit
    defaultValues: {
      projectId: '',
      proposedAmount: undefined,
      partnershipPlan: '',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(
    async values => {
    try {
      const result = await createPartnership.mutateAsync({
        projectId: values.projectId && values.projectId.trim() !== '' ? values.projectId : undefined,
        proposedAmount: values.proposedAmount,
        partnershipPlan: values.partnershipPlan || undefined,
        notes: values.notes && values.notes.trim() !== '' ? values.notes.trim() : undefined,
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
    },
    (validationErrors) => {
      // Handle validation errors from react-hook-form
      // Errors are already displayed in the form fields, so we just need to guide the user
      const errorFields = Object.keys(validationErrors);
      if (errorFields.length > 0) {
        // Scroll to first error field after a short delay to ensure DOM is updated
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

        // Show a general toast message
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
                // Clean the value: trim and return empty string if empty
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


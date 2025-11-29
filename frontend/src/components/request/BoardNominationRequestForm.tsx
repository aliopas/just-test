import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCreateBoardNominationRequest } from '../../hooks/useCreateBoardNominationRequest';
import { UploadDropzone } from './UploadDropzone';
import { useState } from 'react';

const boardNominationFormSchema = z.object({
  qualifications: z
    .string()
    .trim()
    .min(50, 'Qualifications must be at least 50 characters')
    .max(2000, 'Qualifications must be 2000 characters or fewer'),
  experience: z
    .string()
    .trim()
    .max(2000, 'Experience must be 2000 characters or fewer')
    .optional()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
  motivations: z
    .string()
    .trim()
    .max(2000, 'Motivations must be 2000 characters or fewer')
    .optional()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
  cvSummary: z
    .string()
    .trim()
    .max(2000, 'CV Summary must be 2000 characters or fewer')
    .optional()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
  notes: z
    .string()
    .trim()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
});

type BoardNominationFormValues = z.infer<typeof boardNominationFormSchema>;

export function BoardNominationRequestForm() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createBoardNomination = useCreateBoardNominationRequest();
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoardNominationFormValues>({
    resolver: zodResolver(boardNominationFormSchema),
    defaultValues: {
      qualifications: '',
      experience: '',
      motivations: '',
      cvSummary: '',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const result = await createBoardNomination.mutateAsync({
          qualifications: values.qualifications,
          experience: values.experience,
          motivations: values.motivations,
          cvSummary: values.cvSummary,
          notes: values.notes && values.notes.trim() !== '' ? values.notes.trim() : undefined,
        });

        setCreatedRequestId(result.requestId);

        pushToast({
          message:
            language === 'ar'
              ? 'تم إنشاء طلب الترشيح بنجاح'
              : 'Board nomination request created successfully',
          variant: 'success',
        });

        // Reset form immediately after successful submission (like buy/sell forms)
        reset({
          qualifications: '',
          experience: '',
          motivations: '',
          cvSummary: '',
          notes: '',
        });
        setCreatedRequestId(null);
      } catch (error: unknown) {
        console.error('Failed to create board nomination request:', error);
        const message =
          typeof error === 'object' &&
          error !== null &&
          'message' in error
            ? String((error as { message: unknown }).message)
            : language === 'ar'
            ? 'فشل إنشاء طلب الترشيح. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
            : 'Failed to create board nomination request. Please check your data and try again.';

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
      <Field
        label={language === 'ar' ? 'المؤهلات *' : 'Qualifications *'}
        error={errors.qualifications?.message}
      >
        <textarea
          {...register('qualifications')}
          style={{
            ...inputStyle,
            minHeight: '8rem',
            resize: 'vertical',
            borderColor: errors.qualifications ? '#DC2626' : undefined,
          }}
          placeholder={
            language === 'ar'
              ? 'اكتب مؤهلاتك بالتفصيل (50 حرف على الأقل)'
              : 'Describe your qualifications in detail (at least 50 characters)'
          }
          required
        />
      </Field>

      <Field
        label={language === 'ar' ? 'الخبرة (اختياري)' : 'Experience (Optional)'}
        error={errors.experience?.message}
      >
        <textarea
          {...register('experience')}
          style={{
            ...inputStyle,
            minHeight: '6rem',
            resize: 'vertical',
            borderColor: errors.experience ? '#DC2626' : undefined,
          }}
          placeholder={
            language === 'ar'
              ? 'اكتب خبرتك المهنية (اختياري)'
              : 'Describe your professional experience (optional)'
          }
        />
      </Field>

      <Field
        label={language === 'ar' ? 'الدوافع (اختياري)' : 'Motivations (Optional)'}
        error={errors.motivations?.message}
      >
        <textarea
          {...register('motivations')}
          style={{
            ...inputStyle,
            minHeight: '6rem',
            resize: 'vertical',
            borderColor: errors.motivations ? '#DC2626' : undefined,
          }}
          placeholder={
            language === 'ar'
              ? 'اكتب دوافعك للترشيح (اختياري)'
              : 'Describe your motivations for nomination (optional)'
          }
        />
      </Field>

      <Field
        label={language === 'ar' ? 'ملخص السيرة الذاتية (اختياري)' : 'CV Summary (Optional)'}
        error={errors.cvSummary?.message}
      >
        <textarea
          {...register('cvSummary')}
          style={{
            ...inputStyle,
            minHeight: '6rem',
            resize: 'vertical',
            borderColor: errors.cvSummary ? '#DC2626' : undefined,
          }}
          placeholder={
            language === 'ar'
              ? 'اكتب ملخصاً عن سيرتك الذاتية (اختياري)'
              : 'Provide a summary of your CV (optional)'
          }
        />
      </Field>

      <Field
        label={language === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
        error={errors.notes?.message}
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
          // Form already reset after submission, just clear requestId
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
            cursor: createBoardNomination.isPending ? 'progress' : 'pointer',
            opacity: createBoardNomination.isPending ? 0.7 : 1,
          }}
          disabled={createBoardNomination.isPending}
        >
          {createBoardNomination.isPending
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

const inputStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-border-muted)',
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
};


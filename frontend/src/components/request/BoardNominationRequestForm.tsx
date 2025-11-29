import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCreateBoardNominationRequest } from '../../hooks/useCreateBoardNominationRequest';
import { UploadDropzone } from './UploadDropzone';

const boardNominationFormSchema = z.object({
  cvSummary: z
    .string()
    .trim()
    .min(100, 'CV summary must be at least 100 characters')
    .max(2000, 'CV summary must be 2000 characters or fewer'),
  experience: z
    .string()
    .trim()
    .min(100, 'Experience must be at least 100 characters')
    .max(3000, 'Experience must be 3000 characters or fewer'),
  motivations: z
    .string()
    .trim()
    .min(100, 'Motivations must be at least 100 characters')
    .max(2000, 'Motivations must be 2000 characters or fewer'),
  qualifications: z
    .string()
    .trim()
    .min(50, 'Qualifications must be at least 50 characters')
    .max(2000, 'Qualifications must be 2000 characters or fewer'),
  notes: z.string().max(1000, 'Notes must be 1000 characters or fewer').optional(),
});

type BoardNominationFormValues = z.infer<typeof boardNominationFormSchema>;

interface BoardNominationRequestFormProps {
  onSuccess?: (requestId: string) => void;
}

export function BoardNominationRequestForm({
  onSuccess,
}: BoardNominationRequestFormProps) {
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
      cvSummary: '',
      experience: '',
      motivations: '',
      qualifications: '',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      const result = await createBoardNomination.mutateAsync({
        cvSummary: values.cvSummary,
        experience: values.experience,
        motivations: values.motivations,
        qualifications: values.qualifications,
        notes: values.notes || undefined,
      });

      setCreatedRequestId(result.requestId);
      onSuccess?.(result.requestId);

      pushToast({
        message:
          language === 'ar'
            ? 'تم إنشاء طلب الترشيح بنجاح'
            : 'Board nomination request created successfully',
        variant: 'success',
      });
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : language === 'ar'
          ? 'فشل إنشاء طلب الترشيح'
          : 'Failed to create board nomination request';

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
      <Field
        label={language === 'ar' ? 'ملخص السيرة الذاتية *' : 'CV Summary *'}
        error={errors.cvSummary?.message}
      >
        <textarea
          {...register('cvSummary')}
          style={{ ...inputStyle, minHeight: '6rem', resize: 'vertical' }}
          placeholder={
            language === 'ar'
              ? 'اكتب ملخصاً عن سيرتك الذاتية (100 حرف على الأقل)'
              : 'Write a summary of your CV (at least 100 characters)'
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
            ? 'الحد الأدنى: 100 حرف | الحد الأقصى: 2000 حرف'
            : 'Min: 100 characters | Max: 2000 characters'}
        </div>
      </Field>

      <Field
        label={language === 'ar' ? 'الخبرات *' : 'Experience *'}
        error={errors.experience?.message}
      >
        <textarea
          {...register('experience')}
          style={{ ...inputStyle, minHeight: '8rem', resize: 'vertical' }}
          placeholder={
            language === 'ar'
              ? 'اكتب عن خبراتك المهنية (100 حرف على الأقل)'
              : 'Describe your professional experience (at least 100 characters)'
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
            ? 'الحد الأدنى: 100 حرف | الحد الأقصى: 3000 حرف'
            : 'Min: 100 characters | Max: 3000 characters'}
        </div>
      </Field>

      <Field
        label={language === 'ar' ? 'الدوافع *' : 'Motivations *'}
        error={errors.motivations?.message}
      >
        <textarea
          {...register('motivations')}
          style={{ ...inputStyle, minHeight: '6rem', resize: 'vertical' }}
          placeholder={
            language === 'ar'
              ? 'اكتب عن دوافعك للترشيح (100 حرف على الأقل)'
              : 'Describe your motivations for nomination (at least 100 characters)'
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
            ? 'الحد الأدنى: 100 حرف | الحد الأقصى: 2000 حرف'
            : 'Min: 100 characters | Max: 2000 characters'}
        </div>
      </Field>

      <Field
        label={language === 'ar' ? 'المؤهلات *' : 'Qualifications *'}
        error={errors.qualifications?.message}
      >
        <textarea
          {...register('qualifications')}
          style={{ ...inputStyle, minHeight: '4rem', resize: 'vertical' }}
          placeholder={
            language === 'ar'
              ? 'المؤهلات الأكاديمية والمهنية (50 حرف على الأقل)'
              : 'Academic and professional qualifications (at least 50 characters)'
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
            ? 'الحد الأدنى: 50 حرف | الحد الأقصى: 2000 حرف'
            : 'Min: 50 characters | Max: 2000 characters'}
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


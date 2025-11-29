import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCreateFeedbackRequest } from '../../hooks/useCreateFeedbackRequest';
import { UploadDropzone } from './UploadDropzone';
import { useState } from 'react';

const feedbackFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be 200 characters or fewer'),
  category: z
    .string()
    .trim()
    .min(3, 'Category must be at least 3 characters')
    .max(100, 'Category must be 100 characters or fewer'),
  description: z
    .string()
    .trim()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be 5000 characters or fewer'),
  priority: z.enum(['low', 'medium', 'high']),
  notes: z
    .string()
    .trim()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional()
    .transform((val) => (!val || val.trim() === '' ? undefined : val.trim())),
});

type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;

export function FeedbackRequestForm() {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createFeedback = useCreateFeedbackRequest();
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      subject: '',
      category: '',
      description: '',
      priority: 'medium',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const result = await createFeedback.mutateAsync({
          subject: values.subject,
          category: values.category,
          description: values.description,
          priority: values.priority,
          notes: values.notes && values.notes.trim() !== '' ? values.notes.trim() : undefined,
        });

        setCreatedRequestId(result.requestId);

        pushToast({
          message:
            language === 'ar'
              ? 'تم إنشاء طلب الملاحظات بنجاح'
              : 'Feedback request created successfully',
          variant: 'success',
        });

        // Reset form immediately after successful submission (like buy/sell forms)
        reset({
          subject: '',
          category: '',
          description: '',
          priority: 'medium',
          notes: '',
        });
        setCreatedRequestId(null);
      } catch (error: unknown) {
        console.error('Failed to create feedback request:', error);
        const message =
          typeof error === 'object' &&
          error !== null &&
          'message' in error
            ? String((error as { message: unknown }).message)
            : language === 'ar'
            ? 'فشل إنشاء طلب الملاحظات. يرجى التحقق من البيانات والمحاولة مرة أخرى.'
            : 'Failed to create feedback request. Please check your data and try again.';

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
          label={language === 'ar' ? 'الموضوع *' : 'Subject *'}
          error={errors.subject?.message}
        >
          <input
            type="text"
            {...register('subject')}
            style={{
              ...inputStyle,
              borderColor: errors.subject ? '#DC2626' : undefined,
            }}
            placeholder={
              language === 'ar'
                ? 'أدخل موضوع الملاحظات'
                : 'Enter feedback subject'
            }
            required
          />
        </Field>

        <Field
          label={language === 'ar' ? 'الفئة *' : 'Category *'}
          error={errors.category?.message}
        >
          <input
            type="text"
            {...register('category')}
            style={{
              ...inputStyle,
              borderColor: errors.category ? '#DC2626' : undefined,
            }}
            placeholder={
              language === 'ar'
                ? 'أدخل فئة الملاحظات'
                : 'Enter feedback category'
            }
            required
          />
        </Field>
      </div>

      <div style={gridStyle}>
        <Field
          label={language === 'ar' ? 'الأولوية *' : 'Priority *'}
          error={errors.priority?.message}
        >
          <select
            {...register('priority')}
            style={{
              ...inputStyle,
              borderColor: errors.priority ? '#DC2626' : undefined,
            }}
            required
          >
            <option value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</option>
            <option value="medium">{language === 'ar' ? 'متوسطة' : 'Medium'}</option>
            <option value="high">{language === 'ar' ? 'عالية' : 'High'}</option>
          </select>
        </Field>
      </div>

      <Field
        label={language === 'ar' ? 'الوصف *' : 'Description *'}
        error={errors.description?.message}
      >
        <textarea
          {...register('description')}
          style={{
            ...inputStyle,
            minHeight: '8rem',
            resize: 'vertical',
            borderColor: errors.description ? '#DC2626' : undefined,
          }}
          placeholder={
            language === 'ar'
              ? 'اكتب وصفاً مفصلاً للملاحظات (50 حرف على الأقل)'
              : 'Describe your feedback in detail (at least 50 characters)'
          }
          required
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
            cursor: createFeedback.isPending ? 'progress' : 'pointer',
            opacity: createFeedback.isPending ? 0.7 : 1,
          }}
          disabled={createFeedback.isPending}
        >
          {createFeedback.isPending
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


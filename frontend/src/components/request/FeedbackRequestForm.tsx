import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCreateFeedbackRequest } from '../../hooks/useCreateFeedbackRequest';
import { UploadDropzone } from './UploadDropzone';

const feedbackFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be 200 characters or fewer'),
  category: z.enum(['suggestion', 'complaint', 'question', 'other']),
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

interface FeedbackRequestFormProps {
  onSuccess?: (requestId: string) => void;
}

export function FeedbackRequestForm({ onSuccess }: FeedbackRequestFormProps) {
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
      category: 'suggestion',
      description: '',
      priority: 'medium',
      notes: '',
    },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      const result = await createFeedback.mutateAsync({
        subject: values.subject,
        category: values.category,
        description: values.description,
        priority: values.priority || 'medium',
        notes: values.notes && values.notes.trim() !== '' ? values.notes.trim() : undefined,
      });

      setCreatedRequestId(result.requestId);
      onSuccess?.(result.requestId);

      pushToast({
        message:
          language === 'ar'
            ? 'تم إرسال الملاحظات بنجاح'
            : 'Feedback submitted successfully',
        variant: 'success',
      });
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : language === 'ar'
          ? 'فشل إرسال الملاحظات'
          : 'Failed to submit feedback';

      pushToast({
        message,
        variant: 'error',
      });
    }
  });

  const categoryOptions = [
    { value: 'suggestion', label: { ar: 'اقتراح', en: 'Suggestion' } },
    { value: 'complaint', label: { ar: 'شكوى', en: 'Complaint' } },
    { value: 'question', label: { ar: 'سؤال', en: 'Question' } },
    { value: 'other', label: { ar: 'أخرى', en: 'Other' } },
  ];

  const priorityOptions = [
    { value: 'low', label: { ar: 'منخفضة', en: 'Low' } },
    { value: 'medium', label: { ar: 'متوسطة', en: 'Medium' } },
    { value: 'high', label: { ar: 'عالية', en: 'High' } },
  ];

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
            style={inputStyle}
            placeholder={
              language === 'ar'
                ? 'موضوع الملاحظة (5-200 حرف)'
                : 'Feedback subject (5-200 characters)'
            }
            required
          />
        </Field>

        <Field
          label={language === 'ar' ? 'الفئة *' : 'Category *'}
          error={errors.category?.message}
        >
          <select {...register('category')} style={selectStyle} required>
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label[language]}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label={language === 'ar' ? 'الأولوية *' : 'Priority *'}
          error={errors.priority?.message}
        >
          <select {...register('priority')} style={selectStyle} required>
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label[language]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label={language === 'ar' ? 'الوصف *' : 'Description *'}
        error={errors.description?.message}
      >
        <textarea
          {...register('description')}
          style={{ ...inputStyle, minHeight: '8rem', resize: 'vertical' }}
          placeholder={
            language === 'ar'
              ? 'اكتب وصفاً مفصلاً للملاحظة (50 حرف على الأقل)'
              : 'Describe your feedback in detail (at least 50 characters)'
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

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
};


import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FeedbackRequestFormValues } from '../../schemas/feedbackRequestSchema';
import { feedbackRequestSchema } from '../../schemas/feedbackRequestSchema';
import { useLanguage } from '../../context/LanguageContext';
import { UploadDropzone } from './UploadDropzone';
import { useToast } from '../../context/ToastContext';
import { useCreateRequest } from '../../hooks/useCreateRequest';
import { analytics } from '../../utils/analytics';
import type { RequestType } from '../../types/request';

interface FeedbackRequestFormProps {
  onSuccess?: () => void;
}

export function FeedbackRequestForm({ onSuccess }: FeedbackRequestFormProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createRequest = useCreateRequest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackRequestFormValues>({
    resolver: zodResolver(feedbackRequestSchema),
    defaultValues: {
      type: 'feedback',
      priority: 'medium',
    },
  });

  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const onSubmit = handleSubmit(async values => {
    try {
      // For feedback, we use a fixed amount (1) as it's not a financial request
      // But the schema requires amount > 0, so we use 1
      const result = await createRequest.mutateAsync({
        type: 'feedback' as RequestType,
        amount: 1, // Fixed amount for non-financial requests
        currency: 'SAR',
        metadata: {
          feedbackType: values.feedbackType,
          subject: values.subject,
          priority: values.priority,
        },
        notes: values.message,
      });

      setCreatedRequestId(result.requestId);

      analytics.track('request_created', {
        type: 'feedback',
      });

      pushToast({
        message: language === 'ar' ? 'تم إرسال الملاحظات بنجاح' : 'Feedback submitted successfully',
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
          : language === 'ar' ? 'حدث خطأ أثناء إرسال الملاحظات' : 'An error occurred while submitting feedback';

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
        label={language === 'ar' ? 'نوع الملاحظة' : 'Feedback Type'}
        error={errors.feedbackType?.message}
      >
        <select {...register('feedbackType')} style={selectStyle}>
          <option value="suggestion">{language === 'ar' ? 'اقتراح' : 'Suggestion'}</option>
          <option value="complaint">{language === 'ar' ? 'شكوى' : 'Complaint'}</option>
          <option value="question">{language === 'ar' ? 'سؤال' : 'Question'}</option>
          <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
        </select>
      </Field>

      <Field
        label={language === 'ar' ? 'الأولوية' : 'Priority'}
        error={errors.priority?.message}
      >
        <select {...register('priority')} style={selectStyle}>
          <option value="low">{language === 'ar' ? 'منخفضة' : 'Low'}</option>
          <option value="medium">{language === 'ar' ? 'متوسطة' : 'Medium'}</option>
          <option value="high">{language === 'ar' ? 'عالية' : 'High'}</option>
        </select>
      </Field>

      <Field
        label={language === 'ar' ? 'الموضوع' : 'Subject'}
        error={errors.subject?.message}
      >
        <input
          type="text"
          {...register('subject')}
          style={inputStyle}
          placeholder={language === 'ar' ? 'أدخل موضوع الملاحظة' : 'Enter feedback subject'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'الرسالة' : 'Message'}
        error={errors.message?.message}
      >
        <textarea
          {...register('message')}
          style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
          placeholder={language === 'ar' ? 'أدخل رسالتك' : 'Enter your message'}
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
              ? 'إرسال الملاحظات'
              : 'Submit Feedback'}
        </button>
      </div>
    </form>
  );
}


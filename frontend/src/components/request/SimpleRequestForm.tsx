import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { useCreateAndSubmitRequest } from '../../hooks/useCreateAndSubmitRequest';
import { analytics } from '../../utils/analytics';
import type { RequestType } from '../../types/request';

const simpleRequestFormSchema = z.object({
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or fewer')
    .optional(),
});

type SimpleRequestFormValues = z.infer<typeof simpleRequestFormSchema>;

interface SimpleRequestFormProps {
  type: 'partnership' | 'board_nomination' | 'feedback';
}

export function SimpleRequestForm({ type }: SimpleRequestFormProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createAndSubmitRequest = useCreateAndSubmitRequest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SimpleRequestFormValues>({
    resolver: zodResolver(simpleRequestFormSchema),
    defaultValues: {
      notes: '',
    },
  });

  const onSubmit = handleSubmit(async values => {
    try {
      await createAndSubmitRequest.mutateAsync({
        type: type as RequestType,
        amount: undefined,
        currency: undefined,
        targetPrice: undefined,
        expiryAt: undefined,
        notes: values.notes ?? undefined,
      });

      analytics.track('request_created_and_submitted', {
        type,
      });

      pushToast({
        message: language === 'ar' 
          ? 'تم إرسال الطلب بنجاح' 
          : 'Request submitted successfully',
        variant: 'success',
      });

      // Reset form immediately
      reset({
        notes: '',
      });
    } catch (error: unknown) {
      const message =
        typeof error === 'object' && error && 'message' in error
          ? String((error as { message: unknown }).message)
          : language === 'ar'
          ? 'فشل إرسال الطلب'
          : 'Failed to submit request';

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <label
          style={{
            fontWeight: 600,
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)',
          }}
        >
          {language === 'ar' ? 'الملاحظات (اختياري)' : 'Notes (optional)'}
        </label>
        <textarea
          {...register('notes')}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.85rem',
            border: '1px solid var(--color-border-muted)',
            background: 'var(--color-background-surface)',
            color: 'var(--color-text-primary)',
            fontSize: '0.95rem',
            minHeight: '8rem',
            resize: 'vertical',
          }}
          placeholder={
            language === 'ar'
              ? 'أدخل ملاحظات إضافية (اختياري)'
              : 'Additional notes (optional)'
          }
        />
        {errors.notes && (
          <span
            style={{
              color: '#DC2626',
              fontSize: '0.85rem',
            }}
          >
            {errors.notes.message}
          </span>
        )}
      </div>

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
            cursor: createAndSubmitRequest.isPending ? 'progress' : 'pointer',
            opacity: createAndSubmitRequest.isPending ? 0.7 : 1,
          }}
          disabled={createAndSubmitRequest.isPending}
        >
          {createAndSubmitRequest.isPending
            ? (language === 'ar' ? 'جاري الإرسال…' : 'Submitting…')
            : (language === 'ar' ? 'إرسال الطلب' : 'Submit Request')}
        </button>

        <button
          type="button"
          style={{
            padding: '0.75rem 1.75rem',
            borderRadius: '0.85rem',
            border: '1px solid var(--color-brand-secondary-soft)',
            background: 'var(--color-background-surface)',
            color: 'var(--color-brand-accent-deep)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() =>
            reset({
              notes: '',
            })
          }
          disabled={createAndSubmitRequest.isPending}
        >
          {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
        </button>
      </div>
    </form>
  );
}


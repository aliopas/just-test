import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BoardNominationRequestFormValues } from '../../schemas/boardNominationRequestSchema';
import { boardNominationRequestSchema } from '../../schemas/boardNominationRequestSchema';
import { useLanguage } from '../../context/LanguageContext';
import { UploadDropzone } from './UploadDropzone';
import { useToast } from '../../context/ToastContext';
import { useCreateRequest } from '../../hooks/useCreateRequest';
import { analytics } from '../../utils/analytics';
import type { RequestType } from '../../types/request';

interface BoardNominationRequestFormProps {
  onSuccess?: () => void;
}

export function BoardNominationRequestForm({ onSuccess }: BoardNominationRequestFormProps) {
  const { language, direction } = useLanguage();
  const { pushToast } = useToast();
  const createRequest = useCreateRequest();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BoardNominationRequestFormValues>({
    resolver: zodResolver(boardNominationRequestSchema),
    defaultValues: {
      type: 'board_nomination',
    },
  });

  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  const onSubmit = handleSubmit(async values => {
    try {
      // For board nomination, amount and currency are optional (non-financial request)
      const result = await createRequest.mutateAsync({
        type: 'board_nomination' as RequestType,
        // Do not send amount or currency for non-financial requests
        metadata: {
          nomineeName: values.nomineeName,
          nomineePosition: values.nomineePosition,
          nomineeQualifications: values.nomineeQualifications,
          nominationReason: values.nominationReason,
          nomineeEmail: values.nomineeEmail,
          nomineePhone: values.nomineePhone,
        },
        notes: values.nominationReason,
      });

      setCreatedRequestId(result.requestId);

      analytics.track('request_created', {
        type: 'board_nomination',
      });

      pushToast({
        message: language === 'ar' ? 'تم إنشاء طلب الترشيح بنجاح' : 'Board nomination request created successfully',
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
        label={language === 'ar' ? 'اسم المرشح' : 'Nominee Name'}
        error={errors.nomineeName?.message}
      >
        <input
          type="text"
          {...register('nomineeName')}
          style={inputStyle}
          placeholder={language === 'ar' ? 'أدخل اسم المرشح' : 'Enter nominee name'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'المنصب المقترح' : 'Proposed Position'}
        error={errors.nomineePosition?.message}
      >
        <input
          type="text"
          {...register('nomineePosition')}
          style={inputStyle}
          placeholder={language === 'ar' ? 'أدخل المنصب المقترح' : 'Enter proposed position'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'المؤهلات والخبرات' : 'Qualifications and Experience'}
        error={errors.nomineeQualifications?.message}
      >
        <textarea
          {...register('nomineeQualifications')}
          style={{ ...inputStyle, minHeight: '150px', resize: 'vertical' }}
          placeholder={language === 'ar' ? 'أدخل المؤهلات والخبرات' : 'Enter qualifications and experience'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'سبب الترشيح' : 'Nomination Reason'}
        error={errors.nominationReason?.message}
      >
        <textarea
          {...register('nominationReason')}
          style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
          placeholder={language === 'ar' ? 'أدخل سبب الترشيح' : 'Enter nomination reason'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
        error={errors.nomineeEmail?.message}
      >
        <input
          type="email"
          {...register('nomineeEmail')}
          style={inputStyle}
          placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email'}
        />
      </Field>

      <Field
        label={language === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}
        error={errors.nomineePhone?.message}
      >
        <input
          type="tel"
          {...register('nomineePhone')}
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


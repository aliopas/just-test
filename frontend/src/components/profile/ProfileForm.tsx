import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type {
  InvestorProfile,
  InvestorProfileUpdateRequest,
} from '../../types/investor';
import { useLanguage } from '../../context/LanguageContext';
import { getMessage } from '../../locales/investorProfile';
import {
  investorProfileFormSchema,
  type InvestorProfileFormValues,
} from '../../schemas/investorProfileSchema';
import type { CommunicationChannels } from '../../types/investor';
import { analytics } from '../../utils/analytics';
import { useToast } from '../../context/ToastContext';

const channelIcons: Record<CommunicationChannels, string> = {
  email: '\u2709\uFE0F',
  sms: '\u{1F4F1}',
  push: '\u{1F514}',
};

interface ProfileFormProps {
  profile: InvestorProfile | null;
  onSubmit: (payload: InvestorProfileUpdateRequest) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function mapProfileToFormValues(
  profile: InvestorProfile | null
): InvestorProfileFormValues {
  if (!profile) {
    return {
      email: null,
      phone: null,
      fullName: null,
      preferredName: null,
      language: 'ar',
      idType: null,
      idNumber: null,
      idExpiry: null,
      nationality: null,
      residencyCountry: null,
      city: null,
      kycStatus: 'pending',
      riskProfile: null,
      communicationPreferences: {
        email: true,
        sms: false,
        push: true,
      },
      kycDocuments: [],
    };
  }

  return {
    email: profile.email,
    phone: profile.phone,
    fullName: profile.fullName,
    preferredName: profile.preferredName,
    language: profile.language,
    idType: profile.idType,
    idNumber: profile.idNumber,
    idExpiry: profile.idExpiry,
    nationality: profile.nationality,
    residencyCountry: profile.residencyCountry,
    city: profile.city,
    kycStatus: profile.kycStatus,
    riskProfile: profile.riskProfile,
    communicationPreferences: profile.communicationPreferences,
    kycDocuments: profile.kycDocuments ?? [],
  };
}

export function ProfileForm({
  profile,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProfileFormProps) {
  const { language, setLanguage } = useLanguage();
  const { pushToast } = useToast();

  const defaultValues = useMemo(
    () => mapProfileToFormValues(profile),
    [profile]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<InvestorProfileFormValues>({
    defaultValues,
    resolver: zodResolver(investorProfileFormSchema),
    mode: 'onChange',
  });

  const currentLanguage = watch('language');

  useEffect(() => {
    if (currentLanguage && currentLanguage !== language) {
      setLanguage(currentLanguage);
      analytics.track('investor_language_changed', {
        language: currentLanguage,
      });
    }
  }, [currentLanguage, language, setLanguage]);

  useEffect(() => {
    if (profile) {
      reset(mapProfileToFormValues(profile));
    }
  }, [profile, reset]);

  const submitHandler = handleSubmit(async values => {
    const payload: InvestorProfileUpdateRequest = {
      email: values.email ?? undefined,
      phone: values.phone ?? undefined,
      fullName: values.fullName ?? undefined,
      preferredName: values.preferredName ?? undefined,
      language: values.language,
      idType: values.idType ?? undefined,
      idNumber: values.idNumber ?? undefined,
      idExpiry: values.idExpiry ?? undefined,
      nationality: values.nationality ?? undefined,
      residencyCountry: values.residencyCountry ?? undefined,
      city: values.city ?? undefined,
      kycStatus: values.kycStatus ?? undefined,
      riskProfile: values.riskProfile ?? undefined,
      communicationPreferences: values.communicationPreferences,
      kycDocuments: values.kycDocuments ?? undefined,
    };

    await onSubmit(payload);
    analytics.track('investor_profile_updated', payload as Record<string, unknown>);
    pushToast({
      message: getMessage('toast.saved', values.language),
      variant: 'success',
    });
  });

  const communicationPreferences = watch('communicationPreferences');
  const kycDocuments = watch('kycDocuments') ?? [];

  return (
    <form
      onSubmit={submitHandler}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Field
          label={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
          error={errors.email?.message}
        >
          <input
            type="email"
            {...register('email')}
            placeholder={language === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
          />
        </Field>
        <Field
          label={language === 'ar' ? 'رقم الهاتف' : 'Phone'}
          error={errors.phone?.message}
        >
          <input
            type="tel"
            {...register('phone')}
            placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
          />
        </Field>
        <Field
          label={getMessage('fields.fullName', language)}
          error={errors.fullName?.message}
        >
          <input
            type="text"
            {...register('fullName')}
            placeholder={language === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
          />
        </Field>
        <Field
          label={getMessage('fields.preferredName', language)}
          error={errors.preferredName?.message}
        >
          <input
            type="text"
            {...register('preferredName')}
            placeholder={
              language === 'ar' ? 'الاسم المختصر (اختياري)' : 'Preferred name (optional)'
            }
          />
        </Field>
        <Field
          label={getMessage('fields.language', language)}
          error={errors.language?.message}
        >
          <select {...register('language')}>
            <option value="ar">{getMessage('language.switch.ar', language)}</option>
            <option value="en">{getMessage('language.switch.en', language)}</option>
          </select>
        </Field>
        <Field
          label={getMessage('fields.riskProfile', language)}
          error={errors.riskProfile?.message}
        >
          <select {...register('riskProfile')}>
            <option value="">
              {language === 'ar' ? 'غير محدد' : 'Not set'}
            </option>
            <option value="conservative">
              {language === 'ar' ? 'حذر' : 'Conservative'}
            </option>
            <option value="balanced">
              {language === 'ar' ? 'متوازن' : 'Balanced'}
            </option>
            <option value="aggressive">
              {language === 'ar' ? 'مغامر' : 'Aggressive'}
            </option>
          </select>
        </Field>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Field
          label={getMessage('fields.idType', language)}
          error={errors.idType?.message}
        >
          <select {...register('idType')}>
            <option value="">{language === 'ar' ? 'اختر' : 'Select'}</option>
            <option value="national_id">
              {language === 'ar' ? 'هوية وطنية' : 'National ID'}
            </option>
            <option value="iqama">
              {language === 'ar' ? 'إقامة' : 'Iqama'}
            </option>
            <option value="passport">
              {language === 'ar' ? 'جواز سفر' : 'Passport'}
            </option>
            <option value="other">
              {language === 'ar' ? 'أخرى' : 'Other'}
            </option>
          </select>
        </Field>
        <Field
          label={getMessage('fields.idNumber', language)}
          error={errors.idNumber?.message}
        >
          <input type="text" {...register('idNumber')} />
        </Field>
        <Field
          label={getMessage('fields.idExpiry', language)}
          error={errors.idExpiry?.message}
        >
          <input type="date" {...register('idExpiry')} />
        </Field>
        <Field
          label={getMessage('fields.kycStatus', language)}
          error={errors.kycStatus?.message}
        >
          <select {...register('kycStatus')}>
            <option value="pending">
              {language === 'ar' ? 'قيد المعالجة' : 'Pending'}
            </option>
            <option value="in_review">
              {language === 'ar' ? 'قيد المراجعة' : 'In review'}
            </option>
            <option value="approved">
              {language === 'ar' ? 'معتمد' : 'Approved'}
            </option>
            <option value="rejected">
              {language === 'ar' ? 'مرفوض' : 'Rejected'}
            </option>
          </select>
        </Field>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Field
          label={getMessage('fields.nationality', language)}
          error={errors.nationality?.message}
        >
          <input type="text" {...register('nationality')} placeholder="SA" />
        </Field>
        <Field
          label={getMessage('fields.residencyCountry', language)}
          error={errors.residencyCountry?.message}
        >
          <input type="text" {...register('residencyCountry')} placeholder="SA" />
        </Field>
        <Field
          label={getMessage('fields.city', language)}
          error={errors.city?.message}
        >
          <input type="text" {...register('city')} />
        </Field>
      </section>

      <section
        style={{
          border: '1px solid var(--color-border-soft)',
          borderRadius: '1rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--color-background-surface)',
        }}
      >
        <strong style={{ color: 'var(--color-text-primary)' }}>
          {getMessage('fields.communication.title', language)}
        </strong>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {(Object.keys(communicationPreferences) as CommunicationChannels[]).map(
            channel => (
              <label
                key={channel}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.85rem',
                  border: communicationPreferences[channel]
                    ? '1px solid var(--color-brand-primary)'
                    : '1px solid var(--color-border-soft)',
                  background: communicationPreferences[channel]
                    ? 'var(--color-background-alt)'
                    : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="checkbox"
                  checked={Boolean(communicationPreferences[channel])}
                  onChange={event => {
                    setValue(`communicationPreferences.${channel}`, event.target.checked, {
                      shouldDirty: true,
                    });
                  }}
                />
                <span>
                  {channelIcons[channel]}{' '}
                  {getMessage(
                    `fields.communication.${channel}` as
                      | 'fields.communication.email'
                      | 'fields.communication.sms'
                      | 'fields.communication.push',
                    language
                  )}
                </span>
              </label>
            )
          )}
        </div>
        {errors.communicationPreferences?.message && (
          <ErrorText message={errors.communicationPreferences.message} />
        )}
      </section>

      <section
        style={{
          border: '1px dashed var(--color-brand-secondary-soft)',
          borderRadius: '1rem',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <strong style={{ color: 'var(--color-text-primary)' }}>
          {getMessage('fields.documents.title', language)}
        </strong>
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-muted)',
            fontSize: '0.95rem',
          }}
        >
          {getMessage('fields.documents.helper', language)}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {kycDocuments.map(document => (
            <span
              key={document}
              style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '0.75rem',
                background: 'var(--color-background-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                fontSize: '0.9rem',
              }}
            >
              ðŸ“Ž {document}
              <button
                type="button"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#EF4444',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const next = kycDocuments.filter(item => item !== document);
                  setValue('kycDocuments', next, { shouldDirty: true });
                }}
              >
                Ã—
              </button>
            </span>
          ))}
        </div>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.85rem',
            border: '1px solid var(--color-brand-primary)',
            background: 'var(--color-background-alt)',
            color: 'var(--color-brand-accent-deep)',
            cursor: 'pointer',
            width: 'fit-content',
          }}
        >
          📎 {language === 'ar' ? 'رفع المستندات' : 'Upload documents'}
          <input
            type="file"
            accept=".pdf,.jpeg,.jpg,.png"
            multiple
            hidden
            onChange={event => {
              if (!event.target.files) {
                return;
              }
              const next = [
                ...kycDocuments,
                ...Array.from(event.target.files).map(file => file.name),
              ];
              setValue('kycDocuments', next, { shouldDirty: true });
              pushToast({
                message: getMessage('toast.uploadPlaceholder', language),
                variant: 'info',
              });
            }}
          />
        </label>
      </section>

      <footer
        style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => {
            reset();
            onCancel();
          }}
          style={{
            padding: '0.65rem 1.2rem',
            borderRadius: '0.85rem',
            border: '1px solid var(--color-brand-secondary-soft)',
            background: 'var(--color-background-surface)',
            color: 'var(--color-text-primary)',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {getMessage('actions.cancel', language)}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          style={{
            padding: '0.65rem 1.2rem',
            borderRadius: '0.85rem',
            border: 'none',
            background: 'var(--color-brand-primary)',
            color: 'var(--color-text-on-brand)',
            cursor: isSubmitting || !isDirty ? 'not-allowed' : 'pointer',
            opacity: isSubmitting || !isDirty ? 0.6 : 1,
            fontWeight: 600,
            minWidth: '9rem',
          }}
        >
          {isSubmitting
            ? `${getMessage('status.loading', language)}`
            : getMessage('actions.save', language)}
        </button>
      </footer>
    </form>
  );
}

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, error, children }: FieldProps) {
  return (
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
          color: 'var(--color-text-primary)',
          fontSize: '0.95rem',
        }}
      >
        {label}
      </span>
      {children}
      {error && <ErrorText message={error} />}
    </label>
  );
}

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span
      style={{
        color: '#DC2626',
        fontSize: '0.85rem',
      }}
    >
      {message}
    </span>
  );
}




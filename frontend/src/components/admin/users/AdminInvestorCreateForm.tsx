import { useMemo, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '../../../context/LanguageContext';
import { tAdminUsers } from '../../../locales/adminUsers';
import type { AdminCreateUserPayload } from '../../../types/admin-users';

const phoneRegex = /^\+[1-9]\d{1,14}$/;
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

const idTypeLabels = {
  national_id: { en: 'National ID', ar: 'الهوية الوطنية' },
  iqama: { en: 'Iqama', ar: 'هوية مقيم' },
  passport: { en: 'Passport', ar: 'جواز السفر' },
  other: { en: 'Other', ar: 'أخرى' },
} as const;

const statusValues: AdminCreateUserPayload['status'][] = [
  'pending',
  'active',
  'suspended',
  'deactivated',
];

const localeValues: AdminCreateUserPayload['locale'][] = ['ar', 'en'];

const kycValues = ['pending', 'in_review', 'approved', 'rejected'] as const;

const riskValues = ['conservative', 'balanced', 'aggressive'] as const;

function buildFormSchema(messages: {
  phone: string;
  password: string;
  tempPasswordRequired: string;
  fullNameMin: string;
  fullNameMax: string;
  idNumberMax: string;
  isoCode: string;
  cityMax: string;
}) {
  return z
    .object({
      email: z.string().trim().min(1).email(),
      fullName: z
        .string()
        .trim()
        .transform(value => (value.length === 0 ? undefined : value))
        .refine(
          value => value === undefined || value.length >= 3,
          messages.fullNameMin
        )
        .refine(
          value => value === undefined || value.length <= 150,
          messages.fullNameMax
        ),
      phone: z
        .string()
        .trim()
        .transform(value => (value.length === 0 ? undefined : value))
        .refine(
          value => value === undefined || phoneRegex.test(value),
          messages.phone
        ),
      locale: z.enum(localeValues),
      status: z.enum(statusValues),
      sendInvite: z.boolean(),
      temporaryPassword: z
        .string()
        .trim()
        .transform(value => (value.length === 0 ? undefined : value))
        .refine(
          value => value === undefined || passwordRegex.test(value),
          messages.password
        ),
      investorLanguage: z.enum(localeValues),
      idType: z
        .union([
          z.literal(''),
          z.enum(['national_id', 'iqama', 'passport', 'other'] as const),
        ])
        .transform(value => (value === '' ? undefined : value)),
      idNumber: z
        .string()
        .trim()
        .transform(value => (value.length === 0 ? undefined : value))
        .refine(
          value => value === undefined || value.length <= 50,
          messages.idNumberMax
        ),
      nationality: z
        .string()
        .trim()
        .transform(value =>
          value.length === 0 ? undefined : value.toUpperCase()
        )
        .refine(
          value => value === undefined || /^[A-Z]{2}$/.test(value),
          messages.isoCode
        ),
      residencyCountry: z
        .string()
        .trim()
        .transform(value =>
          value.length === 0 ? undefined : value.toUpperCase()
        )
        .refine(
          value => value === undefined || /^[A-Z]{2}$/.test(value),
          messages.isoCode
        ),
      city: z
        .string()
        .trim()
        .transform(value => (value.length === 0 ? undefined : value))
        .refine(
          value => value === undefined || value.length <= 120,
          messages.cityMax
        ),
      kycStatus: z.enum(kycValues),
      riskProfile: z
        .union([z.literal(''), z.enum(riskValues)])
        .transform(value => (value === '' ? undefined : value)),
    })
    .superRefine((data, ctx) => {
      if (!data.sendInvite && !data.temporaryPassword) {
        ctx.addIssue({
          path: ['temporaryPassword'],
          code: z.ZodIssueCode.custom,
          message: messages.tempPasswordRequired,
        });
      }
    });
}

type FormSchema = ReturnType<typeof buildFormSchema>;
type FormValues = z.infer<FormSchema>;

interface Props {
  onSubmit: (payload: AdminCreateUserPayload) => Promise<void> | void;
  submitting: boolean;
}

export function AdminInvestorCreateForm({ onSubmit, submitting }: Props) {
  const { language, direction } = useLanguage();

  const schema = useMemo(
    () =>
      buildFormSchema({
        phone: tAdminUsers('validation.phone', language),
        password: tAdminUsers('validation.password', language),
        tempPasswordRequired: tAdminUsers(
          'form.temporaryPassword.required',
          language
        ),
        fullNameMin:
          language === 'ar'
            ? 'يجب ألا يقل الاسم الكامل عن 3 أحرف.'
            : 'Full name must be at least 3 characters.',
        fullNameMax:
          language === 'ar'
            ? 'يجب ألا يتجاوز الاسم الكامل 150 حرفاً.'
            : 'Full name must be 150 characters or fewer.',
        idNumberMax:
          language === 'ar'
            ? 'يجب ألا يتجاوز رقم الهوية 50 حرفاً.'
            : 'ID number must be 50 characters or fewer.',
        isoCode:
          language === 'ar'
            ? 'يجب أن يتكون الرمز من حرفين (ISO Alpha-2).'
            : 'Must be a two-letter ISO alpha-2 code.',
        cityMax:
          language === 'ar'
            ? 'يجب ألا يتجاوز اسم المدينة 120 حرفاً.'
            : 'City must be 120 characters or fewer.',
      }),
    [language]
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      fullName: undefined,
      phone: undefined,
      locale: language,
      status: 'pending',
      sendInvite: true,
      temporaryPassword: undefined,
      investorLanguage: language,
      idType: undefined,
      idNumber: undefined,
      nationality: undefined,
      residencyCountry: undefined,
      city: undefined,
      kycStatus: 'pending',
      riskProfile: undefined,
    },
  });

  const sendInvite = watch('sendInvite');

  const onSubmitForm = async (values: FormValues) => {
    const payload: AdminCreateUserPayload = {
      email: values.email.trim(),
      phone: values.phone ?? null,
      fullName: values.fullName ?? null,
      role: 'investor',
      status: values.status,
      locale: values.locale,
      sendInvite: values.sendInvite,
      temporaryPassword: values.sendInvite
        ? undefined
        : values.temporaryPassword,
      investorProfile: {
        language: values.investorLanguage ?? values.locale,
        idType: values.idType,
        idNumber: values.idNumber,
        nationality: values.nationality,
        residencyCountry: values.residencyCountry,
        city: values.city,
        kycStatus: values.kycStatus ?? 'pending',
        riskProfile: values.riskProfile ?? null,
      },
    };

    await onSubmit(payload);
    reset({
      email: '',
      fullName: undefined,
      phone: undefined,
      locale: language,
      status: 'pending',
      sendInvite: true,
      temporaryPassword: undefined,
      investorLanguage: language,
      idType: undefined,
      idNumber: undefined,
      nationality: undefined,
      residencyCountry: undefined,
      city: undefined,
      kycStatus: 'pending',
      riskProfile: undefined,
    });
  };

  return (
    <section
      style={{
        background: 'var(--color-background-surface)',
        borderRadius: '1.5rem',
        padding: '1.75rem',
        boxShadow: '0 30px 60px rgba(15, 23, 42, 0.08)',
        direction,
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '1.75rem',
            color: 'var(--color-text-primary)',
          }}
        >
          {tAdminUsers('form.title', language)}
        </h2>
        <p
          style={{
            margin: 0,
            color: 'var(--color-text-secondary)',
            fontSize: '0.95rem',
            maxWidth: '48rem',
          }}
        >
          {tAdminUsers('form.subtitle', language)}
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmitForm)}
        style={{
          display: 'grid',
          gap: '1.25rem',
        }}
      >
        <div style={gridRowStyle}>
          <FormField
            label={tAdminUsers('form.email', language)}
            error={errors.email?.message}
          >
            <input
              type="email"
              {...register('email')}
              disabled={submitting}
              style={inputStyle}
            />
          </FormField>

          <FormField
            label={tAdminUsers('form.fullName', language)}
            error={errors.fullName?.message}
          >
            <input
              type="text"
              {...register('fullName')}
              disabled={submitting}
              style={inputStyle}
            />
          </FormField>
        </div>

        <div style={gridRowStyle}>
          <FormField
            label={tAdminUsers('form.phone', language)}
            error={errors.phone?.message}
          >
            <input
              type="tel"
              {...register('phone')}
              disabled={submitting}
              style={inputStyle}
            />
          </FormField>

          <FormField
            label={tAdminUsers('form.locale', language)}
            error={errors.locale?.message}
          >
            <select
              {...register('locale')}
              disabled={submitting}
              style={inputStyle}
            >
              {localeValues.map(value => (
                <option key={value} value={value}>
                  {value === 'ar' ? 'العربية' : 'English'}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div style={gridRowStyle}>
          <FormField
            label={tAdminUsers('form.status', language)}
            error={errors.status?.message}
          >
            <select
              {...register('status')}
              disabled={submitting}
              style={inputStyle}
            >
              {statusValues.map(status => (
                <option key={status} value={status}>
                  {tAdminUsers(`status.${status}` as const, language)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={tAdminUsers('form.investor.language', language)}
            error={errors.investorLanguage?.message}
          >
            <select
              {...register('investorLanguage')}
              disabled={submitting}
              style={inputStyle}
            >
              {localeValues.map(value => (
                <option key={value} value={value}>
                  {value === 'ar' ? 'العربية' : 'English'}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            <input
              type="checkbox"
              {...register('sendInvite')}
              disabled={submitting}
              style={{ width: '1.1rem', height: '1.1rem' }}
            />
            {tAdminUsers('form.sendInvite', language)}
          </label>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            {tAdminUsers('form.sendInvite.help', language)}
          </span>
        </div>

        {!sendInvite && (
          <FormField
            label={tAdminUsers('form.temporaryPassword', language)}
            error={errors.temporaryPassword?.message}
          >
            <input
              type="password"
              {...register('temporaryPassword')}
              disabled={submitting}
              style={inputStyle}
            />
            <small style={helpTextStyle}>
              {tAdminUsers('form.temporaryPassword.help', language)}
            </small>
          </FormField>
        )}

        <div style={gridRowStyle}>
          <FormField
            label={tAdminUsers('form.investor.idType', language)}
            error={errors.idType?.message}
          >
            <select
              {...register('idType')}
              disabled={submitting}
              style={inputStyle}
              defaultValue=""
            >
              <option value="">
                {language === 'ar' ? 'بدون' : 'None'}
              </option>
              {Object.entries(idTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label[language]}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label={tAdminUsers('form.investor.idNumber', language)}
            error={errors.idNumber?.message}
          >
            <input
              type="text"
              {...register('idNumber')}
              disabled={submitting}
              style={inputStyle}
            />
          </FormField>
        </div>

        <div style={gridRowStyle}>
          <FormField
            label={tAdminUsers('form.investor.nationality', language)}
            error={errors.nationality?.message}
          >
            <input
              type="text"
              {...register('nationality')}
              disabled={submitting}
              style={inputStyle}
              placeholder="SA"
            />
          </FormField>

          <FormField
            label={tAdminUsers('form.investor.residency', language)}
            error={errors.residencyCountry?.message}
          >
            <input
              type="text"
              {...register('residencyCountry')}
              disabled={submitting}
              style={inputStyle}
              placeholder="SA"
            />
          </FormField>
        </div>

        <div style={gridRowStyle}>
          <FormField
            label={tAdminUsers('form.investor.city', language)}
            error={errors.city?.message}
          >
            <input
              type="text"
              {...register('city')}
              disabled={submitting}
              style={inputStyle}
            />
          </FormField>

          <FormField
            label={tAdminUsers('form.investor.kycStatus', language)}
            error={errors.kycStatus?.message}
          >
            <select
              {...register('kycStatus')}
              disabled={submitting}
              style={inputStyle}
            >
              {kycValues.map(status => (
                <option key={status} value={status}>
                  {tAdminUsers(`kyc.${status}` as const, language)}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          label={tAdminUsers('form.investor.riskProfile', language)}
          error={errors.riskProfile?.message}
        >
          <select
            {...register('riskProfile')}
            disabled={submitting}
            style={inputStyle}
            defaultValue=""
          >
            <option value="">
              {language === 'ar' ? 'غير محدد' : 'Not set'}
            </option>
            {riskValues.map(value => (
              <option key={value} value={value}>
                {tAdminUsers(`risk.${value}` as const, language)}
              </option>
            ))}
          </select>
        </FormField>

        <div
          style={{
            display: 'flex',
            justifyContent:
              direction === 'rtl' ? 'flex-start' : 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '0.85rem 1.85rem',
              borderRadius: '0.9rem',
              border: 'none',
              background: 'var(--color-brand-primary-strong)',
              color: 'var(--color-text-on-brand)',
              fontWeight: 700,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting
              ? language === 'ar'
                ? 'جارٍ الإنشاء…'
                : 'Creating…'
              : tAdminUsers('form.submit', language)}
          </button>
        </div>
      </form>
    </section>
  );
}

interface FormFieldProps {
  label: string;
  error?: string;
  children: ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
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
          fontSize: '0.9rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
        }}
      >
        {label}
      </span>
      {children}
      {error && (
        <span
          style={{
            fontSize: '0.8rem',
            color: '#B91C1C',
          }}
        >
          {error}
        </span>
      )}
    </label>
  );
}

const gridRowStyle: React.CSSProperties = {
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
};

const inputStyle: React.CSSProperties = {
  padding: '0.7rem 0.9rem',
  borderRadius: '0.85rem',
  border: '1px solid var(--color-brand-secondary-soft)',
  background: 'var(--color-background-base)',
  color: 'var(--color-text-primary)',
  fontSize: '0.95rem',
};

const helpTextStyle: React.CSSProperties = {
  marginTop: '0.35rem',
  fontSize: '0.8rem',
  color: 'var(--color-text-secondary)',
};



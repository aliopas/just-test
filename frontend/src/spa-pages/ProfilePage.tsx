import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { palette, radius, shadow, typography } from '../styles/theme';
import { useInvestorProfileDirect } from '../hooks/useInvestorProfileDirect';
import { getMessage } from '../locales/investorProfile';
import type {
  InvestorProfile,
  InvestorProfileUpdateRequest,
  InvestorIdType,
  InvestorLanguage,
  InvestorRiskProfile,
} from '../types/investor';

type TabType = 'basic' | 'identity' | 'preferences';

export function ProfilePage() {
  const { language, direction, setLanguage } = useLanguage();
  const {
    profile,
    isLoading,
    isError,
    refetch,
    updateProfile,
    isUpdating,
    updateError,
  } = useInvestorProfileDirect();

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<InvestorProfileUpdateRequest>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        fullName: profile.fullName ?? null,
        preferredName: profile.preferredName ?? null,
        email: profile.email ?? null,
        phone: profile.phone ?? null,
        idType: profile.idType ?? null,
        idNumber: profile.idNumber ?? null,
        idExpiry: profile.idExpiry ?? null,
        nationality: profile.nationality ?? null,
        residencyCountry: profile.residencyCountry ?? null,
        city: profile.city ?? null,
        language: profile.language,
        riskProfile: profile.riskProfile,
        communicationPreferences: profile.communicationPreferences,
      });
      setHasChanges(false);
    }
  }, [profile, isEditing]);

  // Check for changes
  useEffect(() => {
    if (!profile || !isEditing) {
      setHasChanges(false);
      return;
    }

    const changed =
      formData.fullName !== (profile.fullName ?? null) ||
      formData.preferredName !== (profile.preferredName ?? null) ||
      formData.email !== (profile.email ?? null) ||
      formData.phone !== (profile.phone ?? null) ||
      formData.idType !== (profile.idType ?? null) ||
      formData.idNumber !== (profile.idNumber ?? null) ||
      formData.idExpiry !== (profile.idExpiry ?? null) ||
      formData.nationality !== (profile.nationality ?? null) ||
      formData.residencyCountry !== (profile.residencyCountry ?? null) ||
      formData.city !== (profile.city ?? null) ||
      formData.language !== profile.language ||
      formData.riskProfile !== profile.riskProfile ||
      JSON.stringify(formData.communicationPreferences) !==
        JSON.stringify(profile.communicationPreferences);

    setHasChanges(changed);
  }, [formData, profile, isEditing]);

  const handleFieldChange = (
    field: keyof InvestorProfileUpdateRequest,
    value: unknown
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageChange = (newLang: InvestorLanguage) => {
    handleFieldChange('language', newLang);
    setLanguage(newLang);
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await refetch();
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      fullName: profile?.fullName ?? null,
      preferredName: profile?.preferredName ?? null,
      email: profile?.email ?? null,
      phone: profile?.phone ?? null,
      idType: profile?.idType ?? null,
      idNumber: profile?.idNumber ?? null,
      idExpiry: profile?.idExpiry ?? null,
      nationality: profile?.nationality ?? null,
      residencyCountry: profile?.residencyCountry ?? null,
      city: profile?.city ?? null,
      language: profile?.language ?? 'ar',
      riskProfile: profile?.riskProfile ?? null,
      communicationPreferences: profile?.communicationPreferences,
    });
    setHasChanges(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-SA' : 'en-US',
      { dateStyle: 'medium' }
    );
  };

  const getKycStatusColor = (status: string | null) => {
    switch (status) {
      case 'approved':
        return palette.success;
      case 'rejected':
        return palette.error;
      case 'in_review':
        return palette.warning;
      default:
        return palette.textSecondary;
    }
  };

  const getKycStatusLabel = (status: string | null) => {
    switch (status) {
      case 'approved':
        return language === 'ar' ? 'معتمد' : 'Approved';
      case 'rejected':
        return language === 'ar' ? 'مرفوض' : 'Rejected';
      case 'in_review':
        return language === 'ar' ? 'قيد المراجعة' : 'In review';
      default:
        return language === 'ar' ? 'قيد الانتظار' : 'Pending';
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: palette.backgroundSurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          direction,
        }}
      >
        <p style={{ color: palette.textSecondary }}>
          {getMessage('status.loading', language)}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: palette.backgroundSurface,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          direction,
        }}
      >
        <p style={{ color: palette.error }}>
          {getMessage('status.error', language)}
        </p>
        <button
          onClick={() => refetch()}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: radius.md,
            background: palette.brandPrimary,
            color: palette.textOnBrand,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {getMessage('actions.refresh', language)}
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div
        style={{
          minHeight: '100vh',
          padding: '2rem',
          background: palette.backgroundSurface,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          direction,
        }}
      >
        <p style={{ color: palette.textSecondary }}>
          {getMessage('status.empty', language)}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '2rem',
        background: palette.backgroundSurface,
        direction,
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        {/* Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: typography.sizes.heading,
                fontWeight: typography.weights.bold,
                color: palette.textPrimary,
              }}
            >
              {getMessage('pageTitle', language)}
            </h1>
            {profile.updatedAt && (
              <p
                style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: typography.sizes.caption,
                  color: palette.textSecondary,
                }}
              >
                {getMessage('lastUpdated', language)}: {formatDate(profile.updatedAt)}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: radius.md,
                    background: 'transparent',
                    color: palette.textPrimary,
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    fontWeight: 600,
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                >
                  {getMessage('actions.cancel', language)}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isUpdating}
                  style={{
                    padding: '0.65rem 1.25rem',
                    borderRadius: radius.md,
                    background:
                      hasChanges && !isUpdating
                        ? palette.brandPrimary
                        : palette.neutralBorderMuted,
                    color:
                      hasChanges && !isUpdating
                        ? palette.textOnBrand
                        : palette.textSecondary,
                    border: 'none',
                    cursor:
                      hasChanges && !isUpdating ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    opacity: isUpdating ? 0.6 : 1,
                  }}
                >
                  {isUpdating
                    ? language === 'ar'
                      ? 'جاري الحفظ...'
                      : 'Saving...'
                    : getMessage('actions.save', language)}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: radius.md,
                  background: palette.brandPrimary,
                  color: palette.textOnBrand,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {getMessage('actions.edit', language)}
              </button>
            )}
          </div>
        </header>

        {/* Success message */}
        {saveSuccess && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: radius.md,
              background: `${palette.success}15`,
              color: palette.success,
              border: `1px solid ${palette.success}`,
            }}
          >
            {getMessage('toast.saved', language)}
          </div>
        )}

        {/* Error message */}
        {updateError && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: radius.md,
              background: `${palette.error}15`,
              color: palette.error,
              border: `1px solid ${palette.error}`,
            }}
          >
            {getMessage('toast.error', language)}
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: `1px solid ${palette.neutralBorderSoft}`,
            flexWrap: 'wrap',
          }}
        >
          {(['basic', 'identity', 'preferences'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.25rem',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${
                  activeTab === tab ? palette.brandPrimary : 'transparent'
                }`,
                color:
                  activeTab === tab ? palette.brandPrimary : palette.textSecondary,
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 600 : 400,
                fontSize: typography.sizes.body,
              }}
            >
              {getMessage(`tabs.${tab}` as any, language)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.5rem',
            borderRadius: radius.lg,
            background: palette.backgroundBase,
            boxShadow: shadow.subtle,
            border: `1px solid ${palette.neutralBorderMuted}`,
          }}
        >
          {activeTab === 'basic' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem',
              }}
            >
              <Field
                label={getMessage('fields.fullName', language)}
                value={isEditing ? formData.fullName ?? '' : profile.fullName ?? ''}
                onChange={value => handleFieldChange('fullName', value)}
                isEditing={isEditing}
                type="text"
              />
              <Field
                label={getMessage('fields.preferredName', language)}
                value={
                  isEditing
                    ? formData.preferredName ?? ''
                    : profile.preferredName ?? ''
                }
                onChange={value => handleFieldChange('preferredName', value)}
                isEditing={isEditing}
                type="text"
              />
              <Field
                label={getMessage('fields.communication.email', language)}
                value={isEditing ? formData.email ?? '' : profile.email ?? ''}
                onChange={value => handleFieldChange('email', value)}
                isEditing={isEditing}
                type="email"
              />
              <Field
                label="Phone"
                value={isEditing ? formData.phone ?? '' : profile.phone ?? ''}
                onChange={value => handleFieldChange('phone', value)}
                isEditing={isEditing}
                type="tel"
              />
            </div>
          )}

          {activeTab === 'identity' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {/* KYC Status */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: typography.sizes.caption,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {getMessage('fields.kycStatus', language)}
                </label>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: radius.md,
                    background: palette.backgroundSurface,
                    border: `1px solid ${palette.neutralBorderSoft}`,
                    color: getKycStatusColor(profile.kycStatus),
                    fontWeight: 600,
                  }}
                >
                  {getKycStatusLabel(profile.kycStatus)}
                </div>
              </div>

              {/* Identity fields */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.25rem',
                }}
              >
                <SelectField
                  label={getMessage('fields.idType', language)}
                  value={
                    isEditing
                      ? formData.idType ?? null
                      : profile.idType ?? null
                  }
                  onChange={value => handleFieldChange('idType', value)}
                  isEditing={isEditing}
                  options={[
                    { value: 'national_id', label: 'National ID' },
                    { value: 'iqama', label: 'Iqama' },
                    { value: 'passport', label: 'Passport' },
                    { value: 'other', label: 'Other' },
                  ]}
                />
                <Field
                  label={getMessage('fields.idNumber', language)}
                  value={isEditing ? formData.idNumber ?? '' : profile.idNumber ?? ''}
                  onChange={value => handleFieldChange('idNumber', value)}
                  isEditing={isEditing}
                  type="text"
                />
                <Field
                  label={getMessage('fields.idExpiry', language)}
                  value={
                    isEditing
                      ? formData.idExpiry ?? ''
                      : profile.idExpiry ?? ''
                  }
                  onChange={value => handleFieldChange('idExpiry', value)}
                  isEditing={isEditing}
                  type="date"
                />
                <Field
                  label={getMessage('fields.nationality', language)}
                  value={
                    isEditing ? formData.nationality ?? '' : profile.nationality ?? ''
                  }
                  onChange={value => handleFieldChange('nationality', value)}
                  isEditing={isEditing}
                  type="text"
                />
                <Field
                  label={getMessage('fields.residencyCountry', language)}
                  value={
                    isEditing
                      ? formData.residencyCountry ?? ''
                      : profile.residencyCountry ?? ''
                  }
                  onChange={value => handleFieldChange('residencyCountry', value)}
                  isEditing={isEditing}
                  type="text"
                />
                <Field
                  label={getMessage('fields.city', language)}
                  value={isEditing ? formData.city ?? '' : profile.city ?? ''}
                  onChange={value => handleFieldChange('city', value)}
                  isEditing={isEditing}
                  type="text"
                />
              </div>

              {/* KYC Documents */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: typography.sizes.caption,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {getMessage('fields.documents.title', language)}
                </label>
                <p
                  style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: typography.sizes.caption,
                    color: palette.textSecondary,
                  }}
                >
                  {getMessage('fields.documents.helper', language)}
                </p>
                {profile.kycDocuments && profile.kycDocuments.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {profile.kycDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: radius.md,
                          background: palette.backgroundSurface,
                          border: `1px solid ${palette.neutralBorderSoft}`,
                          fontSize: typography.sizes.caption,
                          color: palette.textSecondary,
                        }}
                      >
                        {doc}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      fontSize: typography.sizes.caption,
                      color: palette.textSecondary,
                      fontStyle: 'italic',
                    }}
                  >
                    {language === 'ar'
                      ? 'لا توجد وثائق مرفوعة'
                      : 'No documents uploaded'}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {/* Language */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: typography.sizes.caption,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {getMessage('fields.language', language)}
                </label>
                {isEditing ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleLanguageChange('ar')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: radius.md,
                      background:
                        formData.language === 'ar'
                          ? palette.brandPrimary
                          : palette.backgroundSurface,
                      color:
                        formData.language === 'ar'
                          ? palette.textOnBrand
                          : palette.textPrimary,
                      border: `1px solid ${
                        formData.language === 'ar'
                          ? palette.brandPrimary
                          : palette.neutralBorderSoft
                      }`,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {getMessage('language.switch.ar', language)}
                    </button>
                    <button
                      onClick={() => handleLanguageChange('en')}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: radius.md,
                      background:
                        formData.language === 'en'
                          ? palette.brandPrimary
                          : palette.backgroundSurface,
                      color:
                        formData.language === 'en'
                          ? palette.textOnBrand
                          : palette.textPrimary,
                      border: `1px solid ${
                        formData.language === 'en'
                          ? palette.brandPrimary
                          : palette.neutralBorderSoft
                      }`,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {getMessage('language.switch.en', language)}
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: radius.md,
                      background: palette.backgroundSurface,
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      color: palette.textPrimary,
                    }}
                  >
                    {profile.language === 'ar'
                      ? getMessage('language.switch.ar', language)
                      : getMessage('language.switch.en', language)}
                  </div>
                )}
              </div>

              {/* Risk Profile */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: typography.sizes.caption,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {getMessage('fields.riskProfile', language)}
                </label>
                {isEditing ? (
                  <SelectField
                    value={
                      isEditing
                        ? formData.riskProfile ?? null
                        : profile.riskProfile ?? null
                    }
                    onChange={value => handleFieldChange('riskProfile', value)}
                    isEditing={true}
                    options={[
                      { value: 'conservative', label: 'Conservative' },
                      { value: 'balanced', label: 'Balanced' },
                      { value: 'aggressive', label: 'Aggressive' },
                    ]}
                  />
                ) : (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: radius.md,
                      background: palette.backgroundSurface,
                      border: `1px solid ${palette.neutralBorderSoft}`,
                      color: palette.textPrimary,
                    }}
                  >
                    {profile.riskProfile
                      ? profile.riskProfile.charAt(0).toUpperCase() +
                        profile.riskProfile.slice(1)
                      : language === 'ar'
                        ? 'غير محدد'
                        : 'Not set'}
                  </div>
                )}
              </div>

              {/* Communication Preferences */}
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: typography.sizes.caption,
                    fontWeight: 600,
                    color: palette.textPrimary,
                  }}
                >
                  {getMessage('fields.communication.title', language)}
                </label>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  {(['email', 'sms', 'push'] as const).map(channel => (
                    <label
                      key={channel}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          isEditing
                            ? formData.communicationPreferences?.[channel] ??
                              false
                            : profile.communicationPreferences[channel]
                        }
                        onChange={e => {
                          if (isEditing) {
                            handleFieldChange('communicationPreferences', {
                              ...formData.communicationPreferences,
                              [channel]: e.target.checked,
                            });
                          }
                        }}
                        disabled={!isEditing}
                        style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          cursor: isEditing ? 'pointer' : 'not-allowed',
                        }}
                      />
                      <span style={{ color: palette.textPrimary }}>
                        {getMessage(`fields.communication.${channel}` as any, language)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  isEditing,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  type?: string;
}) {
  const { palette, radius, typography } = require('../styles/theme');

  if (isEditing) {
    return (
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: typography.sizes.small,
            fontWeight: 600,
            color: palette.textPrimary,
          }}
        >
          {label}
        </label>
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: radius.md,
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundBase,
            color: palette.textPrimary,
            fontSize: typography.sizes.body,
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: typography.sizes.small,
          fontWeight: 600,
          color: palette.textPrimary,
        }}
      >
        {label}
      </label>
      <div
        style={{
          padding: '0.75rem 1rem',
          borderRadius: radius.md,
          background: palette.backgroundSurface,
          border: `1px solid ${palette.neutralBorderSoft}`,
          color: palette.textPrimary,
          minHeight: '2.75rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {value || (
          <span style={{ color: palette.textSecondary, fontStyle: 'italic' }}>
            —
          </span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  isEditing,
  options,
}: {
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  isEditing: boolean;
  options: { value: string; label: string }[];
}) {
  const { palette, radius, typography } = require('../styles/theme');

  if (isEditing) {
    return (
      <div>
        {label && (
          <label
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: typography.sizes.small,
              fontWeight: 600,
              color: palette.textPrimary,
            }}
          >
            {label}
          </label>
        )}
        <select
          value={value ?? ''}
          onChange={e => onChange(e.target.value || null)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: radius.md,
            border: `1px solid ${palette.neutralBorderSoft}`,
            background: palette.backgroundBase,
            color: palette.textPrimary,
            fontSize: typography.sizes.body,
            cursor: 'pointer',
          }}
        >
          <option value="">—</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: typography.sizes.small,
            fontWeight: 600,
            color: palette.textPrimary,
          }}
        >
          {label}
        </label>
      )}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderRadius: radius.md,
          background: palette.backgroundSurface,
          border: `1px solid ${palette.neutralBorderSoft}`,
          color: palette.textPrimary,
          minHeight: '2.75rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {value
          ? options.find(opt => opt.value === value)?.label ?? value
          : (
              <span style={{ color: palette.textSecondary, fontStyle: 'italic' }}>
                —
              </span>
            )}
      </div>
    </div>
  );
}

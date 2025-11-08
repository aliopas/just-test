import { useMemo, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type {
  InvestorProfile,
  InvestorProfileUpdateRequest,
} from '../types/investor';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import { ToastStack } from '../components/ToastStack';
import { useInvestorProfile } from '../hooks/useInvestorProfile';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileSummaryCard } from '../components/profile/ProfileSummaryCard';
import { ProfileSkeleton } from '../components/profile/ProfileSkeleton';
import { ProfileEmptyState } from '../components/profile/ProfileEmptyState';
import { ProfileForm } from '../components/profile/ProfileForm';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { ProfileDetails } from '../components/profile/ProfileDetails';
import { getMessage } from '../locales/investorProfile';
import { analytics } from '../utils/analytics';

const queryClient = new QueryClient();

function ProfilePageInner() {
  const {
    profile,
    isLoading,
    isError,
    refetch,
    updateProfile,
    isUpdating,
    updateError,
  } = useInvestorProfile();
  const { language } = useLanguage();
  const { pushToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (payload: InvestorProfileUpdateRequest) => {
    await updateProfile(payload);
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (!profile) return;
    setIsEditing(true);
  };

  const handleRefresh = async () => {
    await refetch();
    pushToast({ message: getMessage('actions.refresh', language), variant: 'info' });
  };

  const tabs = useMemo(() => {
    if (!profile) {
      return [];
    }
    return [
      {
        id: 'basic',
        label: 'basic',
        icon: '🧾',
        content: <ProfileDetails profile={profile} />,
      },
      {
        id: 'identity',
        label: 'identity',
        icon: '🪪',
        content: <IdentityDetails profile={profile} />,
      },
      {
        id: 'preferences',
        label: 'preferences',
        icon: '⚙️',
        content: <PreferencesDetails profile={profile} />,
      },
    ];
  }, [profile]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    return (
      <div
        style={{
          border: '1px solid #FCA5A5',
          borderRadius: '1rem',
          padding: '2rem',
          background: '#FEF2F2',
          color: '#B91C1C',
        }}
      >
        {getMessage('status.error', language)}
      </div>
    );
  }

  if (!profile) {
    return (
      <ProfileEmptyState
        onCreate={() => {
          analytics.track('investor_profile_viewed', { empty: true });
          setIsEditing(true);
        }}
        isCreating={isUpdating}
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
      }}
    >
      <ProfileHeader
        profile={profile}
        onEdit={handleEdit}
        isEditing={isEditing}
        onRefresh={handleRefresh}
        isRefreshing={isUpdating}
        onLanguageChange={nextLanguage => {
          analytics.track('investor_language_changed', {
            language: nextLanguage,
            source: 'profile_header',
          });
        }}
      />

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 320px) 1fr',
          gap: '2rem',
        }}
      >
        <ProfileSummaryCard profile={profile} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem',
          }}
        >
          {isEditing ? (
            <ProfileForm
              profile={profile}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isUpdating}
            />
          ) : (
            <ProfileTabs tabs={tabs} />
          )}
          {updateError instanceof Error && (
            <div
              style={{
                borderRadius: '0.85rem',
                padding: '0.85rem 1rem',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
              }}
            >
              {getMessage('toast.error', language)} – {updateError.message}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function IdentityDetails({ profile }: { profile: InvestorProfile }) {
  const { language, direction } = useLanguage();

  const pairs = [
    {
      label: getMessage('fields.idType', language),
      value: profile.idType ?? '—',
    },
    {
      label: getMessage('fields.idNumber', language),
      value: profile.idNumber ?? '—',
    },
    {
      label: getMessage('fields.idExpiry', language),
      value: profile.idExpiry
        ? new Date(profile.idExpiry).toLocaleDateString(
            language === 'ar' ? 'ar-SA' : 'en-US'
          )
        : '—',
    },
    {
      label: getMessage('fields.kycStatus', language),
      value: profile.kycStatus,
    },
  ];

  return (
    <dl
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        direction,
      }}
    >
      {pairs.map(pair => (
        <div
          key={pair.label}
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: '0.85rem',
            padding: '0.85rem 1rem',
            background: '#FFFFFF',
          }}
        >
          <dt
            style={{
              fontSize: '0.85rem',
              color: '#6B7280',
              marginBottom: '0.35rem',
            }}
          >
            {pair.label}
          </dt>
          <dd
            style={{
              margin: 0,
              fontWeight: 600,
              color: '#111418',
            }}
          >
            {pair.value ?? '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function PreferencesDetails({ profile }: { profile: InvestorProfile }) {
  const { language, direction } = useLanguage();
  const preferences = profile.communicationPreferences;
  const documents = profile.kycDocuments ?? [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        direction,
      }}
    >
      <section>
        <h3
          style={{
            margin: '0 0 0.75rem',
            fontSize: '1.1rem',
            color: '#111418',
          }}
        >
          {getMessage('fields.communication.title', language)}
        </h3>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {(['email', 'sms', 'push'] as const).map(channel => (
            <li
              key={channel}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.85rem',
                background: preferences[channel] ? '#ECFDF5' : '#F9FAFB',
                border: preferences[channel]
                  ? '1px solid #34D399'
                  : '1px solid #E5E7EB',
              }}
            >
              {getMessage(
                `fields.communication.${channel}` as
                  | 'fields.communication.email'
                  | 'fields.communication.sms'
                  | 'fields.communication.push',
                language
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3
          style={{
            margin: '0 0 0.75rem',
            fontSize: '1.1rem',
            color: '#111418',
          }}
        >
          {getMessage('fields.documents.title', language)}
        </h3>
        {documents.length === 0 ? (
          <p
            style={{
              margin: 0,
              color: '#6B7280',
            }}
          >
            {language === 'ar'
              ? 'لم يتم رفع أي مستندات حتى الآن.'
              : 'No documents uploaded yet.'}
          </p>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {documents.map(document => (
              <li
                key={document}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.85rem',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                }}
              >
                📎 {document}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function ProfilePage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ToastProvider>
          <div
            style={{
              maxWidth: '1100px',
              margin: '0 auto',
              padding: '2rem 1.5rem 4rem',
              background: '#F1F5F9',
              minHeight: '100vh',
            }}
          >
            <ProfilePageInner />
          </div>
          <ToastStack />
        </ToastProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}



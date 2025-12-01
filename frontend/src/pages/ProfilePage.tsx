import { useMemo, useState } from 'react';
import type {
  InvestorProfile,
  InvestorProfileUpdateRequest,
} from '../types/investor';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useInvestorProfile } from '../hooks/useInvestorProfile';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileSummaryCard } from '../components/profile/ProfileSummaryCard';
import { ProfileSkeleton } from '../components/profile/ProfileSkeleton';
import { ProfileEmptyState } from '../components/profile/ProfileEmptyState';
import { ProfileForm } from '../components/profile/ProfileForm';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { ProfileDetails } from '../components/profile/ProfileDetails';
import { ProfileInsightsPanel } from '../components/profile/ProfileInsightsPanel';
import { getMessage } from '../locales/investorProfile';
import { analytics } from '../utils/analytics';

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
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isFetching: isDashboardFetching,
    isError: isDashboardError,
    refetch: refetchDashboard,
  } = useInvestorDashboard();
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
    await Promise.all([refetch(), refetchDashboard()]);
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
        icon: 'ðŸ§¾',
        content: <ProfileDetails profile={profile} />,
      },
      {
        id: 'identity',
        label: 'identity',
        icon: 'ðŸªª',
        content: <IdentityDetails profile={profile} />,
      },
      {
        id: 'preferences',
        label: 'preferences',
        icon: '\u2699\uFE0F',
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
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          <ProfileSummaryCard profile={profile} />
          <ProfileInsightsPanel
            insights={dashboard?.insights ?? null}
            recentRequests={dashboard?.recentRequests ?? []}
            isLoading={isDashboardLoading || isDashboardFetching}
            isError={isDashboardError}
            onRetry={refetchDashboard}
          />
        </div>
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
              {getMessage('toast.error', language)} {'\u2013'} {updateError.message}
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
      value: profile.idType ?? '\u2014',
    },
    {
      label: getMessage('fields.idNumber', language),
      value: profile.idNumber ?? '\u2014',
    },
    {
      label: getMessage('fields.idExpiry', language),
      value: profile.idExpiry
        ? new Date(profile.idExpiry).toLocaleDateString(
            language === 'ar' ? 'ar-SA' : 'en-US'
          )
        : '\u2014',
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
            border: '1px solid var(--color-border-soft)',
            borderRadius: '0.85rem',
            padding: '0.85rem 1rem',
            background: 'var(--color-background-surface)',
          }}
        >
          <dt
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              marginBottom: '0.35rem',
            }}
          >
            {pair.label}
          </dt>
          <dd
            style={{
              margin: 0,
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {pair.value ?? '\u2014'}
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
            color: 'var(--color-text-primary)',
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
                background: preferences[channel] ? '#ECFDF5' : 'var(--color-background-surface)',
                border: preferences[channel]
                  ? '1px solid #34D399'
                  : '1px solid var(--color-border-soft)',
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
            color: 'var(--color-text-primary)',
          }}
        >
          {getMessage('fields.documents.title', language)}
        </h3>
        {documents.length === 0 ? (
          <p
            style={{
              margin: 0,
              color: 'var(--color-text-muted)',
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
                  border: '1px solid var(--color-border-soft)',
                  background: 'var(--color-background-surface)',
                }}
              >
                ðŸ“Ž {document}
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
    <div
      style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        background: 'var(--color-background-base)',
        minHeight: '100vh',
      }}
    >
      <ProfilePageInner />
    </div>
  );
}

// Default export used only for legacy Next.js pages directory validation.
// We export a simple stub that does not rely on React Router, React Query, or
// any browser-only APIs so that static generation in Netlify succeeds.
export default function ProfilePageStub() {
  return null;
}


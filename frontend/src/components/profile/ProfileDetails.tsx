import type { InvestorProfile } from '../../types/investor';
import { useLanguage } from '../../context/LanguageContext';
import { getMessage } from '../../locales/investorProfile';

interface ProfileDetailsProps {
  profile: InvestorProfile;
}

function InfoPair({ label, value }: { label: string; value?: string | null }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.85rem',
        border: '1px solid var(--color-border-soft)',
        background: 'var(--color-background-surface)',
      }}
    >
      <span
        style={{
          fontSize: '0.85rem',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          minHeight: '1.25rem',
        }}
      >
        {value || 'â€”'}
      </span>
    </div>
  );
}

export function ProfileDetails({ profile }: ProfileDetailsProps) {
  const { language, direction } = useLanguage();

  const riskLabel =
    profile.riskProfile === 'conservative'
      ? language === 'ar'
        ? 'Ø­Ø°Ø±'
        : 'Conservative'
      : profile.riskProfile === 'balanced'
      ? language === 'ar'
        ? 'Ù…ØªÙˆØ§Ø²Ù†'
        : 'Balanced'
      : profile.riskProfile === 'aggressive'
      ? language === 'ar'
        ? 'Ù…ØºØ§Ù…Ø±'
        : 'Aggressive'
      : null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        direction,
      }}
    >
      <InfoPair
        label={getMessage('fields.fullName', language)}
        value={profile.fullName}
      />
      <InfoPair
        label={getMessage('fields.preferredName', language)}
        value={profile.preferredName}
      />
      <InfoPair
        label={getMessage('fields.language', language)}
        value={
          profile.language === 'ar'
            ? getMessage('language.switch.ar', language)
            : getMessage('language.switch.en', language)
        }
      />
      <InfoPair
        label={getMessage('fields.idType', language)}
        value={
          profile.idType
            ? {
                national_id: language === 'ar' ? 'Ù‡ÙˆÙŠØ© ÙˆØ·Ù†ÙŠØ©' : 'National ID',
                iqama: language === 'ar' ? 'Ø¥Ù‚Ø§Ù…Ø©' : 'Iqama',
                passport: language === 'ar' ? 'Ø¬ÙˆØ§Ø² Ø³ÙØ±' : 'Passport',
                other: language === 'ar' ? 'Ø£Ø®Ø±Ù‰' : 'Other',
              }[profile.idType]
            : null
        }
      />
      <InfoPair
        label={getMessage('fields.idNumber', language)}
        value={profile.idNumber}
      />
      <InfoPair
        label={getMessage('fields.idExpiry', language)}
        value={
          profile.idExpiry
            ? new Date(profile.idExpiry).toLocaleDateString(
                language === 'ar' ? 'ar-SA' : 'en-US'
              )
            : null
        }
      />
      <InfoPair
        label={getMessage('fields.nationality', language)}
        value={profile.nationality}
      />
      <InfoPair
        label={getMessage('fields.residencyCountry', language)}
        value={profile.residencyCountry}
      />
      <InfoPair
        label={getMessage('fields.city', language)}
        value={profile.city}
      />
      <InfoPair
        label={getMessage('fields.riskProfile', language)}
        value={riskLabel}
      />
      <InfoPair
        label={getMessage('fields.communication.title', language)}
        value={formatPreferences(profile, language)}
      />
    </div>
  );
}

function formatPreferences(
  profile: InvestorProfile,
  language: 'ar' | 'en'
): string {
  const pairs: string[] = [];
  if (profile.communicationPreferences.email) {
    pairs.push(
      getMessage('fields.communication.email', language).replace('Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ', '').replace('notifications', '').trim()
    );
  }
  if (profile.communicationPreferences.sms) {
    pairs.push(
      getMessage('fields.communication.sms', language).replace('Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ', '').replace('notifications', '').trim()
    );
  }
  if (profile.communicationPreferences.push) {
    pairs.push(
      getMessage('fields.communication.push', language).replace('Ø¥Ø´Ø¹Ø§Ø±Ø§Øª ', '').replace('notifications', '').trim()
    );
  }
  if (pairs.length === 0) {
    return language === 'ar' ? 'Ù„Ø§ ØªÙˆØ¬Ø¯ ØªÙØ¶ÙŠÙ„Ø§Øª Ù…Ø­Ø¯Ø¯Ø©' : 'No channels enabled';
  }
  return pairs.join(language === 'ar' ? 'ØŒ ' : ', ');
}




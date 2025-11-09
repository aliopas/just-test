import type { InvestorProfile } from '../../types/investor';
import { useLanguage } from '../../context/LanguageContext';
import { getMessage } from '../../locales/investorProfile';

interface ProfileSummaryCardProps {
  profile: InvestorProfile | null;
}

const statusColor: Record<
  NonNullable<InvestorProfile['kycStatus']>,
  { label: { ar: string; en: string }; color: string }
> = {
  pending: {
    label: { ar: 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©', en: 'Pending' },
    color: '#F59E0B',
  },
  in_review: {
    label: { ar: 'Ù‚ÙŠØ¯ Ø§Ù„Ù…Ø±Ø§Ø¬Ø¹Ø©', en: 'In review' },
    color: 'var(--color-brand-primary)',
  },
  approved: {
    label: { ar: 'Ù…Ø¹ØªÙ…Ø¯', en: 'Approved' },
    color: '#10B981',
  },
  rejected: {
    label: { ar: 'Ù…Ø±ÙÙˆØ¶', en: 'Rejected' },
    color: '#EF4444',
  },
};

export function ProfileSummaryCard({ profile }: ProfileSummaryCardProps) {
  const { language, direction } = useLanguage();

  if (!profile) {
    return null;
  }

  const statusMeta = statusColor[profile.kycStatus];

  return (
    <aside
      style={{
        background: 'var(--color-background-surface)',
        border: '1px solid var(--color-border-soft)',
        borderRadius: '1rem',
        padding: '1.5rem',
        boxShadow: '0 12px 32px rgba(17, 24, 39, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        minWidth: '18rem',
        direction,
      }}
    >
      <div>
        <h2
          style={{
            fontSize: '1.15rem',
            margin: 0,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}
        >
          {profile.fullName || profile.email || getMessage('pageTitle', language)}
        </h2>
        {profile.email && (
          <p
            style={{
              margin: '0.25rem 0 0',
              color: 'var(--color-text-muted)',
            }}
          >
            {profile.email}
          </p>
        )}
        {profile.phone && (
          <p
            style={{
              margin: '0.15rem 0 0',
              color: 'var(--color-text-muted)',
              fontSize: '0.95rem',
            }}
          >
            {profile.phone}
          </p>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
          }}
        >
          âš–ï¸{' '}
          {profile.riskProfile
            ? profile.riskProfile === 'conservative'
              ? language === 'ar'
                ? 'Ø­Ø°Ø±'
                : 'Conservative'
              : profile.riskProfile === 'balanced'
              ? language === 'ar'
                ? 'Ù…ØªÙˆØ§Ø²Ù†'
                : 'Balanced'
              : language === 'ar'
              ? 'Ù…ØºØ§Ù…Ø±'
              : 'Aggressive'
            : language === 'ar'
            ? 'Ù„Ù… ÙŠØªÙ… ØªØ­Ø¯ÙŠØ¯ Ù…Ø³ØªÙˆÙ‰ Ø§Ù„Ù…Ø®Ø§Ø·Ø±'
            : 'Risk profile not set'}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
          }}
        >
          ðŸŒ {profile.nationality || (language === 'ar' ? 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯' : 'Not set')}
        </span>
      </div>

      <div
        style={{
          marginTop: '0.5rem',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            fontSize: '0.95rem',
          }}
        >
          ðŸ›¡ï¸ {getMessage('fields.kycStatus', language)}
        </span>
        <div
          style={{
            marginTop: '0.35rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <span
            style={{
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '999px',
              background: statusMeta.color,
              boxShadow: `0 0 0 3px ${statusMeta.color}1f`,
            }}
          />
          <span
            style={{
              fontWeight: 600,
              color: statusMeta.color,
            }}
          >
            {statusMeta.label[language]}
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>
          {language === 'ar'
            ? 'Ø¹Ø¶Ùˆ Ù…Ù†Ø°'
            : 'Member since'}{' '}
          {profile.userCreatedAt
            ? new Date(profile.userCreatedAt).toLocaleDateString(
                language === 'ar' ? 'ar-SA' : 'en-US',
                {
                  month: 'short',
                  year: 'numeric',
                }
              )
            : 'â€”'}
        </span>
        <span>
          {language === 'ar'
            ? 'Ø§Ù„Ø­Ø§Ù„Ø© Ø§Ù„Ø­Ø§Ù„ÙŠØ©'
            : 'Account status'}{' '}
          <strong>{profile.userStatus ?? (language === 'ar' ? 'ØºÙŠØ± Ù…Ø­Ø¯Ø¯' : 'Not set')}</strong>
        </span>
      </div>
    </aside>
  );
}




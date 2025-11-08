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
    label: { ar: 'قيد المعالجة', en: 'Pending' },
    color: '#F59E0B',
  },
  in_review: {
    label: { ar: 'قيد المراجعة', en: 'In review' },
    color: '#3B82F6',
  },
  approved: {
    label: { ar: 'معتمد', en: 'Approved' },
    color: '#10B981',
  },
  rejected: {
    label: { ar: 'مرفوض', en: 'Rejected' },
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
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
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
            color: '#111418',
          }}
        >
          {profile.fullName || profile.email || getMessage('pageTitle', language)}
        </h2>
        {profile.email && (
          <p
            style={{
              margin: '0.25rem 0 0',
              color: '#6B7280',
            }}
          >
            {profile.email}
          </p>
        )}
        {profile.phone && (
          <p
            style={{
              margin: '0.15rem 0 0',
              color: '#6B7280',
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
            color: '#1F2937',
            fontWeight: 500,
          }}
        >
          ⚖️{' '}
          {profile.riskProfile
            ? profile.riskProfile === 'conservative'
              ? language === 'ar'
                ? 'حذر'
                : 'Conservative'
              : profile.riskProfile === 'balanced'
              ? language === 'ar'
                ? 'متوازن'
                : 'Balanced'
              : language === 'ar'
              ? 'مغامر'
              : 'Aggressive'
            : language === 'ar'
            ? 'لم يتم تحديد مستوى المخاطر'
            : 'Risk profile not set'}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.95rem',
            color: '#1F2937',
            fontWeight: 500,
          }}
        >
          🌍 {profile.nationality || (language === 'ar' ? 'غير محدد' : 'Not set')}
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
            color: '#111418',
            fontSize: '0.95rem',
          }}
        >
          🛡️ {getMessage('fields.kycStatus', language)}
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
          color: '#6B7280',
        }}
      >
        <span>
          {language === 'ar'
            ? 'عضو منذ'
            : 'Member since'}{' '}
          {profile.userCreatedAt
            ? new Date(profile.userCreatedAt).toLocaleDateString(
                language === 'ar' ? 'ar-SA' : 'en-US',
                {
                  month: 'short',
                  year: 'numeric',
                }
              )
            : '—'}
        </span>
        <span>
          {language === 'ar'
            ? 'الحالة الحالية'
            : 'Account status'}{' '}
          <strong>{profile.userStatus ?? (language === 'ar' ? 'غير محدد' : 'Not set')}</strong>
        </span>
      </div>
    </aside>
  );
}


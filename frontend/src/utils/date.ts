import type { InvestorLanguage } from '../types/investor';

export function formatInvestorDateTime(
  value: string | null | undefined,
  language: InvestorLanguage
): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const locale = language === 'ar' ? 'ar-SA' : 'en-US';

  return date.toLocaleString(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}



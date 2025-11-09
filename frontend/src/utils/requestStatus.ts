import type { RequestStatus } from '../types/request';

type StatusMeta = {
  label: {
    en: string;
    ar: string;
  };
  color: string;
  progress: number;
};

export const REQUEST_STATUSES: RequestStatus[] = [
  'draft',
  'submitted',
  'screening',
  'pending_info',
  'compliance_review',
  'approved',
  'rejected',
  'settling',
  'completed',
];

const STATUS_META: Record<RequestStatus, StatusMeta> = {
  draft: {
    label: { en: 'Draft', ar: 'Ù…Ø³ÙˆØ¯Ø©' },
    color: 'var(--color-text-secondary)',
    progress: 10,
  },
  submitted: {
    label: { en: 'Submitted', ar: 'Ù…ÙØ±Ø³ÙŽÙ„' },
    color: 'var(--color-brand-primary-strong)',
    progress: 25,
  },
  screening: {
    label: { en: 'Screening', ar: 'ØªØµÙÙŠØ© Ø£ÙˆÙ„ÙŠØ©' },
    color: 'var(--color-brand-primary-muted)',
    progress: 40,
  },
  pending_info: {
    label: { en: 'Pending Info', ar: 'Ø¨Ø§Ù†ØªØ¸Ø§Ø± Ù…Ø¹Ù„ÙˆÙ…Ø§Øª' },
    color: '#F59E0B',
    progress: 50,
  },
  compliance_review: {
    label: { en: 'Compliance Review', ar: 'Ù…Ø±Ø§Ø¬Ø¹Ø© Ø§Ù„ØªØ²Ø§Ù…' },
    color: '#7C3AED',
    progress: 65,
  },
  approved: {
    label: { en: 'Approved', ar: 'Ù…ÙˆØ§ÙÙŽÙ‚' },
    color: '#16A34A',
    progress: 80,
  },
  settling: {
    label: { en: 'Settling', ar: 'ØªØ³ÙˆÙŠØ©' },
    color: '#0D9488',
    progress: 90,
  },
  completed: {
    label: { en: 'Completed', ar: 'Ù…ÙƒØªÙ…Ù„' },
    color: 'var(--color-brand-accent-deep)',
    progress: 100,
  },
  rejected: {
    label: { en: 'Rejected', ar: 'Ù…Ø±ÙÙˆØ¶' },
    color: '#DC2626',
    progress: 100,
  },
};

export function getStatusMeta(status: RequestStatus): StatusMeta {
  return STATUS_META[status] ?? STATUS_META.draft;
}

export function getStatusLabel(status: RequestStatus, language: 'ar' | 'en') {
  const meta = getStatusMeta(status);
  return meta.label[language] ?? meta.label.en;
}

export function getStatusColor(status: RequestStatus) {
  return getStatusMeta(status).color;
}

export function getStatusProgress(status: RequestStatus) {
  return getStatusMeta(status).progress;
}



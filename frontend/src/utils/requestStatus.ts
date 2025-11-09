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
    label: { en: 'Draft', ar: 'مسودة' },
    color: 'var(--color-text-secondary)',
    progress: 10,
  },
  submitted: {
    label: { en: 'Submitted', ar: 'مرسل' },
    color: 'var(--color-brand-primary-strong)',
    progress: 25,
  },
  screening: {
    label: { en: 'Screening', ar: 'تصفية أولية' },
    color: 'var(--color-brand-primary-muted)',
    progress: 40,
  },
  pending_info: {
    label: { en: 'Pending Info', ar: 'بانتظار معلومات' },
    color: '#F59E0B',
    progress: 50,
  },
  compliance_review: {
    label: { en: 'Compliance Review', ar: 'مراجعة التزام' },
    color: '#7C3AED',
    progress: 65,
  },
  approved: {
    label: { en: 'Approved', ar: 'موافق' },
    color: '#16A34A',
    progress: 80,
  },
  settling: {
    label: { en: 'Settling', ar: 'قيد التسوية' },
    color: '#0D9488',
    progress: 90,
  },
  completed: {
    label: { en: 'Completed', ar: 'مكتمل' },
    color: 'var(--color-brand-accent-deep)',
    progress: 100,
  },
  rejected: {
    label: { en: 'Rejected', ar: 'مرفوض' },
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



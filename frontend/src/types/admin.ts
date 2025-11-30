import type { RequestStatus, RequestType, RequestCurrency } from './request';

export interface AdminRequestInvestor {
  id: string | null;
  email: string | null;
  phone: string | null;
  phoneCc: string | null;
  fullName: string | null;
  preferredName: string | null;
  language: 'ar' | 'en' | null;
  idType: string | null;
  idNumber: string | null;
  idExpiry: string | null;
  nationality: string | null;
  residencyCountry: string | null;
  city: string | null;
  kycStatus: string | null;
  kycUpdatedAt: string | null;
  riskProfile: string | null;
  communicationPreferences: Record<string, boolean> | null;
  kycDocuments: unknown;
  profileCreatedAt: string | null;
  profileUpdatedAt: string | null;
  userStatus: string | null;
  userCreatedAt: string | null;
}

export interface AdminRequest {
  id: string;
  requestNumber: string;
  status: RequestStatus;
  type: RequestType;
  amount: number | null;
  currency: RequestCurrency | null;
  targetPrice: number | null | undefined;
  expiryAt: string | null | undefined;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  investor: AdminRequestInvestor;
}

export interface AdminRequestListMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
}

export interface AdminRequestListResponse {
  requests: AdminRequest[];
  meta: AdminRequestListMeta;
}

export interface AdminAttachment {
  id: string;
  filename: string;
  mimeType: string | null;
  size: number | null;
  storageKey: string;
  createdAt: string;
  category: string;
  metadata: Record<string, unknown>;
  downloadUrl: string | null;
}

export interface AdminRequestEvent {
  id: string;
  fromStatus: string | null;
  toStatus: string | null;
  actorId: string | null;
  note: string | null;
  createdAt: string;
}

export interface AdminRequestCommentActor {
  id: string | null;
  email: string | null;
  fullName: string | null;
  preferredName: string | null;
  language: 'ar' | 'en' | null;
}

export interface AdminRequestComment {
  id: string;
  note: string;
  createdAt: string;
  actor: AdminRequestCommentActor | null;
}

export interface AdminRequestSettlement {
  startedAt: string | null;
  completedAt: string | null;
  reference: string | null;
  notes: string | null;
}

export interface AdminRequestDetail {
  request: AdminRequest & {
    userId: string;
    notes: string | null;
    settlement?: AdminRequestSettlement;
  };
  attachments: AdminAttachment[];
  events: AdminRequestEvent[];
  comments: AdminRequestComment[];
}

export type AdminRequestSortField = 'created_at' | 'amount' | 'status';
export type AdminRequestSortOrder = 'asc' | 'desc';
export type RequestCategory = 'all' | 'financial' | 'non-financial';

// Helper functions to categorize requests
export function isFinancialRequest(type: RequestType): boolean {
  return type === 'buy' || type === 'sell';
}

export function isNonFinancialRequest(type: RequestType): boolean {
  return type === 'partnership' || type === 'board_nomination' || type === 'feedback';
}

export function getRequestCategory(type: RequestType): 'financial' | 'non-financial' {
  return isFinancialRequest(type) ? 'financial' : 'non-financial';
}

export interface AdminRequestFilters {
  page?: number;
  status?: RequestStatus | 'all';
  type?: RequestType | 'all';
  category?: RequestCategory; // Filter by request category (financial/non-financial)
  isNew?: boolean; // Filter for new requests (unread by any admin)
  minAmount?: number | null;
  maxAmount?: number | null;
  createdFrom?: string | null;
  createdTo?: string | null;
  search?: string;
  sortBy?: AdminRequestSortField;
  order?: AdminRequestSortOrder;
}



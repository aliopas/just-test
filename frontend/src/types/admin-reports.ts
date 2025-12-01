import type { RequestStatus, RequestType } from './request';

export interface AdminRequestReportFilters {
  from?: string;
  to?: string;
  status?: RequestStatus[] | 'all';
  // Support all request types (financial and non-financial)
  type?: RequestType | 'all';
  minAmount?: number;
  maxAmount?: number;
}

export interface AdminRequestReportItem {
  id: string;
  requestNumber: string;
  status: RequestStatus | string;
  type: RequestType | string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  investorEmail: string | null;
  investorName: string | null;
}

export interface AdminRequestReportResponse {
  format: 'json';
  requests: AdminRequestReportItem[];
  generatedAt: string;
}


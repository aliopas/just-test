import type { RequestStatus } from './request';

export interface AdminRequestReportFilters {
  from?: string;
  to?: string;
  status?: RequestStatus[] | 'all';
  type?: 'buy' | 'sell' | 'all';
  minAmount?: number;
  maxAmount?: number;
}

export interface AdminRequestReportItem {
  id: string;
  requestNumber: string;
  status: RequestStatus | string;
  type: 'buy' | 'sell';
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


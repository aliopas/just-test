import type { RequestStatus } from './request';

export interface DashboardRequestSummary {
  total: number;
  byStatus: Record<RequestStatus, number>;
}

export interface DashboardRecentRequest {
  id: string;
  requestNumber: string;
  status: RequestStatus;
  amount: number;
  currency: string;
  createdAt: string;
}

export interface DashboardPendingItem {
  id: string;
  requestNumber: string;
  updatedAt: string;
}

export interface InvestorDashboardResponse {
  requestSummary: DashboardRequestSummary;
  recentRequests: DashboardRecentRequest[];
  pendingActions: {
    pendingInfoCount: number;
    items: DashboardPendingItem[];
  };
  unreadNotifications: number;
  generatedAt: string;
}


import type { RequestStatus, RequestType } from './request';

export interface DashboardRequestSummary {
  total: number;
  byStatus: Record<RequestStatus, number>;
}

export interface DashboardRecentRequest {
  id: string;
  requestNumber: string;
  type: RequestType;
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
  insights: {
    averageAmountByType: Record<RequestType, number>;
    rolling30DayVolume: number;
    lastRequest: {
      id: string;
      requestNumber: string;
      type: RequestType;
      status: RequestStatus;
      amount: number;
      currency: string;
      createdAt: string;
    } | null;
  };
}


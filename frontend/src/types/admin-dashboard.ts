export interface AdminDashboardSummary {
  totalRequests: number;
  byStatus: Record<string, number>;
  averageProcessingHours: number | null;
  medianProcessingHours: number | null;
}

export interface AdminDashboardTrendPoint {
  day: string;
  count: number;
}

export interface AdminDashboardStuckItem {
  id: string;
  requestNumber: string;
  status: string;
  investorEmail: string | null;
  ageHours: number;
  updatedAt: string;
}

export interface AdminDashboardKpiProcessingHours {
  average: number | null;
  median: number | null;
  p90: number | null;
}

export interface AdminDashboardKpiPendingInfo {
  total: number;
  overdue: number;
  thresholdHours: number;
  rate: number;
  alert: boolean;
}

export interface AdminDashboardKpiAttachmentSuccess {
  totalRequests: number;
  withAttachments: number;
  rate: number | null;
  alert: boolean;
}

export interface AdminDashboardKpiNotificationFailures {
  total: number;
  failed: number;
  rate: number | null;
  windowDays: number;
  alert: boolean;
}

export interface AdminDashboardKpis {
  processingHours: AdminDashboardKpiProcessingHours;
  pendingInfoAging: AdminDashboardKpiPendingInfo;
  attachmentSuccess: AdminDashboardKpiAttachmentSuccess;
  notificationFailures: AdminDashboardKpiNotificationFailures;
}

export interface AdminDashboardStats {
  summary: AdminDashboardSummary;
  trend: AdminDashboardTrendPoint[];
  stuckRequests: AdminDashboardStuckItem[];
  kpis: AdminDashboardKpis;
}


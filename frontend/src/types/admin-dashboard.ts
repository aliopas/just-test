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

export interface AdminDashboardStats {
  summary: AdminDashboardSummary;
  trend: AdminDashboardTrendPoint[];
  stuckRequests: AdminDashboardStuckItem[];
}


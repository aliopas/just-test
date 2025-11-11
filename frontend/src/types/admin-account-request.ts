export type AdminSignupRequestStatus = 'pending' | 'approved' | 'rejected';

export type AdminSignupRequest = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  requestedRole: string;
  status: AdminSignupRequestStatus;
  createdAt: string;
  updatedAt: string;
  reviewerId: string | null;
  reviewedAt: string | null;
  decisionNote: string | null;
  approvedUserId: string | null;
  payload: Record<string, unknown>;
};

export type AdminSignupRequestFilters = {
  status?: AdminSignupRequestStatus | 'all';
  search?: string;
  page?: number;
};

export type AdminSignupRequestListResponse = {
  requests: AdminSignupRequest[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pageCount: number;
    hasNext: boolean;
  };
};

export type ApproveSignupRequestPayload = {
  id: string;
  note?: string;
  sendInvite?: boolean;
  locale?: 'ar' | 'en';
};

export type RejectSignupRequestPayload = {
  id: string;
  note?: string;
};


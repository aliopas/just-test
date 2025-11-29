import type {
  NotificationChannel,
  NotificationType,
} from './notification';

export type RequestType = 'buy' | 'sell' | 'partnership' | 'board_nomination' | 'feedback';
export type RequestCurrency = 'SAR' | 'USD' | 'EUR';
export type RequestStatus =
  | 'draft'
  | 'submitted'
  | 'screening'
  | 'pending_info'
  | 'compliance_review'
  | 'approved'
  | 'rejected'
  | 'settling'
  | 'completed';

export interface CreateRequestPayload {
  type: RequestType;
  amount?: number | null;
  currency?: RequestCurrency | null;
  targetPrice?: number | null;
  expiryAt?: string | null;
  notes?: string | null;
  documents?: File[];
}

export interface CreateRequestResponse {
  requestId: string;
  requestNumber: string;
  status: string;
}

export interface RequestEventSnapshot {
  id: string | null;
  fromStatus: RequestStatus | null | string;
  toStatus: RequestStatus | null | string;
  actorId: string | null;
  note: string | null;
  createdAt: string | null;
}

export interface InvestorRequest {
  id: string;
  requestNumber: string;
  type: RequestType;
  amount: number | null;
  currency: RequestCurrency | null;
  targetPrice: number | null | undefined;
  expiryAt: string | null | undefined;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  lastEvent: RequestEventSnapshot | null;
  notes?: string | null;
}

export interface RequestListMeta {
  page: number;
  limit: number;
  total: number;
  pageCount: number;
  hasNext: boolean;
}

export interface RequestListResponse {
  requests: InvestorRequest[];
  meta: RequestListMeta;
}

export interface RequestListFilters {
  page?: number;
  status?: RequestStatus | 'all';
  type?: RequestType | 'all';
}

export interface RequestAttachment {
  id: string;
  filename: string;
  mimeType: string | null;
  size: number | null;
  createdAt: string;
  storageKey: string;
  downloadUrl: string | null;
}

export interface RequestEvent {
  id: string;
  fromStatus: string | null;
  toStatus: string | null;
  actorId: string | null;
  note: string | null;
  createdAt: string;
}

export interface RequestComment {
  id: string;
  note: string;
  createdAt: string;
}

export interface InvestorRequestDetail {
  request: InvestorRequest & { notes: string | null };
  attachments: RequestAttachment[];
  events: RequestEvent[];
  comments: RequestComment[];
}

export type RequestTimelineEntryType =
  | 'notification'
  | 'status_change'
  | 'comment';

export type TimelineVisibility = 'investor' | 'admin';

export interface RequestTimelineActor {
  id: string | null;
  email: string | null;
  name: string | null;
}

export interface RequestTimelineEntry {
  id: string;
  entryType: RequestTimelineEntryType;
  createdAt: string;
  visibility: TimelineVisibility;
  actor: RequestTimelineActor | null;
  notification?: {
    type: NotificationType;
    channel: NotificationChannel;
    payload: Record<string, unknown>;
    readAt: string | null;
    stateRead: boolean;
    userId: string;
  };
  event?: {
    fromStatus: string | null;
    toStatus: string | null;
    note: string | null;
  };
  comment?: {
    comment: string;
  };
}

export interface RequestTimelineResponse {
  requestId: string;
  requestNumber: string;
  items: RequestTimelineEntry[];
}



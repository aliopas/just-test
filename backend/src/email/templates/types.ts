export type EmailLanguage = 'en' | 'ar';

export type NotificationEmailTemplateId =
  | 'request_submitted'
  | 'request_pending_info'
  | 'request_approved'
  | 'request_rejected'
  | 'request_settling'
  | 'request_completed'
  | 'admin_request_submitted'
  | 'admin_request_pending_info'
  | 'admin_request_decision'
  | 'admin_request_settling'
  | 'admin_request_completed';

export interface TemplateBaseContext {
  userName: string;
  requestNumber: string;
  requestLink: string;
  supportEmail?: string;
}

export interface RequestSubmittedContext extends TemplateBaseContext {
  submittedAt: string;
}

export interface RequestPendingInfoContext extends TemplateBaseContext {
  infoMessage: string;
}

export interface RequestApprovedContext extends TemplateBaseContext {
  approvedAmount?: number;
  currency?: string;
  settlementEta?: string;
}

export interface RequestRejectedContext extends TemplateBaseContext {
  rejectionReason?: string;
}

export interface RequestSettlingContext extends TemplateBaseContext {
  settlementReference?: string;
  expectedCompletion?: string;
}

export interface RequestCompletedContext extends TemplateBaseContext {
  settlementReference?: string;
  completedAt: string;
}

export interface AdminTemplateBaseContext {
  recipientName: string;
  requestNumber: string;
  investorName: string;
  requestType: string;
  amount?: number;
  currency?: string;
  requestLink: string;
  supportEmail?: string;
}

export interface AdminRequestSubmittedContext extends AdminTemplateBaseContext {
  submittedAt: string;
}

export interface AdminRequestPendingInfoContext
  extends AdminTemplateBaseContext {
  infoMessage: string;
  previousStatus: string;
}

export interface AdminRequestDecisionContext extends AdminTemplateBaseContext {
  decision: 'approved' | 'rejected';
  note?: string | null;
  actorName?: string;
}

export interface AdminRequestSettlingContext extends AdminTemplateBaseContext {
  settlementReference?: string | null;
  startedAt: string;
}

export interface AdminRequestCompletedContext extends AdminTemplateBaseContext {
  settlementReference?: string | null;
  completedAt: string;
}

export type TemplateContextMap = {
  request_submitted: RequestSubmittedContext;
  request_pending_info: RequestPendingInfoContext;
  request_approved: RequestApprovedContext;
  request_rejected: RequestRejectedContext;
  request_settling: RequestSettlingContext;
  request_completed: RequestCompletedContext;
  admin_request_submitted: AdminRequestSubmittedContext;
  admin_request_pending_info: AdminRequestPendingInfoContext;
  admin_request_decision: AdminRequestDecisionContext;
  admin_request_settling: AdminRequestSettlingContext;
  admin_request_completed: AdminRequestCompletedContext;
};

export type TemplateContext<TTemplate extends NotificationEmailTemplateId> =
  TemplateContextMap[TTemplate];

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

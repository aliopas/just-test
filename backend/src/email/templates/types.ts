export type EmailLanguage = 'en' | 'ar';

export type NotificationEmailTemplateId =
  | 'request_submitted'
  | 'request_pending_info'
  | 'request_approved'
  | 'request_rejected'
  | 'request_settling'
  | 'request_completed';

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
  approvedAmount: number;
  currency: string;
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

export type TemplateContextMap = {
  request_submitted: RequestSubmittedContext;
  request_pending_info: RequestPendingInfoContext;
  request_approved: RequestApprovedContext;
  request_rejected: RequestRejectedContext;
  request_settling: RequestSettlingContext;
  request_completed: RequestCompletedContext;
};

export type TemplateContext<TTemplate extends NotificationEmailTemplateId> =
  TemplateContextMap[TTemplate];

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}


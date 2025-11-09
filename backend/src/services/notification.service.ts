type InvestorSubmissionNotification = {
  userId: string;
  requestId: string;
  requestNumber: string;
};

type AdminSubmissionNotification = {
  requestId: string;
  requestNumber: string;
};

export async function notifyInvestorOfSubmission(
  payload: InvestorSubmissionNotification
) {
  void payload;
  return Promise.resolve();
}

export async function notifyAdminsOfSubmission(
  payload: AdminSubmissionNotification
) {
  void payload;
  return Promise.resolve();
}

type InvestorDecisionNotification = InvestorSubmissionNotification & {
  decision: 'approved' | 'rejected';
};

export async function notifyInvestorOfDecision(
  payload: InvestorDecisionNotification
) {
  void payload;
  return Promise.resolve();
}

type InvestorInfoRequestNotification = InvestorSubmissionNotification & {
  message: string;
};

export async function notifyInvestorOfInfoRequest(
  payload: InvestorInfoRequestNotification
) {
  void payload;
  return Promise.resolve();
}

type InvestorSettlementNotification = InvestorSubmissionNotification & {
  stage: 'started' | 'completed';
  reference?: string | null;
};

export async function notifyInvestorOfSettlement(
  payload: InvestorSettlementNotification
) {
  void payload;
  return Promise.resolve();
}

type NewsPublishNotification = {
  newsId: string;
  title: string;
  slug: string;
  publishedAt: string;
};

export async function notifyInvestorsOfPublishedNews(
  payload: NewsPublishNotification
) {
  void payload;
  return Promise.resolve();
}

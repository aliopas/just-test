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

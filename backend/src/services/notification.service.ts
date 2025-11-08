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
  console.info(
    '[notifications] Investor submission queued',
    JSON.stringify(payload)
  );
}

export async function notifyAdminsOfSubmission(
  payload: AdminSubmissionNotification
) {
  console.info(
    '[notifications] Admin submission queued',
    JSON.stringify(payload)
  );
}


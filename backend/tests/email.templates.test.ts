import {
  renderNotificationEmailTemplate,
  type NotificationEmailTemplateId,
} from '../src/email/templates';

const baseContext = {
  userName: 'Sarah',
  requestNumber: 'REQ-2024-001',
  requestLink: 'https://app.bakurah.com/requests/REQ-2024-001',
  supportEmail: 'care@bakurah.com',
};

const adminBaseContext = {
  recipientName: 'Ops Team',
  requestNumber: 'REQ-2024-001',
  investorName: 'Sarah Nasser',
  requestType: 'buy',
  amount: 50000,
  currency: 'SAR',
  requestLink: 'https://admin.bakurah.com/requests/REQ-2024-001',
  supportEmail: 'ops@bakurah.com',
};

const templateContexts: Record<NotificationEmailTemplateId, any> = {
  request_submitted: {
    ...baseContext,
    submittedAt: '2025-11-08T12:00:00Z',
  },
  request_pending_info: {
    ...baseContext,
    infoMessage: 'Please upload the latest financial statements.',
  },
  request_approved: {
    ...baseContext,
    approvedAmount: 50000,
    currency: 'SAR',
    settlementEta: '2025-11-15T00:00:00Z',
  },
  request_rejected: {
    ...baseContext,
    rejectionReason: 'The investment criteria were not met.',
  },
  request_settling: {
    ...baseContext,
    settlementReference: 'STL-778899',
    expectedCompletion: '2025-11-20T00:00:00Z',
  },
  request_completed: {
    ...baseContext,
    settlementReference: 'STL-778899',
    completedAt: '2025-11-21T12:00:00Z',
  },
  admin_request_submitted: {
    ...adminBaseContext,
    submittedAt: '2025-11-08T12:00:00Z',
  },
  admin_request_pending_info: {
    ...adminBaseContext,
    infoMessage: 'Investor was asked to upload updated KYC documents.',
    previousStatus: 'screening',
  },
  admin_request_decision: {
    ...adminBaseContext,
    decision: 'approved',
    note: 'All compliance checks passed.',
    actorName: 'Amal Alharbi',
  },
  admin_request_settling: {
    ...adminBaseContext,
    settlementReference: 'STL-889900',
    startedAt: '2025-11-22T09:30:00Z',
  },
  admin_request_completed: {
    ...adminBaseContext,
    settlementReference: 'STL-889900',
    completedAt: '2025-11-24T15:10:00Z',
  },
};

describe('notification email templates', () => {
  const templateIds = Object.keys(templateContexts) as NotificationEmailTemplateId[];

  it.each(templateIds)('renders %s template in both languages', (templateId) => {
    const context = templateContexts[templateId];
    const english = renderNotificationEmailTemplate(templateId, 'en', context);
    const arabic = renderNotificationEmailTemplate(templateId, 'ar', context);

    expect(english.subject).toBeTruthy();
    expect(arabic.subject).toBeTruthy();

    expect(english.html).toContain('<html');
    expect(arabic.html).toContain('dir="rtl"');

    expect(english.text).toContain(baseContext.requestNumber);
    expect(arabic.text).toContain(baseContext.requestNumber);

    const expectedSupport = context.supportEmail ?? 'support@bakurah.com';
    expect(english.html).toContain(expectedSupport);
    expect(arabic.html).toContain(expectedSupport ?? '');
  });

  it('falls back to default support email', () => {
    const context = {
      userName: 'Omar',
      requestNumber: 'REQ-2024-777',
      requestLink: '#',
      submittedAt: '2025-11-08T12:00:00Z',
    };

    const email = renderNotificationEmailTemplate('request_submitted', 'en', context);
    expect(email.html).toContain('support@bakurah.com');
  });
});


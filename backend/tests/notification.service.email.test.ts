import {
  notifyInvestorOfSubmission,
  notifyInvestorOfDecision,
  notifyInvestorOfInfoRequest,
  notifyInvestorOfSettlement,
} from '../src/services/notification.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';
import { enqueueEmailNotification } from '../src/services/email-dispatch.service';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

jest.mock('../src/services/email-dispatch.service', () => ({
  enqueueEmailNotification: jest.fn(),
}));

describe('notification.service investor emails', () => {
  const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;
  const mockEnqueue = enqueueEmailNotification as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    const investorProfileMaybeSingleMock = jest.fn().mockResolvedValue({
      data: {
        full_name: 'Sara Nasser',
        preferred_name: 'Sara',
        language: 'ar',
      },
      error: null,
    });

    const investorProfileEqMock = jest.fn().mockReturnValue({
      maybeSingle: investorProfileMaybeSingleMock,
    });

    const investorProfileSelectMock = jest.fn().mockReturnValue({
      eq: investorProfileEqMock,
    });

    const notificationsSingleMock = jest.fn().mockResolvedValue({
      data: { id: 'notif-1' },
      error: null,
    });

    const notificationsInsertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: notificationsSingleMock,
      }),
    });

    const requestsMaybeSingleFactory = (requestId: string) =>
      jest.fn().mockResolvedValue({
        data: {
          id: requestId,
          request_number: `INV-${requestId.toUpperCase()}`,
          type: 'buy',
          amount: 50000,
          currency: 'SAR',
          status: 'submitted',
          created_at: '2025-11-08T12:00:00Z',
          user_id: 'user-1',
        },
        error: null,
      });

    const requestsSelectMock = jest.fn().mockReturnValue({
      eq: jest.fn((_column: string, value: string) => ({
        maybeSingle: requestsMaybeSingleFactory(value),
      })),
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      auth: {
        admin: {
          getUserById: jest.fn().mockResolvedValue({
            data: {
              user: {
                id: 'user-1',
                email: 'sara@example.com',
                user_metadata: {
                  full_name: 'Sara N.',
                  language: 'ar',
                },
              },
            },
            error: null,
          }),
          getUserByEmail: jest.fn().mockResolvedValue({
            data: {
              user: {
                id: 'admin-1',
                email: 'ops@example.com',
                user_metadata: {
                  full_name: 'Ops Team',
                  language: 'en',
                },
              },
            },
            error: null,
          }),
        },
      },
      from: jest.fn((table: string) => {
        if (table === 'investor_profiles') {
          return {
            select: investorProfileSelectMock,
          };
        }
        if (table === 'notifications') {
          return {
            insert: notificationsInsertMock,
          };
        }
        if (table === 'requests') {
          return {
            select: requestsSelectMock,
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
    });
  });

  afterEach(() => {
    delete process.env.ADMIN_NOTIFICATION_EMAILS;
  });

  it('queues submission email with localized context', async () => {
    await notifyInvestorOfSubmission({
      userId: 'user-1',
      requestId: 'req-1',
      requestNumber: 'INV-2025-000010',
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'request_submitted',
        language: 'ar',
        recipientEmail: 'sara@example.com',
        context: expect.objectContaining({
          userName: 'Sara',
          requestNumber: 'INV-2025-000010',
        }),
      })
    );
  });

  it('queues rejection email with note when provided', async () => {
    await notifyInvestorOfDecision({
      userId: 'user-1',
      requestId: 'req-2',
      requestNumber: 'INV-2025-000011',
      decision: 'rejected',
      note: 'Documentation missing',
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'request_rejected',
        context: expect.objectContaining({
          rejectionReason: 'Documentation missing',
        }),
      })
    );
  });

  it('queues info request email with message body', async () => {
    await notifyInvestorOfInfoRequest({
      userId: 'user-1',
      requestId: 'req-3',
      requestNumber: 'INV-2025-000012',
      message: 'Please upload updated bank statements.',
      previousStatus: 'screening',
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'request_pending_info',
        context: expect.objectContaining({
          infoMessage: 'Please upload updated bank statements.',
        }),
      })
    );
  });

  it('queues settlement completion email', async () => {
    await notifyInvestorOfSettlement({
      userId: 'user-1',
      requestId: 'req-4',
      requestNumber: 'INV-2025-000013',
      stage: 'completed',
      reference: 'STL-123',
    });

    expect(mockEnqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        templateId: 'request_completed',
        context: expect.objectContaining({
          settlementReference: 'STL-123',
        }),
      })
    );
  });
});


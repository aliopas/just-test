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

    const maybeSingleMock = jest.fn().mockResolvedValue({
      data: {
        full_name: 'Sara Nasser',
        preferred_name: 'Sara',
        language: 'ar',
      },
      error: null,
    });

    const eqMock = jest.fn().mockReturnValue({
      maybeSingle: maybeSingleMock,
    });

    const selectMock = jest.fn().mockReturnValue({
      eq: eqMock,
    });

    const singleMock = jest.fn().mockResolvedValue({
      data: { id: 'notif-1' },
      error: null,
    });

    const notificationsInsertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: singleMock,
      }),
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
        },
      },
      from: jest.fn((table: string) => {
        if (table === 'investor_profiles') {
          return {
            select: selectMock,
          };
        }
        if (table === 'notifications') {
          return {
            insert: notificationsInsertMock,
          };
        }
        throw new Error(`Unexpected table: ${table}`);
      }),
    });
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


import { submitInvestorRequest } from '../src/services/request.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';
import { transitionRequestStatus } from '../src/services/request-state.service';
import {
  notifyAdminsOfSubmission,
  notifyInvestorOfSubmission,
} from '../src/services/notification.service';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

jest.mock('../src/services/request-state.service', () => ({
  transitionRequestStatus: jest.fn(),
}));

jest.mock('../src/services/notification.service', () => ({
  notifyInvestorOfSubmission: jest.fn(),
  notifyAdminsOfSubmission: jest.fn(),
}));

type QueryResult = {
  data?: unknown;
  error: { message: string } | null;
  count?: number | null;
};

type QueryHandler = (value: unknown, options?: unknown) => Promise<QueryResult>;

const handlers: Record<string, QueryHandler> = {};

const mockClient = {
  from: jest.fn((table: string) => ({
    select: jest.fn((_columns: string, options?: unknown) => ({
      eq: jest.fn(async (_column: string, value: unknown) => {
        const handler = handlers[table];
        if (!handler) {
          return {
            data: null,
            error: { message: `Unhandled table: ${table}` },
          };
        }
        return handler(value, options);
      }),
    })),
  })),
};

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;
const mockTransition = transitionRequestStatus as jest.Mock;
const mockNotifyInvestor = notifyInvestorOfSubmission as jest.Mock;
const mockNotifyAdmins = notifyAdminsOfSubmission as jest.Mock;

describe('submitInvestorRequest', () => {
  beforeAll(() => {
    mockRequireSupabaseAdmin.mockReturnValue(mockClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        status: 'draft',
        user_id: 'user-1',
        request_number: 'INV-2025-000001',
      },
      error: null,
    });
    handlers.attachments = async () => ({
      data: null,
      error: null,
      count: 1,
    });
    mockTransition.mockResolvedValue({
      request: { id: 'req-1', status: 'submitted' },
      event: { id: 'event-1' },
    });
  });

  it('throws when request not found', async () => {
    handlers.requests = async () => ({
      data: null,
      error: { message: 'Not found' },
    });

    await expect(
      submitInvestorRequest({
        requestId: 'missing',
        userId: 'user-1',
      })
    ).rejects.toThrow('REQUEST_NOT_FOUND');
  });

  it('throws when request does not belong to user', async () => {
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        status: 'draft',
        user_id: 'user-99',
        request_number: 'INV-2025-000001',
      },
      error: null,
    });

    await expect(
      submitInvestorRequest({
        requestId: 'req-1',
        userId: 'user-1',
      })
    ).rejects.toThrow('REQUEST_NOT_OWNED');
  });

  it('throws when request is not in draft status', async () => {
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        status: 'submitted',
        user_id: 'user-1',
        request_number: 'INV-2025-000001',
      },
      error: null,
    });

    await expect(
      submitInvestorRequest({
        requestId: 'req-1',
        userId: 'user-1',
      })
    ).rejects.toThrow('REQUEST_NOT_DRAFT');
  });

  it('throws when attachments are missing', async () => {
    handlers.attachments = async () => ({
      data: null,
      error: null,
      count: 0,
    });

    await expect(
      submitInvestorRequest({
        requestId: 'req-1',
        userId: 'user-1',
      })
    ).rejects.toThrow('ATTACHMENTS_REQUIRED');
  });

  it('transitions status and triggers notifications', async () => {
    const result = await submitInvestorRequest({
      requestId: 'req-1',
      userId: 'user-1',
    });

    expect(mockTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
        actorId: 'user-1',
        toStatus: 'submitted',
      })
    );
    expect(mockNotifyInvestor).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        requestId: 'req-1',
      })
    );
    expect(mockNotifyAdmins).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
      })
    );
    expect(result.status).toBe('submitted');
  });
});


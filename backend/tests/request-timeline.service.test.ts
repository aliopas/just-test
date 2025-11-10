import {
  getAdminRequestTimeline,
  getInvestorRequestTimeline,
} from '../src/services/request-timeline.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;

function createRequestsClient(requestRow: {
  id: string;
  user_id: string;
  request_number: string;
}) {
  return {
    from: jest.fn((table: string) => {
      if (table !== 'requests') {
        throw new Error(`Unexpected table lookup: ${table}`);
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({
              data: requestRow,
              error: null,
            }),
          }),
        }),
      };
    }),
  };
}

describe('request-timeline.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns investor timeline with notifications and events', async () => {
    const requestsClient = createRequestsClient({
      id: 'req-1',
      user_id: 'user-1',
      request_number: 'INV-001',
    });

    const notificationsBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'notif-1',
            type: 'request_submitted',
            channel: 'email',
            payload: { requestId: 'req-1' },
            read_at: null,
            created_at: '2025-01-01T10:00:00Z',
            user_id: 'user-1',
          },
        ],
        error: null,
      }),
    };

    const eventsBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'event-1',
            from_status: 'draft',
            to_status: 'submitted',
            actor_id: 'user-1',
            note: 'Submitted by investor',
            created_at: '2025-01-01T11:00:00Z',
            actor: [
              {
                id: 'user-1',
                email: 'investor@example.com',
                profile: [{ full_name: 'Investor Example', preferred_name: null }],
              },
            ],
          },
        ],
        error: null,
      }),
    };

    const mainClient = {
      from: jest.fn((table: string) => {
        if (table === 'notifications') {
          return notificationsBuilder;
        }
        if (table === 'request_events') {
          return eventsBuilder;
        }
        throw new Error(`Unexpected table query: ${table}`);
      }),
    };

    mockRequireSupabaseAdmin
      .mockImplementationOnce(() => mainClient)
      .mockImplementationOnce(() => requestsClient);

    const result = await getInvestorRequestTimeline({
      requestId: 'req-1',
      userId: 'user-1',
    });

    expect(result.requestId).toBe('req-1');
    expect(result.items).toHaveLength(2);
    expect(result.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          entryType: 'notification',
          visibility: 'investor',
        }),
        expect.objectContaining({
          entryType: 'status_change',
          event: expect.objectContaining({ toStatus: 'submitted' }),
        }),
      ])
    );
  });

  it('returns admin timeline with comments included', async () => {
    const requestsClient = createRequestsClient({
      id: 'req-1',
      user_id: 'user-1',
      request_number: 'INV-001',
    });

    const notificationsBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'notif-1',
            type: 'request_pending_info',
            channel: 'email',
            payload: { requestId: 'req-1', message: 'Need more info' },
            read_at: null,
            created_at: '2025-01-02T09:00:00Z',
            user_id: 'user-1',
          },
          {
            id: 'notif-2',
            type: 'request_pending_info',
            channel: 'email',
            payload: { requestId: 'req-1' },
            read_at: null,
            created_at: '2025-01-02T10:00:00Z',
            user_id: 'admin-1',
          },
        ],
        error: null,
      }),
    };

    const eventsBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    const commentsBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'comment-1',
            comment: 'Internal follow-up',
            actor_id: 'admin-1',
            created_at: '2025-01-02T11:00:00Z',
            actor: [
              {
                id: 'admin-1',
                email: 'admin@example.com',
                profile: [{ full_name: 'Admin User', preferred_name: 'Admin' }],
              },
            ],
          },
        ],
        error: null,
      }),
    };

    const mainClient = {
      from: jest.fn((table: string) => {
        if (table === 'notifications') {
          return notificationsBuilder;
        }
        if (table === 'request_events') {
          return eventsBuilder;
        }
        if (table === 'request_comments') {
          return commentsBuilder;
        }
        throw new Error(`Unexpected table query: ${table}`);
      }),
    };

    mockRequireSupabaseAdmin
      .mockImplementationOnce(() => mainClient)
      .mockImplementationOnce(() => requestsClient);

    const result = await getAdminRequestTimeline({
      requestId: 'req-1',
    });

    expect(result.items).toHaveLength(3);
    const commentEntry = result.items.find(item => item.entryType === 'comment');
    expect(commentEntry).toEqual(
      expect.objectContaining({
        visibility: 'admin',
        comment: expect.objectContaining({
          comment: 'Internal follow-up',
        }),
      })
    );
    const adminNotification = result.items.find(
      item => item.entryType === 'notification' && item.notification?.userId === 'admin-1'
    );
    expect(adminNotification).toBeDefined();
  });

  it('throws when investor does not own request', async () => {
    const requestsClient = createRequestsClient({
      id: 'req-1',
      user_id: 'owner-id',
      request_number: 'INV-001',
    });

    const noopClient = { from: jest.fn() };

    mockRequireSupabaseAdmin
      .mockImplementationOnce(() => noopClient)
      .mockImplementationOnce(() => requestsClient);

    await expect(
      getInvestorRequestTimeline({
        requestId: 'req-1',
        userId: 'user-1',
      })
    ).rejects.toThrow('REQUEST_NOT_OWNED');
  });
});


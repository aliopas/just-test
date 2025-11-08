import {
  listInvestorRequests,
  submitInvestorRequest,
  getInvestorRequestDetail,
} from '../src/services/request.service';
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

type QueryContext = {
  table: string;
  filters: Record<string, unknown>;
  options?: unknown;
  order?: { column: string; config?: unknown };
  range?: { from: number; to: number };
};

type QueryHandler = (context: QueryContext) => Promise<QueryResult>;

const handlers: Record<string, QueryHandler> = {};

function createQueryBuilder(table: string) {
  const context: QueryContext = {
    table,
    filters: {},
  };

  const execute = async () => {
    const handler = handlers[table];
    if (!handler) {
      return {
        data: null,
        error: { message: `Unhandled table: ${table}` },
        count: null,
      };
    }
    return handler(context);
  };

  const builder: any = {
    select: jest.fn((_columns: string, options?: unknown) => {
      context.options = options;
      return builder;
    }),
    eq: jest.fn((column: string, value: unknown) => {
      context.filters[column] = value;
      return builder;
    }),
    order: jest.fn((column: string, config?: unknown) => {
      context.order = { column, config };
      return builder;
    }),
    range: jest.fn((from: number, to: number) => {
      context.range = { from, to };
      return builder;
    }),
    single: jest.fn(async () => {
      const result = await execute();
      if (Array.isArray(result.data)) {
        return {
          data: result.data[0] ?? null,
          error: result.error ?? null,
        };
      }
      return result;
    }),
    then: (resolve: (value: QueryResult) => void, reject: (reason: unknown) => void) =>
      execute().then(resolve, reject),
  };

  return builder;
}

const mockClient: any = {
  from: jest.fn((table: string) => createQueryBuilder(table)),
  storage: {
    from: jest.fn(() => ({
      createSignedUrl: jest
        .fn()
        .mockResolvedValue({ data: { signedUrl: 'https://signed-url' }, error: null }),
    })),
  },
};

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;
const mockTransition = transitionRequestStatus as jest.Mock;
const mockNotifyInvestor = notifyInvestorOfSubmission as jest.Mock;
const mockNotifyAdmins = notifyAdminsOfSubmission as jest.Mock;

beforeAll(() => {
  mockRequireSupabaseAdmin.mockReturnValue(mockClient);
});

describe('submitInvestorRequest', () => {
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

describe('listInvestorRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers['v_request_workflow'] = async context => {
      if (context.filters.user_id !== 'user-1') {
        return {
          data: [],
          error: null,
          count: 0,
        };
      }

      const data = [
        {
          id: 'req-1',
          request_number: 'INV-2025-000001',
          type: 'buy',
          amount: '1500.00',
          currency: 'SAR',
          target_price: null,
          expiry_at: null,
          status: 'draft',
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
          last_event: null,
        },
      ];

      if (context.filters.status && context.filters.status !== 'draft') {
        return {
          data: [],
          error: null,
          count: 0,
        };
      }

      return {
        data,
        error: null,
        count: 1,
      };
    };
  });

  it('returns paginated requests', async () => {
    const result = await listInvestorRequests({
      userId: 'user-1',
      query: { page: 1, limit: 10 },
    });

    expect(result.requests).toHaveLength(1);
    expect(result.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
        total: 1,
        pageCount: 1,
        hasNext: false,
      })
    );
    expect(result.requests[0]).toEqual(
      expect.objectContaining({
        id: 'req-1',
        requestNumber: 'INV-2025-000001',
        status: 'draft',
      })
    );
  });

  it('applies status filter', async () => {
    const result = await listInvestorRequests({
      userId: 'user-1',
      query: { status: 'submitted' },
    });

    expect(result.requests).toHaveLength(0);
    expect(result.meta.total).toBe(0);
  });
});

describe('getInvestorRequestDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.requests = async context => {
      if (context.filters.id === 'missing') {
        return { data: null, error: { message: 'Not found' } };
      }
      return {
        data: [
          {
            id: 'req-1',
            request_number: 'INV-2025-000001',
            user_id: 'user-1',
            type: 'buy',
            amount: '2500.00',
            currency: 'SAR',
            target_price: null,
            expiry_at: null,
            status: 'draft',
            notes: 'Test note',
            created_at: '2025-01-01T00:00:00Z',
            updated_at: '2025-01-02T00:00:00Z',
          },
        ],
        error: null,
      };
    };
    handlers.attachments = async context => {
      if (context.filters.request_id !== 'req-1') {
        return { data: [], error: null };
      }
      return {
        data: [
          {
            id: 'att-1',
            filename: 'document.pdf',
            mime_type: 'application/pdf',
            size: 1024,
            storage_key: 'bucket/documents/document.pdf',
            created_at: '2025-01-01T01:00:00Z',
          },
        ],
        error: null,
      };
    };
    handlers.request_events = async context => {
      if (context.filters.request_id !== 'req-1') {
        return { data: [], error: null };
      }
      return {
        data: [
          {
            id: 'evt-1',
            from_status: null,
            to_status: 'draft',
            actor_id: 'user-1',
            note: 'Created request',
            created_at: '2025-01-01T00:00:00Z',
          },
        ],
        error: null,
      };
    };
  });

  it('throws when request not found', async () => {
    await expect(
      getInvestorRequestDetail({
        userId: 'user-1',
        requestId: 'missing',
      })
    ).rejects.toThrow('REQUEST_NOT_FOUND');
  });

  it('throws when request belongs to another user', async () => {
    handlers.requests = async () => ({
      data: [
        {
          id: 'req-1',
          request_number: 'INV-2025-000001',
          user_id: 'user-2',
          type: 'buy',
          amount: '2500.00',
          currency: 'SAR',
          target_price: null,
          expiry_at: null,
          status: 'draft',
          notes: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
        },
      ],
      error: null,
    });

    await expect(
      getInvestorRequestDetail({
        userId: 'user-1',
        requestId: 'req-1',
      })
    ).rejects.toThrow('REQUEST_NOT_OWNED');
  });

  it('returns detail with attachments and events', async () => {
    const result = await getInvestorRequestDetail({
      userId: 'user-1',
      requestId: 'req-1',
    });

    expect(result.request).toEqual(
      expect.objectContaining({
        id: 'req-1',
        requestNumber: 'INV-2025-000001',
        status: 'draft',
        notes: 'Test note',
      })
    );
    expect(result.attachments).toHaveLength(1);
    expect(result.attachments[0]).toEqual(
      expect.objectContaining({
        downloadUrl: 'https://signed-url',
      })
    );
    expect(result.events).toHaveLength(1);
    expect(result.comments).toHaveLength(1);
  });
});


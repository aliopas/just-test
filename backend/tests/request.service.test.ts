import {
  listInvestorRequests,
  submitInvestorRequest,
  getInvestorRequestDetail,
  createRequestAttachmentUploadUrl,
  createPartnershipRequest,
  createBoardNominationRequest,
  createFeedbackRequest,
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

jest.mock('../src/services/request-number.service', () => ({
  generateRequestNumber: jest.fn().mockResolvedValue('INV-2025-000001'),
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
    insert: jest.fn((data: unknown) => {
      (context as any).data = data;
      // Return a thenable object that can be awaited directly or chained with select()
      const insertPromise: any = Promise.resolve({
        error: null,
        data: null,
      });
      
      insertPromise.select = jest.fn(() => ({
        single: jest.fn(async () => {
          const handler = handlers[table];
          if (handler) {
            const result = await handler(context);
            return result;
          }
          return { data: null, error: null };
        }),
      }));
      
      return insertPromise;
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

const mockCreateSignedUploadUrl = jest
  .fn()
  .mockResolvedValue({
    data: {
      signedUrl: 'https://storage.supabase.co/upload-url',
      token: 'token-123',
      path: 'req-1/2025/01/uuid.pdf',
    },
    error: null,
  });

const mockClient: any = {
  from: jest.fn((table: string) => createQueryBuilder(table)),
  storage: {
    from: jest.fn(() => ({
      createSignedUrl: jest
        .fn()
        .mockResolvedValue({ data: { signedUrl: 'https://signed-url' }, error: null }),
      createSignedUploadUrl: mockCreateSignedUploadUrl,
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
    handlers.request_events = async () => ({
      error: null,
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

describe('createRequestAttachmentUploadUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSignedUploadUrl.mockResolvedValue({
      data: {
        signedUrl: 'https://storage.supabase.co/upload-url',
        token: 'token-123',
        path: 'req-1/2025/01/uuid.pdf',
      },
      error: null,
    });
  });

  it('throws when request not found', async () => {
    handlers.requests = async () => ({
      data: null,
      error: { message: 'Not found' },
    });

    await expect(
      createRequestAttachmentUploadUrl({
        requestId: 'missing',
        userId: 'user-1',
        input: {
          fileName: 'document.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
        },
      })
    ).rejects.toThrow('REQUEST_NOT_FOUND');
  });

  it('throws when request not owned by user', async () => {
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        user_id: 'user-2',
        status: 'draft',
      },
      error: null,
    });

    await expect(
      createRequestAttachmentUploadUrl({
        requestId: 'req-1',
        userId: 'user-1',
        input: {
          fileName: 'document.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
        },
      })
    ).rejects.toThrow('REQUEST_NOT_OWNED');
  });

  it('throws when request is not editable', async () => {
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        user_id: 'user-1',
        status: 'approved', // Cannot add attachments to approved requests
      },
      error: null,
    });

    await expect(
      createRequestAttachmentUploadUrl({
        requestId: 'req-1',
        userId: 'user-1',
        input: {
          fileName: 'document.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
        },
      })
    ).rejects.toThrow('REQUEST_NOT_EDITABLE');
  });

  it('allows attachments for draft requests', async () => {
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        user_id: 'user-1',
        status: 'draft',
      },
      error: null,
    });
    handlers.attachments = async () => ({
      data: { id: 'attach-1' },
      error: null,
    });

    const result = await createRequestAttachmentUploadUrl({
      requestId: 'req-1',
      userId: 'user-1',
      input: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        bucket: 'request-attachments',
        uploadUrl: 'https://storage.supabase.co/upload-url',
        headers: expect.objectContaining({
          'Content-Type': 'application/pdf',
        }),
      })
    );
    expect(result.attachmentId).toBeDefined();
    expect(result.storageKey).toContain('req-1/');
  });

  it('allows attachments for submitted requests', async () => {
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        user_id: 'user-1',
        status: 'submitted',
      },
      error: null,
    });
    handlers.attachments = async () => ({
      data: { id: 'attach-1' },
      error: null,
    });

    const result = await createRequestAttachmentUploadUrl({
      requestId: 'req-1',
      userId: 'user-1',
      input: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
      },
    });

    expect(result).toBeDefined();
  });

  it('creates attachment record in database', async () => {
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        user_id: 'user-1',
        status: 'draft',
      },
      error: null,
    });

    // insert() without select() returns { error } directly
    // The mock insert() already returns a promise with { error: null }
    // so we don't need to mock handlers.attachments for this test

    const result = await createRequestAttachmentUploadUrl({
      requestId: 'req-1',
      userId: 'user-1',
      input: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 2048,
      },
    });

    // Verify attachment was created successfully
    expect(result.attachmentId).toBeDefined();
    expect(result.bucket).toBe('request-attachments');
    expect(result.storageKey).toContain('req-1/');
    expect(result.uploadUrl).toBe('https://storage.supabase.co/upload-url');
    expect(mockClient.from).toHaveBeenCalledWith('attachments');
  });

  it('handles storage error', async () => {
    handlers.requests = async () => ({
      data: {
        id: 'req-1',
        user_id: 'user-1',
        status: 'draft',
      },
      error: null,
    });

    mockCreateSignedUploadUrl.mockResolvedValueOnce({
      data: null,
      error: { message: 'Storage error' },
    });

    await expect(
      createRequestAttachmentUploadUrl({
        requestId: 'req-1',
        userId: 'user-1',
        input: {
          fileName: 'document.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
        },
      })
    ).rejects.toThrow('Failed to create signed upload url');
  });
});

describe('createPartnershipRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.request_events = async () => ({
      error: null,
    });
  });

  it('throws PROJECT_NOT_FOUND when project does not exist', async () => {
    handlers.projects = async () => ({
      data: null,
      error: { message: 'Not found' },
    });

    await expect(
      createPartnershipRequest({
        userId: 'user-1',
        payload: {
          projectId: 'non-existent-project-id',
          partnershipPlan: 'A'.repeat(100),
          proposedAmount: 1000000,
        },
      })
    ).rejects.toThrow('PROJECT_NOT_FOUND');
  });

  it('creates partnership request without projectId', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-partnership-1',
            request_number: 'INV-2025-000001',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    const result = await createPartnershipRequest({
      userId: 'user-1',
      payload: {
        partnershipPlan: 'A'.repeat(100),
        proposedAmount: 1000000,
        notes: 'Test notes',
      },
    });

    expect(result.id).toBeDefined();
    expect(result.requestNumber).toBeDefined();
    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('creates partnership request with projectId and verifies project exists', async () => {
    handlers.projects = async () => ({
      data: {
        id: 'project-1',
        name: 'Test Project',
      },
      error: null,
    });

    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        return {
          data: {
            id: 'req-partnership-2',
            request_number: 'INV-2025-000002',
            type: data.type,
            metadata: data.metadata,
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    const result = await createPartnershipRequest({
      userId: 'user-1',
      payload: {
        projectId: 'project-1',
        partnershipPlan: 'A'.repeat(100),
        proposedAmount: 2000000,
      },
    });

    expect(result.id).toBeDefined();
    expect(mockClient.from).toHaveBeenCalledWith('projects');
    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('saves partnership data in metadata field', async () => {
    let savedMetadata: any = null;

    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        savedMetadata = (context as any).data.metadata;
        return {
          data: {
            id: 'req-partnership-3',
            request_number: 'INV-2025-000003',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createPartnershipRequest({
      userId: 'user-1',
      payload: {
        projectId: 'project-1',
        partnershipPlan: 'Detailed partnership plan here',
        proposedAmount: 5000000,
        notes: 'Additional notes',
      },
    });

    expect(savedMetadata).toEqual({
      projectId: 'project-1',
      proposedAmount: 5000000,
      partnershipPlan: 'Detailed partnership plan here',
    });
  });

  it('creates request with draft status', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        expect(data.status).toBe('draft');
        expect(data.type).toBe('partnership');
        return {
          data: {
            id: 'req-partnership-4',
            request_number: 'INV-2025-000004',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createPartnershipRequest({
      userId: 'user-1',
      payload: {
        partnershipPlan: 'A'.repeat(100),
      },
    });

    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('logs initial event in request_events', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-partnership-5',
            request_number: 'INV-2025-000005',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    let loggedEvent: any = null;
    handlers.request_events = async (context: any) => {
      loggedEvent = (context as any).data;
      return { error: null };
    };

    await createPartnershipRequest({
      userId: 'user-1',
      payload: {
        partnershipPlan: 'A'.repeat(100),
      },
    });

    expect(loggedEvent).toEqual({
      request_id: 'req-partnership-5',
      from_status: null,
      to_status: 'draft',
      actor_id: 'user-1',
      note: 'Partnership request created',
    });
    expect(mockClient.from).toHaveBeenCalledWith('request_events');
  });

  it('sets amount to null when proposedAmount is not provided', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        expect(data.amount).toBeNull();
        return {
          data: {
            id: 'req-partnership-6',
            request_number: 'INV-2025-000006',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createPartnershipRequest({
      userId: 'user-1',
      payload: {
        partnershipPlan: 'A'.repeat(100),
      },
    });

    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('handles database error when creating request', async () => {
    handlers.requests = async () => ({
      data: null,
      error: { message: 'Database error' },
    });

    await expect(
      createPartnershipRequest({
        userId: 'user-1',
        payload: {
          partnershipPlan: 'A'.repeat(100),
        },
      })
    ).rejects.toThrow('Failed to create partnership request');
  });

  it('handles error when logging event fails', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-partnership-7',
            request_number: 'INV-2025-000007',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    handlers.request_events = async () => ({
      error: { message: 'Event logging failed' },
    });

    await expect(
      createPartnershipRequest({
        userId: 'user-1',
        payload: {
          partnershipPlan: 'A'.repeat(100),
        },
      })
    ).rejects.toThrow('Failed to log initial request event');
  });
});

describe('createBoardNominationRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.request_events = async () => ({
      error: null,
    });
  });

  it('creates board nomination request with all required fields', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-board-nomination-1',
            request_number: 'INV-2025-000001',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    const result = await createBoardNominationRequest({
      userId: 'user-1',
      payload: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
        notes: 'Test notes',
      },
    });

    expect(result.id).toBeDefined();
    expect(result.requestNumber).toBeDefined();
    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('saves board nomination data in metadata field', async () => {
    let savedMetadata: any = null;

    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        savedMetadata = (context as any).data.metadata;
        return {
          data: {
            id: 'req-board-nomination-2',
            request_number: 'INV-2025-000002',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createBoardNominationRequest({
      userId: 'user-1',
      payload: {
        cvSummary: 'Detailed CV summary here',
        experience: 'Extensive experience in board management',
        motivations: 'Strong motivation to serve on the board',
        qualifications: 'MBA, 10 years executive experience',
        notes: 'Additional notes',
      },
    });

    expect(savedMetadata).toEqual({
      cvSummary: 'Detailed CV summary here',
      experience: 'Extensive experience in board management',
      motivations: 'Strong motivation to serve on the board',
      qualifications: 'MBA, 10 years executive experience',
    });
  });

  it('creates request with draft status', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        expect(data.status).toBe('draft');
        expect(data.type).toBe('board_nomination');
        return {
          data: {
            id: 'req-board-nomination-3',
            request_number: 'INV-2025-000003',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createBoardNominationRequest({
      userId: 'user-1',
      payload: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
    });

    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('sets amount and currency to null (non-financial request)', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        expect(data.amount).toBeNull();
        expect(data.currency).toBeNull();
        expect(data.target_price).toBeNull();
        expect(data.expiry_at).toBeNull();
        return {
          data: {
            id: 'req-board-nomination-4',
            request_number: 'INV-2025-000004',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createBoardNominationRequest({
      userId: 'user-1',
      payload: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
    });

    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('logs initial event in request_events', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-board-nomination-5',
            request_number: 'INV-2025-000005',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    let loggedEvent: any = null;
    handlers.request_events = async (context: any) => {
      loggedEvent = (context as any).data;
      return { error: null };
    };

    await createBoardNominationRequest({
      userId: 'user-1',
      payload: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
    });

    expect(loggedEvent).toEqual({
      request_id: 'req-board-nomination-5',
      from_status: null,
      to_status: 'draft',
      actor_id: 'user-1',
      note: 'Board nomination request created',
    });
    expect(mockClient.from).toHaveBeenCalledWith('request_events');
  });

  it('handles database error when creating request', async () => {
    handlers.requests = async () => ({
      data: null,
      error: { message: 'Database error' },
    });

    await expect(
      createBoardNominationRequest({
        userId: 'user-1',
        payload: {
          cvSummary: 'A'.repeat(100),
          experience: 'A'.repeat(100),
          motivations: 'A'.repeat(100),
          qualifications: 'A'.repeat(50),
        },
      })
    ).rejects.toThrow('Failed to create board nomination request');
  });

  it('handles error when logging event fails', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-board-nomination-6',
            request_number: 'INV-2025-000006',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    handlers.request_events = async () => ({
      error: { message: 'Event logging failed' },
    });

    await expect(
      createBoardNominationRequest({
        userId: 'user-1',
        payload: {
          cvSummary: 'A'.repeat(100),
          experience: 'A'.repeat(100),
          motivations: 'A'.repeat(100),
          qualifications: 'A'.repeat(50),
        },
      })
    ).rejects.toThrow('Failed to log initial request event');
  });

  it('creates request without notes field', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        expect(data.notes).toBeNull();
        return {
          data: {
            id: 'req-board-nomination-7',
            request_number: 'INV-2025-000007',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createBoardNominationRequest({
      userId: 'user-1',
      payload: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
    });

    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });
});

describe('createFeedbackRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    handlers.request_events = async () => ({
      error: null,
    });
  });

  it('creates feedback request with all required fields', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-feedback-1',
            request_number: 'INV-2025-000001',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    const result = await createFeedbackRequest({
      userId: 'user-1',
      payload: {
        subject: 'Valid subject for feedback',
        category: 'suggestion',
        description: 'A'.repeat(50),
        priority: 'high',
        notes: 'Test notes',
      },
    });

    expect(result.id).toBeDefined();
    expect(result.requestNumber).toBeDefined();
    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('saves feedback data in metadata field', async () => {
    let savedMetadata: any = null;

    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        savedMetadata = (context as any).data.metadata;
        return {
          data: {
            id: 'req-feedback-2',
            request_number: 'INV-2025-000002',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createFeedbackRequest({
      userId: 'user-1',
      payload: {
        subject: 'Detailed feedback subject',
        category: 'complaint',
        description: 'This is a detailed description of the feedback',
        priority: 'medium',
        notes: 'Additional notes',
      },
    });

    expect(savedMetadata).toEqual({
      subject: 'Detailed feedback subject',
      category: 'complaint',
      description: 'This is a detailed description of the feedback',
      priority: 'medium',
    });
  });

  it('creates request with draft status', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        expect(data.status).toBe('draft');
        expect(data.type).toBe('feedback');
        return {
          data: {
            id: 'req-feedback-3',
            request_number: 'INV-2025-000003',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createFeedbackRequest({
      userId: 'user-1',
      payload: {
        subject: 'Valid subject',
        category: 'question',
        description: 'A'.repeat(50),
        priority: 'low',
      },
    });

    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('sets amount and currency to null (non-financial request)', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        expect(data.amount).toBeNull();
        expect(data.currency).toBeNull();
        expect(data.target_price).toBeNull();
        expect(data.expiry_at).toBeNull();
        return {
          data: {
            id: 'req-feedback-4',
            request_number: 'INV-2025-000004',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createFeedbackRequest({
      userId: 'user-1',
      payload: {
        subject: 'Valid subject',
        category: 'other',
        description: 'A'.repeat(50),
        priority: 'medium',
      },
    });

    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('logs initial event in request_events', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-feedback-5',
            request_number: 'INV-2025-000005',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    let loggedEvent: any = null;
    handlers.request_events = async (context: any) => {
      loggedEvent = (context as any).data;
      return { error: null };
    };

    await createFeedbackRequest({
      userId: 'user-1',
      payload: {
        subject: 'Valid subject',
        category: 'suggestion',
        description: 'A'.repeat(50),
        priority: 'high',
      },
    });

    expect(loggedEvent).toEqual({
      request_id: 'req-feedback-5',
      from_status: null,
      to_status: 'draft',
      actor_id: 'user-1',
      note: 'Feedback request created',
    });
    expect(mockClient.from).toHaveBeenCalledWith('request_events');
  });

  it('handles database error when creating request', async () => {
    handlers.requests = async () => ({
      data: null,
      error: { message: 'Database error' },
    });

    await expect(
      createFeedbackRequest({
        userId: 'user-1',
        payload: {
          subject: 'Valid subject',
          category: 'suggestion',
          description: 'A'.repeat(50),
          priority: 'low',
        },
      })
    ).rejects.toThrow('Failed to create feedback request');
  });

  it('handles error when logging event fails', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        return {
          data: {
            id: 'req-feedback-6',
            request_number: 'INV-2025-000006',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    handlers.request_events = async () => ({
      error: { message: 'Event logging failed' },
    });

    await expect(
      createFeedbackRequest({
        userId: 'user-1',
        payload: {
          subject: 'Valid subject',
          category: 'complaint',
          description: 'A'.repeat(50),
          priority: 'medium',
        },
      })
    ).rejects.toThrow('Failed to log initial request event');
  });

  it('creates request without notes field', async () => {
    handlers.requests = async (context: any) => {
      if ((context as any).data) {
        const data = (context as any).data;
        expect(data.notes).toBeNull();
        return {
          data: {
            id: 'req-feedback-7',
            request_number: 'INV-2025-000007',
          },
          error: null,
        };
      }
      return { data: null, error: null };
    };

    await createFeedbackRequest({
      userId: 'user-1',
      payload: {
        subject: 'Valid subject',
        category: 'question',
        description: 'A'.repeat(50),
        priority: 'low',
      },
    });

    expect(mockClient.from).toHaveBeenCalledWith('requests');
  });

  it('handles all category types', async () => {
    const categories = ['suggestion', 'complaint', 'question', 'other'];

    for (const category of categories) {
      handlers.requests = async (context: any) => {
        if ((context as any).data) {
          const data = (context as any).data;
          expect(data.metadata.category).toBe(category);
          return {
            data: {
              id: `req-feedback-${category}`,
              request_number: 'INV-2025-000001',
            },
            error: null,
          };
        }
        return { data: null, error: null };
      };

      await createFeedbackRequest({
        userId: 'user-1',
        payload: {
          subject: `Valid subject for ${category}`,
          category: category as any,
          description: 'A'.repeat(50),
          priority: 'medium',
        },
      });

      expect(mockClient.from).toHaveBeenCalledWith('requests');
    }
  });

  it('handles all priority levels', async () => {
    const priorities = ['low', 'medium', 'high'];

    for (const priority of priorities) {
      handlers.requests = async (context: any) => {
        if ((context as any).data) {
          const data = (context as any).data;
          expect(data.metadata.priority).toBe(priority);
          return {
            data: {
              id: `req-feedback-${priority}`,
              request_number: 'INV-2025-000001',
            },
            error: null,
          };
        }
        return { data: null, error: null };
      };

      await createFeedbackRequest({
        userId: 'user-1',
        payload: {
          subject: `Valid subject for ${priority} priority`,
          category: 'suggestion',
          description: 'A'.repeat(50),
          priority: priority as any,
        },
      });

      expect(mockClient.from).toHaveBeenCalledWith('requests');
    }
  });
});


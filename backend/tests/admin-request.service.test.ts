import {
  listAdminRequests,
  escapeLikePattern,
  getAdminRequestDetail,
  approveAdminRequest,
  rejectAdminRequest,
  requestInfoFromInvestor,
  listAdminRequestComments,
  addAdminRequestComment,
} from '../src/services/admin-request.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';
import type { AdminRequestListQuery } from '../src/schemas/admin-requests.schema';
import type { RequestStatus } from '../src/services/request-state.service';
import { transitionRequestStatus } from '../src/services/request-state.service';
import {
  notifyInvestorOfDecision,
  notifyInvestorOfInfoRequest,
} from '../src/services/notification.service';

jest.mock('../src/services/request-state.service', () => ({
  transitionRequestStatus: jest.fn(),
  REQUEST_STATUSES: [
    'draft',
    'submitted',
    'screening',
    'pending_info',
    'compliance_review',
    'approved',
    'rejected',
    'settling',
    'completed',
  ],
}));

jest.mock('../src/services/notification.service', () => ({
  notifyInvestorOfSubmission: jest.fn(),
  notifyInvestorOfDecision: jest.fn(),
  notifyInvestorOfInfoRequest: jest.fn(),
}));

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;
const mockTransition = transitionRequestStatus as jest.Mock;
const mockNotifyDecision = notifyInvestorOfDecision as jest.Mock;
const mockNotifyInfoRequest = notifyInvestorOfInfoRequest as jest.Mock;

beforeEach(() => {
  mockRequireSupabaseAdmin.mockReset();
  mockTransition.mockReset();
  mockNotifyDecision.mockReset();
  mockNotifyInfoRequest.mockReset();
});

describe('escapeLikePattern', () => {
  it('escapes percent and underscore characters', () => {
    expect(escapeLikePattern('100%_match')).toBe('100\\%\\_match');
  });
});

describe('listAdminRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps requests with investor info', async () => {
    const selectMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockReturnThis();
    const gteMock = jest.fn().mockReturnThis();
    const lteMock = jest.fn().mockReturnThis();
    const orMock = jest.fn().mockReturnThis();
    const orderMock = jest.fn().mockReturnThis();
    const rangeMock = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'req-1',
          request_number: 'INV-2025-000001',
          status: 'submitted',
          type: 'buy',
          amount: '1500.00',
          currency: 'SAR',
          target_price: null,
          expiry_at: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-02T00:00:00Z',
          users: {
            id: 'user-1',
            email: 'user@example.com',
            profile: {
              full_name: 'Investor One',
              preferred_name: 'Investor',
              language: 'ar',
            },
          },
        },
      ],
      count: 1,
      error: null,
    });

    const fromMock = jest.fn(() => ({
      select: selectMock,
      eq: eqMock,
      gte: gteMock,
      lte: lteMock,
      or: orMock,
      order: orderMock,
      range: rangeMock,
    }));

    mockRequireSupabaseAdmin.mockReturnValue({
      from: fromMock,
    });

    const result = await listAdminRequests({
      actorId: 'admin-1',
      query: {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        order: 'desc',
      } as AdminRequestListQuery,
    });

    expect(fromMock).toHaveBeenCalledWith('requests');
    expect(selectMock).toHaveBeenCalled();
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(rangeMock).toHaveBeenCalledWith(0, 9);

    expect(result.requests).toHaveLength(1);
    expect(result.requests[0]).toEqual(
      expect.objectContaining({
        id: 'req-1',
        requestNumber: 'INV-2025-000001',
        amount: 1500,
        investor: expect.objectContaining({
          email: 'user@example.com',
          fullName: 'Investor One',
        }),
      })
    );
    expect(result.meta).toEqual(
      expect.objectContaining({
        page: 1,
        limit: 10,
        total: 1,
        pageCount: 1,
        hasNext: false,
      })
    );
  });

  it('applies filters and search', async () => {
    const expectedPattern = '%INV-000%';

    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: [],
        count: 0,
        error: null,
      }),
    };

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue(chain),
    });

    const filterQuery: AdminRequestListQuery = {
      page: 2,
      limit: 5,
  status: 'submitted' as RequestStatus,
      type: 'buy',
      minAmount: 1000,
      maxAmount: 5000,
      createdFrom: '2025-01-01T00:00:00Z',
      createdTo: '2025-01-31T23:59:59Z',
      search: 'INV-000',
      sortBy: 'amount',
      order: 'asc',
    };

    await listAdminRequests({
      actorId: 'admin-1',
      query: filterQuery,
    });

    expect(chain.eq).toHaveBeenCalledWith('status', 'submitted');
    expect(chain.eq).toHaveBeenCalledWith('type', 'buy');
    expect(chain.gte).toHaveBeenCalledWith('amount', 1000);
    expect(chain.lte).toHaveBeenCalledWith('amount', 5000);
    expect(chain.gte).toHaveBeenCalledWith('created_at', '2025-01-01T00:00:00Z');
    expect(chain.lte).toHaveBeenCalledWith('created_at', '2025-01-31T23:59:59Z');
    expect(chain.or).toHaveBeenCalledWith(
      expect.stringContaining(`request_number.ilike.${expectedPattern}`)
    );
    expect(chain.order).toHaveBeenCalledWith('amount', { ascending: true });
    expect(chain.range).toHaveBeenCalledWith(5, 9);
  });

  it('throws when supabase returns error', async () => {
    const chain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockResolvedValue({
        data: null,
        count: null,
        error: { message: 'boom' },
      }),
    };

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue(chain),
    });

    const basicQuery: AdminRequestListQuery = {
      page: 1,
      limit: 10,
      sortBy: 'created_at',
      order: 'desc',
    };

    await expect(
      listAdminRequests({
        actorId: 'admin-1',
        query: basicQuery,
      })
    ).rejects.toThrow('Failed to list admin requests: boom');
  });
});

describe('getAdminRequestDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws when request not found', async () => {
    const fromMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      }),
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: fromMock,
    });

    await expect(
      getAdminRequestDetail({
        actorId: 'admin-1',
        requestId: 'missing',
      })
    ).rejects.toThrow('REQUEST_NOT_FOUND');
  });

  it('returns detailed information including attachments and events', async () => {
    const requestData = {
      id: 'req-1',
      request_number: 'INV-2025-000001',
      user_id: 'user-1',
      status: 'submitted',
      type: 'buy',
      amount: '5000',
      currency: 'SAR',
      target_price: '120.5',
      expiry_at: null,
      notes: 'Urgent request',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      users: [
        {
          id: 'user-1',
          email: 'user@example.com',
          profile: [
            {
              full_name: 'Investor One',
              preferred_name: 'Investor',
              language: 'ar',
            },
          ],
        },
      ],
    };

    const selectMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockReturnThis();
    const singleMock = jest.fn().mockResolvedValue({
      data: requestData,
      error: null,
    });

    const attachmentSelectMock = jest.fn().mockReturnThis();
    const attachmentEqMock = jest.fn().mockReturnThis();
    const attachmentOrderMock = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'att-1',
          filename: 'doc.pdf',
          mime_type: 'application/pdf',
          size: '2048',
          storage_key: 'bucket/doc.pdf',
          created_at: '2025-01-01T01:00:00Z',
        },
      ],
      error: null,
    });

    const eventsSelectMock = jest.fn().mockReturnThis();
    const eventsEqMock = jest.fn().mockReturnThis();
    const eventsOrderMock = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'event-1',
          from_status: null,
          to_status: 'submitted',
          actor_id: 'user-1',
          note: 'Submitted by investor',
          created_at: '2025-01-01T00:00:00Z',
        },
      ],
      error: null,
    });

    const commentSelectMock = jest.fn().mockReturnThis();
    const commentEqMock = jest.fn().mockReturnThis();
    const commentOrderMock = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'com-1',
          comment: 'Internal follow-up required',
          actor_id: 'admin-42',
          created_at: '2025-01-01T03:00:00Z',
          actor: {
            id: 'admin-42',
            email: 'admin@example.com',
            profile: [
              {
                full_name: 'Admin reviewer',
                preferred_name: 'Lead Reviewer',
                language: 'en',
              },
            ],
          },
        },
      ],
      error: null,
    });

    const fromMock = jest.fn((table: string) => {
      if (table === 'requests') {
        return {
          select: selectMock,
          eq: eqMock,
          single: singleMock,
        };
      }
      if (table === 'attachments') {
        return {
          select: attachmentSelectMock,
          eq: attachmentEqMock,
          order: attachmentOrderMock,
        };
      }
      if (table === 'request_events') {
        return {
          select: eventsSelectMock,
          eq: eventsEqMock,
          order: eventsOrderMock,
        };
      }
      if (table === 'request_comments') {
        return {
          select: commentSelectMock,
          eq: commentEqMock,
          order: commentOrderMock,
        };
      }
      throw new Error(`Unhandled table ${table}`);
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: fromMock,
    });

    const result = await getAdminRequestDetail({
      actorId: 'admin-1',
      requestId: 'req-1',
    });

    expect(result.request).toEqual(
      expect.objectContaining({
        id: 'req-1',
        requestNumber: 'INV-2025-000001',
        status: 'submitted',
        notes: 'Urgent request',
        investor: expect.objectContaining({
          email: 'user@example.com',
          fullName: 'Investor One',
        }),
      })
    );
    expect(result.attachments).toHaveLength(1);
    expect(result.attachments[0]).toEqual(
      expect.objectContaining({
        id: 'att-1',
        filename: 'doc.pdf',
        size: 2048,
      })
    );
    expect(result.events).toHaveLength(1);
    expect(result.comments).toHaveLength(1);
    expect(result.comments[0]).toEqual(
      expect.objectContaining({
        note: 'Internal follow-up required',
        actor: expect.objectContaining({
          email: 'admin@example.com',
          preferredName: 'Lead Reviewer',
        }),
      })
    );
  });
});

describe('approveAdminRequest', () => {
  it('transitions status, logs audit, and notifies investor', async () => {
    const auditInsertMock = jest.fn().mockResolvedValue({ error: null });
    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn((table: string) => {
        if (table === 'audit_logs') {
          return { insert: auditInsertMock };
        }
        throw new Error(`Unhandled table: ${table}`);
      }),
    });

    mockTransition.mockResolvedValue({
      request: {
        id: 'req-1',
        user_id: 'user-1',
        request_number: 'INV-2025-000001',
        status: 'approved',
      },
      event: {
        from_status: 'compliance_review',
        to_status: 'approved',
      },
    });

    await approveAdminRequest({
      actorId: 'admin-1',
      requestId: 'req-1',
      note: 'Looks good',
    });

    expect(mockTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
        toStatus: 'approved',
      })
    );
    expect(auditInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'request.approved',
        target_id: 'req-1',
      })
    );
    expect(mockNotifyDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        requestNumber: 'INV-2025-000001',
        decision: 'approved',
      })
    );
  });
});

describe('rejectAdminRequest', () => {
  it('transitions status, logs audit, and notifies investor', async () => {
    const auditInsertMock = jest.fn().mockResolvedValue({ error: null });
    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn((table: string) => {
        if (table === 'audit_logs') {
          return { insert: auditInsertMock };
        }
        throw new Error(`Unhandled table: ${table}`);
      }),
    });

    mockTransition.mockResolvedValue({
      request: {
        id: 'req-2',
        user_id: 'user-2',
        request_number: 'INV-2025-000002',
        status: 'rejected',
      },
      event: {
        from_status: 'screening',
        to_status: 'rejected',
      },
    });

    await rejectAdminRequest({
      actorId: 'admin-2',
      requestId: 'req-2',
      note: 'Insufficient documents',
    });

    expect(mockTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-2',
        toStatus: 'rejected',
      })
    );
    expect(auditInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'request.rejected',
        target_id: 'req-2',
      })
    );
    expect(mockNotifyDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-2',
        requestNumber: 'INV-2025-000002',
        decision: 'rejected',
      })
    );
  });
});

describe('requestInfoFromInvestor', () => {
  it('requires non-empty message', async () => {
    await expect(
      requestInfoFromInvestor({
        actorId: 'admin-1',
        requestId: 'req-1',
        message: '',
      } as any)
    ).rejects.toThrow('INFO_MESSAGE_REQUIRED');
  });

  it('transitions status, logs audit, and notifies investor', async () => {
    const auditInsertMock = jest.fn().mockResolvedValue({ error: null });
    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn((table: string) => {
        if (table === 'audit_logs') {
          return { insert: auditInsertMock };
        }
        throw new Error(`Unhandled table: ${table}`);
      }),
    });

    mockTransition.mockResolvedValue({
      request: {
        id: 'req-3',
        user_id: 'user-3',
        request_number: 'INV-2025-000003',
        status: 'pending_info',
      },
      event: {
        from_status: 'screening',
        to_status: 'pending_info',
      },
    });

    await requestInfoFromInvestor({
      actorId: 'admin-3',
      requestId: 'req-3',
      message: 'Please upload proof of funds within 48 hours.',
    });

    expect(mockTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-3',
        toStatus: 'pending_info',
        note: expect.stringContaining('Please upload'),
      })
    );
    expect(auditInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'request.info_requested',
        target_id: 'req-3',
      })
    );
    expect(mockNotifyInfoRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-3',
        requestNumber: 'INV-2025-000003',
        message: expect.stringContaining('Please upload'),
      })
    );
  });
});

describe('listAdminRequestComments', () => {
  it('returns mapped comments', async () => {
    const selectMock = jest.fn().mockReturnThis();
    const eqMock = jest.fn().mockReturnThis();
    const orderMock = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'com-1',
          comment: 'Need more details',
          actor_id: 'admin-1',
          created_at: '2025-01-01T02:00:00Z',
          actor: {
            id: 'admin-1',
            email: 'admin@example.com',
            profile: [
              {
                full_name: 'Admin User',
                preferred_name: 'Admin',
                language: 'ar',
              },
            ],
          },
        },
      ],
      error: null,
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: selectMock,
        eq: eqMock,
        order: orderMock,
      }),
    });

    const comments = await listAdminRequestComments({
      actorId: 'admin-1',
      requestId: 'req-1',
    });

    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: true });
    expect(comments).toHaveLength(1);
    expect(comments[0]).toEqual(
      expect.objectContaining({
        note: 'Need more details',
        actor: expect.objectContaining({
          email: 'admin@example.com',
          fullName: 'Admin User',
        }),
      })
    );
  });
});

describe('addAdminRequestComment', () => {
  it('requires non-empty comment', async () => {
    await expect(
      addAdminRequestComment({
        actorId: 'admin-1',
        requestId: 'req-1',
        comment: '   ',
      } as any)
    ).rejects.toThrow('COMMENT_REQUIRED');
  });

  it('inserts comment and logs audit', async () => {
    const auditInsertMock = jest.fn().mockResolvedValue({ error: null });
    const insertMock = jest.fn().mockReturnThis();
    const selectMock = jest.fn().mockReturnThis();
    const singleMock = jest.fn().mockResolvedValue({
      data: {
        id: 'com-99',
        comment: 'Reviewed documents',
        actor_id: 'admin-1',
        created_at: '2025-01-01T03:00:00Z',
        actor: {
          id: 'admin-1',
          email: 'admin@example.com',
          profile: [
            {
              full_name: 'Admin User',
              preferred_name: 'Admin',
              language: 'en',
            },
          ],
        },
      },
      error: null,
    });

    const fromMock = jest.fn((table: string) => {
      if (table === 'request_comments') {
        return {
          insert: insertMock,
          select: selectMock,
          single: singleMock,
        };
      }
      if (table === 'audit_logs') {
        return { insert: auditInsertMock };
      }
      throw new Error(`Unhandled table: ${table}`);
    });

    mockRequireSupabaseAdmin.mockReturnValue({
      from: fromMock,
    });

    const result = await addAdminRequestComment({
      actorId: 'admin-1',
      requestId: 'req-1',
      comment: 'Reviewed documents',
    });

    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        request_id: 'req-1',
        actor_id: 'admin-1',
      })
    );
    expect(auditInsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'request.comment_added',
        target_id: 'req-1',
      })
    );
    expect(result).toEqual(
      expect.objectContaining({
        note: 'Reviewed documents',
        actor: expect.objectContaining({ email: 'admin@example.com' }),
      })
    );
  });
});


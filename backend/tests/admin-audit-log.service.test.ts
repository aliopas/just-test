import { listAdminAuditLogs } from '../src/services/admin-audit-log.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

const mockRequireAdmin = requireSupabaseAdmin as jest.Mock;

function createQueryBuilder<T>(result: T) {
  const promise = Promise.resolve(result);
  const builder: any = {
    gte: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    in: jest.fn(() => builder),
    select: jest.fn(() => builder),
    order: jest.fn(() => builder),
    range: jest.fn(() => promise),
  };
  return builder;
}

describe('admin-audit-log.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns paginated audit log entries with metadata', async () => {
    const builder = createQueryBuilder({
      data: [
        {
          id: 'log-1',
          actor_id: 'admin-1',
          action: 'request.approved',
          target_type: 'request',
          target_id: 'req-1',
          diff: { status: ['submitted', 'approved'] },
          ip_address: '192.168.1.10',
          user_agent: 'jest-test',
          created_at: '2025-01-01T10:00:00Z',
          actor: {
            id: 'admin-1',
            email: 'admin@example.com',
            profile: [
              { full_name: 'Admin Example', preferred_name: 'Ops Admin' },
            ],
          },
        },
      ],
      error: null,
      count: 1,
    });

    mockRequireAdmin.mockReturnValue({
      from: jest.fn(() => builder),
    });

    const result = await listAdminAuditLogs({
      page: 1,
      limit: 10,
    });

    expect(builder.gte).not.toHaveBeenCalled();
    expect(builder.lte).not.toHaveBeenCalled();
    expect(builder.eq).not.toHaveBeenCalled();

    expect(builder.select).toHaveBeenCalledWith(expect.any(String), {
      count: 'exact',
    });
    expect(builder.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
    expect(builder.range).toHaveBeenCalledWith(0, 9);

    expect(result.logs).toHaveLength(1);
    expect(result.logs[0]).toEqual(
      expect.objectContaining({
        id: 'log-1',
        action: 'request.approved',
        targetType: 'request',
        targetId: 'req-1',
        actor: expect.objectContaining({
          email: 'admin@example.com',
          name: 'Ops Admin',
        }),
      })
    );
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      pageCount: 1,
    });
  });

  it('applies filters to the query builder', async () => {
    const builder = createQueryBuilder({
      data: [],
      error: null,
      count: 0,
    });

    mockRequireAdmin.mockReturnValue({
      from: jest.fn(() => builder),
    });

    await listAdminAuditLogs({
      page: 2,
      limit: 25,
      from: '2025-01-01T00:00:00Z',
      to: '2025-01-31T23:59:59Z',
      actorId: 'admin-1',
      action: 'request.comment_added',
      resourceType: 'request',
      resourceId: 'req-123',
    });

    expect(builder.gte).toHaveBeenCalledWith('created_at', '2025-01-01T00:00:00Z');
    expect(builder.lte).toHaveBeenCalledWith('created_at', '2025-01-31T23:59:59Z');
    expect(builder.eq).toHaveBeenCalledWith('actor_id', 'admin-1');
    expect(builder.eq).toHaveBeenCalledWith('action', 'request.comment_added');
    expect(builder.eq).toHaveBeenCalledWith('target_type', 'request');
    expect(builder.eq).toHaveBeenCalledWith('target_id', 'req-123');
    expect(builder.range).toHaveBeenCalledWith(25, 49);
  });

  it('throws when Supabase returns an error', async () => {
    const builder = createQueryBuilder({
      data: null,
      error: { message: 'boom' },
      count: null,
    });

    mockRequireAdmin.mockReturnValue({
      from: jest.fn(() => builder),
    });

    await expect(
      listAdminAuditLogs({ page: 1, limit: 10 })
    ).rejects.toThrow('FAILED_AUDIT_LOG_QUERY');
  });
});


import { getInvestorDashboard } from '../src/services/investor-dashboard.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;

describe('investor-dashboard.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('aggregates dashboard data for investor', async () => {
    const summaryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ status: 'submitted' }, { status: 'pending_info' }],
        error: null,
      }),
    };

    const recentBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'req-1',
            request_number: 'INV-001',
            status: 'submitted',
            amount: 1000,
            currency: 'SAR',
            created_at: '2025-01-01T10:00:00Z',
          },
        ],
        error: null,
      }),
    };

    const pendingBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'req-2',
            request_number: 'INV-002',
            updated_at: '2025-01-02T12:00:00Z',
          },
        ],
        error: null,
      }),
    };

    const unreadBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockResolvedValue({
        count: 3,
        error: null,
      }),
    };

    const adminClient = {
      from: jest
        .fn()
        .mockImplementationOnce(() => summaryBuilder)
        .mockImplementationOnce(() => recentBuilder)
        .mockImplementationOnce(() => pendingBuilder)
        .mockImplementationOnce(() => unreadBuilder),
    };

    mockRequireSupabaseAdmin.mockReturnValue(adminClient);

    const dashboard = await getInvestorDashboard({ userId: 'user-1' });

    expect(dashboard.requestSummary.total).toBe(2);
    expect(dashboard.requestSummary.byStatus.submitted).toBe(1);
    expect(dashboard.requestSummary.byStatus.pending_info).toBe(1);
    expect(dashboard.recentRequests).toHaveLength(1);
    expect(dashboard.pendingActions.pendingInfoCount).toBe(1);
    expect(dashboard.pendingActions.items[0]).toEqual(
      expect.objectContaining({ id: 'req-2' })
    );
    expect(dashboard.unreadNotifications).toBe(3);
  });

  it('throws when summary query fails', async () => {
    const summaryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'boom' },
      }),
    };

    const recentBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    };

    const pendingBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    };

    const unreadBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      is: jest.fn().mockResolvedValue({ count: 0, error: null }),
    };

    const adminClient = {
      from: jest
        .fn()
        .mockImplementationOnce(() => summaryBuilder)
        .mockImplementationOnce(() => recentBuilder)
        .mockImplementationOnce(() => pendingBuilder)
        .mockImplementationOnce(() => unreadBuilder),
    };

    mockRequireSupabaseAdmin.mockReturnValue(adminClient);

    await expect(getInvestorDashboard({ userId: 'user-1' })).rejects.toThrow(
      'FAILED_STATUS_SUMMARY'
    );
  });
});


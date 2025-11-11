import { getAdminDashboardStats } from '../src/services/admin-dashboard.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

const mockRequireSupabaseAdmin = requireSupabaseAdmin as jest.Mock;

describe('admin-dashboard.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns aggregated dashboard stats', async () => {
    const statusBuilder = {
      select: jest.fn().mockReturnValue({
        data: [{ status: 'submitted' }, { status: 'approved' }],
        error: null,
      }),
    };

    const trendBuilder = {
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockResolvedValue({
        data: [{ created_at: '2025-11-08T06:00:00Z' }],
        error: null,
      }),
    };

    const eventsBuilder = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          {
            request_id: 'req-1',
            to_status: 'submitted',
            created_at: '2025-11-01T00:00:00Z',
          },
          {
            request_id: 'req-1',
            to_status: 'approved',
            created_at: '2025-11-03T00:00:00Z',
          },
        ],
        error: null,
      }),
    };

    const stuckBuilder = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'req-1',
            request_number: 'INV-001',
            status: 'pending_info',
            created_at: '2025-11-01T00:00:00Z',
            updated_at: '2025-11-05T00:00:00Z',
            investor: { email: 'investor@example.com' },
          },
        ],
        error: null,
      }),
    };

    const pendingInfoBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 4,
      }),
    };

    const pendingInfoOverdueBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      lt: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 1,
      }),
    };

    const attachmentBaseBuilder = {
      select: jest.fn().mockReturnThis(),
      neq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 5,
      }),
    };

    const attachmentWithBuilder = {
      select: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 4,
      }),
    };

    const notificationTotalBuilder = {
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 20,
      }),
    };

    const notificationFailedBuilder = {
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
        count: 2,
      }),
    };

    const adminClient = {
      from: jest
        .fn()
        .mockImplementationOnce(() => statusBuilder)
        .mockImplementationOnce(() => trendBuilder)
        .mockImplementationOnce(() => eventsBuilder)
        .mockImplementationOnce(() => stuckBuilder)
        .mockImplementationOnce(() => pendingInfoBuilder)
        .mockImplementationOnce(() => pendingInfoOverdueBuilder)
        .mockImplementationOnce(() => attachmentBaseBuilder)
        .mockImplementationOnce(() => attachmentWithBuilder)
        .mockImplementationOnce(() => notificationTotalBuilder)
        .mockImplementationOnce(() => notificationFailedBuilder),
    };

    mockRequireSupabaseAdmin.mockReturnValue(adminClient);

    const result = await getAdminDashboardStats();

    expect(result.summary.totalRequests).toBe(2);
    expect(result.summary.byStatus).toEqual(
      expect.objectContaining({ submitted: 1, approved: 1 })
    );
    expect(result.summary.averageProcessingHours).toBeCloseTo(48);
    expect(result.summary.medianProcessingHours).toBeCloseTo(48);
    expect(result.kpis.processingHours.p90).toBeCloseTo(48);
    expect(result.trend).toHaveLength(14);
    expect(result.trend.some(point => point.count === 1)).toBe(true);
    expect(result.stuckRequests[0]).toEqual(
      expect.objectContaining({
        id: 'req-1',
        requestNumber: 'INV-001',
        investorEmail: 'investor@example.com',
        status: 'pending_info',
      })
    );
    expect(result.kpis.pendingInfoAging.total).toBe(4);
    expect(result.kpis.pendingInfoAging.overdue).toBe(1);
    expect(result.kpis.pendingInfoAging.alert).toBe(true);
    expect(result.kpis.attachmentSuccess.rate).toBeCloseTo(0.8);
    expect(result.kpis.notificationFailures.rate).toBeCloseTo(0.1);
  });

  it('throws when status summary fails', async () => {
    const statusBuilder = {
      select: jest.fn().mockReturnValue({
        data: null,
        error: { message: 'boom' },
      }),
    };

    const trendBuilder = {
      select: jest.fn().mockReturnThis(),
      gte: jest.fn().mockResolvedValue({ data: [], error: null }),
    };

    const eventsBuilder = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    };

    const stuckBuilder = {
      select: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({ data: [], error: null }),
    };

    const adminClient = {
      from: jest
        .fn()
        .mockImplementationOnce(() => statusBuilder)
        .mockImplementationOnce(() => trendBuilder)
        .mockImplementationOnce(() => eventsBuilder)
        .mockImplementationOnce(() => stuckBuilder)
        .mockImplementation(() => ({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          lt: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
          neq: jest.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
          gte: jest.fn().mockReturnThis(),
        })),
    };

    mockRequireSupabaseAdmin.mockReturnValue(adminClient);

    await expect(getAdminDashboardStats()).rejects.toThrow(
      'FAILED_STATUS_SUMMARY'
    );
  });
});


import { adminDashboardController } from '../src/controllers/admin-dashboard.controller';
import { getAdminDashboardStats } from '../src/services/admin-dashboard.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/services/admin-dashboard.service', () => ({
  getAdminDashboardStats: jest.fn(),
}));

const mockedGetStats = getAdminDashboardStats as jest.Mock;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
};

describe('adminDashboardController.stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const req = { user: undefined } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminDashboardController.stats(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockedGetStats).not.toHaveBeenCalled();
  });

  it('returns stats payload on success', async () => {
    mockedGetStats.mockResolvedValueOnce({
      summary: {
        totalRequests: 10,
        byStatus: { submitted: 5 },
        averageProcessingHours: 24,
        medianProcessingHours: 18,
      },
      trend: [],
      stuckRequests: [],
      kpis: {
        processingHours: { average: 24, median: 18, p90: 30 },
        pendingInfoAging: {
          total: 2,
          overdue: 0,
          thresholdHours: 24,
          rate: 0,
          alert: false,
        },
        attachmentSuccess: {
          totalRequests: 10,
          withAttachments: 8,
          rate: 0.8,
          alert: false,
        },
        notificationFailures: {
          total: 20,
          failed: 1,
          rate: 0.05,
          windowDays: 30,
          alert: false,
        },
      },
    });

    const req = { user: { id: 'admin-1' } } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminDashboardController.stats(req, res);

    expect(mockedGetStats).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: expect.objectContaining({ totalRequests: 10 }),
      })
    );
  });

  it('returns 500 when service throws', async () => {
    mockedGetStats.mockRejectedValueOnce(new Error('boom'));

    const req = { user: { id: 'admin-1' } } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminDashboardController.stats(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      })
    );
  });
});


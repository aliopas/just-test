import { investorDashboardController } from '../src/controllers/investor-dashboard.controller';
import { getInvestorDashboard } from '../src/services/investor-dashboard.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/services/investor-dashboard.service', () => ({
  getInvestorDashboard: jest.fn(),
}));

const mockedGetDashboard = getInvestorDashboard as jest.Mock;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe('investorDashboardController.getDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const req = {
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await investorDashboardController.getDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockedGetDashboard).not.toHaveBeenCalled();
  });

  it('returns dashboard payload on success', async () => {
    mockedGetDashboard.mockResolvedValueOnce({
      requestSummary: {
        total: 1,
        byStatus: {
          draft: 0,
          submitted: 1,
          screening: 0,
          pending_info: 0,
          compliance_review: 0,
          approved: 0,
          rejected: 0,
          settling: 0,
          completed: 0,
        },
      },
      recentRequests: [],
      pendingActions: { pendingInfoCount: 0, items: [] },
      unreadNotifications: 0,
      generatedAt: new Date().toISOString(),
    });

    const req = {
      user: { id: 'user-1' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await investorDashboardController.getDashboard(req, res);

    expect(mockedGetDashboard).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 500 when service throws', async () => {
    mockedGetDashboard.mockRejectedValueOnce(new Error('boom'));

    const req = {
      user: { id: 'user-1' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await investorDashboardController.getDashboard(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      })
    );
  });
});


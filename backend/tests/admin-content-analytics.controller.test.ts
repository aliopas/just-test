import { adminContentAnalyticsController } from '../src/controllers/admin-content-analytics.controller';
import { getContentAnalytics } from '../src/services/content-analytics.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/services/content-analytics.service', () => ({
  getContentAnalytics: jest.fn(),
}));

const mockedGetContentAnalytics = getContentAnalytics as jest.Mock;

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
}

describe('adminContentAnalyticsController.summary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when validation fails', async () => {
    const req = {
      query: { days: '0' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminContentAnalyticsController.summary(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedGetContentAnalytics).not.toHaveBeenCalled();
  });

  it('returns analytics payload from service', async () => {
    const payload = {
      summary: {
        totalImpressions: 10,
        totalViews: 5,
        overallCtr: 0.5,
        topNews: [],
      },
      trend: [],
      news: [],
      generatedAt: new Date().toISOString(),
      range: {
        from: new Date().toISOString(),
        to: new Date().toISOString(),
        days: 30,
      },
    };

    mockedGetContentAnalytics.mockResolvedValueOnce(payload);

    const req = {
      query: { days: '30', limitTop: '5' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminContentAnalyticsController.summary(req, res);

    expect(mockedGetContentAnalytics).toHaveBeenCalledWith({
      days: 30,
      limitTop: 5,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(payload);
  });

  it('returns 500 when service throws', async () => {
    mockedGetContentAnalytics.mockRejectedValueOnce(new Error('boom'));

    const req = {
      query: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminContentAnalyticsController.summary(req, res);

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



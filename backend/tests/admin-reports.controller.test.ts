import { adminReportsController } from '../src/controllers/admin-reports.controller';
import { getAdminRequestReport } from '../src/services/admin-reports.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/services/admin-reports.service', () => ({
  getAdminRequestReport: jest.fn(),
  adminRequestReportQuerySchema: {
    safeParse: jest.fn((value: unknown) => ({
      success: true,
      data: value,
    })),
  },
}));

const mockedGetReport = getAdminRequestReport as jest.Mock;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn();
  return res as Response & {
    status: jest.Mock;
    json: jest.Mock;
    send: jest.Mock;
    setHeader: jest.Mock;
  };
};

describe('adminReportsController.requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const req = {
      user: undefined,
      query: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminReportsController.requests(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns JSON report', async () => {
    mockedGetReport.mockResolvedValueOnce({
      format: 'json',
      requests: [],
      generatedAt: new Date().toISOString(),
    });

    const req = {
      user: { id: 'admin-1' },
      query: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminReportsController.requests(req, res);

    expect(mockedGetReport).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        format: 'json',
      })
    );
  });

  it('returns CSV when requested', async () => {
    mockedGetReport.mockResolvedValueOnce({
      format: 'csv',
      filename: 'requests-report.csv',
      content: 'Request Number,...',
    });

    const req = {
      user: { id: 'admin-1' },
      query: { format: 'csv' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminReportsController.requests(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Request Number,...');
  });

  it('returns 500 when service throws', async () => {
    mockedGetReport.mockRejectedValueOnce(new Error('boom'));

    const req = {
      user: { id: 'admin-1' },
      query: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminReportsController.requests(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INTERNAL_ERROR' }),
      })
    );
  });
});


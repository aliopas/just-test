import { adminAuditLogController } from '../src/controllers/admin-audit-log.controller';
import { listAdminAuditLogs } from '../src/services/admin-audit-log.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/services/admin-audit-log.service', () => ({
  listAdminAuditLogs: jest.fn(),
  adminAuditLogQuerySchema: {
    safeParse: jest.fn((value: unknown) => ({
      success: true,
      data: value,
    })),
  },
}));

const mockedList = listAdminAuditLogs as jest.Mock;

function createMockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
}

describe('adminAuditLogController.list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      user: undefined,
      query: {},
    } as unknown as AuthenticatedRequest;

    const res = createMockResponse();
    await adminAuditLogController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockedList).not.toHaveBeenCalled();
  });

  it('returns audit log data', async () => {
    mockedList.mockResolvedValueOnce({
      logs: [],
      meta: { page: 1, limit: 25, total: 0, pageCount: 1 },
    });

    const req = {
      user: { id: 'admin-1' },
      query: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminAuditLogController.list(req, res);

    expect(mockedList).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        logs: [],
      })
    );
  });

  it('bubbles service errors as 500', async () => {
    mockedList.mockRejectedValueOnce(new Error('boom'));

    const req = {
      user: { id: 'admin-1' },
      query: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminAuditLogController.list(req, res);

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


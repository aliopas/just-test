jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

import { adminRequestController } from '../src/controllers/admin-request.controller';
import {
  listAdminRequests,
  getAdminRequestDetail,
} from '../src/services/admin-request.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/services/admin-request.service', () => ({
  listAdminRequests: jest.fn(),
  getAdminRequestDetail: jest.fn(),
}));

const mockedListAdminRequests = listAdminRequests as jest.Mock;
const mockedGetAdminRequestDetail = getAdminRequestDetail as jest.Mock;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & { status: jest.Mock; json: jest.Mock };
};

describe('adminRequestController.listRequests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      query: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.listRequests(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 on invalid query', async () => {
    const req = {
      query: { page: 0 },
      user: { id: 'admin-1', email: 'admin@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.listRequests(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedListAdminRequests).not.toHaveBeenCalled();
  });

  it('returns list result on success', async () => {
    mockedListAdminRequests.mockResolvedValueOnce({
      requests: [],
      meta: {
        page: 1,
        limit: 25,
        total: 0,
        pageCount: 0,
        hasNext: false,
      },
    });

    const req = {
      query: { page: 1 },
      user: { id: 'admin-1', email: 'admin@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.listRequests(req, res);

    expect(mockedListAdminRequests).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        query: expect.any(Object),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requests: expect.any(Array),
        meta: expect.objectContaining({ page: 1 }),
      })
    );
  });

  it('returns 500 on unexpected errors', async () => {
    mockedListAdminRequests.mockRejectedValueOnce(new Error('boom'));

    const req = {
      query: { page: 1 },
      user: { id: 'admin-1', email: 'admin@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.listRequests(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('adminRequestController.getRequestDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-1' },
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.getRequestDetail(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when request not found', async () => {
    mockedGetAdminRequestDetail.mockRejectedValueOnce(new Error('REQUEST_NOT_FOUND'));

    const req = {
      params: { id: 'req-404' },
      user: { id: 'admin-1', email: 'admin@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.getRequestDetail(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns detail on success', async () => {
    mockedGetAdminRequestDetail.mockResolvedValueOnce({
      request: {
        id: 'req-1',
        requestNumber: 'INV-2025-000001',
        status: 'submitted',
      },
      attachments: [],
      events: [],
      comments: [],
    });

    const req = {
      params: { id: 'req-1' },
      user: { id: 'admin-1', email: 'admin@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.getRequestDetail(req, res);

    expect(mockedGetAdminRequestDetail).toHaveBeenCalledWith({
      actorId: 'admin-1',
      requestId: 'req-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({ id: 'req-1' }),
      })
    );
  });
});


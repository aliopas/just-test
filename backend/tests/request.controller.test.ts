import { requestController } from '../src/controllers/request.controller';
import {
  createInvestorRequest,
  submitInvestorRequest,
  listInvestorRequests,
  getInvestorRequestDetail,
} from '../src/services/request.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

jest.mock('../src/services/request.service', () => ({
  createInvestorRequest: jest.fn(),
  submitInvestorRequest: jest.fn(),
  listInvestorRequests: jest.fn(),
  getInvestorRequestDetail: jest.fn(),
}));

const mockedCreateRequest = createInvestorRequest as jest.Mock;
const mockedSubmitRequest = submitInvestorRequest as jest.Mock;
const mockedListRequests = listInvestorRequests as jest.Mock;
const mockedGetRequestDetail = getInvestorRequestDetail as jest.Mock;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

describe('requestController.create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      body: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
  });

  it('creates request and returns request info', async () => {
    mockedCreateRequest.mockResolvedValueOnce({
      id: 'req-1',
      requestNumber: 'INV-2025-000123',
    });
    const req = {
      body: {
        type: 'buy',
        amount: 5000,
        currency: 'SAR',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.create(req, res);

    expect(mockedCreateRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        payload: expect.objectContaining({ type: 'buy', amount: 5000 }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
        requestNumber: 'INV-2025-000123',
        status: 'draft',
      })
    );
  });
});

describe('requestController.submit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-1' },
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.submit(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 when submission succeeds', async () => {
    mockedSubmitRequest.mockResolvedValueOnce({ status: 'submitted' });

    const req = {
      params: { id: 'req-1' },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.submit(req, res);

    expect(mockedSubmitRequest).toHaveBeenCalledWith({
      requestId: 'req-1',
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
        status: 'submitted',
      })
    );
  });

  it('maps domain errors to HTTP responses', async () => {
    mockedSubmitRequest.mockRejectedValueOnce(new Error('REQUEST_NOT_FOUND'));

    const req = {
      params: { id: 'req-404' },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.submit(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'NOT_FOUND' }),
      })
    );
  });
});

describe('requestController.list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      query: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 for invalid query params', async () => {
    const req = {
      query: { page: 0 },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.list(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns request list on success', async () => {
    mockedListRequests.mockResolvedValueOnce({
      requests: [
        {
          id: 'req-1',
          requestNumber: 'INV-001',
          status: 'draft',
          type: 'buy',
          amount: 1000,
          currency: 'SAR',
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          lastEvent: null,
          targetPrice: null,
          expiryAt: null,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        pageCount: 1,
        hasNext: false,
      },
    });

    const req = {
      query: {},
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.list(req, res);

    expect(mockedListRequests).toHaveBeenCalledWith({
      userId: 'user-1',
      query: {},
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requests: expect.any(Array),
        meta: expect.objectContaining({ page: 1 }),
      })
    );
  });
});

describe('requestController.detail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-1' },
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.detail(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when request not found', async () => {
    mockedGetRequestDetail.mockRejectedValueOnce(new Error('REQUEST_NOT_FOUND'));

    const req = {
      params: { id: 'req-404' },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.detail(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns request detail on success', async () => {
    mockedGetRequestDetail.mockResolvedValueOnce({
      request: {
        id: 'req-1',
        requestNumber: 'INV-2025-000001',
        status: 'draft',
        type: 'buy',
        amount: 2000,
        currency: 'SAR',
        notes: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        targetPrice: null,
        expiryAt: null,
      },
      attachments: [],
      events: [],
      comments: [],
    });

    const req = {
      params: { id: 'req-1' },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.detail(req, res);

    expect(mockedGetRequestDetail).toHaveBeenCalledWith({
      requestId: 'req-1',
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        request: expect.objectContaining({ id: 'req-1' }),
        attachments: expect.any(Array),
        events: expect.any(Array),
      })
    );
  });
});


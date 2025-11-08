import { requestController } from '../src/controllers/request.controller';
import {
  createInvestorRequest,
  submitInvestorRequest,
} from '../src/services/request.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/services/request.service', () => ({
  createInvestorRequest: jest.fn(),
  submitInvestorRequest: jest.fn(),
}));

const mockedCreateRequest = createInvestorRequest as jest.Mock;
const mockedSubmitRequest = submitInvestorRequest as jest.Mock;

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


jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

import { adminRequestController } from '../src/controllers/admin-request.controller';
import {
  listAdminRequests,
  getAdminRequestDetail,
  approveAdminRequest,
  rejectAdminRequest,
  requestInfoFromInvestor,
  listAdminRequestComments,
  addAdminRequestComment,
} from '../src/services/admin-request.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/services/admin-request.service', () => ({
  listAdminRequests: jest.fn(),
  getAdminRequestDetail: jest.fn(),
  approveAdminRequest: jest.fn(),
  rejectAdminRequest: jest.fn(),
  requestInfoFromInvestor: jest.fn(),
  listAdminRequestComments: jest.fn(),
  addAdminRequestComment: jest.fn(),
}));

const mockedListAdminRequests = listAdminRequests as jest.Mock;
const mockedGetAdminRequestDetail = getAdminRequestDetail as jest.Mock;
const mockedApproveAdminRequest = approveAdminRequest as jest.Mock;
const mockedRejectAdminRequest = rejectAdminRequest as jest.Mock;
const mockedRequestInfo = requestInfoFromInvestor as jest.Mock;
const mockedListComments = listAdminRequestComments as jest.Mock;
const mockedAddComment = addAdminRequestComment as jest.Mock;

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

describe('adminRequestController.approveRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-1' },
      body: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.approveRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when request not found', async () => {
    mockedApproveAdminRequest.mockRejectedValueOnce(new Error('Request req-404 not found'));

    const req = {
      params: { id: 'req-404' },
      body: {},
      user: { id: 'admin-1', email: 'admin@example.com' },
      ip: '::1',
      headers: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.approveRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 409 for invalid state', async () => {
    mockedApproveAdminRequest.mockRejectedValueOnce(
      new Error('Transition from "draft" to "approved" is not permitted')
    );

    const req = {
      params: { id: 'req-1' },
      body: { note: 'approve please' },
      user: { id: 'admin-1', email: 'admin@example.com' },
      ip: '::1',
      headers: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.approveRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('returns 200 on success', async () => {
    mockedApproveAdminRequest.mockResolvedValueOnce({
      request: { status: 'approved' },
    });

    const req = {
      params: { id: 'req-1' },
      body: { note: 'Looks good' },
      user: { id: 'admin-1', email: 'admin@example.com' },
      ip: '::1',
      headers: { 'user-agent': 'jest' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.approveRequest(req, res);

    expect(mockedApproveAdminRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-1',
        requestId: 'req-1',
        note: 'Looks good',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-1',
        status: 'approved',
      })
    );
  });
});

describe('adminRequestController.rejectRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-2' },
      body: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.rejectRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 when request not found', async () => {
    mockedRejectAdminRequest.mockRejectedValueOnce(new Error('Request req-2 not found'));

    const req = {
      params: { id: 'req-2' },
      body: {},
      user: { id: 'admin-8', email: 'admin@example.com' },
      ip: '::1',
      headers: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.rejectRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 409 for invalid state', async () => {
    mockedRejectAdminRequest.mockRejectedValueOnce(
      new Error('Request is already in the target status')
    );

    const req = {
      params: { id: 'req-2' },
      body: { note: 'Reject reason' },
      user: { id: 'admin-8', email: 'admin@example.com' },
      ip: '::1',
      headers: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.rejectRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it('returns 200 on success', async () => {
    mockedRejectAdminRequest.mockResolvedValueOnce({
      request: { status: 'rejected' },
    });

    const req = {
      params: { id: 'req-2' },
      body: { note: 'Rejected due to risk' },
      user: { id: 'admin-8', email: 'admin@example.com' },
      ip: '::1',
      headers: { 'user-agent': 'jest' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.rejectRequest(req, res);

    expect(mockedRejectAdminRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-8',
        requestId: 'req-2',
        note: 'Rejected due to risk',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-2',
        status: 'rejected',
      })
    );
  });
});

describe('adminRequestController.requestInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-3' },
      body: { message: 'Need more documents' },
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.requestInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when message missing', async () => {
    const req = {
      params: { id: 'req-3' },
      body: { message: '' },
      user: { id: 'admin-4', email: 'admin@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.requestInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedRequestInfo).not.toHaveBeenCalled();
  });

  it('returns 404 when request not found', async () => {
    mockedRequestInfo.mockRejectedValueOnce(new Error('Request req-3 not found'));

    const req = {
      params: { id: 'req-3' },
      body: { message: 'Please upload updated bank statement.' },
      user: { id: 'admin-4', email: 'admin@example.com' },
      ip: '::1',
      headers: {},
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.requestInfo(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on success', async () => {
    mockedRequestInfo.mockResolvedValueOnce({
      request: { status: 'pending_info' },
    });

    const req = {
      params: { id: 'req-3' },
      body: { message: 'Please provide additional documentation.' },
      user: { id: 'admin-4', email: 'admin@example.com' },
      ip: '::1',
      headers: { 'user-agent': 'jest' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.requestInfo(req, res);

    expect(mockedRequestInfo).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-4',
        requestId: 'req-3',
        message: expect.stringContaining('Please provide'),
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'req-3',
        status: 'pending_info',
      })
    );
  });
});

describe('adminRequestController.listComments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-4' },
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.listComments(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with comments', async () => {
    const comments = [{ id: 'com-1', note: 'Test', createdAt: '2025-01-01' }];
    mockedListComments.mockResolvedValueOnce(comments);

    const req = {
      params: { id: 'req-4' },
      user: { id: 'admin-5', email: 'admin@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.listComments(req, res);

    expect(mockedListComments).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-5',
        requestId: 'req-4',
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ comments });
  });
});

describe('adminRequestController.addComment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-5' },
      body: { comment: 'Hello' },
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when comment missing', async () => {
    const req = {
      params: { id: 'req-5' },
      body: { comment: '   ' },
      user: { id: 'admin-6', email: 'admin@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 201 on success', async () => {
    const commentResponse = { id: 'com-9', note: 'New note' };
    mockedAddComment.mockResolvedValueOnce(commentResponse);

    const req = {
      params: { id: 'req-5' },
      body: { comment: 'New note' },
      user: { id: 'admin-6', email: 'admin@example.com' },
      ip: '::1',
      headers: { 'user-agent': 'jest' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await adminRequestController.addComment(req, res);

    expect(mockedAddComment).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'admin-6',
        requestId: 'req-5',
        comment: 'New note',
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(commentResponse);
  });
});


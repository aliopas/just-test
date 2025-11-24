import { requestController } from '../src/controllers/request.controller';
import {
  createInvestorRequest,
  createPartnershipRequest,
  createBoardNominationRequest,
  createFeedbackRequest,
  submitInvestorRequest,
  listInvestorRequests,
  getInvestorRequestDetail,
  createRequestAttachmentUploadUrl,
} from '../src/services/request.service';
import { getInvestorRequestTimeline } from '../src/services/request-timeline.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

jest.mock('../src/services/request.service', () => ({
  createInvestorRequest: jest.fn(),
  createPartnershipRequest: jest.fn(),
  createBoardNominationRequest: jest.fn(),
  createFeedbackRequest: jest.fn(),
  submitInvestorRequest: jest.fn(),
  listInvestorRequests: jest.fn(),
  getInvestorRequestDetail: jest.fn(),
  createRequestAttachmentUploadUrl: jest.fn(),
}));

jest.mock('../src/services/request-timeline.service', () => ({
  getInvestorRequestTimeline: jest.fn(),
}));

const mockedCreateRequest = createInvestorRequest as jest.Mock;
const mockedCreatePartnershipRequest = createPartnershipRequest as jest.Mock;
const mockedCreateBoardNominationRequest = createBoardNominationRequest as jest.Mock;
const mockedCreateFeedbackRequest = createFeedbackRequest as jest.Mock;
const mockedSubmitRequest = submitInvestorRequest as jest.Mock;
const mockedListRequests = listInvestorRequests as jest.Mock;
const mockedGetRequestDetail = getInvestorRequestDetail as jest.Mock;
const mockedGetTimeline = getInvestorRequestTimeline as jest.Mock;
const mockedCreateAttachmentUploadUrl = createRequestAttachmentUploadUrl as jest.Mock;

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

describe('requestController.timeline', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      params: { id: 'req-1' },
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.timeline(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 when request id missing', async () => {
    const req = {
      params: {},
      user: { id: 'user-1' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.timeline(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns timeline payload on success', async () => {
    mockedGetTimeline.mockResolvedValueOnce({
      requestId: 'req-1',
      requestNumber: 'INV-001',
      items: [],
    });
    const req = {
      params: { id: 'req-1' },
      user: { id: 'user-1' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.timeline(req, res);

    expect(mockedGetTimeline).toHaveBeenCalledWith({
      requestId: 'req-1',
      userId: 'user-1',
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ requestId: 'req-1', items: [] })
    );
  });

  it('maps domain errors to HTTP responses', async () => {
    mockedGetTimeline.mockRejectedValueOnce(new Error('REQUEST_NOT_FOUND'));
    const req = {
      params: { id: 'req-1' },
      user: { id: 'user-1' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.timeline(req, res);

    expect(res.status).toHaveBeenCalledWith(404);

    mockedGetTimeline.mockRejectedValueOnce(new Error('REQUEST_NOT_OWNED'));
    await requestController.timeline(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });
});

describe('requestController.presignAttachment', () => {
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

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
  });

  it('returns 400 when request id is missing', async () => {
    const req = {
      params: {},
      body: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'VALIDATION_ERROR' }),
      })
    );
  });

  it('returns 400 when payload is invalid', async () => {
    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'invalid',
        fileSize: 'not-a-number',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.any(Array),
        }),
      })
    );
    expect(mockedCreateAttachmentUploadUrl).not.toHaveBeenCalled();
  });

  it('returns 400 when file type is not allowed', async () => {
    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'document.exe',
        fileType: 'application/x-msdownload',
        fileSize: 1000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateAttachmentUploadUrl).not.toHaveBeenCalled();
  });

  it('returns 400 when file size exceeds 10MB', async () => {
    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'large-document.pdf',
        fileType: 'application/pdf',
        fileSize: 11 * 1024 * 1024, // 11MB
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateAttachmentUploadUrl).not.toHaveBeenCalled();
  });

  it('returns 404 when request not found', async () => {
    mockedCreateAttachmentUploadUrl.mockRejectedValueOnce(
      new Error('REQUEST_NOT_FOUND')
    );

    const req = {
      params: { id: 'req-404' },
      body: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'NOT_FOUND' }),
      })
    );
  });

  it('returns 403 when request not owned by user', async () => {
    mockedCreateAttachmentUploadUrl.mockRejectedValueOnce(
      new Error('REQUEST_NOT_OWNED')
    );

    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'FORBIDDEN' }),
      })
    );
  });

  it('returns 409 when request is not editable', async () => {
    mockedCreateAttachmentUploadUrl.mockRejectedValueOnce(
      new Error('REQUEST_NOT_EDITABLE')
    );

    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'INVALID_STATE' }),
      })
    );
  });

  it('returns presigned URL on success', async () => {
    mockedCreateAttachmentUploadUrl.mockResolvedValueOnce({
      attachmentId: 'attach-1',
      bucket: 'request-attachments',
      storageKey: 'request-attachments/req-1/2025/01/uuid.pdf',
      uploadUrl: 'https://storage.supabase.co/upload-url',
      token: 'token-123',
      path: 'req-1/2025/01/uuid.pdf',
      headers: {
        'Content-Type': 'application/pdf',
        'x-upsert': 'false',
      },
    });

    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(mockedCreateAttachmentUploadUrl).toHaveBeenCalledWith({
      requestId: 'req-1',
      userId: 'user-1',
      input: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        attachmentId: 'attach-1',
        bucket: 'request-attachments',
        uploadUrl: 'https://storage.supabase.co/upload-url',
        headers: expect.objectContaining({
          'Content-Type': 'application/pdf',
        }),
      })
    );
  });

  it('handles internal errors', async () => {
    mockedCreateAttachmentUploadUrl.mockRejectedValueOnce(
      new Error('Internal server error')
    );

    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create attachment upload url',
        }),
      })
    );
  });

  it('accepts PDF files', async () => {
    mockedCreateAttachmentUploadUrl.mockResolvedValueOnce({
      attachmentId: 'attach-1',
      bucket: 'request-attachments',
      storageKey: 'request-attachments/req-1/2025/01/uuid.pdf',
      uploadUrl: 'https://storage.supabase.co/upload-url',
      token: 'token-123',
      path: 'req-1/2025/01/uuid.pdf',
      headers: {
        'Content-Type': 'application/pdf',
        'x-upsert': 'false',
      },
    });

    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'document.pdf',
        fileType: 'application/pdf',
        fileSize: 1024,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('accepts JPG files', async () => {
    mockedCreateAttachmentUploadUrl.mockResolvedValueOnce({
      attachmentId: 'attach-1',
      bucket: 'request-attachments',
      storageKey: 'request-attachments/req-1/2025/01/uuid.jpg',
      uploadUrl: 'https://storage.supabase.co/upload-url',
      token: 'token-123',
      path: 'req-1/2025/01/uuid.jpg',
      headers: {
        'Content-Type': 'image/jpeg',
        'x-upsert': 'false',
      },
    });

    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'image.jpg',
        fileType: 'image/jpeg',
        fileSize: 2048,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('accepts PNG files', async () => {
    mockedCreateAttachmentUploadUrl.mockResolvedValueOnce({
      attachmentId: 'attach-1',
      bucket: 'request-attachments',
      storageKey: 'request-attachments/req-1/2025/01/uuid.png',
      uploadUrl: 'https://storage.supabase.co/upload-url',
      token: 'token-123',
      path: 'req-1/2025/01/uuid.png',
      headers: {
        'Content-Type': 'image/png',
        'x-upsert': 'false',
      },
    });

    const req = {
      params: { id: 'req-1' },
      body: {
        fileName: 'image.png',
        fileType: 'image/png',
        fileSize: 3072,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.presignAttachment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('requestController.createPartnership', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      body: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
    expect(mockedCreatePartnershipRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when payload is invalid', async () => {
    const req = {
      body: {
        partnershipPlan: 'too short', // Less than 50 characters
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.any(Array),
        }),
      })
    );
    expect(mockedCreatePartnershipRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when partnership plan is missing', async () => {
    const req = {
      body: {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        proposedAmount: 1000000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreatePartnershipRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when partnership plan is too short', async () => {
    const req = {
      body: {
        partnershipPlan: 'Short plan', // Less than 50 characters
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreatePartnershipRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when proposed amount is negative', async () => {
    const req = {
      body: {
        partnershipPlan: 'A'.repeat(100),
        proposedAmount: -1000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreatePartnershipRequest).not.toHaveBeenCalled();
  });

  it('returns 404 when project not found', async () => {
    mockedCreatePartnershipRequest.mockRejectedValueOnce(
      new Error('PROJECT_NOT_FOUND')
    );

    const req = {
      body: {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        partnershipPlan: 'A'.repeat(100),
        proposedAmount: 1000000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'NOT_FOUND',
          message: 'Project not found',
        }),
      })
    );
  });

  it('returns 201 with partnership request details on success', async () => {
    mockedCreatePartnershipRequest.mockResolvedValueOnce({
      id: 'req-partnership-1',
      requestNumber: 'INV-2025-000001',
    });

    const req = {
      body: {
        partnershipPlan: 'A'.repeat(100),
        proposedAmount: 1000000,
        notes: 'Additional notes',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(mockedCreatePartnershipRequest).toHaveBeenCalledWith({
      userId: 'user-1',
      payload: {
        partnershipPlan: 'A'.repeat(100),
        proposedAmount: 1000000,
        notes: 'Additional notes',
        projectId: undefined,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      requestId: 'req-partnership-1',
      requestNumber: 'INV-2025-000001',
      status: 'draft',
      type: 'partnership',
    });
  });

  it('returns 201 with optional projectId on success', async () => {
    mockedCreatePartnershipRequest.mockResolvedValueOnce({
      id: 'req-partnership-2',
      requestNumber: 'INV-2025-000002',
    });

    const req = {
      body: {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        partnershipPlan: 'A'.repeat(100),
        proposedAmount: 2000000,
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(mockedCreatePartnershipRequest).toHaveBeenCalledWith({
      userId: 'user-1',
      payload: {
        projectId: '123e4567-e89b-12d3-a456-426614174000',
        partnershipPlan: 'A'.repeat(100),
        proposedAmount: 2000000,
        notes: undefined,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('handles internal errors', async () => {
    mockedCreatePartnershipRequest.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const req = {
      body: {
        partnershipPlan: 'A'.repeat(100),
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createPartnership(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create partnership request',
        }),
      })
    );
  });
});

describe('requestController.createBoardNomination', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      body: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
    expect(mockedCreateBoardNominationRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when payload is invalid', async () => {
    const req = {
      body: {
        cvSummary: 'too short', // Less than 100 characters
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.any(Array),
        }),
      })
    );
    expect(mockedCreateBoardNominationRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when cvSummary is missing', async () => {
    const req = {
      body: {
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateBoardNominationRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when cvSummary is too short', async () => {
    const req = {
      body: {
        cvSummary: 'Short summary', // Less than 100 characters
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateBoardNominationRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when experience is too short', async () => {
    const req = {
      body: {
        cvSummary: 'A'.repeat(100),
        experience: 'Short', // Less than 100 characters
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateBoardNominationRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when motivations is too short', async () => {
    const req = {
      body: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'Short', // Less than 100 characters
        qualifications: 'A'.repeat(50),
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateBoardNominationRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when qualifications is too short', async () => {
    const req = {
      body: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'Short', // Less than 50 characters
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateBoardNominationRequest).not.toHaveBeenCalled();
  });

  it('returns 201 with board nomination request details on success', async () => {
    mockedCreateBoardNominationRequest.mockResolvedValueOnce({
      id: 'req-board-nomination-1',
      requestNumber: 'INV-2025-000001',
    });

    const req = {
      body: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
        notes: 'Additional notes',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(mockedCreateBoardNominationRequest).toHaveBeenCalledWith({
      userId: 'user-1',
      payload: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
        notes: 'Additional notes',
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      requestId: 'req-board-nomination-1',
      requestNumber: 'INV-2025-000001',
      status: 'draft',
      type: 'board_nomination',
    });
  });

  it('returns 201 without notes field on success', async () => {
    mockedCreateBoardNominationRequest.mockResolvedValueOnce({
      id: 'req-board-nomination-2',
      requestNumber: 'INV-2025-000002',
    });

    const req = {
      body: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(mockedCreateBoardNominationRequest).toHaveBeenCalledWith({
      userId: 'user-1',
      payload: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
        notes: undefined,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('handles internal errors', async () => {
    mockedCreateBoardNominationRequest.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const req = {
      body: {
        cvSummary: 'A'.repeat(100),
        experience: 'A'.repeat(100),
        motivations: 'A'.repeat(100),
        qualifications: 'A'.repeat(50),
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createBoardNomination(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create board nomination request',
        }),
      })
    );
  });
});

describe('requestController.createFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when user not authenticated', async () => {
    const req = {
      body: {},
      user: undefined,
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
      })
    );
    expect(mockedCreateFeedbackRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when payload is invalid', async () => {
    const req = {
      body: {
        subject: 'too', // Less than 5 characters
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          details: expect.any(Array),
        }),
      })
    );
    expect(mockedCreateFeedbackRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when subject is missing', async () => {
    const req = {
      body: {
        category: 'suggestion',
        description: 'A'.repeat(50),
        priority: 'medium',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateFeedbackRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when subject is too short', async () => {
    const req = {
      body: {
        subject: 'too', // Less than 5 characters
        category: 'suggestion',
        description: 'A'.repeat(50),
        priority: 'medium',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateFeedbackRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when description is missing', async () => {
    const req = {
      body: {
        subject: 'Valid subject',
        category: 'suggestion',
        priority: 'medium',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateFeedbackRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when description is too short', async () => {
    const req = {
      body: {
        subject: 'Valid subject',
        category: 'suggestion',
        description: 'Short', // Less than 50 characters
        priority: 'medium',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateFeedbackRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when category is invalid', async () => {
    const req = {
      body: {
        subject: 'Valid subject',
        category: 'invalid_category',
        description: 'A'.repeat(50),
        priority: 'medium',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateFeedbackRequest).not.toHaveBeenCalled();
  });

  it('returns 400 when priority is invalid', async () => {
    const req = {
      body: {
        subject: 'Valid subject',
        category: 'suggestion',
        description: 'A'.repeat(50),
        priority: 'invalid_priority',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockedCreateFeedbackRequest).not.toHaveBeenCalled();
  });

  it('returns 201 with feedback request details on success', async () => {
    mockedCreateFeedbackRequest.mockResolvedValueOnce({
      id: 'req-feedback-1',
      requestNumber: 'INV-2025-000001',
    });

    const req = {
      body: {
        subject: 'Valid subject for feedback',
        category: 'suggestion',
        description: 'A'.repeat(50),
        priority: 'high',
        notes: 'Additional notes',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(mockedCreateFeedbackRequest).toHaveBeenCalledWith({
      userId: 'user-1',
      payload: {
        subject: 'Valid subject for feedback',
        category: 'suggestion',
        description: 'A'.repeat(50),
        priority: 'high',
        notes: 'Additional notes',
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      requestId: 'req-feedback-1',
      requestNumber: 'INV-2025-000001',
      status: 'draft',
      type: 'feedback',
    });
  });

  it('returns 201 with all category types on success', async () => {
    const categories = ['suggestion', 'complaint', 'question', 'other'];
    const priorities = ['low', 'medium', 'high'];

    for (const category of categories) {
      for (const priority of priorities) {
        mockedCreateFeedbackRequest.mockResolvedValueOnce({
          id: `req-feedback-${category}-${priority}`,
          requestNumber: 'INV-2025-000001',
        });

        const req = {
          body: {
            subject: `Valid subject for ${category}`,
            category,
            description: 'A'.repeat(50),
            priority,
          },
          user: { id: 'user-1', email: 'user@example.com' },
        } as unknown as AuthenticatedRequest;
        const res = createMockResponse();

        await requestController.createFeedback(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
      }
    }
  });

  it('returns 201 without notes field on success', async () => {
    mockedCreateFeedbackRequest.mockResolvedValueOnce({
      id: 'req-feedback-2',
      requestNumber: 'INV-2025-000002',
    });

    const req = {
      body: {
        subject: 'Valid subject for feedback',
        category: 'question',
        description: 'A'.repeat(50),
        priority: 'low',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(mockedCreateFeedbackRequest).toHaveBeenCalledWith({
      userId: 'user-1',
      payload: {
        subject: 'Valid subject for feedback',
        category: 'question',
        description: 'A'.repeat(50),
        priority: 'low',
        notes: undefined,
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('handles internal errors', async () => {
    mockedCreateFeedbackRequest.mockRejectedValueOnce(
      new Error('Database connection failed')
    );

    const req = {
      body: {
        subject: 'Valid subject for feedback',
        category: 'suggestion',
        description: 'A'.repeat(50),
        priority: 'medium',
      },
      user: { id: 'user-1', email: 'user@example.com' },
    } as unknown as AuthenticatedRequest;
    const res = createMockResponse();

    await requestController.createFeedback(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
          message: 'Failed to create feedback request',
        }),
      })
    );
  });
});


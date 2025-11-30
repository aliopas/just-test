/**
 * Automated tests for request forms submission
 * Tests partnership, board_nomination, and feedback request types
 */

import { requestController } from '../src/controllers/request.controller';
import { createInvestorRequest } from '../src/services/request.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';
import type { Response } from 'express';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

jest.mock('../src/services/request.service', () => ({
  createInvestorRequest: jest.fn(),
}));

jest.mock('../src/services/request-number.service', () => ({
  generateRequestNumber: jest.fn(() => Promise.resolve('INV-2025-000123')),
}));

jest.mock('../src/services/notification.service', () => ({
  notifyAdminsOfSubmission: jest.fn(),
  notifyInvestorOfSubmission: jest.fn(),
}));

const mockedCreateRequest = createInvestorRequest as jest.Mock;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response & {
    status: jest.Mock;
    json: jest.Mock;
  };
};

const createMockRequest = (body: Record<string, unknown>) => {
  return {
    body,
    user: { id: 'user-test-123', email: 'test@example.com' },
  } as unknown as AuthenticatedRequest;
};

describe('Request Forms Submission - Automated Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Partnership Request Form Submission', () => {
    it('should create partnership request with all required fields', async () => {
      mockedCreateRequest.mockResolvedValueOnce({
        id: 'req-partnership-1',
        requestNumber: 'INV-2025-000123',
      });

      const req = createMockRequest({
        type: 'partnership',
        metadata: {
          companyName: 'شركة تجريبية',
          partnershipType: 'strategic',
          contactPerson: 'أحمد محمد',
          contactEmail: 'test@example.com',
          partnershipDetails: 'تفاصيل تجريبية',
        },
        notes: 'تفاصيل تجريبية',
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      expect(mockedCreateRequest).toHaveBeenCalledWith({
        userId: 'user-test-123',
        payload: expect.objectContaining({
          type: 'partnership',
          metadata: expect.objectContaining({
            companyName: 'شركة تجريبية',
            partnershipType: 'strategic',
            contactPerson: 'أحمد محمد',
            contactEmail: 'test@example.com',
          }),
        }),
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-partnership-1',
          requestNumber: 'INV-2025-000123',
          status: 'draft',
        })
      );
    });

    it('should create partnership request with optional investment amount', async () => {
      mockedCreateRequest.mockResolvedValueOnce({
        id: 'req-partnership-2',
        requestNumber: 'INV-2025-000124',
      });

      const req = createMockRequest({
        type: 'partnership',
        amount: 100000,
        currency: 'SAR',
        metadata: {
          companyName: 'شركة تجريبية',
          partnershipType: 'financial',
          contactPerson: 'أحمد محمد',
          contactEmail: 'test@example.com',
        },
        notes: 'تفاصيل تجريبية',
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      expect(mockedCreateRequest).toHaveBeenCalledWith({
        userId: 'user-test-123',
        payload: expect.objectContaining({
          type: 'partnership',
          amount: 100000,
          currency: 'SAR',
          metadata: expect.objectContaining({
            companyName: 'شركة تجريبية',
            partnershipType: 'financial',
          }),
        }),
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should create partnership request without amount/currency when not provided', async () => {
      mockedCreateRequest.mockResolvedValueOnce({
        id: 'req-partnership-3',
        requestNumber: 'INV-2025-000125',
      });

      const req = createMockRequest({
        type: 'partnership',
        metadata: {
          companyName: 'شركة تجريبية',
          partnershipType: 'technical',
          contactPerson: 'أحمد محمد',
          contactEmail: 'test@example.com',
        },
        notes: 'تفاصيل تجريبية',
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      // Verify that amount and currency are not sent when not provided
      const callArgs = mockedCreateRequest.mock.calls[0][0];
      // Zod may include optional fields as undefined or omit them entirely
      if ('amount' in callArgs.payload) {
        expect(callArgs.payload.amount).toBeUndefined();
      }
      if ('currency' in callArgs.payload) {
        expect(callArgs.payload.currency).toBeUndefined();
      }

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('Board Nomination Request Form Submission', () => {
    it('should create board_nomination request without amount/currency', async () => {
      mockedCreateRequest.mockResolvedValueOnce({
        id: 'req-board-1',
        requestNumber: 'INV-2025-000126',
      });

      const req = createMockRequest({
        type: 'board_nomination',
        metadata: {
          nomineeName: 'محمد علي',
          nomineePosition: 'عضو مجلس إدارة',
          nomineeQualifications: 'خبرة 10 سنوات في القطاع المالي',
          nominationReason: 'سبب الترشيح هنا',
          nomineeEmail: 'nominee@example.com',
          nomineePhone: '+966501234567',
        },
        notes: 'سبب الترشيح هنا',
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      expect(mockedCreateRequest).toHaveBeenCalledWith({
        userId: 'user-test-123',
        payload: expect.objectContaining({
          type: 'board_nomination',
          metadata: expect.objectContaining({
            nomineeName: 'محمد علي',
            nomineePosition: 'عضو مجلس إدارة',
            nomineeQualifications: 'خبرة 10 سنوات في القطاع المالي',
            nominationReason: 'سبب الترشيح هنا',
          }),
        }),
      });

      // Verify that amount and currency are NOT sent for board_nomination
      const callArgs = mockedCreateRequest.mock.calls[0][0];
      // Zod may include optional fields as undefined or omit them entirely
      if ('amount' in callArgs.payload) {
        expect(callArgs.payload.amount).toBeUndefined();
      }
      if ('currency' in callArgs.payload) {
        expect(callArgs.payload.currency).toBeUndefined();
      }

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-board-1',
          status: 'draft',
        })
      );
    });

    it('should create board_nomination request with optional fields', async () => {
      mockedCreateRequest.mockResolvedValueOnce({
        id: 'req-board-2',
        requestNumber: 'INV-2025-000127',
      });

      const req = createMockRequest({
        type: 'board_nomination',
        metadata: {
          nomineeName: 'محمد علي',
          nomineePosition: 'عضو مجلس إدارة',
          nomineeQualifications: 'خبرة 10 سنوات في القطاع المالي',
          nominationReason: 'سبب الترشيح هنا',
          // Optional fields omitted
        },
        notes: 'سبب الترشيح هنا',
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      expect(mockedCreateRequest).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);

      // Verify no amount/currency
      const callArgs = mockedCreateRequest.mock.calls[0][0];
      // Zod may include optional fields as undefined or omit them entirely
      if ('amount' in callArgs.payload) {
        expect(callArgs.payload.amount).toBeUndefined();
      }
      if ('currency' in callArgs.payload) {
        expect(callArgs.payload.currency).toBeUndefined();
      }
    });
  });

  describe('Feedback Request Form Submission', () => {
    it('should create feedback request without amount/currency', async () => {
      mockedCreateRequest.mockResolvedValueOnce({
        id: 'req-feedback-1',
        requestNumber: 'INV-2025-000128',
      });

      const req = createMockRequest({
        type: 'feedback',
        metadata: {
          feedbackType: 'suggestion',
          subject: 'اقتراح تحسين',
          priority: 'medium',
        },
        notes: 'أقترح إضافة ميزة جديدة...',
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      expect(mockedCreateRequest).toHaveBeenCalledWith({
        userId: 'user-test-123',
        payload: expect.objectContaining({
          type: 'feedback',
          metadata: expect.objectContaining({
            feedbackType: 'suggestion',
            subject: 'اقتراح تحسين',
            priority: 'medium',
          }),
          notes: 'أقترح إضافة ميزة جديدة...',
        }),
      });

        // Verify that amount and currency are NOT sent for feedback
        const callArgs = mockedCreateRequest.mock.calls[0][0];
        // Zod may include optional fields as undefined or omit them entirely
        if ('amount' in callArgs.payload) {
          expect(callArgs.payload.amount).toBeUndefined();
        }
        if ('currency' in callArgs.payload) {
          expect(callArgs.payload.currency).toBeUndefined();
        }

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'req-feedback-1',
          status: 'draft',
        })
      );
    });

    it('should create feedback request with different feedback types', async () => {
      const feedbackTypes = ['suggestion', 'complaint', 'question', 'other'];

      for (const feedbackType of feedbackTypes) {
        jest.clearAllMocks();

        mockedCreateRequest.mockResolvedValueOnce({
          id: `req-feedback-${feedbackType}`,
          requestNumber: 'INV-2025-000129',
        });

        const req = createMockRequest({
          type: 'feedback',
          metadata: {
            feedbackType,
            subject: `Test ${feedbackType}`,
            priority: 'high',
          },
          notes: 'Test feedback message',
        });

        const res = createMockResponse();

        await requestController.create(req, res);

        expect(mockedCreateRequest).toHaveBeenCalledWith({
          userId: 'user-test-123',
          payload: expect.objectContaining({
            type: 'feedback',
            metadata: expect.objectContaining({
              feedbackType,
            }),
          }),
        });

        // Verify no amount/currency for any feedback type
        const callArgs = mockedCreateRequest.mock.calls[0][0];
        // Zod may include optional fields as undefined or omit them entirely
        if ('amount' in callArgs.payload) {
          expect(callArgs.payload.amount).toBeUndefined();
        }
        if ('currency' in callArgs.payload) {
          expect(callArgs.payload.currency).toBeUndefined();
        }

        expect(res.status).toHaveBeenCalledWith(201);
      }
    });

    it('should create feedback request with different priority levels', async () => {
      const priorities = ['low', 'medium', 'high'];

      for (const priority of priorities) {
        jest.clearAllMocks();

        mockedCreateRequest.mockResolvedValueOnce({
          id: `req-feedback-priority-${priority}`,
          requestNumber: 'INV-2025-000130',
        });

        const req = createMockRequest({
          type: 'feedback',
          metadata: {
            feedbackType: 'suggestion',
            subject: 'Test subject',
            priority,
          },
          notes: 'Test feedback',
        });

        const res = createMockResponse();

        await requestController.create(req, res);

        expect(mockedCreateRequest).toHaveBeenCalledWith({
          userId: 'user-test-123',
          payload: expect.objectContaining({
            metadata: expect.objectContaining({
              priority,
            }),
          }),
        });

        expect(res.status).toHaveBeenCalledWith(201);
      }
    });
  });

  describe('Request Type Validation', () => {
    it('should reject invalid request types', async () => {
      const req = createMockRequest({
        type: 'invalid_type',
        metadata: {},
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      expect(mockedCreateRequest).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });

    it('should accept all valid request types', async () => {
      const validTypes = ['buy', 'sell', 'partnership', 'board_nomination', 'feedback'];

      for (const type of validTypes) {
        jest.clearAllMocks();

        mockedCreateRequest.mockResolvedValueOnce({
          id: `req-${type}-test`,
          requestNumber: 'INV-2025-000131',
        });

        const req = createMockRequest({
          type,
          ...(type === 'buy' || type === 'sell'
            ? { amount: 1000, currency: 'SAR' }
            : { metadata: { test: 'data' } }),
        });

        const res = createMockResponse();

        await requestController.create(req, res);

        expect(mockedCreateRequest).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
      }
    });
  });

  describe('Metadata Validation', () => {
    it('should handle empty metadata object', async () => {
      mockedCreateRequest.mockResolvedValueOnce({
        id: 'req-empty-metadata',
        requestNumber: 'INV-2025-000132',
      });

      const req = createMockRequest({
        type: 'feedback',
        metadata: {},
        notes: 'Test notes',
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      expect(mockedCreateRequest).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should handle metadata with various data types', async () => {
      mockedCreateRequest.mockResolvedValueOnce({
        id: 'req-metadata-types',
        requestNumber: 'INV-2025-000133',
      });

      const req = createMockRequest({
        type: 'partnership',
        metadata: {
          stringField: 'test',
          numberField: 123,
          booleanField: true,
          arrayField: ['item1', 'item2'],
          nestedObject: {
            key: 'value',
          },
        },
      });

      const res = createMockResponse();

      await requestController.create(req, res);

      expect(mockedCreateRequest).toHaveBeenCalledWith({
        userId: 'user-test-123',
        payload: expect.objectContaining({
          metadata: expect.objectContaining({
            stringField: 'test',
            numberField: 123,
            booleanField: true,
            arrayField: ['item1', 'item2'],
            nestedObject: {
              key: 'value',
            },
          }),
        }),
      });

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});


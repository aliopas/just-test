/**
 * Test file to validate request schemas for all request types
 * Run with: npm test -- request-schema-validation.test.ts
 */

import { createRequestSchema } from '../src/schemas/request.schema';

describe('Request Schema Validation', () => {
  describe('Financial Requests (buy, sell)', () => {
    it('should validate buy request with required fields', () => {
      const result = createRequestSchema.safeParse({
        type: 'buy',
        amount: 10000,
        currency: 'SAR',
        notes: 'Test buy request',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('buy');
        expect(result.data.amount).toBe(10000);
        expect(result.data.currency).toBe('SAR');
      }
    });

    it('should validate sell request with target price', () => {
      const result = createRequestSchema.safeParse({
        type: 'sell',
        amount: 5000,
        currency: 'USD',
        targetPrice: 150,
        notes: 'Test sell request',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('sell');
        expect(result.data.amount).toBe(5000);
        expect(result.data.targetPrice).toBe(150);
      }
    });

    it('should reject buy request without amount', () => {
      const result = createRequestSchema.safeParse({
        type: 'buy',
        currency: 'SAR',
      });

      expect(result.success).toBe(false);
    });

    it('should reject sell request without currency', () => {
      const result = createRequestSchema.safeParse({
        type: 'sell',
        amount: 5000,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('Partnership Requests', () => {
    it('should validate partnership request with amount and currency', () => {
      const result = createRequestSchema.safeParse({
        type: 'partnership',
        amount: 50000,
        currency: 'SAR',
        metadata: {
          companyName: 'Test Company',
          partnershipType: 'strategic',
        },
        notes: 'Test partnership',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('partnership');
        expect(result.data.amount).toBe(50000);
      }
    });

    it('should validate partnership request without amount (optional)', () => {
      const result = createRequestSchema.safeParse({
        type: 'partnership',
        metadata: {
          companyName: 'Test Company',
          partnershipType: 'strategic',
        },
        notes: 'Test partnership',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('partnership');
        expect(result.data.amount).toBeUndefined();
      }
    });
  });

  describe('Board Nomination Requests', () => {
    it('should validate board nomination with amount and currency', () => {
      const result = createRequestSchema.safeParse({
        type: 'board_nomination',
        amount: 1,
        currency: 'SAR',
        metadata: {
          nomineeName: 'Jane Smith',
          nomineePosition: 'Board Member',
        },
        notes: 'Test nomination',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('board_nomination');
        expect(result.data.amount).toBe(1);
      }
    });

    it('should validate board nomination without amount and currency', () => {
      const result = createRequestSchema.safeParse({
        type: 'board_nomination',
        metadata: {
          nomineeName: 'Jane Smith',
          nomineePosition: 'Board Member',
        },
        notes: 'Test nomination',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('board_nomination');
        expect(result.data.amount).toBeUndefined();
        expect(result.data.currency).toBeUndefined();
      }
    });
  });

  describe('Feedback Requests', () => {
    it('should validate feedback without amount and currency', () => {
      const result = createRequestSchema.safeParse({
        type: 'feedback',
        metadata: {
          feedbackType: 'suggestion',
          subject: 'Test feedback',
          priority: 'high',
        },
        notes: 'Test feedback message',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('feedback');
        expect(result.data.amount).toBeUndefined();
        expect(result.data.currency).toBeUndefined();
      }
    });

    it('should validate feedback with amount and currency (optional)', () => {
      const result = createRequestSchema.safeParse({
        type: 'feedback',
        amount: 1,
        currency: 'SAR',
        metadata: {
          feedbackType: 'complaint',
          subject: 'Test complaint',
          priority: 'medium',
        },
        notes: 'Test complaint message',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('feedback');
        expect(result.data.amount).toBe(1);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should reject invalid request type', () => {
      const result = createRequestSchema.safeParse({
        type: 'invalid_type',
        amount: 1000,
        currency: 'SAR',
      });

      expect(result.success).toBe(false);
    });

    it('should reject negative amount', () => {
      const result = createRequestSchema.safeParse({
        type: 'buy',
        amount: -1000,
        currency: 'SAR',
      });

      expect(result.success).toBe(false);
    });

    it('should reject zero amount for financial requests', () => {
      const result = createRequestSchema.safeParse({
        type: 'buy',
        amount: 0,
        currency: 'SAR',
      });

      expect(result.success).toBe(false);
    });

    it('should reject invalid currency', () => {
      const result = createRequestSchema.safeParse({
        type: 'buy',
        amount: 1000,
        currency: 'INVALID',
      });

      expect(result.success).toBe(false);
    });

    it('should accept long notes (up to 5000 characters)', () => {
      const longNotes = 'a'.repeat(5000);
      const result = createRequestSchema.safeParse({
        type: 'feedback',
        metadata: {
          feedbackType: 'suggestion',
          subject: 'Test',
          priority: 'low',
        },
        notes: longNotes,
      });

      expect(result.success).toBe(true);
    });

    it('should reject notes longer than 5000 characters', () => {
      const longNotes = 'a'.repeat(5001);
      const result = createRequestSchema.safeParse({
        type: 'feedback',
        metadata: {
          feedbackType: 'suggestion',
          subject: 'Test',
          priority: 'low',
        },
        notes: longNotes,
      });

      expect(result.success).toBe(false);
    });
  });
});


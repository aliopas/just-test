jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(() => ({
    from: jest.fn(),
  })),
  supabase: {},
}));

import { investorProfileController } from '../src/controllers/investor-profile.controller';
import {
  investorProfileService,
  DEFAULT_COMMUNICATION_PREFERENCES,
  type InvestorProfileRecord,
  type InvestorProfileView,
} from '../src/services/investor-profile.service';
import type { AuthenticatedRequest } from '../src/middleware/auth.middleware';

jest.mock('../src/services/investor-profile.service', () => {
  const actual = jest.requireActual('../src/services/investor-profile.service');
  return {
    ...actual,
    investorProfileService: {
      getProfile: jest.fn(),
      getProfileRecord: jest.fn(),
      upsertProfile: jest.fn(),
      logAudit: jest.fn(),
    },
  };
});

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
  statusCode?: number;
  body?: unknown;
};

const createMockResponse = (): MockResponse => {
  const res: Partial<MockResponse> = {};
  res.status = jest.fn().mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn().mockImplementation((payload: unknown) => {
    res.body = payload;
    return res;
  });
  return res as MockResponse;
};

const baseRecord: InvestorProfileRecord = {
  user_id: 'user-1',
  full_name: 'Test User',
  preferred_name: 'Tester',
  id_type: 'national_id',
  id_number: '1234567890',
  id_expiry: '2030-12-31',
  nationality: 'SA',
  residency_country: 'SA',
  city: 'Riyadh',
  kyc_status: 'pending',
  kyc_updated_at: null,
  language: 'ar',
  communication_preferences: {
    ...DEFAULT_COMMUNICATION_PREFERENCES,
  },
  risk_profile: 'balanced',
  kyc_documents: ['doc1'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const baseView: InvestorProfileView = {
  ...baseRecord,
  email: 'user@example.com',
  phone: '+966500000000',
  user_status: 'active',
  user_created_at: new Date().toISOString(),
};

describe('InvestorProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('returns 401 when user is not authenticated', async () => {
      const req = {
        headers: {},
      } as AuthenticatedRequest;
      const res = createMockResponse();

      await investorProfileController.getProfile(req, res as never);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('returns 404 when profile not found', async () => {
      (investorProfileService.getProfile as jest.Mock).mockResolvedValue(null);

      const req = {
        user: { id: 'user-1', email: 'user@example.com' },
        headers: { 'accept-language': 'en-US,en;q=0.9' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await investorProfileController.getProfile(req, res as never);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.body).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({
            code: 'PROFILE_NOT_FOUND',
            message: 'Investor profile not found',
          }),
        })
      );
    });

    it('returns profile data with localized message', async () => {
      (investorProfileService.getProfile as jest.Mock).mockResolvedValue(
        baseView
      );

      const req = {
        user: { id: 'user-1', email: 'user@example.com' },
        headers: { 'accept-language': 'ar-SA,ar;q=0.9' },
      } as unknown as AuthenticatedRequest;
      const res = createMockResponse();

      await investorProfileController.getProfile(req, res as never);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'تم جلب الملف الشخصي بنجاح',
          profile: expect.objectContaining({
            userId: baseView.user_id,
            fullName: baseView.full_name,
            communicationPreferences: baseView.communication_preferences,
          }),
        })
      );
    });
  });

  describe('updateProfile', () => {
    it('updates profile and logs diff', async () => {
      (investorProfileService.getProfileRecord as jest.Mock).mockResolvedValue(
        baseRecord
      );
      (investorProfileService.upsertProfile as jest.Mock).mockResolvedValue({
        record: {
          ...baseRecord,
          kyc_status: 'approved',
          kyc_updated_at: '2025-01-01T00:00:00.000Z',
          communication_preferences: {
            ...baseRecord.communication_preferences,
            sms: true,
          },
        },
        view: {
          ...baseView,
          kyc_status: 'approved',
          kyc_updated_at: '2025-01-01T00:00:00.000Z',
          communication_preferences: {
            ...baseView.communication_preferences,
            sms: true,
          },
        },
      });

      const req = {
        user: { id: 'user-1', email: 'user@example.com' },
        headers: { 'accept-language': 'en' },
        ip: '127.0.0.1',
        body: {
          kycStatus: 'approved',
          communicationPreferences: { sms: true },
        },
      } as unknown as AuthenticatedRequest;

      const res = createMockResponse();

      await investorProfileController.updateProfile(req, res as never);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'Investor profile updated successfully',
          profile: expect.objectContaining({
            kycStatus: 'approved',
            communicationPreferences: expect.objectContaining({ sms: true }),
          }),
        })
      );
      expect(investorProfileService.logAudit).toHaveBeenCalledWith(
        expect.objectContaining({
          actorId: 'user-1',
          diff: expect.objectContaining({
            kycStatus: expect.any(Object),
          }),
        })
      );
    });

    it('returns no changes message when diff is empty', async () => {
      (investorProfileService.getProfileRecord as jest.Mock).mockResolvedValue(
        baseRecord
      );
      (investorProfileService.upsertProfile as jest.Mock).mockResolvedValue({
        record: baseRecord,
        view: baseView,
      });

      const req = {
        user: { id: 'user-1', email: 'user@example.com' },
        headers: { 'accept-language': 'en' },
        ip: '127.0.0.1',
        body: {
          fullName: baseRecord.full_name,
        },
      } as unknown as AuthenticatedRequest;

      const res = createMockResponse();

      await investorProfileController.updateProfile(req, res as never);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toEqual(
        expect.objectContaining({
          message: 'No changes detected',
        })
      );
      expect(investorProfileService.logAudit).not.toHaveBeenCalled();
    });
  });
});


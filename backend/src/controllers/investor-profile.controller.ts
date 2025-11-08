import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  investorProfileService,
  DEFAULT_COMMUNICATION_PREFERENCES,
  type InvestorProfileRecord,
  type InvestorProfileView,
} from '../services/investor-profile.service';
import type { InvestorProfileUpdateInput } from '../schemas/investor-profile.schema';
import { diffObjects } from '../utils/diff.util';
import { detectLanguage, t } from '../utils/i18n.util';

type CommunicationPreferences = Record<'email' | 'sms' | 'push', boolean>;

const toArray = (value: unknown): string[] | null => {
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string') as string[];
  }
  return value === null || value === undefined ? null : null;
};

function mapViewToResponse(view: InvestorProfileView) {
  return {
    userId: view.user_id,
    fullName: view.full_name,
    preferredName: view.preferred_name,
    idType: view.id_type,
    idNumber: view.id_number,
    idExpiry: view.id_expiry,
    nationality: view.nationality,
    residencyCountry: view.residency_country,
    city: view.city,
    kycStatus: view.kyc_status,
    kycUpdatedAt: view.kyc_updated_at,
    language: view.language,
    communicationPreferences:
      view.communication_preferences as CommunicationPreferences,
    riskProfile: view.risk_profile,
    kycDocuments: toArray(view.kyc_documents),
    createdAt: view.created_at,
    updatedAt: view.updated_at,
    email: view.email,
    phone: view.phone,
    userStatus: view.user_status,
    userCreatedAt: view.user_created_at,
  };
}

function mapRecordToAuditShape(
  record: InvestorProfileRecord | null
): Record<string, unknown> | null {
  if (!record) {
    return null;
  }

  return {
    fullName: record.full_name,
    preferredName: record.preferred_name,
    idType: record.id_type,
    idNumber: record.id_number,
    idExpiry: record.id_expiry,
    nationality: record.nationality,
    residencyCountry: record.residency_country,
    city: record.city,
    kycStatus: record.kyc_status,
    kycUpdatedAt: record.kyc_updated_at,
    language: record.language,
    communicationPreferences: record.communication_preferences,
    riskProfile: record.risk_profile,
    kycDocuments: toArray(record.kyc_documents),
  };
}

function mergeCommunicationPreferences(
  existing: CommunicationPreferences | null | undefined,
  updates?: Partial<CommunicationPreferences>
): CommunicationPreferences {
  const base = {
    ...DEFAULT_COMMUNICATION_PREFERENCES,
    ...(existing ?? {}),
  };

  if (!updates) {
    return base;
  }

  return {
    ...base,
    ...updates,
  };
}

export const investorProfileController = {
  async getProfile(req: AuthenticatedRequest, res: Response) {
    const lang = detectLanguage(req.headers['accept-language']);

    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
      });
    }

    try {
      const profile = await investorProfileService.getProfile(req.user.id);

      if (!profile) {
        return res.status(404).json({
          error: {
            code: 'PROFILE_NOT_FOUND',
            message: t('profileNotFound', lang),
          },
        });
      }

      return res.status(200).json({
        message: t('profileFetched', lang),
        profile: mapViewToResponse(profile),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to get investor profile:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch investor profile',
        },
      });
    }
  },

  async updateProfile(req: AuthenticatedRequest, res: Response) {
    const lang = detectLanguage(req.headers['accept-language']);

    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthorized',
        },
      });
    }

    const payload = req.body as InvestorProfileUpdateInput;

    try {
      const beforeRecord = await investorProfileService.getProfileRecord(
        req.user.id
      );

      const communicationPreferences = mergeCommunicationPreferences(
        beforeRecord?.communication_preferences as CommunicationPreferences,
        payload.communicationPreferences ?? undefined
      );

      const updatePayload: Parameters<
        typeof investorProfileService.upsertProfile
      >[0] = {
        user_id: req.user.id,
        full_name:
          payload.fullName !== undefined
            ? payload.fullName
            : (beforeRecord?.full_name ?? null),
        preferred_name:
          payload.preferredName !== undefined
            ? payload.preferredName
            : (beforeRecord?.preferred_name ?? null),
        id_type:
          payload.idType !== undefined
            ? payload.idType
            : (beforeRecord?.id_type ?? null),
        id_number:
          payload.idNumber !== undefined
            ? payload.idNumber
            : (beforeRecord?.id_number ?? null),
        id_expiry:
          payload.idExpiry !== undefined
            ? payload.idExpiry
            : (beforeRecord?.id_expiry ?? null),
        nationality:
          payload.nationality !== undefined
            ? payload.nationality
            : (beforeRecord?.nationality ?? null),
        residency_country:
          payload.residencyCountry !== undefined
            ? payload.residencyCountry
            : (beforeRecord?.residency_country ?? null),
        city:
          payload.city !== undefined
            ? payload.city
            : (beforeRecord?.city ?? null),
        kyc_status: payload.kycStatus ?? beforeRecord?.kyc_status ?? 'pending',
        language: payload.language ?? beforeRecord?.language ?? 'ar',
        communication_preferences: communicationPreferences,
        risk_profile:
          payload.riskProfile !== undefined
            ? payload.riskProfile
            : (beforeRecord?.risk_profile ?? null),
        kyc_documents:
          payload.kycDocuments !== undefined
            ? payload.kycDocuments
            : (beforeRecord?.kyc_documents ?? null),
        kyc_updated_at:
          payload.kycStatus && payload.kycStatus !== beforeRecord?.kyc_status
            ? new Date().toISOString()
            : (beforeRecord?.kyc_updated_at ?? null),
      };

      const { record, view } =
        await investorProfileService.upsertProfile(updatePayload);

      const beforeAudit = mapRecordToAuditShape(beforeRecord) ?? {};
      const afterAudit = mapRecordToAuditShape(record) ?? {};
      const diff = diffObjects(beforeAudit, afterAudit);

      if (Object.keys(diff).length > 0) {
        try {
          await investorProfileService.logAudit({
            actorId: req.user.id,
            targetId: req.user.id,
            diff,
            action: 'investor_profile.update',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] ?? null,
          });
        } catch (auditError) {
          // eslint-disable-next-line no-console
          console.error('Failed to write audit log:', auditError);
        }
      }

      return res.status(200).json({
        message:
          Object.keys(diff).length === 0
            ? t('noChanges', lang)
            : t('profileUpdated', lang),
        profile: mapViewToResponse(view),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update investor profile:', error);
      return res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update investor profile',
        },
      });
    }
  },
};

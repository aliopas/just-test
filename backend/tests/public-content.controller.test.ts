import type { Request, Response } from 'express';
import { publicContentController } from '../src/controllers/public-content.controller';
import {
  listCompanyProfiles,
  listCompanyPartners,
  listCompanyClients,
  listCompanyResources,
  listCompanyStrengths,
  listPartnershipInfo,
  listMarketValues,
  listCompanyGoals,
} from '../src/services/company-content.service';

jest.mock('../src/services/company-content.service', () => ({
  listCompanyProfiles: jest.fn(),
  listCompanyPartners: jest.fn(),
  listCompanyClients: jest.fn(),
  listCompanyResources: jest.fn(),
  listCompanyStrengths: jest.fn(),
  listPartnershipInfo: jest.fn(),
  listMarketValues: jest.fn(),
  listCompanyGoals: jest.fn(),
}));

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
};

const mockedListCompanyProfiles = listCompanyProfiles as jest.MockedFunction<
  typeof listCompanyProfiles
>;
const mockedListCompanyPartners = listCompanyPartners as jest.MockedFunction<
  typeof listCompanyPartners
>;
const mockedListCompanyClients = listCompanyClients as jest.MockedFunction<
  typeof listCompanyClients
>;
const mockedListCompanyResources = listCompanyResources as jest.MockedFunction<
  typeof listCompanyResources
>;
const mockedListCompanyStrengths = listCompanyStrengths as jest.MockedFunction<
  typeof listCompanyStrengths
>;
const mockedListPartnershipInfo = listPartnershipInfo as jest.MockedFunction<
  typeof listPartnershipInfo
>;
const mockedListMarketValues = listMarketValues as jest.MockedFunction<
  typeof listMarketValues
>;
const mockedListCompanyGoals = listCompanyGoals as jest.MockedFunction<
  typeof listCompanyGoals
>;

function createMockResponse(): MockResponse {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('publicContentController.getCompanyProfile', () => {
  it('returns profiles in Arabic by default', async () => {
    mockedListCompanyProfiles.mockResolvedValueOnce([
      {
        id: 'profile-1',
        titleAr: 'عنوان بالعربية',
        titleEn: 'English Title',
        contentAr: 'محتوى بالعربية',
        contentEn: 'English Content',
        iconKey: 'icon1',
        displayOrder: 0,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyProfile(req, res as unknown as Response);

    expect(mockedListCompanyProfiles).toHaveBeenCalledWith(false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      profiles: [
        {
          id: 'profile-1',
          title: 'عنوان بالعربية',
          content: 'محتوى بالعربية',
          iconKey: 'icon1',
          displayOrder: 0,
        },
      ],
      language: 'ar',
    });
  });

  it('returns profiles in English when lang=en', async () => {
    mockedListCompanyProfiles.mockResolvedValueOnce([
      {
        id: 'profile-1',
        titleAr: 'عنوان بالعربية',
        titleEn: 'English Title',
        contentAr: 'محتوى بالعربية',
        contentEn: 'English Content',
        iconKey: 'icon1',
        displayOrder: 0,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: { lang: 'en' } } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyProfile(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      profiles: [
        {
          id: 'profile-1',
          title: 'English Title',
          content: 'English Content',
          iconKey: 'icon1',
          displayOrder: 0,
        },
      ],
      language: 'en',
    });
  });

  it('returns profiles in Arabic when lang=ar', async () => {
    mockedListCompanyProfiles.mockResolvedValueOnce([
      {
        id: 'profile-1',
        titleAr: 'عنوان بالعربية',
        titleEn: 'English Title',
        contentAr: 'محتوى بالعربية',
        contentEn: 'English Content',
        iconKey: 'icon1',
        displayOrder: 0,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: { lang: 'ar' } } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyProfile(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      profiles: [
        {
          id: 'profile-1',
          title: 'عنوان بالعربية',
          content: 'محتوى بالعربية',
          iconKey: 'icon1',
          displayOrder: 0,
        },
      ],
      language: 'ar',
    });
  });

  it('supports language parameter', async () => {
    mockedListCompanyProfiles.mockResolvedValueOnce([
      {
        id: 'profile-1',
        titleAr: 'عنوان بالعربية',
        titleEn: 'English Title',
        contentAr: 'محتوى بالعربية',
        contentEn: 'English Content',
        iconKey: 'icon1',
        displayOrder: 0,
        isActive: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: { language: 'en' } } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyProfile(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        language: 'en',
      })
    );
  });

  it('filters inactive profiles (includeInactive = false)', async () => {
    mockedListCompanyProfiles.mockResolvedValueOnce([]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyProfile(req, res as unknown as Response);

    expect(mockedListCompanyProfiles).toHaveBeenCalledWith(false);
  });

  it('handles errors', async () => {
    mockedListCompanyProfiles.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyProfile(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch company profile',
      },
    });
  });
});

describe('publicContentController.getCompanyPartners', () => {
  it('returns partners in Arabic by default', async () => {
    mockedListCompanyPartners.mockResolvedValueOnce([
      {
        id: 'partner-1',
        nameAr: 'شريك',
        nameEn: 'Partner',
        logoKey: 'logo1',
        descriptionAr: 'وصف',
        descriptionEn: 'Description',
        websiteUrl: 'https://example.com',
        displayOrder: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyPartners(req, res as unknown as Response);

    expect(mockedListCompanyPartners).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      partners: [
        {
          id: 'partner-1',
          name: 'شريك',
          logoKey: 'logo1',
          description: 'وصف',
          websiteUrl: 'https://example.com',
          displayOrder: 0,
        },
      ],
      language: 'ar',
    });
  });

  it('handles errors', async () => {
    mockedListCompanyPartners.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyPartners(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch company partners',
      },
    });
  });
});

describe('publicContentController.getCompanyClients', () => {
  it('returns clients with correct language mapping', async () => {
    mockedListCompanyClients.mockResolvedValueOnce([
      {
        id: 'client-1',
        nameAr: 'عميل',
        nameEn: 'Client',
        logoKey: 'logo1',
        descriptionAr: 'وصف',
        descriptionEn: 'Description',
        displayOrder: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: { lang: 'en' } } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyClients(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      clients: [
        {
          id: 'client-1',
          name: 'Client',
          logoKey: 'logo1',
          description: 'Description',
          displayOrder: 0,
        },
      ],
      language: 'en',
    });
  });

  it('handles errors', async () => {
    mockedListCompanyClients.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyClients(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('publicContentController.getCompanyResources', () => {
  it('returns resources with financial values', async () => {
    mockedListCompanyResources.mockResolvedValueOnce([
      {
        id: 'resource-1',
        titleAr: 'مورد',
        titleEn: 'Resource',
        descriptionAr: 'وصف',
        descriptionEn: 'Description',
        iconKey: 'icon1',
        value: 1000000,
        currency: 'SAR',
        displayOrder: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyResources(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      resources: [
        {
          id: 'resource-1',
          title: 'مورد',
          description: 'وصف',
          iconKey: 'icon1',
          value: 1000000,
          currency: 'SAR',
          displayOrder: 0,
        },
      ],
      language: 'ar',
    });
  });

  it('handles errors', async () => {
    mockedListCompanyResources.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyResources(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('publicContentController.getCompanyStrengths', () => {
  it('returns strengths with correct language mapping', async () => {
    mockedListCompanyStrengths.mockResolvedValueOnce([
      {
        id: 'strength-1',
        titleAr: 'قوة',
        titleEn: 'Strength',
        descriptionAr: 'وصف',
        descriptionEn: 'Description',
        iconKey: 'icon1',
        displayOrder: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: { lang: 'en' } } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyStrengths(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      strengths: [
        {
          id: 'strength-1',
          title: 'Strength',
          description: 'Description',
          iconKey: 'icon1',
          displayOrder: 0,
        },
      ],
      language: 'en',
    });
  });

  it('handles errors', async () => {
    mockedListCompanyStrengths.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyStrengths(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('publicContentController.getPartnershipInfo', () => {
  it('returns partnership info with steps', async () => {
    mockedListPartnershipInfo.mockResolvedValueOnce([
      {
        id: 'partnership-1',
        titleAr: 'شراكة',
        titleEn: 'Partnership',
        contentAr: 'محتوى',
        contentEn: 'Content',
        stepsAr: ['خطوة 1', 'خطوة 2'],
        stepsEn: ['Step 1', 'Step 2'],
        iconKey: 'icon1',
        displayOrder: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getPartnershipInfo(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      partnershipInfo: [
        {
          id: 'partnership-1',
          title: 'شراكة',
          content: 'محتوى',
          steps: ['خطوة 1', 'خطوة 2'],
          iconKey: 'icon1',
          displayOrder: 0,
        },
      ],
      language: 'ar',
    });
  });

  it('returns English steps when lang=en', async () => {
    mockedListPartnershipInfo.mockResolvedValueOnce([
      {
        id: 'partnership-1',
        titleAr: 'شراكة',
        titleEn: 'Partnership',
        contentAr: 'محتوى',
        contentEn: 'Content',
        stepsAr: ['خطوة 1'],
        stepsEn: ['Step 1'],
        iconKey: 'icon1',
        displayOrder: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: { lang: 'en' } } as any;
    const res = createMockResponse();

    await publicContentController.getPartnershipInfo(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      partnershipInfo: [
        {
          id: 'partnership-1',
          title: 'Partnership',
          content: 'Content',
          steps: ['Step 1'],
          iconKey: 'icon1',
          displayOrder: 0,
        },
      ],
      language: 'en',
    });
  });

  it('handles errors', async () => {
    mockedListPartnershipInfo.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getPartnershipInfo(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('publicContentController.getMarketValue', () => {
  it('returns latest verified market value', async () => {
    mockedListMarketValues.mockResolvedValueOnce([
      {
        id: 'value-1',
        value: 50000000,
        currency: 'SAR',
        valuationDate: '2024-12-31',
        source: 'مصدر التقييم',
        isVerified: true,
        verifiedAt: '2024-12-31T10:00:00Z',
        createdAt: '2024-12-31T00:00:00Z',
        updatedAt: '2024-12-31T00:00:00Z',
      },
    ]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getMarketValue(req, res as unknown as Response);

    expect(mockedListMarketValues).toHaveBeenCalledWith(false); // includeUnverified = false
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      marketValue: {
        id: 'value-1',
        value: 50000000,
        currency: 'SAR',
        valuationDate: '2024-12-31',
        source: 'مصدر التقييم',
        isVerified: true,
        verifiedAt: '2024-12-31T10:00:00Z',
      },
    });
  });

  it('returns null when no verified market value exists', async () => {
    mockedListMarketValues.mockResolvedValueOnce([]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getMarketValue(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      marketValue: null,
    });
  });

  it('filters unverified values (includeUnverified = false)', async () => {
    mockedListMarketValues.mockResolvedValueOnce([]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getMarketValue(req, res as unknown as Response);

    expect(mockedListMarketValues).toHaveBeenCalledWith(false);
  });

  it('handles errors', async () => {
    mockedListMarketValues.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getMarketValue(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch market value',
      },
    });
  });
});

describe('publicContentController.getCompanyGoals', () => {
  it('returns goals with target dates', async () => {
    mockedListCompanyGoals.mockResolvedValueOnce([
      {
        id: 'goal-1',
        titleAr: 'هدف',
        titleEn: 'Goal',
        descriptionAr: 'وصف',
        descriptionEn: 'Description',
        targetDate: '2025-12-31',
        iconKey: 'icon1',
        displayOrder: 0,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ]);

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyGoals(req, res as unknown as Response);

    expect(res.json).toHaveBeenCalledWith({
      goals: [
        {
          id: 'goal-1',
          title: 'هدف',
          description: 'وصف',
          targetDate: '2025-12-31',
          iconKey: 'icon1',
          displayOrder: 0,
        },
      ],
      language: 'ar',
    });
  });

  it('handles errors', async () => {
    mockedListCompanyGoals.mockRejectedValueOnce(new Error('Database error'));

    const req = { query: {} } as any;
    const res = createMockResponse();

    await publicContentController.getCompanyGoals(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});


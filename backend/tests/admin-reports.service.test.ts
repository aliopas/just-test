import {
  getAdminRequestReport,
  adminRequestReportQuerySchema,
} from '../src/services/admin-reports.service';
import { requireSupabaseAdmin } from '../src/lib/supabase';

jest.mock('../src/lib/supabase', () => ({
  requireSupabaseAdmin: jest.fn(),
}));

const mockRequireAdmin = requireSupabaseAdmin as jest.Mock;

function createQueryBuilder<T>(result: T) {
  const promise = Promise.resolve(result);
  const builder: any = {
    select: jest.fn(() => builder),
    order: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    in: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
  };
  return builder;
}

describe('admin-reports.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns json report with filters applied', async () => {
    const requestData = [
      {
        id: 'req-1',
        request_number: 'INV-001',
        status: 'submitted',
        type: 'buy',
        amount: 1000,
        currency: 'SAR',
        created_at: '2025-01-01T10:00:00Z',
        updated_at: '2025-01-02T08:00:00Z',
        investor: {
          email: 'investor@example.com',
          profile: {
            full_name: 'Investor Example',
            preferred_name: 'InvestEx',
          },
        },
      },
    ];

    const queryBuilder = createQueryBuilder({
      data: requestData,
      error: null,
    });

    mockRequireAdmin.mockReturnValue({
      from: jest.fn(() => queryBuilder),
    });

    const parsedQuery = adminRequestReportQuerySchema.parse({
      from: '2025-01-01T00:00:00Z',
      to: '2025-01-31T23:59:59Z',
      status: 'submitted,approved',
      type: 'buy',
      minAmount: '100',
      maxAmount: '5000',
    });

    const result = await getAdminRequestReport(parsedQuery);

    expect(result.format).toBe('json');
    if (result.format === 'json') {
      expect(result.requests).toHaveLength(1);
      expect(result.requests[0]).toEqual(
        expect.objectContaining({
          requestNumber: 'INV-001',
          investorName: 'InvestEx',
        })
      );
    }

    expect(queryBuilder.gte).toHaveBeenCalledWith('created_at', parsedQuery.from);
    expect(queryBuilder.lte).toHaveBeenCalledWith('created_at', parsedQuery.to);
    expect(queryBuilder.in).toHaveBeenCalledWith('status', ['submitted', 'approved']);
    expect(queryBuilder.eq).toHaveBeenCalledWith('type', 'buy');
  });

  it('returns csv when format requested', async () => {
    const queryBuilder = createQueryBuilder({
      data: [
        {
          id: 'req-1',
          request_number: 'INV-001',
          status: 'completed',
          type: 'sell',
          amount: 2500,
          currency: 'SAR',
          created_at: '2025-01-05T09:00:00Z',
          updated_at: '2025-01-06T11:00:00Z',
          investor: {
            email: 'user@example.com',
            profile: {
              full_name: 'Example User',
              preferred_name: null,
            },
          },
        },
      ],
      error: null,
    });

    mockRequireAdmin.mockReturnValue({
      from: jest.fn(() => queryBuilder),
    });

    const result = await getAdminRequestReport({
      format: 'csv',
    });

    expect(result.format).toBe('csv');
    if (result.format === 'csv') {
      expect(result.content).toContain('INV-001');
      expect(result.filename).toMatch(/requests-report-/);
    }
  });

  it('throws when supabase errors', async () => {
    const queryBuilder = createQueryBuilder({
      data: null,
      error: { message: 'boom' },
    });

    mockRequireAdmin.mockReturnValue({
      from: jest.fn(() => queryBuilder),
    });

    await expect(getAdminRequestReport({ format: 'json' })).rejects.toThrow(
      'FAILED_REPORT_QUERY'
    );
  });
});


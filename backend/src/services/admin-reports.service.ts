import { requireSupabaseAdmin } from '../lib/supabase';
import { z } from 'zod';

export const adminRequestReportQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  status: z.string().optional(),
  type: z.enum(['buy', 'sell']).optional(),
  minAmount: z.preprocess(
    value => (value === undefined ? undefined : Number(value)),
    z.number().nonnegative().optional()
  ),
  maxAmount: z.preprocess(
    value => (value === undefined ? undefined : Number(value)),
    z.number().nonnegative().optional()
  ),
  format: z.enum(['json', 'csv']).optional().default('json'),
});

export type AdminRequestReportQuery = z.infer<
  typeof adminRequestReportQuerySchema
>;

type InvestorProfileRow = {
  full_name: string | null;
  preferred_name: string | null;
};

type RawInvestorRow = {
  email: string | null;
  profile: InvestorProfileRow[] | null;
};

type RequestWithInvestorRow = {
  id: string;
  request_number: string;
  status: string;
  type: string;
  amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
  investor: {
    email: string | null;
    profile: InvestorProfileRow | null;
  } | null;
};

type RawRequestWithInvestorRow = Omit<RequestWithInvestorRow, 'investor'> & {
  investor: RawInvestorRow[] | RawInvestorRow | null;
};

export interface AdminRequestReportItem {
  id: string;
  requestNumber: string;
  status: string;
  type: string;
  amount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  investorEmail: string | null;
  investorName: string | null;
}

export interface AdminRequestReportResult {
  format: 'json';
  requests: AdminRequestReportItem[];
  generatedAt: string;
}

export interface AdminRequestReportCsv {
  format: 'csv';
  filename: string;
  content: string;
}

function mapInvestor(
  investor: RawInvestorRow | null | undefined
): RequestWithInvestorRow['investor'] {
  if (!investor) {
    return null;
  }

  const profile = Array.isArray(investor.profile)
    ? (investor.profile[0] ?? null)
    : (investor.profile ?? null);

  return {
    email: investor.email ?? null,
    profile,
  };
}

function mapRow(row: RequestWithInvestorRow): AdminRequestReportItem {
  const profile = row.investor?.profile ?? null;
  const name = profile?.preferred_name ?? profile?.full_name ?? null;

  return {
    id: row.id,
    requestNumber: row.request_number,
    status: row.status,
    type: row.type,
    amount: Number(row.amount ?? 0),
    currency: row.currency ?? 'SAR',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    investorEmail: row.investor?.email ?? null,
    investorName: name,
  };
}

export async function getAdminRequestReport(
  query: AdminRequestReportQuery
): Promise<AdminRequestReportResult | AdminRequestReportCsv> {
  const adminClient = requireSupabaseAdmin();

  let requestQuery = adminClient
    .from('requests')
    .select(
      `
        id,
        request_number,
        status,
        type,
        amount,
        currency,
        created_at,
        updated_at,
        investor:users!requests_user_id_fkey (
          email,
          profile:investor_profiles!investor_profiles_user_id_fkey (
            full_name,
            preferred_name
          )
        )
      `
    )
    .order('created_at', { ascending: false });

  if (query.from) {
    requestQuery = requestQuery.gte('created_at', query.from);
  }

  if (query.to) {
    requestQuery = requestQuery.lte('created_at', query.to);
  }

  if (query.status) {
    const statuses = query.status
      .split(',')
      .map(status => status.trim())
      .filter(Boolean);
    if (statuses.length > 0) {
      requestQuery = requestQuery.in('status', statuses);
    }
  }

  if (query.type) {
    requestQuery = requestQuery.eq('type', query.type);
  }

  if (query.minAmount !== undefined) {
    requestQuery = requestQuery.gte('amount', query.minAmount);
  }

  if (query.maxAmount !== undefined) {
    requestQuery = requestQuery.lte('amount', query.maxAmount);
  }

  const { data, error } = await requestQuery;

  if (error) {
    throw new Error(`FAILED_REPORT_QUERY:${error.message ?? 'unknown'}`);
  }

  const rawRows = (data ?? []) as RawRequestWithInvestorRow[];
  const rows: RequestWithInvestorRow[] = rawRows.map(row => {
    const investor = Array.isArray(row.investor)
      ? (row.investor[0] ?? null)
      : (row.investor ?? null);

    return {
      ...row,
      investor: mapInvestor(investor),
    };
  });
  const items = rows.map(mapRow);

  if (query.format === 'csv') {
    const header = [
      'Request ID',
      'Request Number',
      'Status',
      'Type',
      'Amount',
      'Currency',
      'Investor Name',
      'Investor Email',
      'Created At',
      'Updated At',
    ];
    const csvLines = [
      header.join(','),
      ...items.map(item =>
        [
          item.id,
          item.requestNumber,
          item.status,
          item.type,
          item.amount.toString(),
          item.currency,
          item.investorName ?? '',
          item.investorEmail ?? '',
          item.createdAt,
          item.updatedAt,
        ]
          .map(value =>
            typeof value === 'string' && value.includes(',')
              ? `"${value.replace(/"/g, '""')}"`
              : value
          )
          .join(',')
      ),
    ];

    return {
      format: 'csv',
      filename: `requests-report-${new Date().toISOString().slice(0, 10)}.csv`,
      content: csvLines.join('\n'),
    };
  }

  return {
    format: 'json',
    requests: items,
    generatedAt: new Date().toISOString(),
  };
}

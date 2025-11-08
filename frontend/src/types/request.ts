export type RequestType = 'buy' | 'sell';
export type RequestCurrency = 'SAR' | 'USD' | 'EUR';

export interface CreateRequestPayload {
  type: RequestType;
  amount: number;
  currency: RequestCurrency;
  targetPrice?: number | null;
  expiryAt?: string | null;
  notes?: string | null;
  documents?: File[];
}

export interface CreateRequestResponse {
  requestId: string;
  requestNumber: string;
  status: string;
}


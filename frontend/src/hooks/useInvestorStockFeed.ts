import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';
import type { InvestorStockFeed } from '../types/stocks';

const STOCK_FEED_KEY = ['investorStockFeed'] as const;

export function useInvestorStockFeed() {
  return useQuery<InvestorStockFeed>({
    queryKey: STOCK_FEED_KEY,
    queryFn: () => apiClient<InvestorStockFeed>('/investor/stocks'),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
}


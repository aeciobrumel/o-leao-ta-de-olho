import { useQuery } from '@tanstack/react-query';
import { ONE_DAY_IN_MS } from '../constants/time';
import {
  fetchCoinHistory,
  fetchCoinList,
  fetchCoinSearch,
  shouldRetryCoinGeckoRequest,
} from '../services/coingecko';
import { toCoinGeckoDate } from '../utils/formatters';

const MAX_RETRY_ATTEMPTS = 2;
const SEARCH_CACHE_TIME_MS = 15 * 60 * 1000;

interface CoinHistoryParams {
  coinId: string;
  date: string;
}

export function useCoinListQuery() {
  return useQuery({
    queryKey: ['coin-list'],
    queryFn: fetchCoinList,
    staleTime: ONE_DAY_IN_MS,
    gcTime: ONE_DAY_IN_MS,
  });
}

export function useCoinSearchQuery(query?: string | null) {
  const trimmedQuery = query?.trim() ?? '';

  return useQuery({
    queryKey: ['coin-search', trimmedQuery],
    queryFn: () => fetchCoinSearch(trimmedQuery),
    enabled: trimmedQuery.length >= 3,
    staleTime: SEARCH_CACHE_TIME_MS,
    gcTime: SEARCH_CACHE_TIME_MS,
    retry: (failureCount: number, error: unknown) =>
      shouldRetryCoinGeckoRequest(error) && failureCount <= MAX_RETRY_ATTEMPTS,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
  });
}

export function useCoinHistoryQuery(params?: CoinHistoryParams | null) {
  const hasParams = Boolean(params?.coinId && params?.date);

  return useQuery({
    queryKey: ['coin-history', params?.coinId, params?.date ? toCoinGeckoDate(params.date) : null],
    queryFn: () => {
      if (!params?.coinId || !params.date) {
        throw new Error('Parametros insuficientes para consultar o historico da moeda.');
      }

      return fetchCoinHistory(params.coinId, params.date);
    },
    enabled: hasParams,
    staleTime: Infinity,
    gcTime: ONE_DAY_IN_MS,
    retry: (failureCount: number, error: unknown) =>
      shouldRetryCoinGeckoRequest(error) && failureCount <= MAX_RETRY_ATTEMPTS,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
  });
}

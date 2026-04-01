import { useIsFetching } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

type ApiStatus = 'idle' | 'loading' | 'rate-limited' | 'error';

export function useCoinGeckoStatus(): ApiStatus {
  const isFetching = useIsFetching({ queryKey: ['coin-history'] });
  const queryClient = useQueryClient();

  const status = useMemo<ApiStatus>(() => {
    const queries = queryClient.getQueryCache().findAll({ queryKey: ['coin-history'] });

    const hasRateLimit = queries.some(
      (q) => (q.state.error as { name?: string } | null)?.name === 'CoinGeckoRateLimitError',
    );
    if (hasRateLimit) return 'rate-limited';

    const hasError = queries.some((q) => q.state.status === 'error');
    if (hasError) return 'error';

    return 'idle';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient, isFetching]);

  if (isFetching > 0) return 'loading';
  return status;
}

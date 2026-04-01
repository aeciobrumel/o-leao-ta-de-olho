import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ONE_DAY_IN_MS } from '../constants/time';
import { fetchCoinImages } from '../services/coingecko';
import type { Operacao } from '../types';

interface PersistResult {
  success: boolean;
  error?: Error;
}

export function useRestoreCoinImages(
  operacoes: Operacao[],
  hydrateOperacaoImages: (imagesByCoinId: Record<string, string>) => PersistResult,
) {
  const missingCoinIds = useMemo(
    () =>
      Array.from(
        new Set(
          operacoes.filter((operacao) => !operacao.coinImageUrl).map((operacao) => operacao.coinId),
        ),
      ).sort(),
    [operacoes],
  );

  const query = useQuery({
    queryKey: ['coin-images', ...missingCoinIds],
    queryFn: () => fetchCoinImages(missingCoinIds),
    enabled: missingCoinIds.length > 0,
    staleTime: ONE_DAY_IN_MS * 7,
    gcTime: ONE_DAY_IN_MS * 7,
    retry: false,
  });

  useEffect(() => {
    if (!query.data || Object.keys(query.data).length === 0) {
      return;
    }

    hydrateOperacaoImages(query.data);
  }, [hydrateOperacaoImages, query.data]);

  return query.data ?? {};
}

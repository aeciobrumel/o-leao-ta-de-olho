import { useQueries } from '@tanstack/react-query';
import { ONE_DAY_IN_MS } from '../constants/time';
import type { Operacao } from '../types';
import { fetchCoinHistory, shouldRetryCoinGeckoRequest } from '../services/coingecko';
import { buildResumoIRBase } from '../utils/ir';

const MAX_RETRY_ATTEMPTS = 2;

export function useResumoIR(operacoes: Operacao[]) {
  let baseResumos: ReturnType<typeof buildResumoIRBase> = [];

  try {
    baseResumos = buildResumoIRBase(operacoes);
  } catch {
    // Dado corrompido no localStorage; retorna vazio para nao crashar a pagina.
  }

  const positionQueries = useQueries({
    queries: baseResumos.map((resumo) => ({
      queryKey: ['coin-history', resumo.coinId, `31-12-${resumo.anoFiscal}`],
      queryFn: () => fetchCoinHistory(resumo.coinId, `${resumo.anoFiscal}-12-31`),
      staleTime: Infinity,
      gcTime: ONE_DAY_IN_MS,
      retry: (failureCount: number, error: unknown) =>
        shouldRetryCoinGeckoRequest(error) && failureCount <= MAX_RETRY_ATTEMPTS,
    })),
  });

  const resumos = baseResumos.map((resumo, index) => {
    const valorUnitario3112 = positionQueries[index]?.data?.precoUnitarioBRL ?? 0;

    return {
      ...resumo,
      posicao3112: {
        quantidade: resumo.quantidadeTotal,
        valorUnitario3112,
        valorTotal3112: valorUnitario3112 * resumo.quantidadeTotal,
      },
    };
  });

  const errors = positionQueries.flatMap((query) => (query.error ? [query.error] : []));

  return {
    resumos,
    isLoading: positionQueries.some((query) => query.isLoading || query.isFetching),
    hasError: errors.length > 0,
    errors,
  };
}

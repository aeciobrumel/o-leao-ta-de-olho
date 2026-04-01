import type {
  CoinGeckoHistoryResponse,
  CoinGeckoMarketCoin,
  CoinGeckoSearchResponse,
  CoinListItem,
  ConsultaHistorica,
} from '../types';
import {
  getCachedCoinImages,
  getCachedCoinList,
  setCachedCoinImages,
  setCachedCoinList,
} from './localStorage';
import { toCoinGeckoDate } from '../utils/formatters';

const API_BASE_URL = 'https://api.coingecko.com/api/v3';
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000;
let rateLimitBlockedUntil = 0;

class CoinGeckoApiError extends Error {
  status?: number;
  retryable: boolean;

  constructor(message: string, options?: { status?: number; retryable?: boolean }) {
    super(message);
    this.name = 'CoinGeckoApiError';
    this.status = options?.status;
    this.retryable = options?.retryable ?? false;
  }
}

export class CoinGeckoRateLimitError extends CoinGeckoApiError {
  constructor(message?: string) {
    super(
      message ??
        'A CoinGecko atingiu o limite de consultas. Aguarde cerca de 1 minuto antes de tentar novamente.',
      {
      status: 429,
      retryable: false,
    },
    );
    this.name = 'CoinGeckoRateLimitError';
  }
}

export class CoinGeckoNotFoundError extends CoinGeckoApiError {
  constructor() {
    super('Nao foi possivel encontrar a moeda ou a data consultada na CoinGecko.', {
      status: 404,
      retryable: false,
    });
    this.name = 'CoinGeckoNotFoundError';
  }
}

export class CoinGeckoMissingDataError extends CoinGeckoApiError {
  constructor(message: string) {
    super(message, {
      retryable: false,
    });
    this.name = 'CoinGeckoMissingDataError';
  }
}

export class CoinGeckoServerError extends CoinGeckoApiError {
  constructor(status: number) {
    super('A CoinGecko esta indisponivel no momento. Tente novamente em instantes.', {
      status,
      retryable: true,
    });
    this.name = 'CoinGeckoServerError';
  }
}

export class CoinGeckoNetworkError extends CoinGeckoApiError {
  constructor(message?: string) {
    super(
      message ?? 'Nao foi possivel conectar com a CoinGecko. Verifique sua conexao e tente novamente.',
      {
      retryable: true,
    },
    );
    this.name = 'CoinGeckoNetworkError';
  }
}

export function shouldRetryCoinGeckoRequest(error: unknown) {
  return error instanceof CoinGeckoApiError ? error.retryable : false;
}

async function fetchJson<T>(url: string) {
  if (rateLimitBlockedUntil > Date.now()) {
    throw new CoinGeckoRateLimitError();
  }

  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });
  } catch {
    throw new CoinGeckoNetworkError();
  }

  if (!response.ok) {
    if (response.status === 404) {
      throw new CoinGeckoNotFoundError();
    }

    if (response.status === 429) {
      rateLimitBlockedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
      throw new CoinGeckoRateLimitError();
    }

    if (response.status >= 500) {
      throw new CoinGeckoServerError(response.status);
    }

    throw new CoinGeckoApiError(`CoinGecko respondeu com status ${response.status}.`, {
      status: response.status,
      retryable: false,
    });
  }

  return (await response.json()) as T;
}

export async function fetchCoinHistory(
  coinId: string,
  dateInput: string | Date,
): Promise<ConsultaHistorica> {
  const date = toCoinGeckoDate(dateInput);
  const url = `${API_BASE_URL}/coins/${encodeURIComponent(coinId)}/history?date=${date}&localization=false`;
  const data = await fetchJson<CoinGeckoHistoryResponse>(url);
  const precoUnitarioBRL = data.market_data?.current_price?.brl;

  if (typeof precoUnitarioBRL !== 'number') {
    throw new CoinGeckoMissingDataError(
      'Nao foi possivel encontrar preco em BRL para a data selecionada.',
    );
  }

  return {
    coinId: data.id,
    coinSymbol: data.symbol.toUpperCase(),
    coinName: data.name,
    coinImageUrl: data.image?.small ?? data.image?.thumb,
    data: date,
    precoUnitarioBRL,
    consultadoEm: new Date().toISOString(),
  };
}

export async function fetchCoinList(): Promise<CoinListItem[]> {
  const cachedItems = getCachedCoinList();

  if (cachedItems) {
    return cachedItems;
  }

  const url = `${API_BASE_URL}/coins/list`;
  const items = await fetchJson<CoinListItem[]>(url);
  const normalizedItems = items
    .filter((item) => item.id && item.symbol && item.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  if (!normalizedItems.length) {
    throw new CoinGeckoServerError(200);
  }

  setCachedCoinList(normalizedItems);

  return normalizedItems;
}

export async function fetchCoinSearch(query: string): Promise<CoinListItem[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = `${API_BASE_URL}/search?query=${encodeURIComponent(trimmedQuery)}`;
  const data = await fetchJson<CoinGeckoSearchResponse>(url);

  return (data.coins ?? [])
    .filter((item) => item.id && item.symbol && item.name)
    .sort((a, b) => {
      const rankA = a.market_cap_rank ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.market_cap_rank ?? Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      return a.name.localeCompare(b.name);
    })
    .map((item) => ({
      id: item.id,
      symbol: item.symbol,
      name: item.name,
      imageUrl: item.thumb ?? item.large,
    }));
}

export async function fetchCoinImages(coinIds: string[]): Promise<Record<string, string>> {
  const uniqueCoinIds = Array.from(new Set(coinIds.filter(Boolean)));

  if (!uniqueCoinIds.length) {
    return {};
  }

  const cachedImages = getCachedCoinImages();
  const resolvedImages: Record<string, string> = {};

  for (const coinId of uniqueCoinIds) {
    const cachedImage = cachedImages[coinId];

    if (cachedImage) {
      resolvedImages[coinId] = cachedImage;
    }
  }

  const missingCoinIds = uniqueCoinIds.filter((coinId) => !resolvedImages[coinId]);

  if (!missingCoinIds.length) {
    return resolvedImages;
  }

  const fetchedImages: Record<string, string> = {};

  try {
    for (let index = 0; index < missingCoinIds.length; index += 50) {
      const batchIds = missingCoinIds.slice(index, index + 50);
      const url =
        `${API_BASE_URL}/coins/markets?vs_currency=usd&ids=${encodeURIComponent(batchIds.join(','))}` +
        '&sparkline=false';
      const items = await fetchJson<CoinGeckoMarketCoin[]>(url);

      for (const item of items) {
        if (item.id && item.image) {
          fetchedImages[item.id] = item.image;
        }
      }
    }
  } catch {
    return resolvedImages;
  }

  if (Object.keys(fetchedImages).length > 0) {
    setCachedCoinImages(fetchedImages);
  }

  return {
    ...resolvedImages,
    ...fetchedImages,
  };
}

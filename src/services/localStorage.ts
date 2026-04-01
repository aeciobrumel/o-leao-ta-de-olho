import type { CoinListItem, Operacao } from '../types';
import { ONE_DAY_IN_MS } from '../constants/time';

export function isLocalStorageAvailable(): boolean {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return true;
  } catch {
    return false;
  }
}

const OPERACOES_STORAGE_KEY = 'o-leao-ta-de-olho:operacoes';
const COIN_LIST_STORAGE_KEY = 'o-leao-ta-de-olho:coin-list';
const COIN_IMAGES_STORAGE_KEY = 'o-leao-ta-de-olho:coin-images';
const LEGACY_OPERACOES_STORAGE_KEY = 'leao-na-data:operacoes';
const LEGACY_COIN_LIST_STORAGE_KEY = 'leao-na-data:coin-list';
const LEGACY_COIN_IMAGES_STORAGE_KEY = 'leao-na-data:coin-images';

interface CachedCoinListPayload {
  expiresAt: number;
  items: CoinListItem[];
}

interface CachedCoinImagesPayload {
  expiresAt: number;
  items: Record<string, string>;
}

export class LocalStorageWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LocalStorageWriteError';
  }
}

function isQuotaExceededError(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);

    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    if (isQuotaExceededError(error)) {
      throw new LocalStorageWriteError(
        'O armazenamento do navegador está cheio. Remova operações antigas e tente novamente.',
      );
    }

    throw new LocalStorageWriteError('Nao foi possivel salvar os dados no navegador.');
  }
}

function migrateLegacyStorage<T>(currentKey: string, legacyKey: string, fallback: T): T {
  const currentValue = readJson<T | null>(currentKey, null);

  if (currentValue !== null) {
    return currentValue;
  }

  const legacyValue = readJson<T | null>(legacyKey, null);

  if (legacyValue === null || typeof window === 'undefined') {
    return fallback;
  }

  writeJson(currentKey, legacyValue);
  window.localStorage.removeItem(legacyKey);

  return legacyValue;
}

function isValidOperacao(item: unknown): item is Operacao {
  if (!item || typeof item !== 'object') return false;
  const o = item as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.coinId === 'string' &&
    typeof o.coinSymbol === 'string' &&
    typeof o.coinName === 'string' &&
    typeof o.dataCompra === 'string' &&
    !Number.isNaN(new Date(o.dataCompra as string).getTime()) &&
    typeof o.quantidade === 'number' &&
    o.quantidade > 0 &&
    typeof o.precoUnitarioBRL === 'number' &&
    o.precoUnitarioBRL >= 0 &&
    typeof o.valorTotalBRL === 'number' &&
    o.valorTotalBRL >= 0 &&
    typeof o.criadoEm === 'string'
  );
}

export function loadOperacoes() {
  const raw = migrateLegacyStorage<unknown>(OPERACOES_STORAGE_KEY, LEGACY_OPERACOES_STORAGE_KEY, []);
  const operacoes = Array.isArray(raw) ? raw.filter(isValidOperacao) : [];
  return operacoes.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export function saveOperacoes(operacoes: Operacao[]) {
  writeJson(OPERACOES_STORAGE_KEY, operacoes);
}

export function removeOperacaoById(id: string) {
  const nextOperacoes = loadOperacoes().filter((operacao) => operacao.id !== id);
  saveOperacoes(nextOperacoes);

  return nextOperacoes;
}

export function getCachedCoinList() {
  const cache = migrateLegacyStorage<CachedCoinListPayload | null>(
    COIN_LIST_STORAGE_KEY,
    LEGACY_COIN_LIST_STORAGE_KEY,
    null,
  );

  if (!cache || cache.expiresAt < Date.now()) {
    return null;
  }

  return cache.items;
}

export function setCachedCoinList(items: CoinListItem[]) {
  try {
    writeJson<CachedCoinListPayload>(COIN_LIST_STORAGE_KEY, {
      items,
      expiresAt: Date.now() + ONE_DAY_IN_MS,
    });
  } catch {
    // Cache de moedas eh opcional; nao deve bloquear a consulta se falhar.
  }
}

export function getCachedCoinImages() {
  const cache = migrateLegacyStorage<CachedCoinImagesPayload | null>(
    COIN_IMAGES_STORAGE_KEY,
    LEGACY_COIN_IMAGES_STORAGE_KEY,
    null,
  );

  if (!cache || cache.expiresAt < Date.now()) {
    return {};
  }

  return cache.items;
}

export function setCachedCoinImages(items: Record<string, string>) {
  const cachedItems = getCachedCoinImages();

  try {
    writeJson<CachedCoinImagesPayload>(COIN_IMAGES_STORAGE_KEY, {
      items: {
        ...cachedItems,
        ...items,
      },
      expiresAt: Date.now() + ONE_DAY_IN_MS * 7,
    });
  } catch {
    // Cache de imagens eh opcional; nao deve bloquear a consulta se falhar.
  }
}

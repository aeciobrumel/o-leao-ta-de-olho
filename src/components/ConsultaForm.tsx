import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useCoinListQuery, useCoinSearchQuery } from '../hooks/useCoinGecko';
import { cn } from '../lib/utils';
import { useAppStore } from '../store/useAppStore';
import type { CoinListItem, ConsultaFormValues } from '../types';
import { formatDateInputValue, getTodayIsoDate, parseDateInputValue } from '../utils/formatters';
import CoinIdentity from './CoinIdentity';
import Card from './ui/Card';
import { Button } from './ui/Button';
import Input from './ui/Input';

interface ConsultaFormProps {
  loading?: boolean;
  onSubmit: (values: ConsultaFormValues) => void;
}

function formatCoinLabel(coin: CoinListItem) {
  return `${coin.symbol.toUpperCase()} • ${coin.name}`;
}

function isIOSDateInputFallback() {
  if (typeof window === 'undefined') return false;

  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  const maxTouchPoints = window.navigator.maxTouchPoints ?? 0;

  return /iP(hone|ad|od)/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export default function ConsultaForm({ loading = false, onSubmit }: ConsultaFormProps) {
  const {
    data: coins = [],
    isLoading,
    isError,
    error: coinListError,
  } = useCoinListQuery();
  const selectedCoinId = useAppStore((state) => state.selectedCoinId);
  const setSelectedCoinId = useAppStore((state) => state.setSelectedCoinId);

  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dataCompra, setDataCompra] = useState('');
  const [dataCompraInput, setDataCompraInput] = useState('');
  const [quantidade, setQuantidade] = useState('1');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [useTextDateInput, setUseTextDateInput] = useState(false);

  const deferredInput = useDeferredValue(inputValue);
  const searchTerm = deferredInput.trim();
  const inputId = 'consulta-coin-input';
  const listboxId = 'consulta-coin-listbox';
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedCoin = useMemo(
    () => coins.find((c) => c.id === selectedCoinId) ?? null,
    [coins, selectedCoinId],
  );

  // Sync input when selected coin changes externally
  useEffect(() => {
    if (selectedCoin) {
      setInputValue(formatCoinLabel(selectedCoin));
    }
  }, [selectedCoin]);

  useEffect(() => {
    setUseTextDateInput(isIOSDateInputFallback());
  }, []);

  const shouldUseRemoteSearch =
    searchTerm.length >= 3 && (!selectedCoin || searchTerm !== formatCoinLabel(selectedCoin));

  useEffect(() => {
    if (!shouldUseRemoteSearch) {
      setDebouncedSearchTerm('');
      return;
    }

    const timerId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 350);

    return () => window.clearTimeout(timerId);
  }, [searchTerm, shouldUseRemoteSearch]);

  const {
    data: searchedCoins = [],
    isFetching: isSearchingCoins,
    isError: hasSearchError,
    error: searchError,
  } = useCoinSearchQuery(debouncedSearchTerm);

  const filteredCoins = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return coins.slice(0, 120);

    type Scored = { coin: CoinListItem; score: number };
    const scored: Scored[] = [];

    for (const coin of coins) {
      const symbol = coin.symbol.toLowerCase();
      const name = coin.name.toLowerCase();
      if (symbol === q) scored.push({ coin, score: 0 });
      else if (symbol.startsWith(q)) scored.push({ coin, score: 1 });
      else if (name.startsWith(q)) scored.push({ coin, score: 2 });
      else if (symbol.includes(q) || name.includes(q)) scored.push({ coin, score: 3 });
    }

    scored.sort((a, b) => a.score - b.score || a.coin.name.localeCompare(b.coin.name));
    return scored.slice(0, 120).map((s) => s.coin);
  }, [coins, searchTerm]);

  const visibleCoins = useMemo(() => {
    if (debouncedSearchTerm.length >= 3 && searchedCoins.length > 0) {
      return searchedCoins;
    }

    return filteredCoins;
  }, [debouncedSearchTerm, filteredCoins, searchedCoins]);

  function selectCoin(coin: CoinListItem) {
    setSelectedCoinId(coin.id);
    setInputValue(formatCoinLabel(coin));
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleInputChange(value: string) {
    setInputValue(value);
    setOpen(true);
    setActiveIndex(-1);
    // Clear selection if user edits the text
    if (selectedCoin && value !== formatCoinLabel(selectedCoin)) {
      setSelectedCoinId('');
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, visibleCoins.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectCoin(visibleCoins[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex >= visibleCoins.length) {
      setActiveIndex(visibleCoins.length ? visibleCoins.length - 1 : -1);
    }
  }, [activeIndex, visibleCoins.length]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCoin || !dataCompra || Number(quantidade) <= 0) return;
    onSubmit({ coin: selectedCoin, dataCompra, quantidade: Number(quantidade) });
  }

  function handleDateInputChange(value: string) {
    const maskedValue = formatDateInputValue(value);
    const parsedDate = parseDateInputValue(maskedValue);
    const today = getTodayIsoDate();

    setDataCompraInput(maskedValue);

    if (parsedDate && parsedDate <= today) {
      setDataCompra(parsedDate);
      return;
    }

    setDataCompra('');
  }

  const hasInvalidDateInput =
    useTextDateInput && dataCompraInput.length === 10 && parseDateInputValue(dataCompraInput) === '';

  const hasFutureDateInput =
    useTextDateInput &&
    dataCompraInput.length === 10 &&
    parseDateInputValue(dataCompraInput) > getTodayIsoDate();

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {/* Linha 1: combobox */}
          <div className="space-y-2">
            <label htmlFor={inputId} className="text-base font-semibold text-primary">Criptomoeda</label>
            <div ref={containerRef} className="space-y-1">
              <Input
                id={inputId}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                aria-autocomplete="list"
                aria-activedescendant={activeIndex >= 0 ? `coin-option-${visibleCoins[activeIndex]?.id}` : undefined}
                placeholder={
                  isLoading ? 'Carregando moedas...' : 'Buscar por símbolo ou nome...'
                }
                value={inputValue}
                disabled={isLoading || loading}
                onChange={(e) => handleInputChange(e.target.value)}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
              />
              {open && visibleCoins.length > 0 && (
                <ul
                  id={listboxId}
                  ref={listRef}
                  role="listbox"
                  aria-label="Moedas disponíveis"
                  className={cn(
                    'w-full max-h-60 overflow-y-auto rounded-sm border border-input',
                    'bg-white/95 text-sm text-foreground shadow-soft dark:bg-background',
                  )}
                >
                  {visibleCoins.map((coin, idx) => (
                    <li
                      key={coin.id}
                      id={`coin-option-${coin.id}`}
                      role="option"
                      aria-selected={coin.id === selectedCoinId}
                      className={cn(
                        'cursor-pointer px-3 py-2 transition-colors',
                        idx === activeIndex
                          ? 'bg-accent text-accent-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground',
                        coin.id === selectedCoinId && 'font-semibold',
                      )}
                      onMouseDown={(e) => {
                        e.preventDefault(); // prevent blur before click
                        selectCoin(coin);
                      }}
                    >
                      <CoinIdentity
                        name={coin.name}
                        symbol={coin.symbol.toUpperCase()}
                        imageUrl={coin.imageUrl}
                        imageClassName="h-8 w-8"
                        titleClassName="text-sm"
                        subtitleClassName="text-xs"
                      />
                    </li>
                  ))}
                </ul>
              )}
              {open && visibleCoins.length === 0 && searchTerm.length >= 3 && (
                <div className="rounded-sm border border-input bg-white/95 px-4 py-3 text-sm text-muted-foreground shadow-soft dark:bg-background">
                  {isSearchingCoins ? 'Buscando moedas...' : 'Nenhuma moeda encontrada.'}
                </div>
              )}
            </div>
            {hasSearchError && searchTerm.length >= 3 && (
              <span className="text-sm text-amber-700 dark:text-amber-300">
                {searchError instanceof Error
                  ? `${searchError.message} Usando a lista local para continuar a busca.`
                  : 'A busca com icones esta temporariamente indisponivel. Usando a lista local.'}
              </span>
            )}
            {isError && (
              <span className="text-sm text-destructive">
                {coinListError instanceof Error
                  ? coinListError.message
                  : 'Nao foi possivel carregar a lista de moedas.'}
              </span>
            )}
          </div>

          {/* Linha 2: data + quantidade + botão */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
            <div className="min-w-0 space-y-2">
              <label htmlFor="dataCompra" className="text-sm font-semibold text-primary">
                Data
              </label>
              <Input
                id="dataCompra"
                type={useTextDateInput ? 'text' : 'date'}
                max={useTextDateInput ? undefined : getTodayIsoDate()}
                value={useTextDateInput ? dataCompraInput : dataCompra}
                onChange={(e) =>
                  useTextDateInput
                    ? handleDateInputChange(e.target.value)
                    : setDataCompra(e.target.value)
                }
                onBlur={() => {
                  if (useTextDateInput && dataCompra) {
                    setDataCompraInput(formatDateInputValue(dataCompra));
                  }
                }}
                inputMode={useTextDateInput ? 'numeric' : undefined}
                placeholder={useTextDateInput ? 'dd/mm/aaaa' : undefined}
                autoComplete={useTextDateInput ? 'bday' : 'off'}
                pattern={useTextDateInput ? '\\d{2}/\\d{2}/\\d{4}' : undefined}
                className="min-w-0 max-w-full"
              />
              {hasInvalidDateInput && (
                <span className="text-sm text-destructive">Digite uma data valida no formato dd/mm/aaaa.</span>
              )}
              {hasFutureDateInput && (
                <span className="text-sm text-destructive">A data da compra nao pode ser futura.</span>
              )}
            </div>
            <div className="min-w-0 space-y-2">
              <label htmlFor="quantidade" className="text-sm font-semibold text-primary">
                Quantidade{selectedCoin ? ` (${selectedCoin.symbol.toUpperCase()})` : ''}
              </label>
              <Input
                id="quantidade"
                type="number"
                min="0.00000001"
                step="any"
                inputMode="decimal"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                className="min-w-0 max-w-full"
              />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button
                type="submit"
                variant="lion"
                size="lg"
                disabled={loading || !selectedCoinId || !dataCompra}
                className="w-full lg:min-w-[11.5rem]"
              >
                {loading ? 'Consultando...' : 'Buscar Valor'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
}

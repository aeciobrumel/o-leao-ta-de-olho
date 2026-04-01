import { Search, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Operacao } from '../types';
import { formatBRL, formatCripto, formatDate, formatDateTime } from '../utils/formatters';
import CoinIdentity from './CoinIdentity';
import { Button } from './ui/Button';
import Card from './ui/Card';

interface HistoricoListProps {
  operacoes: Operacao[];
  onDelete: (id: string) => void;
  coinImageOverrides?: Record<string, string>;
}

type SortKey = 'criadoEm' | 'dataCompra' | 'valorTotalBRL';
type SortDir = 'asc' | 'desc';

export default function HistoricoList({
  operacoes,
  onDelete,
  coinImageOverrides,
}: HistoricoListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [filterCoin, setFilterCoin] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('criadoEm');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const coinOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const op of operacoes) {
      if (!seen.has(op.coinId)) seen.set(op.coinId, op.coinName);
    }
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [operacoes]);

  const filtered = useMemo(() => {
    const list = filterCoin ? operacoes.filter((op) => op.coinId === filterCoin) : operacoes;
    return [...list].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = typeof aVal === 'number' && typeof bVal === 'number'
        ? aVal - bVal
        : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [operacoes, filterCoin, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  function SortButton({ label, field }: { label: string; field: SortKey }) {
    const active = sortKey === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className={`rounded px-2 py-1 text-xs font-medium transition ${
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/70'
        }`}
      >
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </button>
    );
  }

  if (!operacoes.length) {
    return (
      <Card>
        <h2 className="section-title">Histórico vazio</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          As operações consultadas ficam salvas no navegador e aparecerão aqui.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros e ordenação */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={filterCoin}
            onChange={(e) => setFilterCoin(e.target.value)}
            className="h-8 rounded-md border border-border bg-background pl-8 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Todos os ativos</option>
            {coinOptions.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Ordenar:</span>
          <SortButton label="Data consulta" field="criadoEm" />
          <SortButton label="Data compra" field="dataCompra" />
          <SortButton label="Valor" field="valorTotalBRL" />
        </div>

        {filterCoin && (
          <button
            onClick={() => setFilterCoin('')}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
            Limpar filtro
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} de {operacoes.length} operações
        </span>
      </div>

      {filtered.length === 0 && (
        <Card>
          <p className="text-sm text-muted-foreground">Nenhuma operação encontrada para o filtro selecionado.</p>
        </Card>
      )}

      {filtered.map((operacao) => (
        <Card key={operacao.id}>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Ativo
                </p>
                <CoinIdentity
                  name={operacao.coinName}
                  symbol={operacao.coinSymbol}
                  imageUrl={operacao.coinImageUrl ?? coinImageOverrides?.[operacao.coinId]}
                  className="mt-2"
                  imageClassName="h-9 w-9"
                  titleClassName="text-lg"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Data da compra
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatDate(operacao.dataCompra)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Quantidade
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatCripto(operacao.quantidade, operacao.coinSymbol)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Valor total
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {formatBRL(operacao.valorTotalBRL)}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <p className="text-sm text-muted-foreground">
                Salvo em {formatDateTime(operacao.criadoEm)}
              </p>

              {confirmDeleteId === operacao.id ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive">Confirmar exclusão?</span>
                  <Button
                    onClick={() => { onDelete(operacao.id); setConfirmDeleteId(null); }}
                    variant="destructive"
                    size="sm"
                  >
                    Excluir
                  </Button>
                  <Button
                    onClick={() => setConfirmDeleteId(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setConfirmDeleteId(operacao.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

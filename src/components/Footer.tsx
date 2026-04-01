import { useCoinGeckoStatus } from '../hooks/useCoinGeckoStatus';

const statusConfig = {
  idle: { label: 'CoinGecko: OK', className: 'bg-emerald-500' },
  loading: { label: 'CoinGecko: consultando…', className: 'bg-amber-400 animate-pulse' },
  'rate-limited': { label: 'CoinGecko: limite atingido', className: 'bg-orange-500' },
  error: { label: 'CoinGecko: erro', className: 'bg-destructive' },
};

export default function Footer() {
  const status = useCoinGeckoStatus();
  const { label, className } = statusConfig[status];

  return (
    <footer className="mt-10 border-t border-border/80 pt-5 text-sm text-muted-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p>
            Dados de referência para organização fiscal. Não substitui orientação contábil ou
            jurídica especializada.
          </p>
          <p>Fonte de dados: CoinGecko. Armazenamento local no navegador.</p>
        </div>

        <span className="flex items-center gap-1.5 text-xs">
          <span className={`h-2 w-2 rounded-full ${className}`} />
          {label}
        </span>
      </div>
    </footer>
  );
}

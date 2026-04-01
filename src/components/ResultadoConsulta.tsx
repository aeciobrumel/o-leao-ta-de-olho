import type { Operacao } from '../types';
import { formatBRL, formatCripto, formatDate, formatDateTime } from '../utils/formatters';
import CoinIdentity from './CoinIdentity';
import { Button } from './ui/Button';
import Card from './ui/Card';
import CopyButton from './ui/CopyButton';

interface ResultadoConsultaProps {
  operacao: Operacao | null;
  loading?: boolean;
  errorMessage?: string | null;
}

function buildCopyText(operacao: Operacao) {
  return [
    `${operacao.coinName.toUpperCase()} (${operacao.coinSymbol.toUpperCase()})`,
    `Data da compra: ${formatDate(operacao.dataCompra)}`,
    `Quantidade: ${formatCripto(operacao.quantidade, operacao.coinSymbol)}`,
    `Valor unitário na data: ${formatBRL(operacao.precoUnitarioBRL)}`,
    `Valor total do investimento: ${formatBRL(operacao.valorTotalBRL)}`,
    `Consulta registrada em: ${formatDateTime(operacao.criadoEm)}`,
    'Fonte: CoinGecko (coingecko.com)',
  ].join('\n');
}

export default function ResultadoConsulta({
  operacao,
  loading = false,
  errorMessage,
}: ResultadoConsultaProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-5 w-24 rounded-full bg-foreground/10" />
        <div className="mt-5 h-8 w-3/4 rounded-full bg-foreground/10" />
        <div className="mt-3 h-16 rounded-md bg-foreground/10" />
        <div className="mt-3 h-10 rounded-md bg-foreground/5" />
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="border-destructive/30 bg-destructive/5">
        <h3 className="font-display text-xl font-bold text-destructive">Consulta indisponível</h3>
        <p className="mt-2 text-sm text-destructive/80">{errorMessage}</p>
      </Card>
    );
  }

  if (!operacao) {
    return (
      <Card>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Resultado</p>
        <p className="mt-4 text-sm text-muted-foreground">
          O valor consultado vai aparecer aqui com o texto pronto para copiar na sua organização
          fiscal.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="text-sm font-semibold uppercase tracking-widest text-accent">Resultado</p>

      <CoinIdentity
        name={operacao.coinName}
        symbol={operacao.coinSymbol}
        imageUrl={operacao.coinImageUrl}
        className="mt-4"
        imageClassName="h-11 w-11"
        titleClassName="text-lg"
      />

      <p className="mt-4 text-base text-muted-foreground">
        Em {formatDate(operacao.dataCompra)},{' '}
        {formatCripto(operacao.quantidade, operacao.coinSymbol)} valia:
      </p>

      <p className="mt-2 font-display text-4xl font-bold text-slate-950 dark:text-lion-500 sm:text-5xl">
        {formatBRL(operacao.valorTotalBRL)}
      </p>

      <p className="mt-4 text-sm text-muted-foreground">
        Cotação em Reais na data:{' '}
        <span className="font-semibold text-foreground">
          1 {operacao.coinSymbol.toUpperCase()} = {formatBRL(operacao.precoUnitarioBRL)}
        </span>
      </p>

      <div className="mt-4 flex items-center gap-2">
        <img
          src="https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d2fad576ad1f35e85c9c81a19a4a.png"
          alt="CoinGecko"
          className="h-4 object-contain opacity-70 dark:opacity-40 dark:invert"
        />
        <span className="text-xs text-muted-foreground">Fonte: CoinGecko</span>
      </div>

      <CopyButton text={buildCopyText(operacao)} variant="lion-outline" size="default" className="mt-5 w-full" />

      <p className="mt-3 text-center text-xs text-muted-foreground/60">
        Salvo em {formatDateTime(operacao.criadoEm)}
      </p>
    </Card>
  );
}

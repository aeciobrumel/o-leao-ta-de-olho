import type { ResumoIR as ResumoIRType } from '../types';
import { formatBRL, formatCripto, formatResumoIRText } from '../utils/formatters';
import CoinIdentity from './CoinIdentity';
import Card from './ui/Card';
import CopyButton from './ui/CopyButton';

interface ResumoIRProps {
  resumos: ResumoIRType[];
  loading?: boolean;
}

export default function ResumoIR({ resumos, loading = false }: ResumoIRProps) {
  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-6 w-52 rounded-full bg-muted" />
        <div className="mt-4 h-40 rounded-md bg-muted/50" />
      </Card>
    );
  }

  if (!resumos.length) {
    return (
      <Card>
        <h2 className="section-title">Nada para resumir</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Adicione operações no histórico para gerar o resumo agrupado por ativo e ano fiscal.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resumos.map((resumo) => (
        <Card key={`${resumo.coinId}-${resumo.anoFiscal}`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary dark:text-lion-300">
                  Ano fiscal {resumo.anoFiscal}
                </p>
                <CoinIdentity
                  name={resumo.coinName}
                  symbol={resumo.coinSymbol}
                  imageUrl={resumo.coinImageUrl}
                  className="mt-2"
                  imageClassName="h-10 w-10"
                  titleClassName="font-display text-2xl font-bold"
                />
              </div>
              <CopyButton text={formatResumoIRText(resumo)} />
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md bg-muted/50 p-4 dark:bg-muted/30">
                <p className="text-sm text-muted-foreground">Quantidade total</p>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {formatCripto(resumo.quantidadeTotal, resumo.coinSymbol)}
                </p>
              </div>
              <div className="rounded-md bg-muted/50 p-4 dark:bg-muted/30">
                <p className="text-sm text-muted-foreground">Custo de aquisição</p>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {formatBRL(resumo.custoTotalBRL)}
                </p>
              </div>
              <div className="rounded-md bg-muted/50 p-4 dark:bg-muted/30">
                <p className="text-sm text-muted-foreground">Preço médio</p>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {formatBRL(resumo.precoMedio)}
                </p>
              </div>
              <div className="rounded-md bg-lion-50 p-4 dark:bg-lion-900/20">
                <p className="text-sm text-lion-800 dark:text-lion-300">Posição em 31/12</p>
                <p className="mt-2 text-xl font-semibold text-foreground">
                  {formatBRL(resumo.posicao3112.valorTotal3112)}
                </p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {resumo.operacoes.length} operação(ões) consideradas neste agrupamento.
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}

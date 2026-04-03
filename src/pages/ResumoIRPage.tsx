import { Download } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ResumoIR from '../components/ResumoIR';
import { Button } from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useRestoreCoinImages } from '../hooks/useRestoreCoinImages';
import { useOperacoes } from '../hooks/useOperacoes';
import { useResumoIR } from '../hooks/useResumoIR';
import { DEFAULT_OG_IMAGE_URL, SITE_DISPLAY_NAME, SITE_URL } from '../lib/seo';
import {
  CoinGeckoHistoricalRangeError,
  CoinGeckoRateLimitError,
} from '../services/coingecko';
import type { ResumoIR as ResumoIRType } from '../types';
import { formatDate, getCoinGeckoHistoryMinDate, getTodayIsoDate } from '../utils/formatters';

function exportResumoCSV(resumos: ResumoIRType[]) {
  const header = 'Ativo,Símbolo,Ano Fiscal,Quantidade Total,Custo de Aquisição (BRL),Preço Médio (BRL),Posição 31/12 (BRL)';
  const rows = resumos.map((r) =>
    [
      `"${r.coinName}"`,
      r.coinSymbol.toUpperCase(),
      r.anoFiscal,
      r.quantidadeTotal,
      r.custoTotalBRL.toFixed(2),
      r.precoMedio.toFixed(2),
      r.posicao3112.valorTotal3112.toFixed(2),
    ].join(','),
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'resumo-ir-cripto.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ResumoIRPage() {
  const minCoinGeckoDate = getCoinGeckoHistoryMinDate();
  const maxCoinGeckoDate = getTodayIsoDate();
  const title = `Resumo de Criptoativos para Declaração do IR | ${SITE_DISPLAY_NAME}`;
  const description =
    'Gere um resumo de custo de aquisição por ativo e ano fiscal. Calcule preço médio e posição de criptoativos para organizar a declaração do Imposto de Renda.';
  const canonicalUrl = `${SITE_URL}/resumo-ir`;
  const ogImageUrl = DEFAULT_OG_IMAGE_URL;
  const { operacoes, hydrateOperacaoImages } = useOperacoes();
  const restoredCoinImages = useRestoreCoinImages(operacoes, hydrateOperacaoImages);
  const operacoesEnriquecidas = operacoes.map((operacao) =>
    operacao.coinImageUrl || !restoredCoinImages[operacao.coinId]
      ? operacao
      : {
          ...operacao,
          coinImageUrl: restoredCoinImages[operacao.coinId],
        },
  );
  const { resumos, isLoading, hasError, errors } = useResumoIR(operacoesEnriquecidas);
  const hasRateLimit = errors.some((e) => e instanceof CoinGeckoRateLimitError);
  const hasHistoricalRangeError = errors.some((e) => e instanceof CoinGeckoHistoricalRangeError);

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_DISPLAY_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:url" content={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Início", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Resumo para IR", "item": canonicalUrl }
          ]
        })}</script>
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="section-title">Resumo de criptoativos para declaração do IR</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              O agrupamento considera o ativo e o ano fiscal da compra, calculando custo total,
              preço médio e uma referência de posição em 31/12. Use este resumo como base para
              preencher a ficha de <strong>bens e direitos</strong> da declaração do Imposto de
              Renda, informando o custo de aquisição de cada criptoativo por ano fiscal.
            </p>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              A referência de preço em 31/12 depende da API publica da CoinGecko, que hoje consulta
              apenas datas entre <strong>{formatDate(minCoinGeckoDate)}</strong> e{' '}
              <strong>{formatDate(maxCoinGeckoDate)}</strong>.
            </p>
          </div>
          {resumos.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => exportResumoCSV(resumos)} className="shrink-0">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          )}
        </div>

        {hasRateLimit ? (
          <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-800/50 dark:bg-amber-900/20">
            <p className="text-sm text-amber-900 dark:text-amber-300">
              ⏳ Limite de requisições da CoinGecko atingido. Aguarde cerca de 1 minuto e recarregue
              a página para buscar os preços de 31/12.
            </p>
          </Card>
        ) : hasHistoricalRangeError ? (
          <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-800/50 dark:bg-amber-900/20">
            <p className="text-sm text-amber-900 dark:text-amber-300">
              A API publica da CoinGecko nao cobre parte dos anos fiscais salvos. O custo de
              aquisicao continua disponivel, mas os valores de referencia em 31/12 fora da janela
              de {formatDate(minCoinGeckoDate)} a {formatDate(maxCoinGeckoDate)} podem ficar zerados.
            </p>
          </Card>
        ) : hasError ? (
          <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-800/50 dark:bg-amber-900/20">
            <p className="text-sm text-amber-900 dark:text-amber-300">
              Parte dos preços de 31/12 não pôde ser carregada agora. O custo de aquisição segue
              disponível, mas a referência de mercado pode aparecer zerada.
            </p>
          </Card>
        ) : null}

        <ResumoIR resumos={resumos} loading={isLoading} />
      </div>
    </>
  );
}

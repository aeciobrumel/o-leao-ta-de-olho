import { Helmet } from 'react-helmet-async';
import HistoricoList from '../components/HistoricoList';
import { useRestoreCoinImages } from '../hooks/useRestoreCoinImages';
import { useOperacoes } from '../hooks/useOperacoes';
import { DEFAULT_OG_IMAGE_URL, SITE_DISPLAY_NAME, SITE_URL } from '../lib/seo';

export default function HistoricoPage() {
  const title = `Histórico de Operações com Criptomoedas | ${SITE_DISPLAY_NAME}`;
  const description =
    'Revise consultas salvas de Bitcoin, Ethereum e outros criptoativos. Organize o histórico de operações e o custo de aquisição para a declaração do Imposto de Renda.';
  const canonicalUrl = `${SITE_URL}/historico`;
  const ogImageUrl = DEFAULT_OG_IMAGE_URL;
  const { operacoes, deleteOperacao, hydrateOperacaoImages } = useOperacoes();
  const restoredCoinImages = useRestoreCoinImages(operacoes, hydrateOperacaoImages);

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
            { "@type": "ListItem", "position": 2, "name": "Histórico de Operações", "item": canonicalUrl }
          ]
        })}</script>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="section-title">Histórico de operações com criptomoedas</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Tudo o que você consultar fica armazenado localmente no navegador para facilitar sua
            organização fiscal e revisão posterior. Cada operação registra a criptomoeda, a data
            de compra, a quantidade e o valor histórico em reais — as informações necessárias para
            declarar criptoativos corretamente no Imposto de Renda.
          </p>
        </div>

        <HistoricoList
          operacoes={operacoes}
          onDelete={deleteOperacao}
          coinImageOverrides={restoredCoinImages}
        />
      </div>
    </>
  );
}

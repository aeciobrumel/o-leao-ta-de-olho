import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ConsultaForm from '../components/ConsultaForm';
import ResultadoConsulta from '../components/ResultadoConsulta';
import Card from '../components/ui/Card';
import { useCoinHistoryQuery } from '../hooks/useCoinGecko';
import {
  DEFAULT_OG_IMAGE_URL,
  HOME_SEO_DESCRIPTION,
  HOME_SEO_TITLE,
  SITE_DISPLAY_NAME,
  SITE_URL,
} from '../lib/seo';
import { useOperacoes } from '../hooks/useOperacoes';
import { CoinGeckoRateLimitError } from '../services/coingecko';
import type { ConsultaFormValues, Operacao } from '../types';
import { generateId } from '../utils/generateId';

interface SubmissionState extends ConsultaFormValues {
  token: string;
}

const PAGE_TITLE = HOME_SEO_TITLE;
const PAGE_DESCRIPTION = HOME_SEO_DESCRIPTION;
const PAGE_CANONICAL_URL = `${SITE_URL}/`;
const PAGE_OG_IMAGE_URL = DEFAULT_OG_IMAGE_URL;

export default function HomePage() {
  const [submission, setSubmission] = useState<SubmissionState | null>(null);
  const [operacaoAtual, setOperacaoAtual] = useState<Operacao | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastProcessedTokenRef = useRef<string | null>(null);
  const { addOperacao } = useOperacoes();
  const historyQuery = useCoinHistoryQuery(
    submission ? { coinId: submission.coin.id, date: submission.dataCompra } : null,
  );

  useEffect(() => {
    if (!submission || !historyQuery.data || lastProcessedTokenRef.current === submission.token) {
      return;
    }

    const operacao: Operacao = {
      id: generateId(),
      coinId: submission.coin.id,
      coinSymbol: submission.coin.symbol.toUpperCase(),
      coinName: submission.coin.name,
      coinImageUrl: historyQuery.data.coinImageUrl,
      dataCompra: submission.dataCompra,
      quantidade: submission.quantidade,
      precoUnitarioBRL: historyQuery.data.precoUnitarioBRL,
      valorTotalBRL: submission.quantidade * historyQuery.data.precoUnitarioBRL,
      criadoEm: new Date().toISOString(),
    };

    const saveResult = addOperacao(operacao);

    if (!saveResult.success) {
      setOperacaoAtual(null);
      setErrorMessage(
        saveResult.error?.message ?? 'Nao foi possivel salvar a operacao no navegador.',
      );
      lastProcessedTokenRef.current = submission.token;
      return;
    }

    setOperacaoAtual(operacao);
    setErrorMessage(null);
    lastProcessedTokenRef.current = submission.token;
  }, [addOperacao, historyQuery.data, submission]);

  useEffect(() => {
    if (!historyQuery.isError) {
      return;
    }

    const isRateLimit = historyQuery.error instanceof CoinGeckoRateLimitError;
    const message = isRateLimit
      ? '⏳ Limite de requisições atingido. Aguarde cerca de 1 minuto e tente novamente.'
      : historyQuery.error instanceof Error
        ? historyQuery.error.message
        : 'Nao foi possivel consultar a moeda agora.';

    setErrorMessage(message);
  }, [historyQuery.error, historyQuery.isError]);

  function handleSubmit(values: ConsultaFormValues) {
    setErrorMessage(null);
    setOperacaoAtual(null);
    setSubmission({
      ...values,
      token: generateId(),
    });
  }

  return (
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_CANONICAL_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_DISPLAY_NAME} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:image" content={PAGE_OG_IMAGE_URL} />
        <meta property="og:url" content={PAGE_CANONICAL_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={PAGE_OG_IMAGE_URL} />
        <meta name="twitter:url" content={PAGE_CANONICAL_URL} />
      </Helmet>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr] [&>*]:min-w-0">
        <div className="space-y-6">
          <div>
            <h1 className="sr-only">
              {HOME_SEO_TITLE}
            </h1>
            <ConsultaForm loading={historyQuery.isFetching} onSubmit={handleSubmit} />
          </div>

          <Card>
            <h2 className="font-display text-lg font-bold text-primary dark:text-foreground">
              Como funciona
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Consulte o preço histórico de cada compra, salve a operação no navegador e gere um
              resumo por ativo para organizar a declaração de cripto no Imposto de Renda.
            </p>
          </Card>

          <Card>
            <h2 className="font-display text-base font-semibold text-primary dark:text-foreground">
              Por que usar o valor histórico de criptomoeda?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A Receita Federal exige o <strong>valor de aquisição cripto</strong> na data da compra,
              em reais, para o preenchimento correto da declaração de criptoativos no Imposto de Renda.
              Usar o preço atual em vez do histórico é um erro comum que pode levar à malha fina.
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground list-disc list-inside">
              <li>Consulte o <strong>preço Bitcoin por data</strong> de qualquer compra passada</li>
              <li>Calcule o custo de aquisição de Ethereum e outras criptomoedas</li>
              <li>Gere um resumo organizado por ativo e ano fiscal para <strong>declarar criptomoeda no Imposto de Renda</strong></li>
            </ul>
          </Card>
        </div>

        <ResultadoConsulta
          operacao={operacaoAtual}
          loading={historyQuery.isFetching}
          errorMessage={errorMessage}
        />
      </div>
    </>
  );
}

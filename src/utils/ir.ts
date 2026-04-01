import type { Operacao, ResumoIR } from '../types';

export function getAnoFiscal(dataCompra: string) {
  const data = new Date(dataCompra);

  if (Number.isNaN(data.getTime())) {
    throw new Error('Data de compra invalida. Verifique os dados salvos da operacao.');
  }

  return data.getUTCFullYear();
}

export function calcularPrecoMedio(operacoes: Operacao[]) {
  const quantidadeTotal = operacoes.reduce((total, operacao) => total + operacao.quantidade, 0);
  const custoTotal = operacoes.reduce((total, operacao) => total + operacao.valorTotalBRL, 0);

  if (!quantidadeTotal) {
    return 0;
  }

  return custoTotal / quantidadeTotal;
}

export function buildResumoIRBase(operacoes: Operacao[]): ResumoIR[] {
  const agrupado = new Map<string, Operacao[]>();

  for (const operacao of operacoes) {
    const anoFiscal = getAnoFiscal(operacao.dataCompra);
    const key = `${operacao.coinId}:${anoFiscal}`;
    const grupo = agrupado.get(key) ?? [];

    grupo.push(operacao);
    agrupado.set(key, grupo);
  }

  return Array.from(agrupado.entries())
    .map(([, grupo]) => {
      const [primeiraOperacao] = grupo;
      const quantidadeTotal = grupo.reduce((total, operacao) => total + operacao.quantidade, 0);
      const custoTotalBRL = grupo.reduce((total, operacao) => total + operacao.valorTotalBRL, 0);
      const anoFiscal = getAnoFiscal(primeiraOperacao.dataCompra);

      return {
        coinId: primeiraOperacao.coinId,
        coinSymbol: primeiraOperacao.coinSymbol,
        coinName: primeiraOperacao.coinName,
        coinImageUrl: primeiraOperacao.coinImageUrl,
        anoFiscal,
        quantidadeTotal,
        custoTotalBRL,
        precoMedio: calcularPrecoMedio(grupo),
        posicao3112: {
          quantidade: quantidadeTotal,
          valorUnitario3112: 0,
          valorTotal3112: 0,
        },
        operacoes: [...grupo].sort((a, b) => a.dataCompra.localeCompare(b.dataCompra)),
      };
    })
    .sort((a, b) => {
      if (a.anoFiscal !== b.anoFiscal) {
        return b.anoFiscal - a.anoFiscal;
      }

      return a.coinName.localeCompare(b.coinName);
    });
}


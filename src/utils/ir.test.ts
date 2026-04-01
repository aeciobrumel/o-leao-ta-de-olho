import { describe, expect, it } from 'vitest';
import type { Operacao } from '../types';
import { buildResumoIRBase, calcularPrecoMedio, getAnoFiscal } from './ir';

function makeOperacao(overrides: Partial<Operacao> = {}): Operacao {
  return {
    id: '1',
    coinId: 'bitcoin',
    coinSymbol: 'BTC',
    coinName: 'Bitcoin',
    dataCompra: '2023-06-15',
    quantidade: 0.5,
    precoUnitarioBRL: 100_000,
    valorTotalBRL: 50_000,
    criadoEm: new Date().toISOString(),
    ...overrides,
  };
}

describe('getAnoFiscal', () => {
  it('retorna o ano correto de uma data ISO', () => {
    expect(getAnoFiscal('2023-06-15')).toBe(2023);
  });

  it('retorna o ano correto de 31/12', () => {
    expect(getAnoFiscal('2022-12-31')).toBe(2022);
  });

  it('retorna o ano correto de 01/01', () => {
    expect(getAnoFiscal('2024-01-01')).toBe(2024);
  });

  it('lança erro para data inválida', () => {
    expect(() => getAnoFiscal('nao-e-data')).toThrow();
  });
});

describe('calcularPrecoMedio', () => {
  it('retorna 0 para lista vazia', () => {
    expect(calcularPrecoMedio([])).toBe(0);
  });

  it('retorna o preço unitário para uma única operação', () => {
    const op = makeOperacao({ quantidade: 1, valorTotalBRL: 150_000 });
    expect(calcularPrecoMedio([op])).toBe(150_000);
  });

  it('calcula preço médio ponderado corretamente', () => {
    // 1 BTC a R$100.000 + 1 BTC a R$200.000 = preço médio R$150.000
    const op1 = makeOperacao({ quantidade: 1, valorTotalBRL: 100_000 });
    const op2 = makeOperacao({ quantidade: 1, valorTotalBRL: 200_000 });
    expect(calcularPrecoMedio([op1, op2])).toBe(150_000);
  });

  it('calcula corretamente com quantidades diferentes', () => {
    // 2 BTC a R$100.000 (total R$200.000) + 1 BTC a R$200.000 = média R$133.333...
    const op1 = makeOperacao({ quantidade: 2, valorTotalBRL: 200_000 });
    const op2 = makeOperacao({ quantidade: 1, valorTotalBRL: 200_000 });
    expect(calcularPrecoMedio([op1, op2])).toBeCloseTo(133_333.33, 0);
  });

  it('retorna 0 quando quantidade total é zero', () => {
    const op = makeOperacao({ quantidade: 0, valorTotalBRL: 0 });
    expect(calcularPrecoMedio([op])).toBe(0);
  });
});

describe('buildResumoIRBase', () => {
  it('retorna lista vazia para operações vazias', () => {
    expect(buildResumoIRBase([])).toEqual([]);
  });

  it('agrupa única operação corretamente', () => {
    const op = makeOperacao();
    const [resumo] = buildResumoIRBase([op]);
    expect(resumo.coinId).toBe('bitcoin');
    expect(resumo.anoFiscal).toBe(2023);
    expect(resumo.quantidadeTotal).toBe(0.5);
    expect(resumo.custoTotalBRL).toBe(50_000);
    expect(resumo.operacoes).toHaveLength(1);
  });

  it('agrupa duas operações do mesmo ativo e ano', () => {
    const op1 = makeOperacao({ id: '1', quantidade: 1, valorTotalBRL: 100_000 });
    const op2 = makeOperacao({ id: '2', quantidade: 0.5, valorTotalBRL: 50_000 });
    const resumos = buildResumoIRBase([op1, op2]);
    expect(resumos).toHaveLength(1);
    expect(resumos[0].quantidadeTotal).toBe(1.5);
    expect(resumos[0].custoTotalBRL).toBe(150_000);
    expect(resumos[0].operacoes).toHaveLength(2);
  });

  it('cria grupos separados para anos diferentes', () => {
    const op2022 = makeOperacao({ id: '1', dataCompra: '2022-03-01' });
    const op2023 = makeOperacao({ id: '2', dataCompra: '2023-03-01' });
    const resumos = buildResumoIRBase([op2022, op2023]);
    expect(resumos).toHaveLength(2);
    const anos = resumos.map((r) => r.anoFiscal).sort();
    expect(anos).toEqual([2022, 2023]);
  });

  it('cria grupos separados para ativos diferentes no mesmo ano', () => {
    const btc = makeOperacao({ id: '1', coinId: 'bitcoin', coinSymbol: 'BTC' });
    const eth = makeOperacao({ id: '2', coinId: 'ethereum', coinSymbol: 'ETH', coinName: 'Ethereum' });
    const resumos = buildResumoIRBase([btc, eth]);
    expect(resumos).toHaveLength(2);
    const ids = resumos.map((r) => r.coinId).sort();
    expect(ids).toEqual(['bitcoin', 'ethereum']);
  });

  it('ordena por ano fiscal decrescente', () => {
    const op2021 = makeOperacao({ id: '1', dataCompra: '2021-01-01' });
    const op2023 = makeOperacao({ id: '2', dataCompra: '2023-01-01' });
    const op2022 = makeOperacao({ id: '3', dataCompra: '2022-01-01' });
    const resumos = buildResumoIRBase([op2021, op2023, op2022]);
    expect(resumos[0].anoFiscal).toBe(2023);
    expect(resumos[1].anoFiscal).toBe(2022);
    expect(resumos[2].anoFiscal).toBe(2021);
  });

  it('ordena operações dentro do grupo por data crescente', () => {
    const op2 = makeOperacao({ id: '2', dataCompra: '2023-06-20' });
    const op1 = makeOperacao({ id: '1', dataCompra: '2023-01-10' });
    const [resumo] = buildResumoIRBase([op2, op1]);
    expect(resumo.operacoes[0].dataCompra).toBe('2023-01-10');
    expect(resumo.operacoes[1].dataCompra).toBe('2023-06-20');
  });

  it('inicializa posicao3112 com zeros', () => {
    const op = makeOperacao();
    const [resumo] = buildResumoIRBase([op]);
    expect(resumo.posicao3112.valorTotal3112).toBe(0);
    expect(resumo.posicao3112.valorUnitario3112).toBe(0);
    expect(resumo.posicao3112.quantidade).toBe(op.quantidade);
  });

  it('calcula preço médio ponderado no resumo', () => {
    const op1 = makeOperacao({ id: '1', quantidade: 1, valorTotalBRL: 100_000 });
    const op2 = makeOperacao({ id: '2', quantidade: 1, valorTotalBRL: 200_000 });
    const [resumo] = buildResumoIRBase([op1, op2]);
    expect(resumo.precoMedio).toBe(150_000);
  });
});

import { describe, expect, it } from 'vitest';
import {
  formatBRL,
  formatCripto,
  formatDate,
  formatDateInputValue,
  getCoinGeckoHistoryMinDate,
  getTodayIsoDate,
  isValidIsoDate,
  isCoinGeckoHistoryDateAllowed,
  parseDateInputValue,
  shiftIsoDateByDays,
  toCoinGeckoDate,
  toIsoDate,
} from './formatters';

describe('formatBRL', () => {
  it('formata valor inteiro em BRL', () => {
    expect(formatBRL(1000)).toMatch(/1\.000/);
  });

  it('formata valor com casas decimais', () => {
    expect(formatBRL(1234.56)).toMatch(/1\.234,56/);
  });

  it('formata zero', () => {
    expect(formatBRL(0)).toMatch(/0,00/);
  });

  it('inclui símbolo R$', () => {
    expect(formatBRL(100)).toMatch(/R\$/);
  });
});

describe('formatCripto', () => {
  it('formata valor sem símbolo', () => {
    expect(formatCripto(0.5)).toBe('0,5');
  });

  it('formata valor com símbolo', () => {
    expect(formatCripto(1.5, 'btc')).toBe('1,5 BTC');
  });

  it('converte símbolo para maiúsculo', () => {
    expect(formatCripto(1, 'eth')).toContain('ETH');
  });

  it('formata até 8 casas decimais', () => {
    expect(formatCripto(0.00000001, 'BTC')).toContain('0,00000001');
  });

  it('não exibe zeros à direita desnecessários', () => {
    expect(formatCripto(1.5, 'BTC')).not.toContain('1,50000000');
  });
});

describe('formatDate', () => {
  it('formata data ISO para dd/mm/aaaa', () => {
    expect(formatDate('2023-06-15')).toBe('15/06/2023');
  });

  it('trata 31/12 sem mudança de fuso', () => {
    expect(formatDate('2022-12-31')).toBe('31/12/2022');
  });

  it('trata 01/01 sem mudança de fuso', () => {
    expect(formatDate('2024-01-01')).toBe('01/01/2024');
  });
});

describe('toCoinGeckoDate', () => {
  it('converte data ISO para formato CoinGecko (dd-mm-yyyy)', () => {
    expect(toCoinGeckoDate('2023-06-15')).toBe('15-06-2023');
  });

  it('adiciona zero à esquerda em dia e mês', () => {
    expect(toCoinGeckoDate('2023-01-05')).toBe('05-01-2023');
  });

  it('funciona com 31/12', () => {
    expect(toCoinGeckoDate('2022-12-31')).toBe('31-12-2022');
  });
});

describe('toIsoDate', () => {
  it('normaliza Date para formato ISO sem sofrer com timezone', () => {
    expect(toIsoDate(new Date(Date.UTC(2024, 5, 15)))).toBe('2024-06-15');
  });
});

describe('isValidIsoDate', () => {
  it('aceita data ISO valida', () => {
    expect(isValidIsoDate('2024-06-15')).toBe(true);
  });

  it('rejeita data inexistente', () => {
    expect(isValidIsoDate('2024-02-31')).toBe(false);
  });
});

describe('formatDateInputValue', () => {
  it('converte ISO para dd/mm/aaaa', () => {
    expect(formatDateInputValue('2024-06-15')).toBe('15/06/2024');
  });

  it('mascara entrada parcial numerica', () => {
    expect(formatDateInputValue('15062024')).toBe('15/06/2024');
  });
});

describe('parseDateInputValue', () => {
  it('converte dd/mm/aaaa para ISO', () => {
    expect(parseDateInputValue('15/06/2024')).toBe('2024-06-15');
  });

  it('aceita ISO valido sem alterar', () => {
    expect(parseDateInputValue('2024-06-15')).toBe('2024-06-15');
  });

  it('retorna vazio para data invalida', () => {
    expect(parseDateInputValue('31/02/2024')).toBe('');
  });
});

describe('getTodayIsoDate', () => {
  it('aceita uma data de referencia explicita', () => {
    expect(getTodayIsoDate('2026-04-02')).toBe('2026-04-02');
  });
});

describe('shiftIsoDateByDays', () => {
  it('subtrai dias corretamente', () => {
    expect(shiftIsoDateByDays('2026-04-02', -365)).toBe('2025-04-02');
  });
});

describe('getCoinGeckoHistoryMinDate', () => {
  it('calcula a menor data permitida na janela de 365 dias', () => {
    expect(getCoinGeckoHistoryMinDate('2026-04-02')).toBe('2025-04-02');
  });
});

describe('isCoinGeckoHistoryDateAllowed', () => {
  it('aceita a data limite inferior', () => {
    expect(isCoinGeckoHistoryDateAllowed('2025-04-02', '2026-04-02')).toBe(true);
  });

  it('rejeita datas anteriores a 365 dias', () => {
    expect(isCoinGeckoHistoryDateAllowed('2025-04-01', '2026-04-02')).toBe(false);
  });

  it('rejeita datas futuras', () => {
    expect(isCoinGeckoHistoryDateAllowed('2026-04-03', '2026-04-02')).toBe(false);
  });
});

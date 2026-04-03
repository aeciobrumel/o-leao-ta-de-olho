const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function getDateParts(dateInput: string | Date) {
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    const [year, month, day] = dateInput.split('-').map(Number);
    return { year, month, day };
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
}

function getIsoDateParts(dateInput: string) {
  const [year, month, day] = dateInput.split('-').map(Number);
  return { year, month, day };
}

function formatIsoDateFromParts(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function formatBRL(value: number) {
  return brlFormatter.format(value);
}

export function formatDate(dateInput: string | Date) {
  const { year, month, day } = getDateParts(dateInput);

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatCripto(value: number, symbol?: string) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 8,
  }).format(value);

  return symbol ? `${formatted} ${symbol.toUpperCase()}` : formatted;
}

export function toCoinGeckoDate(dateInput: string | Date) {
  const { year, month, day } = getDateParts(dateInput);

  return `${String(day).padStart(2, '0')}-${String(month).padStart(2, '0')}-${year}`;
}

export function toIsoDate(dateInput: string | Date) {
  const { year, month, day } = getDateParts(dateInput);

  return formatIsoDateFromParts(year, month, day);
}

export function formatDateTime(dateInput: string | Date) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isValidIsoDate(dateInput: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return false;
  }

  const [year, month, day] = dateInput.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

export function formatDateInputValue(dateInput: string) {
  if (!dateInput) return '';

  if (isValidIsoDate(dateInput)) {
    const [year, month, day] = dateInput.split('-');
    return `${day}/${month}/${year}`;
  }

  const digits = dateInput.replace(/\D/g, '').slice(0, 8);
  const parts = [];

  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));

  return parts.join('/');
}

export function parseDateInputValue(dateInput: string) {
  if (!dateInput) return '';

  if (isValidIsoDate(dateInput)) {
    return dateInput;
  }

  const digits = dateInput.replace(/\D/g, '');

  if (digits.length !== 8) {
    return '';
  }

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  const isoDate = `${year}-${month}-${day}`;

  return isValidIsoDate(isoDate) ? isoDate : '';
}

export function formatResumoIRText(resumo: {
  coinName: string;
  coinSymbol: string;
  quantidadeTotal: number;
  custoTotalBRL: number;
  precoMedio: number;
  anoFiscal: number;
  posicao3112: { valorTotal3112: number };
}) {
  return [
    `${resumo.coinName.toUpperCase()} (${resumo.coinSymbol.toUpperCase()})`,
    `Quantidade: ${formatCripto(resumo.quantidadeTotal, resumo.coinSymbol)}`,
    `Custo de aquisição: ${formatBRL(resumo.custoTotalBRL)}`,
    `Preço médio: ${formatBRL(resumo.precoMedio)}/${resumo.coinSymbol.toUpperCase()}`,
    `Posição em 31/12/${resumo.anoFiscal}: ${formatBRL(resumo.posicao3112.valorTotal3112)}`,
  ].join('\n');
}

export function getTodayIsoDate(referenceDate: string | Date = new Date()) {
  const { year, month, day } = getDateParts(referenceDate);

  return formatIsoDateFromParts(year, month, day);
}

export function shiftIsoDateByDays(dateInput: string, days: number) {
  if (!isValidIsoDate(dateInput)) {
    return '';
  }

  const { year, month, day } = getIsoDateParts(dateInput);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);

  return formatIsoDateFromParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
}

export function getCoinGeckoHistoryMinDate(referenceDate: string | Date = new Date()) {
  return shiftIsoDateByDays(getTodayIsoDate(referenceDate), -365);
}

export function isCoinGeckoHistoryDateAllowed(
  dateInput: string,
  referenceDate: string | Date = new Date(),
) {
  if (!isValidIsoDate(dateInput)) {
    return false;
  }

  const today = getTodayIsoDate(referenceDate);
  const minDate = getCoinGeckoHistoryMinDate(referenceDate);

  return dateInput >= minDate && dateInput <= today;
}

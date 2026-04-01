export interface CoinGeckoHistoryResponse {
  id: string;
  symbol: string;
  name: string;
  market_data?: {
    current_price?: Record<string, number>;
    market_cap?: Record<string, number>;
  };
  image?: {
    thumb: string;
    small: string;
  };
}

export interface CoinListItem {
  id: string;
  symbol: string;
  name: string;
  imageUrl?: string;
}

export interface CoinGeckoSearchCoin {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
  large?: string;
  market_cap_rank?: number;
}

export interface CoinGeckoSearchResponse {
  coins?: CoinGeckoSearchCoin[];
}

export interface CoinGeckoMarketCoin {
  id: string;
  image?: string;
}

export interface Operacao {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImageUrl?: string;
  dataCompra: string;
  quantidade: number;
  precoUnitarioBRL: number;
  valorTotalBRL: number;
  criadoEm: string;
}

export interface ConsultaHistorica {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImageUrl?: string;
  data: string;
  precoUnitarioBRL: number;
  consultadoEm: string;
}

export interface ResumoIRPosicao {
  quantidade: number;
  valorUnitario3112: number;
  valorTotal3112: number;
}

export interface ResumoIR {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImageUrl?: string;
  anoFiscal: number;
  quantidadeTotal: number;
  custoTotalBRL: number;
  precoMedio: number;
  posicao3112: ResumoIRPosicao;
  operacoes: Operacao[];
}

export interface ConsultaFormValues {
  coin: CoinListItem;
  dataCompra: string;
  quantidade: number;
}

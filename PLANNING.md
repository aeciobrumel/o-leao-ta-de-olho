# O Leao Ta de Olho — Planejamento Técnico

> "Descubra o valor antes que o leão descubra você."

Aplicação web que ajuda investidores brasileiros a consultar o valor histórico de criptomoedas em datas específicas para facilitar a declaração de bens no Imposto de Renda (Receita Federal).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | React + Vite |
| Linguagem | TypeScript (obrigatório) |
| Estilização | Tailwind CSS v3 |
| Estado global | Zustand |
| Requisições/cache | TanStack Query (React Query) |
| Roteamento | React Router v6 |
| Deploy | Vercel |
| Dados | CoinGecko API (free tier) |
| Persistência | localStorage (sem backend no MVP) |

---

## Fluxo do Usuário

1. Informa a criptomoeda (ex: BTC, ETH, SOL)
2. Informa a data da compra
3. Informa a quantidade adquirida
4. O sistema retorna:
   - Valor unitário da moeda na data (em BRL)
   - Valor total do investimento
   - Fonte dos dados (CoinGecko)
   - Resultado formatado para copiar e usar na declaração IR

---

## 1. Estrutura de Pastas

```
o-leao-ta-de-olho/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                    # Reutilizáveis: Button, Input, Card, CopyButton
│   │   ├── ConsultaForm.tsx       # Formulário principal (moeda, data, quantidade)
│   │   ├── ResultadoConsulta.tsx  # Resultado formatado + botão copiar
│   │   ├── HistoricoList.tsx      # Lista de consultas salvas
│   │   ├── ResumoIR.tsx           # Resumo agrupado por ativo
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── pages/
│   │   ├── HomePage.tsx           # Consulta principal
│   │   ├── HistoricoPage.tsx      # Histórico de operações
│   │   └── ResumoIRPage.tsx       # Resumo para declaração IR
│   ├── hooks/
│   │   ├── useCoinGecko.ts        # React Query wrapper para API
│   │   ├── useOperacoes.ts        # CRUD operações no localStorage
│   │   └── useResumoIR.ts         # Cálculo preço médio + posição 31/12
│   ├── services/
│   │   ├── coingecko.ts           # Fetch functions para CoinGecko
│   │   └── localStorage.ts        # Helpers de persistência local
│   ├── store/
│   │   └── useAppStore.ts         # Zustand — estado global mínimo
│   ├── types/
│   │   └── index.ts               # Interfaces TypeScript
│   ├── utils/
│   │   ├── formatters.ts          # formatBRL, formatDate, formatCripto
│   │   └── ir.ts                  # Lógica de cálculo IR
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                  # Tailwind directives
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── postcss.config.js
├── package.json
├── PLANNING.md
└── README.md
```

---

## 2. Integração com CoinGecko

### Endpoints

**Preço histórico por data:**
```
GET https://api.coingecko.com/api/v3/coins/{id}/history?date={dd-MM-yyyy}&localization=false
```
Retorna `market_data.current_price.brl` diretamente — sem necessidade de conversão USD→BRL.

**Lista de moedas (para busca):**
```
GET https://api.coingecko.com/api/v3/coins/list
```
Mapeia símbolos (BTC→bitcoin, ETH→ethereum) ao `id` do CoinGecko.

### Estratégia de Cache (React Query)

- `staleTime: Infinity` — preço histórico é imutável
- `gcTime: 24h` — manter em memória por sessão longa
- `queryKey: ['coin-history', coinId, date]`
- `retry: 2` com backoff exponencial

### Rate Limiting (free tier: ~30 req/min)

- Cache agressivo elimina requisições repetidas
- Debounce de 500ms no formulário
- Lista de moedas cacheada em localStorage com TTL de 24h

### Tipos da API

```ts
interface CoinGeckoHistoryResponse {
  id: string;
  symbol: string;
  name: string;
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
  };
  image: { thumb: string; small: string };
}

interface CoinListItem {
  id: string;      // "bitcoin"
  symbol: string;  // "btc"
  name: string;    // "Bitcoin"
}
```

---

## 3. Modelagem de Dados

```ts
interface Operacao {
  id: string;                // crypto.randomUUID()
  coinId: string;            // "bitcoin"
  coinSymbol: string;        // "BTC"
  coinName: string;          // "Bitcoin"
  dataCompra: string;        // "2024-03-15" (ISO para storage)
  quantidade: number;
  precoUnitarioBRL: number;  // valor na data via CoinGecko
  valorTotalBRL: number;     // quantidade × precoUnitario
  criadoEm: string;         // ISO timestamp
}

interface ConsultaHistorica {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  data: string;              // "dd-MM-yyyy" formato CoinGecko
  precoUnitarioBRL: number;
  consultadoEm: string;
}

interface ResumoIR {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  anoFiscal: number;
  quantidadeTotal: number;
  custoTotalBRL: number;
  precoMedio: number;        // custoTotal / quantidadeTotal
  posicao3112: {
    quantidade: number;
    valorUnitario3112: number;
    valorTotal3112: number;
  };
  operacoes: Operacao[];
}
```

---

## 4. Lógica de Negócio para IR

### Preço Médio Ponderado

```
precoMedio = Σ(operacao.valorTotalBRL) / Σ(operacao.quantidade)
```

Recalculado a cada nova operação do mesmo ativo.

### Posição em 31/12

- Buscar preço da moeda em 31/12 do ano fiscal via CoinGecko
- `posicao3112 = quantidadeTotal × precoEm31Dez`
- Na declaração de IR, declara-se pelo **custo de aquisição** (preço médio), mas o valor de mercado em 31/12 é útil como referência

### Agrupamento

1. Agrupar operações por `coinId`
2. Dentro de cada ativo, agrupar por ano fiscal (`dataCompra.getFullYear()`)
3. Calcular preço médio e posição 31/12 por grupo

### Texto Formatado para Copiar

```
BITCOIN (BTC)
Quantidade: 0,5 BTC
Custo de aquisição: R$ 175.000,00
Preço médio: R$ 350.000,00/BTC
Posição em 31/12/2024: R$ 250.000,00
Fonte: CoinGecko (consulta em dd/mm/aaaa)
```

---

## 5. Componentes Principais

| Componente | Props | Responsabilidade |
|---|---|---|
| `ConsultaForm` | `onSubmit: (coinId, data, qtd) => void` | Formulário com select de moeda, date picker, input de quantidade |
| `ResultadoConsulta` | `operacao: Operacao \| null; loading: boolean` | Card com resultado formatado + botão copiar |
| `HistoricoList` | `operacoes: Operacao[]; onDelete: (id) => void` | Tabela de operações salvas |
| `ResumoIR` | `resumos: ResumoIR[]` | Resumo por ativo e ano com texto copiável |
| `CopyButton` | `text: string` | Copia texto para clipboard com feedback visual |
| `CoinSelect` | `value: string; onChange: (coinId) => void` | Combobox com busca de moedas |
| `Header` | — | Logo, slogan, navegação |
| `Footer` | — | Disclaimer legal, créditos CoinGecko |

---

## 6. Roadmap

### Fase 1 — MVP

- Setup Vite + React + Tailwind + TypeScript
- Consulta simples: moeda + data + quantidade → resultado em BRL
- Resultado formatado com botão copiar
- Layout responsivo

### Fase 2 — Histórico e IR

- Persistência de operações em localStorage
- Histórico com listagem, filtro e exclusão
- Resumo IR com preço médio e posição 31/12
- Navegação entre páginas (React Router)

### Fase 3 — Polimento

- Exportação PDF do resumo IR
- Modo escuro
- PWA (offline)
- Sugestão automática de moedas populares

---

## 7. Riscos e Decisões Técnicas

| Risco | Mitigação |
|---|---|
| CoinGecko free tier limitado (~30 req/min) | Cache agressivo com React Query (`staleTime: Infinity`) + lista de moedas em localStorage |
| Sem dados para datas muito antigas | Mensagem clara ao usuário; fallback para data mais próxima |
| Precisão para fins fiscais | Disclaimer: "dados de referência, não substitui orientação contábil" |
| localStorage limite ~5MB | Suficiente para milhares de operações; monitorar uso |
| Sem backend = sem proteção de API key | Free tier não exige key; futuro: Vercel Edge Functions como proxy |

---

## Restrições do MVP

- 100% frontend (sem backend próprio)
- Dados do usuário apenas no localStorage
- Sem autenticação
- Foco no contexto fiscal brasileiro (BRL, Receita Federal)
- Tailwind utility classes apenas
- Interface 100% em português (Brasil)

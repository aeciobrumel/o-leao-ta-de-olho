# O Leão Tá de Olho

Aplicação frontend para consultar o valor histórico de criptomoedas em BRL, registrar operações localmente no navegador e montar uma base de apoio para organização do Imposto de Renda.

## Foco do projeto

O foco do projeto O Leão Tá de Olho é ajudar investidores brasileiros a responder uma dúvida prática:

"Quanto essa compra de cripto valia em reais na data em que eu fiz a operação?"

Com isso, o app facilita a organização das informações que costumam ser necessárias para revisão de histórico e apoio ao resumo fiscal.

## Como funciona

O fluxo principal da aplicação é simples:

1. O usuário escolhe uma criptomoeda, informa a data da compra e a quantidade.
2. O app consulta a CoinGecko para buscar o preço histórico daquele ativo na data selecionada.
3. O valor unitário em BRL é usado para calcular o valor total da operação.
4. A operação é salva automaticamente no `localStorage` do navegador.
5. As operações salvas aparecem no histórico e também alimentam o resumo para IR.

## O que o app entrega hoje

- Consulta histórica por moeda, data e quantidade
- Cálculo do preço unitário e valor total em reais
- Salvamento automático das operações no navegador
- Histórico local com possibilidade de revisão e exclusão
- Resumo agrupado por ativo e ano fiscal
- Referência de posição em `31/12` com base em cotação histórica

## Estrutura das telas

### Home

Tela principal para fazer a consulta. A cada envio válido:

- o app busca o histórico da moeda na CoinGecko
- calcula o valor da compra em BRL
- salva a operação localmente
- mostra o resultado da consulta

### Histórico

Lista todas as operações salvas no navegador, facilitando conferência posterior.

### Resumo IR

Agrupa as operações por ativo e ano fiscal, calculando:

- quantidade total
- custo total em BRL
- preço médio
- referência de valor em `31/12`

## Tecnologias

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- TanStack Query
- Zustand
- CoinGecko API
- `localStorage`

## Como rodar o projeto

```bash
npm install
npm run dev
```

Domínio principal da aplicação: `https://oleaotadeolho.com`

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Estrutura resumida

```text
src/
  components/   componentes de interface
  hooks/        regras de consulta, persistência e resumo
  pages/        páginas principais do app
  services/     integrações com CoinGecko e localStorage
  types/        tipagens da aplicação
  utils/        formatação e regras de cálculo
```

## Persistência e dados

- As operações ficam salvas localmente no navegador do usuário.
- A lista de moedas da CoinGecko é cacheada por 1 dia para reduzir novas consultas.
- O projeto não depende de backend próprio nesta versão.

## Espaços para prints

### - Tela inicial

<img width="500" alt="image" src="https://github.com/user-attachments/assets/85602655-3f85-428e-88e7-4b254b65e8d3" />

### - Resultado da consulta
<img width="500" alt="image" src="https://github.com/user-attachments/assets/964e4f90-75c4-404b-a2ab-5255645ae909" />

### - Histórico
<img width="500" alt="image" src="https://github.com/user-attachments/assets/ae405f9c-9493-43bc-b748-d8489fd523c5" />

### - Resumo IR
<img width="500"  alt="image" src="https://github.com/user-attachments/assets/40fd2ad6-20eb-43ab-a374-e59d8a8f3fd9" />

## Observações

- Os dados históricos dependem da disponibilidade da API da CoinGecko.
- O resumo serve como apoio de organização e não substitui orientação contábil ou fiscal.

Veja também [PLANNING.md](./PLANNING.md) para o planejamento técnico do projeto.

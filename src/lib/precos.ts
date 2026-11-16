// Cálculo de preços. Funções puras: o browser usa-as para mostrar o preço ao vivo,
// mas o valor cobrado é SEMPRE recalculado no servidor com a tabela do servidor.

import type { Dimensao, Peca, TabelaPrecos, Tecido } from "@/config/precos";

export type Estampagem = {
  peca: Peca;
  tecido: Tecido;
  frente: Dimensao | null;
  costas: Dimensao | null;
};

export type ResultadoPreco =
  | { tipo: "preco"; unitarioCents: number; descricao: string }
  | { tipo: "consulta"; motivo: string };

export function precoUnitario(tabela: TabelaPrecos, e: Estampagem): ResultadoPreco {
  if (!e.frente && !e.costas) {
    return { tipo: "consulta", motivo: "Escolhe pelo menos uma posição para a estampa." };
  }
  const regra = tabela.regras.find(
    (r) =>
      r.peca === e.peca &&
      r.tecido === e.tecido &&
      r.frente === (e.frente ?? null) &&
      r.costas === (e.costas ?? null),
  );
  if (!regra) {
    return { tipo: "consulta", motivo: "Esta combinação é feita sob consulta." };
  }
  return { tipo: "preco", unitarioCents: regra.precoCents, descricao: regra.descricao };
}

export type ResultadoLinha =
  | { tipo: "preco"; unitarioCents: number; totalCents: number; descricao: string }
  | { tipo: "consulta"; motivo: string };

export function precoLinha(tabela: TabelaPrecos, e: Estampagem, quantidade: number): ResultadoLinha {
  if (!Number.isInteger(quantidade) || quantidade < 1) {
    return { tipo: "consulta", motivo: "Quantidade inválida." };
  }
  const r = precoUnitario(tabela, e);
  if (r.tipo === "consulta") return r;
  return { ...r, totalCents: r.unitarioCents * quantidade };
}

export function formatarEuros(cents: number): string {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(cents / 100);
}

"use client";
// Carrinho guardado no browser (localStorage). Não guarda preços:
// o preço é sempre recalculado no servidor no momento do pagamento.

import { useSyncExternalStore } from "react";
import { z } from "zod";
import { esquemaItemCarrinho, type ItemCarrinho } from "@/lib/validacao";

export type LinhaCarrinho = ItemCarrinho & { id: string };

const CHAVE = "nomads-carrinho-v1";
const VAZIO: LinhaCarrinho[] = [];
const ouvintes = new Set<() => void>();
let cache: LinhaCarrinho[] | null = null;

function ler(): LinhaCarrinho[] {
  if (cache) return cache;
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE) ?? "[]");
    const r = z.array(z.intersection(esquemaItemCarrinho, z.object({ id: z.string().max(40) }))).safeParse(bruto);
    cache = r.success ? r.data : [];
  } catch {
    cache = [];
  }
  return cache;
}

function gravar(linhas: LinhaCarrinho[]) {
  cache = linhas;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(linhas));
  } catch {
    // modo privado ou armazenamento cheio: o carrinho fica só em memória
  }
  ouvintes.forEach((f) => f());
}

function subscrever(f: () => void) {
  ouvintes.add(f);
  const aoMudarNoutroSeparador = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      cache = null;
      f();
    }
  };
  window.addEventListener("storage", aoMudarNoutroSeparador);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener("storage", aoMudarNoutroSeparador);
  };
}

export function useCarrinho(): LinhaCarrinho[] {
  return useSyncExternalStore(subscrever, ler, () => VAZIO);
}

const mesmaPeca = (a: ItemCarrinho, b: ItemCarrinho) =>
  a.estampaId === b.estampaId && a.peca === b.peca && a.cor === b.cor && a.tamanho === b.tamanho &&
  a.frente === b.frente && a.costas === b.costas;

export const carrinho = {
  adicionar(item: ItemCarrinho) {
    const linhas = ler();
    const existente = linhas.find((l) => mesmaPeca(l, item));
    if (existente) {
      gravar(linhas.map((l) => (l === existente ? { ...l, quantidade: Math.min(50, l.quantidade + item.quantidade) } : l)));
    } else {
      gravar([...linhas, { ...item, id: crypto.randomUUID() }]);
    }
  },
  quantidade(id: string, quantidade: number) {
    gravar(ler().map((l) => (l.id === id ? { ...l, quantidade: Math.max(1, Math.min(50, quantidade)) } : l)));
  },
  remover(id: string) {
    gravar(ler().filter((l) => l.id !== id));
  },
  limpar() {
    gravar([]);
  },
};

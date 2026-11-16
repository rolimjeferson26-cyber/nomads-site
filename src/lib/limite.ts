import "server-only";
import { headers } from "next/headers";
import { segredo } from "@/lib/env";
import { supabaseAdmin } from "@/lib/supabase/server";

// Limites por ação: { máximo de pedidos, janela em segundos }
export const LIMITES = {
  login: { max: 8, janela: 15 * 60 },
  registo: { max: 5, janela: 60 * 60 },
  recuperar: { max: 3, janela: 60 * 60 },
  orcamento: { max: 5, janela: 60 * 60 },
  contacto: { max: 5, janela: 60 * 60 },
  checkout: { max: 15, janela: 60 * 60 },
  conta: { max: 30, janela: 60 * 60 },
} as const;
export type AcaoLimitada = keyof typeof LIMITES;

// Reserva local por isolate quando a base de dados não está configurada.
const memoria = new Map<string, { inicio: number; contagem: number }>();

async function ipDoPedido(): Promise<string> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconhecido";
}

// O IP nunca é guardado em claro: só um hash com sal secreto (RGPD).
async function hash(texto: string): Promise<string> {
  const sal = segredo("RATE_LIMIT_SALT") ?? "nomads-dev";
  const dados = new TextEncoder().encode(`${sal}:${texto}`);
  const digest = await crypto.subtle.digest("SHA-256", dados);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Devolve true se o pedido pode continuar. */
export async function verificarLimite(acao: AcaoLimitada, extra = ""): Promise<boolean> {
  const { max, janela } = LIMITES[acao];
  const chave = `${acao}:${await hash(`${await ipDoPedido()}|${extra.toLowerCase()}`)}`;

  const admin = supabaseAdmin();
  if (admin) {
    const { data, error } = await admin.rpc("registar_pedido", {
      p_chave: chave,
      p_max: max,
      p_janela_segundos: janela,
    });
    if (!error) return data === true;
    console.error("rate limit: erro na base de dados", error.message);
  }

  const agora = Date.now();
  const atual = memoria.get(chave);
  if (!atual || agora - atual.inicio > janela * 1000) {
    memoria.set(chave, { inicio: agora, contagem: 1 });
    return true;
  }
  atual.contagem += 1;
  return atual.contagem <= max;
}

export const MENSAGEM_LIMITE = "Demasiados pedidos seguidos. Tenta novamente daqui a uns minutos.";

import "server-only";
import { ESTAMPAS_BASE, type Estampa } from "@/config/estampas";
import { TABELA_PORTES, type TabelaPortes } from "@/config/portes";
import { TABELA_PRECOS, type TabelaPrecos } from "@/config/precos";
import { supabaseServidor } from "@/lib/supabase/server";
import { esquemaTabelaPortes, esquemaTabelaPrecos } from "@/lib/validacao";

// Estampas ativas: da base de dados se existir, senão a lista base em config.
export async function obterEstampas(incluirInativas = false): Promise<(Estampa & { ativa: boolean })[]> {
  const supabase = await supabaseServidor();
  if (supabase) {
    let q = supabase.from("estampas").select("id,nome,estilo,imagem_url,proporcao,ativa").order("ordem");
    if (!incluirInativas) q = q.eq("ativa", true);
    const { data, error } = await q;
    if (!error && data) {
      return data.map((e) => ({
        id: e.id,
        nome: e.nome,
        estilo: e.estilo,
        imagemUrl: e.imagem_url,
        proporcao: Number(e.proporcao),
        ativa: e.ativa,
      }));
    }
    console.error("estampas: a usar lista base", error?.message);
  }
  return ESTAMPAS_BASE.map((e) => ({ ...e, ativa: true }));
}

async function definicao<T>(chave: "precos" | "portes", validar: (v: unknown) => T | null, base: T): Promise<T> {
  const supabase = await supabaseServidor();
  if (!supabase) return base;
  const { data } = await supabase.from("definicoes").select("valor").eq("chave", chave).maybeSingle();
  if (!data) return base;
  return validar(data.valor) ?? base;
}

// Fonte única de verdade para preços no servidor.
export function obterTabelaPrecos(): Promise<TabelaPrecos> {
  return definicao("precos", (v) => esquemaTabelaPrecos.safeParse(v).data ?? null, TABELA_PRECOS);
}

export function obterTabelaPortes(): Promise<TabelaPortes> {
  return definicao("portes", (v) => esquemaTabelaPortes.safeParse(v).data ?? null, TABELA_PORTES);
}

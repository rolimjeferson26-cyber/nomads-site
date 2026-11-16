"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EstadoForm } from "@/components/Formulario";
import { ESTILOS } from "@/config/estilos";
import { exigirAdmin } from "@/lib/auth";
import { ESTADOS_ENCOMENDA, ESTADOS_ORCAMENTO } from "@/lib/estados";
import { BUCKET_ESTAMPAS } from "@/lib/supabase/config";
import { supabaseServidor } from "@/lib/supabase/server";
import { TIPOS_IMAGEM, esquemaTabelaPortes, esquemaTabelaPrecos, primeiroErro, validarImagem } from "@/lib/validacao";

// Todas as ações verificam o admin no servidor; o RLS volta a verificar na base de dados.
async function cliente() {
  await exigirAdmin();
  const s = await supabaseServidor();
  if (!s) throw new Error("Supabase não configurado");
  return s;
}

const chavesEnc = Object.keys(ESTADOS_ENCOMENDA) as [string, ...string[]];
const chavesOrc = Object.keys(ESTADOS_ORCAMENTO) as [string, ...string[]];

export async function mudarEstadoEncomenda(fd: FormData) {
  const v = z.object({ id: z.uuid(), estado: z.enum(chavesEnc), notas: z.string().max(2000) }).safeParse({
    id: fd.get("id"),
    estado: fd.get("estado"),
    notas: fd.get("notas") ?? "",
  });
  if (!v.success) return;
  const s = await cliente();
  let q = s.from("encomendas").update({ estado: v.data.estado, notas_admin: v.data.notas || null }).eq("id", v.data.id);
  // "Paga" só com pagamento confirmado pela Stripe (pago_em preenchido pelo webhook)
  if (v.data.estado === "paga") q = q.not("pago_em", "is", null);
  await q;
  revalidatePath("/admin");
}

export async function mudarEstadoOrcamento(fd: FormData) {
  const v = z.object({ id: z.uuid(), estado: z.enum(chavesOrc), notas: z.string().max(2000) }).safeParse({
    id: fd.get("id"),
    estado: fd.get("estado"),
    notas: fd.get("notas") ?? "",
  });
  if (!v.success) return;
  const s = await cliente();
  await s.from("orcamentos").update({ estado: v.data.estado, notas_admin: v.data.notas || null }).eq("id", v.data.id);
  revalidatePath("/admin/orcamentos");
}

const idsEstilos = ESTILOS.map((e) => e.id) as [string, ...string[]];

export async function atualizarEstampa(fd: FormData) {
  const v = z
    .object({ id: z.string().regex(/^[a-z0-9-]{2,60}$/), estilo: z.enum(idsEstilos), ativa: z.enum(["sim", "nao"]) })
    .safeParse({ id: fd.get("id"), estilo: fd.get("estilo"), ativa: fd.get("ativa") });
  if (!v.success) return;
  const s = await cliente();
  await s.from("estampas").update({ estilo: v.data.estilo, ativa: v.data.ativa === "sim" }).eq("id", v.data.id);
  revalidatePath("/admin/estampas");
  revalidatePath("/loja");
}

function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

export async function novaEstampa(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = z
    .object({
      nome: z.string().trim().min(1, "Indica o nome.").max(80),
      estilo: z.enum(idsEstilos),
      proporcao: z.coerce.number().min(0.25).max(4),
    })
    .safeParse({ nome: fd.get("nome"), estilo: fd.get("estilo"), proporcao: fd.get("proporcao") });
  if (!v.success) return { erro: primeiroErro(v.error) };
  const img = await validarImagem(fd.get("imagem"), 3 * 1024 * 1024);
  if (!img) return { erro: "Escolhe uma imagem." };
  if (!img.ok) return { erro: img.erro };

  const s = await cliente();
  const id = `${slug(v.data.nome) || "estampa"}-${crypto.randomUUID().slice(0, 6)}`;
  const caminho = `${id}.${TIPOS_IMAGEM[img.tipo]}`;
  const { error: errUp } = await s.storage.from(BUCKET_ESTAMPAS).upload(caminho, img.bytes, { contentType: img.tipo });
  if (errUp) return { erro: `Upload falhou: ${errUp.message}` };
  const { data: pub } = s.storage.from(BUCKET_ESTAMPAS).getPublicUrl(caminho);
  const { count } = await s.from("estampas").select("id", { count: "exact", head: true });
  const { error } = await s.from("estampas").insert({
    id,
    nome: v.data.nome,
    estilo: v.data.estilo,
    imagem_url: pub.publicUrl,
    proporcao: v.data.proporcao,
    ordem: (count ?? 0) + 1,
  });
  if (error) return { erro: `Não foi possível gravar: ${error.message}` };
  revalidatePath("/admin/estampas");
  revalidatePath("/loja");
  return { ok: `Estampa "${v.data.nome}" adicionada.` };
}

export async function guardarTabelas(dados: unknown): Promise<{ ok: boolean; mensagem: string }> {
  const v = z.object({ precos: esquemaTabelaPrecos, portes: esquemaTabelaPortes }).safeParse(dados);
  if (!v.success) return { ok: false, mensagem: primeiroErro(v.error) };
  const s = await cliente();
  const agora = new Date().toISOString();
  const { error } = await s.from("definicoes").upsert([
    { chave: "precos", valor: v.data.precos, atualizado_em: agora },
    { chave: "portes", valor: v.data.portes, atualizado_em: agora },
  ]);
  if (error) return { ok: false, mensagem: `Erro ao guardar: ${error.message}` };
  revalidatePath("/", "layout");
  return { ok: true, mensagem: "Tabelas guardadas. Os novos valores já estão em uso." };
}

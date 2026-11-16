"use server";

import { DIMENSOES, PECAS, TECIDOS } from "@/config/precos";
import { utilizadorAtual } from "@/lib/auth";
import { obterTabelaPrecos } from "@/lib/dados";
import { escaparHtml, notificarDono, tabelaHtml } from "@/lib/email";
import { MENSAGEM_LIMITE, verificarLimite } from "@/lib/limite";
import { formatarEuros, precoLinha } from "@/lib/precos";
import { BUCKET_ARTES } from "@/lib/supabase/config";
import { supabaseAdmin } from "@/lib/supabase/server";
import { TIPOS_IMAGEM, esquemaOrcamento, primeiroErro, validarImagem } from "@/lib/validacao";

export type ResultadoOrcamento = { ok: true; numero: number | null } | { ok: false; erro: string };

const MAX_ARTE = 5 * 1024 * 1024;

export async function enviarOrcamento(fd: FormData): Promise<ResultadoOrcamento> {
  // Campo-armadilha para robôs (invisível para pessoas)
  if (fd.get("site")) return { ok: true, numero: null };

  const v = esquemaOrcamento.safeParse({
    peca: fd.get("peca"),
    tecido: fd.get("tecido"),
    frente: fd.get("frente") || null,
    costas: fd.get("costas") || null,
    quantidade: fd.get("quantidade"),
    ocasiao: fd.get("ocasiao"),
    nome: fd.get("nome"),
    email: fd.get("email"),
    telefone: fd.get("telefone") ?? "",
    mensagem: fd.get("mensagem") ?? "",
    consentimento: fd.get("consentimento") === "sim",
  });
  if (!v.success) return { ok: false, erro: primeiroErro(v.error) };
  const o = v.data;

  if (!(await verificarLimite("orcamento", o.email))) return { ok: false, erro: MENSAGEM_LIMITE };

  const arte = await validarImagem(fd.get("arte"), MAX_ARTE);
  if (arte && !arte.ok) return { ok: false, erro: arte.erro };

  // Estimativa calculada no servidor (o browser só mostra uma prévia)
  const tabela = await obterTabelaPrecos();
  const linha = precoLinha(tabela, { peca: o.peca, tecido: o.tecido, frente: o.frente, costas: o.costas }, o.quantidade);
  const estimativa = linha.tipo === "preco" ? linha.totalCents : null;

  const admin = supabaseAdmin();
  let numero: number | null = null;
  let linkArte: string | null = null;

  if (admin) {
    let artePath: string | null = null;
    if (arte?.ok) {
      artePath = `orcamentos/${crypto.randomUUID()}.${TIPOS_IMAGEM[arte.tipo]}`;
      const { error } = await admin.storage.from(BUCKET_ARTES).upload(artePath, arte.bytes, { contentType: arte.tipo, upsert: false });
      if (error) {
        console.error("orçamento: upload falhou", error.message);
        return { ok: false, erro: "Não foi possível guardar a imagem. Tenta outra vez ou envia-a pelo WhatsApp." };
      }
      const { data } = await admin.storage.from(BUCKET_ARTES).createSignedUrl(artePath, 60 * 60 * 24 * 7);
      linkArte = data?.signedUrl ?? null;
    }
    const utilizador = await utilizadorAtual();
    const { data, error } = await admin
      .from("orcamentos")
      .insert({
        user_id: utilizador?.id ?? null,
        nome: o.nome,
        email: o.email,
        telefone: o.telefone || null,
        peca: o.peca,
        tecido: o.tecido,
        frente: o.frente,
        costas: o.costas,
        quantidade: o.quantidade,
        ocasiao: o.ocasiao,
        mensagem: o.mensagem || null,
        arte_path: artePath,
        estimativa_cents: estimativa,
      })
      .select("numero")
      .single();
    if (error) {
      console.error("orçamento: erro ao gravar", error.message);
      return { ok: false, erro: "Não foi possível enviar o pedido. Tenta de novo ou usa o WhatsApp." };
    }
    numero = data.numero;
  } else if (arte?.ok) {
    return { ok: false, erro: "O envio de imagens ainda não está ativo. Envia o pedido sem imagem e manda a arte pelo WhatsApp." };
  }

  await notificarDono(
    `Novo pedido de orçamento${numero ? ` n.º ${numero}` : ""}: ${o.quantidade}x ${PECAS[o.peca]} (${o.ocasiao})`,
    tabelaHtml([
      ["Nome", o.nome],
      ["Email", o.email],
      ["Telefone", o.telefone],
      ["Peça", PECAS[o.peca]],
      ["Tecido", TECIDOS[o.tecido]],
      ["Frente", o.frente ? DIMENSOES[o.frente].nome : "—"],
      ["Costas", o.costas ? DIMENSOES[o.costas].nome : "—"],
      ["Quantidade", o.quantidade],
      ["Ocasião", o.ocasiao],
      ["Pré-orçamento", estimativa !== null ? formatarEuros(estimativa) : "Sob consulta"],
      ["Mensagem", o.mensagem],
    ]) + (linkArte ? `<p style="font-family:Arial"><a href="${escaparHtml(linkArte)}">Ver a arte enviada (link válido 7 dias)</a></p>` : ""),
    o.email,
  );

  return { ok: true, numero };
}

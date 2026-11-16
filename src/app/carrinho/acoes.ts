"use server";

import { CORES, DIMENSOES, PECAS } from "@/config/precos";
import { siteUrl } from "@/config/site";
import { utilizadorAtual } from "@/lib/auth";
import { obterEstampas, obterTabelaPortes, obterTabelaPrecos } from "@/lib/dados";
import { cotarEnvio } from "@/lib/envio";
import { MENSAGEM_LIMITE, verificarLimite } from "@/lib/limite";
import { precoLinha } from "@/lib/precos";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";
import { esquemaCheckout, primeiroErro } from "@/lib/validacao";

export type ResultadoPagamento = { ok: true; url: string } | { ok: false; erro: string };

export async function iniciarPagamento(dados: unknown): Promise<ResultadoPagamento> {
  if (!(await verificarLimite("checkout"))) return { ok: false, erro: MENSAGEM_LIMITE };

  const v = esquemaCheckout.safeParse(dados);
  if (!v.success) return { ok: false, erro: primeiroErro(v.error) };
  const c = v.data;

  const admin = supabaseAdmin();
  const s = stripe();
  if (!admin || !s) {
    return { ok: false, erro: "Os pagamentos online ainda não estão ativos. Fala connosco pelo WhatsApp para encomendar." };
  }

  // Preços SEMPRE calculados aqui, com a tabela do servidor.
  const [estampas, tabelaPrecos, tabelaPortes] = await Promise.all([
    obterEstampas(),
    obterTabelaPrecos(),
    obterTabelaPortes(),
  ]);

  const itens = [];
  for (const i of c.itens) {
    const estampa = estampas.find((e) => e.id === i.estampaId);
    if (!estampa) return { ok: false, erro: "Uma das estampas do carrinho já não está disponível." };
    const linha = precoLinha(tabelaPrecos, { peca: i.peca, tecido: "algodao", frente: i.frente, costas: i.costas }, i.quantidade);
    if (linha.tipo !== "preco") {
      return { ok: false, erro: `"${estampa.nome}" (${PECAS[i.peca]}) é sob consulta e não pode ser paga online.` };
    }
    itens.push({ ...i, estampaNome: estampa.nome, unitarioCents: linha.unitarioCents, totalCents: linha.totalCents });
  }

  const envio = await cotarEnvio(tabelaPortes, c.metodo, {
    codigoPostal: c.morada?.codigoPostal ?? null,
    pecas: c.itens.map((i) => ({ peca: i.peca, quantidade: i.quantidade })),
  });
  if (!envio.ok) return { ok: false, erro: envio.motivo };

  const subtotal = itens.reduce((t, i) => t + i.totalCents, 0);
  const portes = envio.cotacao.precoCents;
  const utilizador = await utilizadorAtual();

  const { data: encomenda, error } = await admin
    .from("encomendas")
    .insert({
      user_id: utilizador?.id ?? null,
      email: c.email,
      nome: c.nome,
      telefone: c.telefone || null,
      itens,
      subtotal_cents: subtotal,
      portes_cents: portes,
      total_cents: subtotal + portes,
      envio: { metodo: c.metodo, nome: envio.cotacao.nome, detalhe: envio.cotacao.detalhe, morada: c.morada },
    })
    .select("id, numero")
    .single();
  if (error || !encomenda) {
    console.error("checkout: erro ao criar encomenda", error?.message);
    return { ok: false, erro: "Não foi possível criar a encomenda. Tenta de novo." };
  }

  try {
    const nomeCor = (id: string) => CORES.find((x) => x.id === id)?.nome ?? id;
    const sessao = await s.checkout.sessions.create({
      mode: "payment",
      locale: "pt",
      customer_email: c.email,
      client_reference_id: encomenda.id,
      metadata: { encomenda_id: encomenda.id },
      payment_intent_data: { metadata: { encomenda_id: encomenda.id } },
      line_items: [
        ...itens.map((i) => ({
          quantity: i.quantidade,
          price_data: {
            currency: "eur",
            unit_amount: i.unitarioCents,
            product_data: {
              name: `${PECAS[i.peca]} "${i.estampaNome}"`,
              description: [
                `${nomeCor(i.cor)}, ${i.tamanho}`,
                i.frente ? `frente ${DIMENSOES[i.frente].nome}` : null,
                i.costas ? `costas ${DIMENSOES[i.costas].nome}` : null,
              ]
                .filter(Boolean)
                .join(" · "),
            },
          },
        })),
        ...(portes > 0
          ? [{ quantity: 1, price_data: { currency: "eur", unit_amount: portes, product_data: { name: `Portes: ${envio.cotacao.nome}` } } }]
          : []),
      ],
      success_url: `${siteUrl()}/encomenda/sucesso?n=${encomenda.numero}`,
      cancel_url: `${siteUrl()}/carrinho?cancelado=1`,
    });
    await admin.from("encomendas").update({ stripe_session_id: sessao.id }).eq("id", encomenda.id);
    if (!sessao.url) throw new Error("sessão sem url");
    return { ok: true, url: sessao.url };
  } catch (e) {
    console.error("checkout: erro Stripe", e);
    await admin.from("encomendas").update({ estado: "cancelada", notas_admin: "Falha ao criar sessão Stripe" }).eq("id", encomenda.id);
    return { ok: false, erro: "O serviço de pagamento não respondeu. Tenta de novo daqui a pouco." };
  }
}

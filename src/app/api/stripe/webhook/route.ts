import type Stripe from "stripe";
import { CORES, PECAS } from "@/config/precos";
import { segredo } from "@/lib/env";
import { notificarDono, tabelaHtml } from "@/lib/email";
import { formatarEuros } from "@/lib/precos";
import { cryptoProvider, stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/server";

// Só este endpoint marca encomendas como "pagas", e só com assinatura Stripe válida.
export async function POST(request: Request) {
  const s = stripe();
  const admin = supabaseAdmin();
  const segredoWebhook = segredo("STRIPE_WEBHOOK_SECRET");
  if (!s || !admin || !segredoWebhook) return new Response("Não configurado", { status: 503 });

  const assinatura = request.headers.get("stripe-signature");
  if (!assinatura) return new Response("Sem assinatura", { status: 400 });

  const corpo = await request.text();
  let evento: Stripe.Event;
  try {
    evento = await s.webhooks.constructEventAsync(corpo, assinatura, segredoWebhook, undefined, cryptoProvider);
  } catch {
    return new Response("Assinatura inválida", { status: 400 });
  }

  // Idempotência: cada evento só é tratado uma vez.
  const { error: duplicado } = await admin.from("eventos_stripe").insert({ id: evento.id, tipo: evento.type });
  if (duplicado) {
    if (duplicado.code === "23505") return new Response("ok (repetido)", { status: 200 });
    return new Response("Erro na base de dados", { status: 500 });
  }

  try {
    if (evento.type === "checkout.session.completed" || evento.type === "checkout.session.async_payment_succeeded") {
      const sessao = evento.data.object as Stripe.Checkout.Session;
      if (sessao.payment_status === "paid") await marcarPaga(sessao);
    }
    if (evento.type === "checkout.session.expired" || evento.type === "checkout.session.async_payment_failed") {
      const sessao = evento.data.object as Stripe.Checkout.Session;
      await admin
        .from("encomendas")
        .update({ estado: "cancelada" })
        .eq("stripe_session_id", sessao.id)
        .eq("estado", "pendente");
    }
  } catch (e) {
    // Remove o registo para a Stripe poder tentar de novo.
    await admin.from("eventos_stripe").delete().eq("id", evento.id);
    console.error("webhook: erro", e);
    return new Response("Erro", { status: 500 });
  }
  return new Response("ok", { status: 200 });

  async function marcarPaga(sessao: Stripe.Checkout.Session) {
    const id = sessao.metadata?.encomenda_id;
    if (!id || !admin) return;
    const { data: enc } = await admin
      .from("encomendas")
      .select("id, numero, total_cents, estado, nome, email, telefone, itens, envio")
      .eq("id", id)
      .eq("stripe_session_id", sessao.id)
      .maybeSingle();
    if (!enc) {
      console.error("webhook: encomenda não encontrada", id);
      return;
    }
    if (sessao.amount_total !== enc.total_cents || sessao.currency !== "eur") {
      console.error("webhook: valor não coincide", id, sessao.amount_total, enc.total_cents);
      await admin.from("encomendas").update({ notas_admin: "ATENÇÃO: valor pago não coincide com o total" }).eq("id", id);
      return;
    }
    if (enc.estado !== "pendente") return;
    await admin
      .from("encomendas")
      .update({
        estado: "paga",
        pago_em: new Date().toISOString(),
        stripe_payment_intent: typeof sessao.payment_intent === "string" ? sessao.payment_intent : null,
      })
      .eq("id", id)
      .eq("estado", "pendente");

    type Item = { quantidade: number; peca: keyof typeof PECAS; estampaNome: string; cor: string; tamanho: string; frente: string | null; costas: string | null };
    const linhas = (enc.itens as Item[])
      .map((i) => `${i.quantidade}x ${PECAS[i.peca]} "${i.estampaNome}" ${CORES.find((c) => c.id === i.cor)?.nome ?? i.cor} ${i.tamanho}${i.frente ? ` · frente ${i.frente}` : ""}${i.costas ? ` · costas ${i.costas}` : ""}`)
      .join("<br>");
    const envio = enc.envio as { nome: string; morada?: { morada: string; codigoPostal: string; localidade: string } | null };
    await notificarDono(
      `Nova encomenda paga n.º ${enc.numero} (${formatarEuros(enc.total_cents)})`,
      `<h2 style="font-family:Arial">Encomenda n.º ${enc.numero}</h2>` +
        tabelaHtml([
          ["Cliente", enc.nome],
          ["Email", enc.email],
          ["Telefone", enc.telefone],
          ["Envio", envio.nome],
          ["Morada", envio.morada ? `${envio.morada.morada}, ${envio.morada.codigoPostal} ${envio.morada.localidade}` : "Levantamento"],
          ["Total", formatarEuros(enc.total_cents)],
        ]) +
        `<p style="font-family:Arial;font-size:14px">${linhas}</p>`,
      enc.email,
    );
  }
}

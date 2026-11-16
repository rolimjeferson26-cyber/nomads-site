import "server-only";
import { segredo } from "@/lib/env";

export function escaparHtml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

type Linha = [rotulo: string, valor: string | number | null | undefined];

export function tabelaHtml(linhas: Linha[]): string {
  const tr = linhas
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(
      ([r, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#666">${escaparHtml(r)}</td><td style="padding:4px 0"><strong>${escaparHtml(String(v))}</strong></td></tr>`,
    )
    .join("");
  return `<table style="font-family:Arial,sans-serif;font-size:14px">${tr}</table>`;
}

// Notificação ao dono da loja (via Resend). Sem chave configurada, só regista no log.
export async function notificarDono(assunto: string, html: string, responderPara?: string): Promise<void> {
  const chave = segredo("RESEND_API_KEY");
  const para = segredo("OWNER_EMAIL");
  const de = segredo("EMAIL_FROM") ?? "NOMAD'S <onboarding@resend.dev>";
  if (!chave || !para) {
    console.warn(`[email] RESEND_API_KEY/OWNER_EMAIL em falta. Notificação não enviada: ${assunto}`);
    return;
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: de,
        to: [para],
        subject: assunto,
        html,
        ...(responderPara ? { reply_to: responderPara } : {}),
      }),
    });
    if (!r.ok) console.error("[email] falhou", r.status, await r.text());
  } catch (e) {
    console.error("[email] erro", e);
  }
}

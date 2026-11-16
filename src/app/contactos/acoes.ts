"use server";

import type { EstadoForm } from "@/components/Formulario";
import { notificarDono, tabelaHtml } from "@/lib/email";
import { segredo } from "@/lib/env";
import { MENSAGEM_LIMITE, verificarLimite } from "@/lib/limite";
import { esquemaContacto, primeiroErro } from "@/lib/validacao";

export async function enviarContacto(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  if (fd.get("site")) return { ok: "Mensagem enviada. Obrigado!" }; // armadilha para robôs
  const v = esquemaContacto.safeParse({
    nome: fd.get("nome"),
    email: fd.get("email"),
    mensagem: fd.get("mensagem"),
    consentimento: fd.get("consentimento") === "sim",
  });
  if (!v.success) return { erro: primeiroErro(v.error) };
  if (!(await verificarLimite("contacto", v.data.email))) return { erro: MENSAGEM_LIMITE };
  if (!segredo("RESEND_API_KEY")) {
    return { erro: "O formulário ainda não está ativo. Fala connosco pelo WhatsApp ou por email." };
  }
  await notificarDono(
    `Mensagem do site: ${v.data.nome}`,
    tabelaHtml([["Nome", v.data.nome], ["Email", v.data.email], ["Mensagem", v.data.mensagem]]),
    v.data.email,
  );
  return { ok: "Mensagem enviada. Respondemos em breve!" };
}

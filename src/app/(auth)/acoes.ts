"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoForm } from "@/components/Formulario";
import { siteUrl } from "@/config/site";
import { COOKIE_CONFIRMAR, COOKIE_RECUPERAR } from "@/lib/cookies-auth";
import { MENSAGEM_LIMITE, verificarLimite } from "@/lib/limite";
import { supabaseServidor } from "@/lib/supabase/server";
import { esquemaEmail, primeiroErro } from "@/lib/validacao";

const palavraPasse = z.string().min(10, "A palavra-passe tem de ter pelo menos 10 caracteres.").max(128);
const SEM_SUPABASE: EstadoForm = { erro: "A área de cliente ainda não está ativa." };

// Os emails do login partilhado (ria-apps) enviam um CÓDIGO, não um link.
// O email à espera de código fica num cookie httpOnly curto (nunca no endereço da página).
const codigo = z
  .string()
  .transform((s) => s.replace(/\s+/g, ""))
  .pipe(z.string().regex(/^\d{6,10}$/, "O código tem só números (6 a 10 dígitos)."));

async function guardarEmailPendente(nome: string, email: string) {
  (await cookies()).set(nome, email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
}

// Só aceita caminhos internos (evita redirecionamentos abertos).
function destinoSeguro(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") && !s.startsWith("/\\") ? s : "/conta";
}

export async function entrar(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = z.object({ email: esquemaEmail, password: z.string().min(1, "Indica a palavra-passe.").max(128) }).safeParse({
    email: fd.get("email"),
    password: fd.get("password"),
  });
  if (!v.success) return { erro: primeiroErro(v.error) };
  if (!(await verificarLimite("login", v.data.email))) return { erro: MENSAGEM_LIMITE };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  const { error } = await supabase.auth.signInWithPassword(v.data);
  if (error?.code === "email_not_confirmed") {
    // Palavra-passe certa mas conta por confirmar: vai para o passo do código.
    await guardarEmailPendente(COOKIE_CONFIRMAR, v.data.email);
    redirect("/confirmar?motivo=por-confirmar");
  }
  if (error) return { erro: "Email ou palavra-passe errados." };
  redirect(destinoSeguro(fd.get("seguir")));
}

export async function registar(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = z
    .object({
      nome: z.string().trim().min(1, "Indica o teu nome.").max(120),
      email: esquemaEmail,
      password: palavraPasse,
      termos: z.literal("sim", { error: "Tens de aceitar os Termos e a Política de Privacidade." }),
    })
    .safeParse({ nome: fd.get("nome"), email: fd.get("email"), password: fd.get("password"), termos: fd.get("termos") });
  if (!v.success) return { erro: primeiroErro(v.error) };
  if (!(await verificarLimite("registo"))) return { erro: MENSAGEM_LIMITE };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  const { error } = await supabase.auth.signUp({
    email: v.data.email,
    password: v.data.password,
    options: { data: { nome: v.data.nome }, emailRedirectTo: `${siteUrl()}/auth/callback?seguir=/conta` },
  });
  if (error) {
    console.error("registo:", error.code, error.message);
    if (error.code === "weak_password") return { erro: "Palavra-passe demasiado fraca. Escolhe outra." };
    if (error.code === "over_email_send_rate_limit") return { erro: MENSAGEM_LIMITE };
  }
  // Mesmo passo em todos os casos, para não revelar que emails já têm conta.
  await guardarEmailPendente(COOKIE_CONFIRMAR, v.data.email);
  redirect("/confirmar");
}

export async function confirmarCodigo(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = z.object({ email: esquemaEmail, codigo }).safeParse({ email: fd.get("email"), codigo: fd.get("codigo") });
  if (!v.success) return { erro: primeiroErro(v.error) };
  if (!(await verificarLimite("codigo", v.data.email))) return { erro: MENSAGEM_LIMITE };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  // "email" é o tipo atual para códigos de confirmação; "signup" para contas criadas com o tipo antigo.
  let { error } = await supabase.auth.verifyOtp({ email: v.data.email, token: v.data.codigo, type: "email" });
  if (error) ({ error } = await supabase.auth.verifyOtp({ email: v.data.email, token: v.data.codigo, type: "signup" }));
  if (error) return { erro: "Código errado ou expirado. Confirma o código ou pede um novo." };
  (await cookies()).delete(COOKIE_CONFIRMAR);
  redirect("/conta");
}

export async function reenviarCodigo(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = esquemaEmail.safeParse(fd.get("email"));
  if (!v.success) return { erro: "Email inválido." };
  if (!(await verificarLimite("reenviar", v.data))) return { erro: MENSAGEM_LIMITE };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: v.data,
    options: { emailRedirectTo: `${siteUrl()}/auth/callback?seguir=/conta` },
  });
  if (error?.code === "over_email_send_rate_limit") return { erro: "Espera um minuto antes de pedir outro código." };
  if (error) console.error("reenviar:", error.code, error.message);
  await guardarEmailPendente(COOKIE_CONFIRMAR, v.data);
  return { ok: "Se a conta estiver por confirmar, enviámos um código novo. Vê também o spam." };
}

export async function recuperar(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = esquemaEmail.safeParse(fd.get("email"));
  if (!v.success) return { erro: "Email inválido." };
  if (!(await verificarLimite("recuperar", v.data))) return { erro: MENSAGEM_LIMITE };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  const { error } = await supabase.auth.resetPasswordForEmail(v.data, {
    redirectTo: `${siteUrl()}/auth/callback?seguir=/conta/nova-palavra-passe`,
  });
  if (error?.code === "over_email_send_rate_limit") return { erro: "Espera um minuto antes de pedir outro código." };
  if (error) console.error("recuperar:", error.code, error.message);
  await guardarEmailPendente(COOKIE_RECUPERAR, v.data);
  redirect("/recuperar/codigo");
}

export async function redefinirComCodigo(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = z
    .object({ email: esquemaEmail, codigo, password: palavraPasse })
    .safeParse({ email: fd.get("email"), codigo: fd.get("codigo"), password: fd.get("password") });
  if (!v.success) return { erro: primeiroErro(v.error) };
  if (fd.get("password") !== fd.get("confirmar")) return { erro: "As palavras-passe não coincidem." };
  if (!(await verificarLimite("codigo", v.data.email))) return { erro: MENSAGEM_LIMITE };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  const { error } = await supabase.auth.verifyOtp({ email: v.data.email, token: v.data.codigo, type: "recovery" });
  if (error) return { erro: "Código errado ou expirado. Confirma o código ou pede um novo." };
  const { error: erroSenha } = await supabase.auth.updateUser({ password: v.data.password });
  if (erroSenha) {
    if (erroSenha.code === "same_password") return { erro: "Escolhe uma palavra-passe diferente da anterior." };
    return { erro: "O código foi aceite mas não foi possível mudar a palavra-passe. Tenta outra vez." };
  }
  (await cookies()).delete(COOKIE_RECUPERAR);
  redirect("/conta?palavra-passe=alterada");
}

export async function novaPalavraPasse(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = palavraPasse.safeParse(fd.get("password"));
  if (!v.success) return { erro: primeiroErro(v.error) };
  if (fd.get("password") !== fd.get("confirmar")) return { erro: "As palavras-passe não coincidem." };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  const { error } = await supabase.auth.updateUser({ password: v.data });
  if (error) return { erro: "Não foi possível alterar. Pede um novo código de recuperação." };
  return { ok: "Palavra-passe alterada." };
}

export async function sair() {
  const supabase = await supabaseServidor();
  await supabase?.auth.signOut();
  redirect("/");
}

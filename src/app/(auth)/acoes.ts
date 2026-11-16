"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoForm } from "@/components/Formulario";
import { siteUrl } from "@/config/site";
import { MENSAGEM_LIMITE, verificarLimite } from "@/lib/limite";
import { supabaseServidor } from "@/lib/supabase/server";
import { esquemaEmail, primeiroErro } from "@/lib/validacao";

const palavraPasse = z.string().min(10, "A palavra-passe tem de ter pelo menos 10 caracteres.").max(128);
const SEM_SUPABASE: EstadoForm = { erro: "A área de cliente ainda não está ativa." };

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
  if (error) return { erro: "Email ou palavra-passe errados (ou email ainda por confirmar)." };
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
  if (error) console.error("registo:", error.message);
  // Mensagem igual em todos os casos para não revelar que emails existem.
  return { ok: "Se o email for válido, enviámos um link de confirmação. Abre-o para ativar a conta." };
}

export async function recuperar(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = esquemaEmail.safeParse(fd.get("email"));
  if (!v.success) return { erro: "Email inválido." };
  if (!(await verificarLimite("recuperar", v.data))) return { erro: MENSAGEM_LIMITE };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  await supabase.auth.resetPasswordForEmail(v.data, {
    redirectTo: `${siteUrl()}/auth/callback?seguir=/conta/nova-palavra-passe`,
  });
  return { ok: "Se existir uma conta com este email, vais receber um link para definir uma nova palavra-passe." };
}

export async function novaPalavraPasse(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = palavraPasse.safeParse(fd.get("password"));
  if (!v.success) return { erro: primeiroErro(v.error) };
  if (fd.get("password") !== fd.get("confirmar")) return { erro: "As palavras-passe não coincidem." };
  const supabase = await supabaseServidor();
  if (!supabase) return SEM_SUPABASE;
  const { error } = await supabase.auth.updateUser({ password: v.data });
  if (error) return { erro: "Não foi possível alterar. Pede um novo link de recuperação." };
  return { ok: "Palavra-passe alterada." };
}

export async function sair() {
  const supabase = await supabaseServidor();
  await supabase?.auth.signOut();
  redirect("/");
}

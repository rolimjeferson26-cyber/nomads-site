import "server-only";
import { redirect } from "next/navigation";
import { supabaseServidor } from "@/lib/supabase/server";

export type Utilizador = { id: string; email: string };

export async function utilizadorAtual(): Promise<Utilizador | null> {
  const supabase = await supabaseServidor();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { id: data.user.id, email: data.user.email ?? "" };
}

export async function exigirUtilizador(destino = "/conta"): Promise<Utilizador> {
  const u = await utilizadorAtual();
  if (!u) redirect(`/entrar?seguir=${encodeURIComponent(destino)}`);
  return u;
}

export async function eAdmin(): Promise<boolean> {
  const supabase = await supabaseServidor();
  if (!supabase) return false;
  const { data, error } = await supabase.rpc("is_admin");
  return !error && data === true;
}

// Admin = utilizador autenticado presente na tabela "admins" (verificado na base de dados).
export async function exigirAdmin(): Promise<Utilizador> {
  const u = await exigirUtilizador("/admin");
  if (!(await eAdmin())) redirect("/conta");
  return u;
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { EstadoForm } from "@/components/Formulario";
import { utilizadorAtual } from "@/lib/auth";
import { MENSAGEM_LIMITE, verificarLimite } from "@/lib/limite";
import { supabaseAdmin, supabaseServidor } from "@/lib/supabase/server";
import { esquemaMorada, esquemaTelefone, normalizarParaMorada, primeiroErro } from "@/lib/validacao";

async function sessao() {
  const u = await utilizadorAtual();
  const supabase = await supabaseServidor();
  if (!u || !supabase) redirect("/entrar");
  if (!(await verificarLimite("conta", u.id))) throw new Error(MENSAGEM_LIMITE);
  return { u, supabase };
}

export async function guardarDados(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = z
    .object({ nome: z.string().trim().min(1, "Indica o teu nome.").max(120), telefone: esquemaTelefone })
    .safeParse({ nome: fd.get("nome"), telefone: fd.get("telefone") ?? "" });
  if (!v.success) return { erro: primeiroErro(v.error) };
  try {
    const { u, supabase } = await sessao();
    const { error } = await supabase
      .from("perfis")
      .upsert({ id: u.id, nome: v.data.nome, telefone: v.data.telefone || null }, { onConflict: "id" });
    if (error) return { erro: "Não foi possível guardar." };
  } catch (e) {
    return { erro: (e as Error).message };
  }
  revalidatePath("/conta/dados");
  return { ok: "Dados guardados." };
}

export async function adicionarMorada(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const v = esquemaMorada.safeParse(normalizarParaMorada(fd));
  if (!v.success) return { erro: primeiroErro(v.error) };
  try {
    const { u, supabase } = await sessao();
    const { count } = await supabase.from("moradas").select("id", { count: "exact", head: true }).eq("user_id", u.id);
    if ((count ?? 0) >= 10) return { erro: "Máximo de 10 moradas." };
    const { error } = await supabase.from("moradas").insert({
      user_id: u.id,
      nome: v.data.nome,
      morada: v.data.morada,
      codigo_postal: v.data.codigoPostal,
      localidade: v.data.localidade,
      telefone: v.data.telefone || null,
    });
    if (error) return { erro: "Não foi possível guardar a morada." };
  } catch (e) {
    return { erro: (e as Error).message };
  }
  revalidatePath("/conta/moradas");
  return { ok: "Morada guardada." };
}

export async function apagarMorada(fd: FormData) {
  const id = z.uuid().safeParse(fd.get("id"));
  if (!id.success) return;
  const { u, supabase } = await sessao();
  // RLS garante que só apaga moradas do próprio utilizador
  await supabase.from("moradas").delete().eq("id", id.data).eq("user_id", u.id);
  revalidatePath("/conta/moradas");
}

export async function eliminarConta(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  if (fd.get("confirmacao") !== "ELIMINAR") return { erro: "Escreve ELIMINAR para confirmar." };
  const u = await utilizadorAtual();
  const admin = supabaseAdmin();
  if (!u || !admin) return { erro: "Não foi possível eliminar a conta agora. Contacta-nos." };
  // Moradas e perfil são apagados em cascata. Encomendas ficam sem ligação à conta
  // (guardadas só pelo prazo legal de faturação).
  const { error } = await admin.auth.admin.deleteUser(u.id);
  if (error) return { erro: "Não foi possível eliminar a conta. Contacta-nos." };
  const supabase = await supabaseServidor();
  await supabase?.auth.signOut();
  redirect("/?conta=eliminada");
}

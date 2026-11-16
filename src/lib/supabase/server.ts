import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env, segredo, supabaseConfigurado } from "@/lib/env";

// Cliente com a sessão do utilizador (respeita RLS).
export async function supabaseServidor(): Promise<SupabaseClient | null> {
  if (!supabaseConfigurado()) return null;
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Chamado num Server Component: o proxy trata da renovação da sessão.
        }
      },
    },
  });
}

// Cliente com a chave secreta (ignora RLS). Usar SÓ no servidor, depois de validar tudo.
export function supabaseAdmin(): SupabaseClient | null {
  const chave = segredo("SUPABASE_SECRET_KEY");
  if (!env.supabaseUrl || !chave) return null;
  return createSupabaseClient(env.supabaseUrl, chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

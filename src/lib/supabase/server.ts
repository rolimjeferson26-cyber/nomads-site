import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env, segredo, supabaseConfigurado } from "@/lib/env";
import { SCHEMA } from "./config";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Cliente = SupabaseClient<any, typeof SCHEMA>;

// Cliente com a sessão do utilizador (respeita RLS).
export async function supabaseServidor(): Promise<Cliente | null> {
  if (!supabaseConfigurado()) return null;
  const store = await cookies();
  return createServerClient<any, typeof SCHEMA>(env.supabaseUrl, env.supabasePublishableKey, { // eslint-disable-line @typescript-eslint/no-explicit-any
    db: { schema: SCHEMA },
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
export function supabaseAdmin(): Cliente | null {
  const chave = segredo("SUPABASE_SECRET_KEY");
  if (!env.supabaseUrl || !chave) return null;
  return createSupabaseClient(env.supabaseUrl, chave, {
    db: { schema: SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

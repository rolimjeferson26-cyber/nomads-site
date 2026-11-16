// Leitura central das variáveis de ambiente. Os segredos nunca vão para o browser:
// só as variáveis NEXT_PUBLIC_* são públicas.

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
};

export function supabaseConfigurado(): boolean {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function segredo(nome: string): string | undefined {
  const v = process.env[nome];
  return v && v.length > 0 ? v : undefined;
}

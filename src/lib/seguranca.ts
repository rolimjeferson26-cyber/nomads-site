// Cabeçalhos de segurança e Content-Security-Policy (aplicados no proxy).

export function gerarNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function construirCsp(nonce: string, dev: boolean): string {
  const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseWs = supabase.replace(/^https:/, "wss:");
  const diretivas: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", ...(dev ? ["'unsafe-eval'"] : [])],
    // Estilos inline são necessários para animações (Framer Motion) e para o tema por estilo.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...(supabase ? [supabase] : [])],
    "font-src": ["'self'"],
    "media-src": ["'self'"],
    "connect-src": ["'self'", ...(supabase ? [supabase, supabaseWs] : []), ...(dev ? ["ws:"] : [])],
    "worker-src": ["'self'", "blob:"],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'", "https://checkout.stripe.com"],
    "frame-ancestors": ["'none'"],
  };
  const csp = Object.entries(diretivas)
    .map(([k, v]) => `${k} ${v.join(" ")}`)
    .join("; ");
  return dev ? csp : `${csp}; upgrade-insecure-requests`;
}

export const CABECALHOS_SEGURANCA: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "Cross-Origin-Opener-Policy": "same-origin",
};

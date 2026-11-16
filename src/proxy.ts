import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CABECALHOS_SEGURANCA, construirCsp, gerarNonce } from "@/lib/seguranca";

export async function proxy(request: NextRequest) {
  const nonce = gerarNonce();
  const csp = construirCsp(nonce, process.env.NODE_ENV === "development");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  // Renovação da sessão Supabase (cookies), quando configurado.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (lista, headers) => {
          lista.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          lista.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
        },
      },
    });
    // Não pôr código entre a criação do cliente e getClaims().
    await supabase.auth.getClaims();
  }

  response.headers.set("Content-Security-Policy", csp);
  for (const [k, v] of Object.entries(CABECALHOS_SEGURANCA)) response.headers.set(k, v);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api/stripe/webhook|_next/static|_next/image|favicon.ico|estampas/|fonts/|img/|video/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

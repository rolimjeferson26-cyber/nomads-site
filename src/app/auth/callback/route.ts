import { NextResponse, type NextRequest } from "next/server";
import { supabaseServidor } from "@/lib/supabase/server";

// Recebe os links de confirmação de email e de recuperação (fluxo PKCE).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const seguir = searchParams.get("seguir") ?? "/conta";
  const destino = seguir.startsWith("/") && !seguir.startsWith("//") && !seguir.startsWith("/\\") ? seguir : "/conta";

  if (code) {
    const supabase = await supabaseServidor();
    const { error } = (await supabase?.auth.exchangeCodeForSession(code)) ?? { error: true };
    if (!error) return NextResponse.redirect(`${origin}${destino}`);
  }
  return NextResponse.redirect(`${origin}/entrar?erro=link`);
}

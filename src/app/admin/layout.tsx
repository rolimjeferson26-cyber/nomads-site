import type { Metadata } from "next";
import Link from "next/link";
import { exigirAdmin } from "@/lib/auth";
import { supabaseConfigurado } from "@/lib/env";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const MENU = [
  { href: "/admin", rotulo: "Encomendas" },
  { href: "/admin/orcamentos", rotulo: "Orçamentos" },
  { href: "/admin/estampas", rotulo: "Estampas" },
  { href: "/admin/precos", rotulo: "Preços e portes" },
];

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigurado()) {
    return <p className="px-4 pb-16 pt-32 text-center text-estrada">Admin indisponível: Supabase não configurado.</p>;
  }
  await exigirAdmin();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 md:px-8 md:pt-28">
      <p className="kicker">Admin NOMAD&apos;S</p>
      <nav className="mt-3 flex gap-2 overflow-x-auto border-b border-white/10 pb-3" aria-label="Admin">
        {MENU.map((m) => (
          <Link key={m.href} href={m.href} className="opcao shrink-0 font-semibold">{m.rotulo}</Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}

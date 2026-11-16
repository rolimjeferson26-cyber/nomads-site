import Link from "next/link";
import { sair } from "@/app/(auth)/acoes";
import { eAdmin, exigirUtilizador } from "@/lib/auth";
import { supabaseConfigurado } from "@/lib/env";

const MENU = [
  { href: "/conta", rotulo: "Encomendas" },
  { href: "/conta/orcamentos", rotulo: "Orçamentos" },
  { href: "/conta/moradas", rotulo: "Moradas" },
  { href: "/conta/dados", rotulo: "Dados da conta" },
];

export default async function LayoutConta({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigurado()) {
    return (
      <div className="mx-auto max-w-xl px-4 pb-16 pt-32 text-center">
        <h1 className="titulo text-6xl">Área de cliente</h1>
        <p className="mt-4 text-estrada">A área de cliente está a ser ativada. Entretanto, fala connosco pelo WhatsApp.</p>
      </div>
    );
  }
  const u = await exigirUtilizador();
  const admin = await eAdmin();
  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 pt-24 md:grid-cols-[220px_1fr] md:px-8 md:pt-32">
      <aside>
        <p className="kicker">Área de cliente</p>
        <p className="mt-2 truncate text-sm text-estrada">{u.email}</p>
        <nav className="mt-6 flex gap-2 overflow-x-auto md:flex-col" aria-label="Área de cliente">
          {MENU.map((m) => (
            <Link key={m.href} href={m.href} className="opcao shrink-0 font-semibold">{m.rotulo}</Link>
          ))}
          {admin && <Link href="/admin" className="opcao shrink-0 font-semibold text-destaque">Admin</Link>}
        </nav>
        <form action={sair} className="mt-4">
          <button className="text-sm text-estrada underline">Terminar sessão</button>
        </form>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

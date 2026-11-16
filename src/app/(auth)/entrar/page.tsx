import type { Metadata } from "next";
import Link from "next/link";
import { Campo, Formulario } from "@/components/Formulario";
import { entrar } from "../acoes";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const { seguir, erro } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-32">
      <h1 className="titulo text-6xl">Entrar</h1>
      <p className="mt-2 text-estrada">Acompanha encomendas e orçamentos.</p>
      {erro && <p className="mt-4 rounded-xl bg-erro/15 p-3 text-sm text-erro">O link expirou ou é inválido. Tenta de novo.</p>}
      <div className="cartao mt-8 p-6">
        <Formulario acao={entrar} botao="Entrar">
          <input type="hidden" name="seguir" value={typeof seguir === "string" ? seguir : "/conta"} />
          <Campo rotulo="Email" name="email" type="email" autoComplete="email" required maxLength={200} />
          <Campo rotulo="Palavra-passe" name="password" type="password" autoComplete="current-password" required maxLength={128} />
        </Formulario>
        <div className="mt-6 flex flex-wrap justify-between gap-2 text-sm">
          <Link href="/registar" className="underline">Criar conta</Link>
          <Link href="/recuperar" className="text-estrada underline">Esqueci a palavra-passe</Link>
        </div>
      </div>
    </div>
  );
}

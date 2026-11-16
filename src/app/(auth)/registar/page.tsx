import type { Metadata } from "next";
import Link from "next/link";
import { Campo, Formulario } from "@/components/Formulario";
import { registar } from "../acoes";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function Registar() {
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-32">
      <h1 className="titulo text-6xl">Criar conta</h1>
      <div className="cartao mt-8 p-6">
        <Formulario acao={registar} botao="Criar conta">
          <Campo rotulo="Nome" name="nome" autoComplete="name" required maxLength={120} />
          <Campo rotulo="Email" name="email" type="email" autoComplete="email" required maxLength={200} />
          <Campo rotulo="Palavra-passe (mín. 10 caracteres)" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="termos" value="sim" required className="mt-0.5 size-5 accent-[var(--destaque)]" />
            <span>
              Aceito os <Link href="/legal/termos" className="underline">Termos</Link> e a{" "}
              <Link href="/legal/privacidade" className="underline">Política de Privacidade</Link>.
            </span>
          </label>
        </Formulario>
        <p className="mt-6 text-sm">
          Já tens conta? <Link href="/entrar" className="underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

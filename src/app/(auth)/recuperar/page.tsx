import type { Metadata } from "next";
import Link from "next/link";
import { Campo, Formulario } from "@/components/Formulario";
import { recuperar } from "../acoes";

export const metadata: Metadata = { title: "Recuperar palavra-passe", robots: { index: false } };

export default function Recuperar() {
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-32">
      <h1 className="titulo text-6xl">Recuperar acesso</h1>
      <div className="cartao mt-8 p-6">
        <p className="mb-4 text-sm text-estrada">Enviamos um código para o email da conta; a seguir escreves o código e a nova palavra-passe.</p>
        <Formulario acao={recuperar} botao="Enviar código">
          <Campo rotulo="Email da conta" name="email" type="email" autoComplete="email" required maxLength={200} />
        </Formulario>
        <p className="mt-4 text-sm"><Link href="/recuperar/codigo" className="underline">Já tenho um código</Link></p>
      </div>
    </div>
  );
}

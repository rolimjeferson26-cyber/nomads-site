import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Campo, Formulario } from "@/components/Formulario";
import { COOKIE_RECUPERAR } from "@/lib/cookies-auth";
import { redefinirComCodigo } from "../../acoes";

export const metadata: Metadata = { title: "Nova palavra-passe", robots: { index: false } };

export default async function RecuperarCodigo() {
  const email = (await cookies()).get(COOKIE_RECUPERAR)?.value ?? "";
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-32">
      <h1 className="titulo text-6xl">Nova palavra-passe</h1>
      <p className="mt-3 text-estrada">
        Se existir uma conta com este email, enviámos um código (o email chega com o nome <strong>Ria Digital</strong>;
        vê também o spam). Escreve-o abaixo com a nova palavra-passe.
      </p>
      <div className="cartao mt-8 p-6">
        <Formulario acao={redefinirComCodigo} botao="Guardar e entrar">
          <Campo rotulo="Email" name="email" type="email" autoComplete="email" defaultValue={email} required maxLength={200} />
          <Campo
            rotulo="Código"
            name="codigo"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,12}"
            maxLength={12}
            required
            autoFocus
            className="campo text-center font-mono text-2xl tracking-[0.4em]"
          />
          <Campo rotulo="Nova palavra-passe (mín. 10)" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required />
          <Campo rotulo="Repetir" name="confirmar" type="password" autoComplete="new-password" maxLength={128} required />
        </Formulario>
      </div>
      <p className="mt-6 text-sm">
        <Link href="/recuperar" className="underline">Pedir outro código</Link>
      </p>
    </div>
  );
}

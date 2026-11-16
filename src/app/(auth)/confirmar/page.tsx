import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Campo, Formulario } from "@/components/Formulario";
import { COOKIE_CONFIRMAR } from "@/lib/cookies-auth";
import { confirmarCodigo, reenviarCodigo } from "../acoes";

export const metadata: Metadata = { title: "Confirmar conta", robots: { index: false } };

export default async function Confirmar({ searchParams }: PageProps<"/confirmar">) {
  const { motivo } = await searchParams;
  const email = (await cookies()).get(COOKIE_CONFIRMAR)?.value ?? "";
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-32">
      <p className="kicker">Último passo</p>
      <h1 className="titulo mt-2 text-6xl">Confirma a conta</h1>
      <p className="mt-3 text-estrada">
        {motivo === "por-confirmar" ? "A tua conta ainda não está confirmada. " : ""}
        Escreve o código que enviámos para o teu email. O email chega com o nome <strong>Ria Digital</strong>
        (a plataforma que gere as contas); vê também o spam.
      </p>
      <div className="cartao mt-8 p-6">
        <Formulario acao={confirmarCodigo} botao="Confirmar e entrar">
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
        </Formulario>
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="mb-3 text-sm text-estrada">Não recebeste ou o código expirou?</p>
          <Formulario acao={reenviarCodigo} botao="Reenviar código">
            <input type="hidden" name="email" value={email} />
            {!email && <Campo rotulo="Email" name="email" type="email" autoComplete="email" required maxLength={200} />}
          </Formulario>
        </div>
      </div>
      <p className="mt-6 text-sm">
        <Link href="/entrar" className="underline">Voltar a entrar</Link>
      </p>
    </div>
  );
}

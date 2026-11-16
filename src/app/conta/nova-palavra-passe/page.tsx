import type { Metadata } from "next";
import { novaPalavraPasse } from "@/app/(auth)/acoes";
import { Campo, Formulario } from "@/components/Formulario";

export const metadata: Metadata = { title: "Nova palavra-passe", robots: { index: false } };

export default function NovaPalavraPasse() {
  return (
    <section>
      <h1 className="titulo text-5xl">Nova palavra-passe</h1>
      <div className="cartao mt-6 max-w-md p-6">
        <Formulario acao={novaPalavraPasse} botao="Guardar">
          <Campo rotulo="Nova palavra-passe (mín. 10)" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required />
          <Campo rotulo="Repetir" name="confirmar" type="password" autoComplete="new-password" maxLength={128} required />
        </Formulario>
      </div>
    </section>
  );
}

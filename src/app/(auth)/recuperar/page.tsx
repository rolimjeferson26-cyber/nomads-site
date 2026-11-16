import type { Metadata } from "next";
import { Campo, Formulario } from "@/components/Formulario";
import { recuperar } from "../acoes";

export const metadata: Metadata = { title: "Recuperar palavra-passe", robots: { index: false } };

export default function Recuperar() {
  return (
    <div className="mx-auto max-w-md px-4 pb-16 pt-32">
      <h1 className="titulo text-6xl">Recuperar acesso</h1>
      <div className="cartao mt-8 p-6">
        <Formulario acao={recuperar} botao="Enviar link">
          <Campo rotulo="Email da conta" name="email" type="email" autoComplete="email" required maxLength={200} />
        </Formulario>
      </div>
    </div>
  );
}

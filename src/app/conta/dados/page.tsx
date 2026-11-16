import type { Metadata } from "next";
import Link from "next/link";
import { novaPalavraPasse } from "@/app/(auth)/acoes";
import { Campo, Formulario } from "@/components/Formulario";
import { exigirUtilizador } from "@/lib/auth";
import { supabaseServidor } from "@/lib/supabase/server";
import { eliminarConta, guardarDados } from "../acoes";

export const metadata: Metadata = { title: "Dados da conta", robots: { index: false } };

export default async function Dados() {
  const u = await exigirUtilizador("/conta/dados");
  const supabase = await supabaseServidor();
  const { data: perfil } = (await supabase?.from("perfis").select("nome, telefone").eq("id", u.id).maybeSingle()) ?? { data: null };
  return (
    <section className="grid gap-8">
      <h1 className="titulo text-5xl">Dados da conta</h1>
      <div className="cartao p-6">
        <Formulario acao={guardarDados} botao="Guardar">
          <p className="text-sm text-estrada">Email: {u.email}</p>
          <Campo rotulo="Nome" name="nome" defaultValue={perfil?.nome ?? ""} autoComplete="name" required maxLength={120} />
          <Campo rotulo="Telemóvel" name="telefone" type="tel" defaultValue={perfil?.telefone ?? ""} autoComplete="tel" maxLength={30} />
        </Formulario>
      </div>
      <div className="cartao p-6" id="palavra-passe">
        <h2 className="mb-4 font-semibold">Alterar palavra-passe</h2>
        <Formulario acao={novaPalavraPasse} botao="Alterar">
          <Campo rotulo="Nova palavra-passe (mín. 10)" name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required />
          <Campo rotulo="Repetir" name="confirmar" type="password" autoComplete="new-password" maxLength={128} required />
        </Formulario>
      </div>
      <div className="cartao border-erro/40 p-6">
        <h2 className="font-semibold text-erro">Eliminar conta</h2>
        <p className="mt-2 text-sm text-estrada">
          Apaga a conta, o perfil e as moradas. As encomendas já feitas ficam guardadas sem ligação à conta, só pelo
          prazo exigido por lei (ver <Link href="/legal/privacidade" className="underline">Privacidade</Link>). Esta ação não pode ser desfeita.
        </p>
        <Formulario acao={eliminarConta} botao="Eliminar conta" perigo className="mt-4 grid gap-4">
          <Campo rotulo="Escreve ELIMINAR para confirmar" name="confirmacao" autoComplete="off" required />
        </Formulario>
      </div>
    </section>
  );
}

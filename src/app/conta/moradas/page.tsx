import type { Metadata } from "next";
import { Campo, Formulario } from "@/components/Formulario";
import { exigirUtilizador } from "@/lib/auth";
import { supabaseServidor } from "@/lib/supabase/server";
import { adicionarMorada, apagarMorada } from "../acoes";

export const metadata: Metadata = { title: "Moradas", robots: { index: false } };

export default async function Moradas() {
  await exigirUtilizador("/conta/moradas");
  const supabase = await supabaseServidor();
  const { data } = (await supabase?.from("moradas").select("*").order("criado_em")) ?? { data: [] };
  return (
    <section className="grid gap-8">
      <h1 className="titulo text-5xl">Moradas</h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {(data ?? []).map((m) => (
          <li key={m.id} className="cartao p-5">
            <p className="font-semibold">{m.nome}</p>
            <p className="text-sm text-estrada">{m.morada}<br />{m.codigo_postal} {m.localidade}{m.telefone && <><br />{m.telefone}</>}</p>
            <form action={apagarMorada} className="mt-3">
              <input type="hidden" name="id" value={m.id} />
              <button className="text-sm text-estrada underline hover:text-erro">Apagar</button>
            </form>
          </li>
        ))}
      </ul>
      <div className="cartao p-6">
        <h2 className="mb-4 font-semibold">Nova morada</h2>
        <Formulario acao={adicionarMorada} botao="Guardar morada" className="grid gap-4 sm:grid-cols-2">
          <Campo rotulo="Nome" name="nome" autoComplete="name" required maxLength={120} />
          <Campo rotulo="Telemóvel (opcional)" name="telefone" type="tel" autoComplete="tel" maxLength={30} />
          <div className="sm:col-span-2"><Campo rotulo="Morada" name="morada" autoComplete="street-address" required maxLength={200} /></div>
          <Campo rotulo="Código postal" name="codigoPostal" placeholder="0000-000" autoComplete="postal-code" required maxLength={8} />
          <Campo rotulo="Localidade" name="localidade" autoComplete="address-level2" required maxLength={80} />
        </Formulario>
      </div>
    </section>
  );
}

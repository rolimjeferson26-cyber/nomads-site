import { NovaEstampa } from "@/components/admin/NovaEstampa";
import { ESTILOS } from "@/config/estilos";
import { exigirAdmin } from "@/lib/auth";
import { obterEstampas } from "@/lib/dados";
import { atualizarEstampa } from "../acoes";

export default async function AdminEstampas() {
  await exigirAdmin();
  const estampas = await obterEstampas(true);
  return (
    <section className="grid gap-8">
      <h1 className="titulo text-5xl">Estampas</h1>
      <NovaEstampa estilos={ESTILOS.map((e) => ({ id: e.id, nome: e.nome }))} />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {estampas.map((e) => (
          <li key={e.id} className={`cartao flex gap-4 p-4 ${e.ativa ? "" : "opacity-60"}`}>
            <img src={e.imagemUrl} alt="" width={80} height={80} className="size-20 rounded-lg bg-asfalto object-contain" />
            <form action={atualizarEstampa} className="grid flex-1 gap-2">
              <p className="font-semibold">{e.nome}</p>
              <input type="hidden" name="id" value={e.id} />
              <select name="estilo" defaultValue={e.estilo} className="campo !min-h-9 !py-1 text-sm" aria-label="Estilo">
                {ESTILOS.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
              </select>
              <select name="ativa" defaultValue={e.ativa ? "sim" : "nao"} className="campo !min-h-9 !py-1 text-sm" aria-label="Visibilidade">
                <option value="sim">Ativa</option>
                <option value="nao">Inativa</option>
              </select>
              <button className="botao !min-h-9 text-sm">Guardar</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}

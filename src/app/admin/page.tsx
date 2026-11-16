import Link from "next/link";
import { CORES, PECAS } from "@/config/precos";
import { exigirAdmin } from "@/lib/auth";
import { ESTADOS_ENCOMENDA, dataCurta, type EstadoEncomenda } from "@/lib/estados";
import { formatarEuros } from "@/lib/precos";
import { supabaseServidor } from "@/lib/supabase/server";
import { mudarEstadoEncomenda } from "./acoes";

type Item = { quantidade: number; peca: keyof typeof PECAS; estampaNome: string; cor: string; tamanho: string; frente: string | null; costas: string | null; totalCents: number };
type Envio = { nome: string; morada?: { morada: string; codigoPostal: string; localidade: string } | null };

export default async function AdminEncomendas({ searchParams }: PageProps<"/admin">) {
  await exigirAdmin();
  const { estado } = await searchParams;
  const filtro = typeof estado === "string" && estado in ESTADOS_ENCOMENDA ? estado : null;
  const s = await supabaseServidor();
  let q = s!.from("encomendas").select("*").order("criado_em", { ascending: false }).limit(100);
  if (filtro) q = q.eq("estado", filtro);
  const { data } = await q;

  return (
    <section>
      <h1 className="titulo text-5xl">Encomendas</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className="opcao" aria-pressed={!filtro}>Todas</Link>
        {Object.entries(ESTADOS_ENCOMENDA).map(([k, v]) => (
          <Link key={k} href={`/admin?estado=${k}`} className="opcao" aria-pressed={filtro === k}>{v}</Link>
        ))}
      </div>
      <ul className="mt-6 grid gap-4">
        {(data ?? []).map((e) => {
          const envio = e.envio as Envio;
          return (
            <li key={e.id} className="cartao grid gap-4 p-5 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="text-lg font-semibold">N.º {e.numero} · {e.nome}</p>
                  <p className="text-lg font-semibold text-destaque">{formatarEuros(e.total_cents)}</p>
                </div>
                <p className="text-sm text-estrada">
                  {dataCurta(e.criado_em)} · {e.email}{e.telefone && ` · ${e.telefone}`} · portes {formatarEuros(e.portes_cents)}
                </p>
                <ul className="mt-3 grid gap-1 text-sm">
                  {(e.itens as Item[]).map((i, n) => (
                    <li key={n}>
                      {i.quantidade}x {PECAS[i.peca]} “{i.estampaNome}” · {CORES.find((c) => c.id === i.cor)?.nome ?? i.cor} {i.tamanho}
                      {i.frente && ` · frente ${i.frente}`}{i.costas && ` · costas ${i.costas}`} · {formatarEuros(i.totalCents)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-sm">
                  <strong>{envio.nome}</strong>
                  {envio.morada && ` · ${envio.morada.morada}, ${envio.morada.codigoPostal} ${envio.morada.localidade}`}
                </p>
              </div>
              <form action={mudarEstadoEncomenda} className="grid content-start gap-2">
                <input type="hidden" name="id" value={e.id} />
                <select name="estado" defaultValue={e.estado} className="campo" aria-label="Estado">
                  {Object.entries(ESTADOS_ENCOMENDA).map(([k, v]) => (
                    <option key={k} value={k} disabled={k === "paga" && e.estado === "pendente"}>{v}</option>
                  ))}
                </select>
                <textarea name="notas" defaultValue={e.notas_admin ?? ""} className="campo min-h-16 text-sm" placeholder="Notas internas" maxLength={2000} />
                <button className="botao !min-h-10">Atualizar</button>
                <p className="text-xs text-estrada">“Paga” só é marcado pela Stripe ({ESTADOS_ENCOMENDA[e.estado as EstadoEncomenda]}).</p>
              </form>
            </li>
          );
        })}
        {(data ?? []).length === 0 && <li className="text-estrada">Sem encomendas.</li>}
      </ul>
    </section>
  );
}

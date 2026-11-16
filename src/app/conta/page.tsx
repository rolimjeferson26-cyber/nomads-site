import type { Metadata } from "next";
import Link from "next/link";
import { PECAS } from "@/config/precos";
import { exigirUtilizador } from "@/lib/auth";
import { ESTADOS_ENCOMENDA, dataCurta, type EstadoEncomenda } from "@/lib/estados";
import { formatarEuros } from "@/lib/precos";
import { supabaseServidor } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "As minhas encomendas", robots: { index: false } };

const ORDEM: EstadoEncomenda[] = ["paga", "em_producao", "enviada", "entregue"];

export default async function Encomendas({ searchParams }: PageProps<"/conta">) {
  await exigirUtilizador();
  const sp = await searchParams;
  const supabase = await supabaseServidor();
  const { data } = (await supabase
    ?.from("encomendas")
    .select("id, numero, estado, total_cents, itens, criado_em")
    .order("criado_em", { ascending: false })
    .limit(50)) ?? { data: [] };
  const encomendas = data ?? [];

  return (
    <section>
      {sp["palavra-passe"] === "alterada" && (
        <p role="status" className="mb-6 rounded-xl bg-ok/15 p-3 text-sm text-ok">Palavra-passe alterada. Já tens sessão iniciada.</p>
      )}
      <h1 className="titulo text-5xl">Encomendas</h1>
      {encomendas.length === 0 ? (
        <p className="mt-6 text-estrada">
          Ainda não tens encomendas. <Link href="/loja" className="underline">Vai à loja</Link>.
        </p>
      ) : (
        <ul className="mt-6 grid gap-4">
          {encomendas.map((e) => {
            const estado = e.estado as EstadoEncomenda;
            const passo = ORDEM.indexOf(estado);
            return (
              <li key={e.id} className="cartao p-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-semibold">N.º {e.numero} · {dataCurta(e.criado_em)}</p>
                  <p className="font-semibold">{formatarEuros(e.total_cents)}</p>
                </div>
                <p className="mt-1 text-sm text-estrada">
                  {(e.itens as { quantidade: number; peca: keyof typeof PECAS; estampaNome: string }[])
                    .map((i) => `${i.quantidade}x ${PECAS[i.peca]} “${i.estampaNome}”`)
                    .join(", ")}
                </p>
                {estado === "pendente" || estado === "cancelada" ? (
                  <p className="mt-3 text-sm">{ESTADOS_ENCOMENDA[estado]}</p>
                ) : (
                  <ol className="mt-4 grid grid-cols-4 gap-1 text-center text-xs" aria-label={`Estado: ${ESTADOS_ENCOMENDA[estado]}`}>
                    {ORDEM.map((s, i) => (
                      <li key={s}>
                        <span className={`block h-1.5 rounded-full ${i <= passo ? "bg-destaque" : "bg-asfalto-3"}`} />
                        <span className={`mt-1 block ${i === passo ? "font-semibold text-marfim" : "text-estrada"}`}>{ESTADOS_ENCOMENDA[s]}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

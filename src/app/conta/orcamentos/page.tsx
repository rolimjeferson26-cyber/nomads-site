import type { Metadata } from "next";
import Link from "next/link";
import { PECAS } from "@/config/precos";
import { exigirUtilizador } from "@/lib/auth";
import { ESTADOS_ORCAMENTO, dataCurta, type EstadoOrcamento } from "@/lib/estados";
import { formatarEuros } from "@/lib/precos";
import { supabaseServidor } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Os meus orçamentos", robots: { index: false } };

export default async function Orcamentos() {
  await exigirUtilizador("/conta/orcamentos");
  const supabase = await supabaseServidor();
  const { data } = (await supabase
    ?.from("orcamentos")
    .select("id, numero, estado, peca, quantidade, ocasiao, estimativa_cents, criado_em")
    .order("criado_em", { ascending: false })
    .limit(50)) ?? { data: [] };
  const lista = data ?? [];
  return (
    <section>
      <h1 className="titulo text-5xl">Orçamentos</h1>
      {lista.length === 0 ? (
        <p className="mt-6 text-estrada">
          Sem pedidos de orçamento. <Link href="/orcamentos" className="underline">Fazer um pedido</Link>.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3">
          {lista.map((o) => (
            <li key={o.id} className="cartao flex flex-wrap items-center justify-between gap-2 p-5">
              <div>
                <p className="font-semibold">N.º {o.numero} · {o.quantidade}x {PECAS[o.peca as keyof typeof PECAS] ?? o.peca}</p>
                <p className="text-sm text-estrada">{o.ocasiao} · {dataCurta(o.criado_em)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{o.estimativa_cents !== null ? formatarEuros(o.estimativa_cents) : "Sob consulta"}</p>
                <p className="text-sm text-destaque">{ESTADOS_ORCAMENTO[o.estado as EstadoOrcamento]}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

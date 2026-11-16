import { DIMENSOES, PECAS, TECIDOS, type Dimensao } from "@/config/precos";
import { exigirAdmin } from "@/lib/auth";
import { ESTADOS_ORCAMENTO, dataCurta } from "@/lib/estados";
import { formatarEuros } from "@/lib/precos";
import { BUCKET_ARTES } from "@/lib/supabase/config";
import { supabaseServidor } from "@/lib/supabase/server";
import { mudarEstadoOrcamento } from "../acoes";

export default async function AdminOrcamentos() {
  await exigirAdmin();
  const s = (await supabaseServidor())!;
  const { data } = await s.from("orcamentos").select("*").order("criado_em", { ascending: false }).limit(100);
  const lista = data ?? [];
  // Links temporários (1 h) para as artes no bucket privado
  const links = new Map<string, string>();
  const caminhos = lista.map((o) => o.arte_path).filter(Boolean) as string[];
  if (caminhos.length) {
    const { data: urls } = await s.storage.from(BUCKET_ARTES).createSignedUrls(caminhos, 3600);
    urls?.forEach((u) => u.path && u.signedUrl && links.set(u.path, u.signedUrl));
  }
  const dim = (d: string | null) => (d ? DIMENSOES[d as Dimensao]?.nome ?? d : "—");

  return (
    <section>
      <h1 className="titulo text-5xl">Orçamentos</h1>
      <ul className="mt-6 grid gap-4">
        {lista.map((o) => {
          const tel = (o.telefone ?? "").replace(/\D/g, "");
          return (
            <li key={o.id} className="cartao grid gap-4 p-5 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="text-lg font-semibold">N.º {o.numero} · {o.nome}</p>
                  <p className="font-semibold text-destaque">{o.estimativa_cents !== null ? formatarEuros(o.estimativa_cents) : "Sob consulta"}</p>
                </div>
                <p className="text-sm text-estrada">{dataCurta(o.criado_em)} · {o.email}{o.telefone && ` · ${o.telefone}`}</p>
                <p className="mt-2 text-sm">
                  {o.quantidade}x {PECAS[o.peca as keyof typeof PECAS] ?? o.peca} · {TECIDOS[o.tecido as keyof typeof TECIDOS] ?? o.tecido} · frente {dim(o.frente)} · costas {dim(o.costas)} · {o.ocasiao}
                </p>
                {o.mensagem && <p className="mt-2 whitespace-pre-wrap rounded-xl bg-asfalto p-3 text-sm">{o.mensagem}</p>}
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  {o.arte_path && links.get(o.arte_path) && (
                    <a href={links.get(o.arte_path)} target="_blank" rel="noopener noreferrer" className="underline">Ver arte</a>
                  )}
                  <a href={`mailto:${o.email}?subject=${encodeURIComponent(`Orçamento NOMAD'S n.º ${o.numero}`)}`} className="underline">Responder por email</a>
                  {tel.length >= 9 && (
                    <a href={`https://wa.me/${tel.length === 9 ? `351${tel}` : tel}`} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp do cliente</a>
                  )}
                </div>
              </div>
              <form action={mudarEstadoOrcamento} className="grid content-start gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="estado" defaultValue={o.estado} className="campo" aria-label="Estado">
                  {Object.entries(ESTADOS_ORCAMENTO).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <textarea name="notas" defaultValue={o.notas_admin ?? ""} className="campo min-h-16 text-sm" placeholder="Notas internas" maxLength={2000} />
                <button className="botao !min-h-10">Atualizar</button>
              </form>
            </li>
          );
        })}
        {lista.length === 0 && <li className="text-estrada">Sem pedidos.</li>}
      </ul>
    </section>
  );
}

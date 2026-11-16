"use client";

import { useState, useTransition } from "react";
import { guardarTabelas } from "@/app/admin/acoes";
import { ZONAS, type TabelaPortes, type Zona } from "@/config/portes";
import { DIMENSOES, PECAS, TECIDOS, type Dimensao, type Peca, type RegraPreco, type TabelaPrecos, type Tecido } from "@/config/precos";

const euros = (c: number) => (c / 100).toFixed(2);
const cents = (v: string) => Math.max(0, Math.round(parseFloat(v.replace(",", ".")) * 100) || 0);

function CampoEuros({ valor, aoMudar, rotulo }: { valor: number; aoMudar: (c: number) => void; rotulo: string }) {
  const [texto, setTexto] = useState(euros(valor));
  return (
    <label className="flex items-center gap-1">
      <span className="sr-only">{rotulo}</span>
      <input
        className="campo !min-h-9 !w-24 !py-1 text-right"
        inputMode="decimal"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={() => {
          aoMudar(cents(texto));
          setTexto(euros(cents(texto)));
        }}
        aria-label={rotulo}
      />
      <span className="text-estrada">€</span>
    </label>
  );
}

export function EditorTabelas({ precosIniciais, portesIniciais }: { precosIniciais: TabelaPrecos; portesIniciais: TabelaPortes }) {
  const [regras, setRegras] = useState<RegraPreco[]>(precosIniciais.regras);
  const [portes, setPortes] = useState<TabelaPortes>(portesIniciais);
  const [msg, setMsg] = useState<{ ok: boolean; mensagem: string } | null>(null);
  const [aGuardar, iniciar] = useTransition();

  const mudarRegra = (i: number, r: Partial<RegraPreco>) => setRegras(regras.map((x, n) => (n === i ? { ...x, ...r } : x)));
  const dimOpcoes = [null, ...(Object.keys(DIMENSOES) as Dimensao[])];
  const mudarEscalao = (z: Zona, i: number, campo: "ateGramas" | "precoCents", valor: number) =>
    setPortes({ ...portes, ctt: { ...portes.ctt, [z]: portes.ctt[z].map((e, n) => (n === i ? { ...e, [campo]: valor } : e)) } });

  return (
    <div className="grid gap-8">
      <section className="cartao overflow-x-auto p-5">
        <h2 className="titulo text-3xl">Preços</h2>
        <p className="mt-1 text-sm text-estrada">Combinações que não estejam aqui aparecem como “Sob consulta”. Valores finais (isento de IVA).</p>
        <table className="mt-4 w-full min-w-[720px] text-sm">
          <thead className="text-left text-estrada">
            <tr><th className="p-2">Peça</th><th className="p-2">Tecido</th><th className="p-2">Frente</th><th className="p-2">Costas</th><th className="p-2">Descrição</th><th className="p-2">Preço</th><th /></tr>
          </thead>
          <tbody>
            {regras.map((r, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="p-2">
                  <select className="campo !min-h-9 !py-1" value={r.peca} onChange={(e) => mudarRegra(i, { peca: e.target.value as Peca })} aria-label="Peça">
                    {(Object.keys(PECAS) as Peca[]).map((p) => <option key={p} value={p}>{PECAS[p]}</option>)}
                  </select>
                </td>
                <td className="p-2">
                  <select className="campo !min-h-9 !py-1" value={r.tecido} onChange={(e) => mudarRegra(i, { tecido: e.target.value as Tecido })} aria-label="Tecido">
                    {(Object.keys(TECIDOS) as Tecido[]).map((t) => <option key={t} value={t}>{TECIDOS[t]}</option>)}
                  </select>
                </td>
                {(["frente", "costas"] as const).map((lado) => (
                  <td key={lado} className="p-2">
                    <select className="campo !min-h-9 !py-1" value={r[lado] ?? ""} onChange={(e) => mudarRegra(i, { [lado]: (e.target.value || null) as Dimensao | null })} aria-label={lado}>
                      {dimOpcoes.map((d) => <option key={d ?? "x"} value={d ?? ""}>{d ?? "—"}</option>)}
                    </select>
                  </td>
                ))}
                <td className="p-2"><input className="campo !min-h-9 !py-1" maxLength={80} value={r.descricao} onChange={(e) => mudarRegra(i, { descricao: e.target.value })} aria-label="Descrição" /></td>
                <td className="p-2"><CampoEuros valor={r.precoCents} aoMudar={(c) => mudarRegra(i, { precoCents: c })} rotulo="Preço" /></td>
                <td className="p-2"><button type="button" className="text-estrada underline hover:text-erro" onClick={() => setRegras(regras.filter((_, n) => n !== i))}>Remover</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          className="botao botao-linha mt-4 !min-h-10"
          onClick={() => setRegras([...regras, { peca: "tshirt", tecido: "algodao", frente: "10x10", costas: null, precoCents: 1400, descricao: "Nova combinação" }])}
        >
          + Combinação
        </button>
      </section>

      <section className="cartao p-5">
        <h2 className="titulo text-3xl">Portes</h2>
        <p className="mt-1 text-sm text-estrada">CTT Expresso Em 2 Dias, preço de balcão com IVA. Acima do último escalão: “portes a combinar”.</p>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {(Object.keys(ZONAS) as Zona[]).map((z) => (
            <div key={z}>
              <h3 className="font-semibold">{ZONAS[z]}</h3>
              <ul className="mt-2 grid gap-2">
                {portes.ctt[z].map((e, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    até
                    <input
                      className="campo !min-h-9 !w-20 !py-1 text-right"
                      inputMode="decimal"
                      defaultValue={e.ateGramas / 1000}
                      onBlur={(ev) => mudarEscalao(z, i, "ateGramas", Math.round(parseFloat(ev.target.value.replace(",", ".")) * 1000) || 1)}
                      aria-label={`Peso máximo do escalão ${i + 1} (kg)`}
                    />
                    kg
                    <CampoEuros valor={e.precoCents} aoMudar={(c) => mudarEscalao(z, i, "precoCents", c)} rotulo={`Preço do escalão ${i + 1}`} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(Object.keys(PECAS) as Peca[]).map((p) => (
            <label key={p} className="rotulo">
              Peso {PECAS[p]} (g)
              <input className="campo" type="number" min={1} value={portes.pesoPorPecaGramas[p]} onChange={(e) => setPortes({ ...portes, pesoPorPecaGramas: { ...portes.pesoPorPecaGramas, [p]: Math.max(1, Number(e.target.value)) } })} />
            </label>
          ))}
          <label className="rotulo">
            Embalagem (g)
            <input className="campo" type="number" min={0} value={portes.pesoEmbalagemGramas} onChange={(e) => setPortes({ ...portes, pesoEmbalagemGramas: Math.max(0, Number(e.target.value)) })} />
          </label>
          <div className="rotulo">
            Entrega na zona
            <CampoEuros valor={portes.entregaLocal.precoCents} aoMudar={(c) => setPortes({ ...portes, entregaLocal: { ...portes.entregaLocal, precoCents: c } })} rotulo="Preço da entrega na zona" />
          </div>
          <label className="rotulo sm:col-span-2">
            Códigos postais da entrega na zona (4 dígitos, separados por vírgula)
            <input
              className="campo"
              defaultValue={portes.entregaLocal.prefixosCodigoPostal.join(", ")}
              onBlur={(e) => setPortes({ ...portes, entregaLocal: { ...portes.entregaLocal, prefixosCodigoPostal: e.target.value.split(/[,\s]+/).filter((x) => /^\d{4}$/.test(x)) } })}
            />
          </label>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="botao"
          disabled={aGuardar}
          onClick={() => iniciar(async () => setMsg(await guardarTabelas({ precos: { regras }, portes })))}
        >
          {aGuardar ? "A guardar…" : "Guardar tabelas"}
        </button>
        {msg && <p role="status" className={msg.ok ? "text-ok" : "text-erro"}>{msg.mensagem}</p>}
      </div>
    </div>
  );
}

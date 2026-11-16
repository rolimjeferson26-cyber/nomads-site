"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Estampa } from "@/config/estampas";
import { ESTILOS } from "@/config/estilos";
import { PECAS, type Peca } from "@/config/precos";
import { formatarEuros } from "@/lib/precos";
import { linkWhatsApp } from "@/lib/whatsapp";
import { useEstilo } from "../EstiloProvider";
import { MockupPlano } from "../MockupPlano";

const CORES_MONTRA = ["#1b1b1d", "#f2f0ea", "#8f9094", "#d8c7a4", "#4b5a3a", "#1f2a44"];

export function GrelhaLoja({ estampas, desdeCents }: { estampas: Estampa[]; desdeCents: Record<Peca, number | null> }) {
  const { estilo, mudarEstilo } = useEstilo();
  const params = useSearchParams();
  const router = useRouter();
  const peca: Peca = params.get("peca") === "sweater" ? "sweater" : "tshirt";
  const [todos, setTodos] = useState(false);
  const lista = todos ? estampas : estampas.filter((e) => e.estilo === estilo.id);
  const desde = desdeCents[peca];

  return (
    <>
      <div className="sticky top-16 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b border-white/10 bg-asfalto/90 px-4 py-3 backdrop-blur md:top-20 md:mx-0 md:rounded-2xl md:border">
        <div className="flex rounded-full bg-asfalto-2 p-1" role="tablist" aria-label="Tipo de peça">
          {(Object.keys(PECAS) as Peca[]).map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={peca === p}
              onClick={() => router.replace(`/loja?peca=${p}`, { scroll: false })}
              className={`relative min-h-10 rounded-full px-5 font-semibold ${peca === p ? "text-asfalto" : ""}`}
            >
              {peca === p && <motion.span layoutId="peca-ativa" className="absolute inset-0 rounded-full bg-destaque" />}
              <span className="relative">{PECAS[p]}s</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Estilo">
          <button type="button" aria-pressed={todos} onClick={() => setTodos(true)} className="opcao !min-h-9 !rounded-full !py-1 text-sm">
            Todos
          </button>
          {ESTILOS.map((e) => (
            <button
              key={e.id}
              type="button"
              aria-pressed={!todos && estilo.id === e.id}
              onClick={() => {
                setTodos(false);
                mudarEstilo(e.id);
              }}
              className="opcao !min-h-9 !rounded-full !py-1 text-sm"
            >
              {e.nome}
            </button>
          ))}
        </div>
        <p className="ml-auto text-sm text-estrada">{lista.length} estampas</p>
      </div>

      <motion.ul layout className="mt-8 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {lista.map((e, i) => (
            <motion.li
              key={`${e.id}-${peca}`}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.04 }}
            >
              <Link
                href={`/configurador?estampa=${e.id}&peca=${peca}`}
                className="cartao group block overflow-hidden transition-colors hover:border-destaque"
              >
                <div className="relative aspect-square bg-[radial-gradient(circle_at_50%_40%,#2d261f,#1e1914_70%)] p-4">
                  <MockupPlano
                    peca={peca}
                    corHex={CORES_MONTRA[i % CORES_MONTRA.length]}
                    face="frente"
                    estampa={e}
                    frente="25x25"
                    costas={null}
                    className="h-full w-full transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-asfalto/80 px-2.5 py-1 text-xs font-semibold capitalize">
                    {ESTILOS.find((x) => x.id === e.estilo)?.nome ?? e.estilo}
                  </span>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-1 p-4">
                  <h2 className="font-semibold md:text-lg">{e.nome}</h2>
                  <p className="text-sm font-semibold text-destaque">{desde !== null ? `desde ${formatarEuros(desde)}` : "Sob consulta"}</p>
                </div>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {lista.length === 0 && <p className="mt-10 text-estrada">Ainda não há estampas neste estilo.</p>}

      {peca === "sweater" && (
        <div className="cartao mt-10 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="max-w-xl">Sweaters são feitas sob consulta: escolhe a estampa no configurador e pede o preço, ou fala connosco.</p>
          <a href={linkWhatsApp("Olá NOMAD'S! Queria um preço para sweaters estampadas.")} target="_blank" rel="noopener noreferrer" className="botao !bg-[#25D366] !text-white">
            Pedir preço no WhatsApp
          </a>
        </div>
      )}
    </>
  );
}

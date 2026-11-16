"use client";

import { motion } from "framer-motion";
import { ESTILOS } from "@/config/estilos";
import { useEstilo } from "./EstiloProvider";

// Botão sempre visível para trocar de estilo (filtra estampas e muda o tema).
export function SeletorEstilo() {
  const { estilo, mudarEstilo } = useEstilo();
  return (
    <div
      role="radiogroup"
      aria-label="Estilo do site"
      className="fixed bottom-3 left-1/2 z-50 flex max-w-[calc(100vw-1rem)] -translate-x-1/2 gap-0.5 overflow-x-auto rounded-full border border-white/10 bg-asfalto/85 p-1 shadow-2xl backdrop-blur-md md:bottom-6 md:left-6 md:max-w-none md:translate-x-0 md:gap-1"
    >
      {ESTILOS.map((e) => {
        const ativo = e.id === estilo.id;
        return (
          <button
            key={e.id}
            type="button"
            role="radio"
            aria-checked={ativo}
            onClick={() => mudarEstilo(e.id)}
            className="relative min-h-10 shrink-0 rounded-full px-[clamp(0.6rem,3vw,1rem)] text-sm font-semibold transition-colors"
            style={{ color: ativo ? "#14110e" : undefined }}
          >
            {ativo && (
              <motion.span
                layoutId="estilo-ativo"
                className="absolute inset-0 rounded-full"
                style={{ background: e.destaque }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{e.nome}</span>
          </button>
        );
      })}
    </div>
  );
}

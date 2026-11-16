"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FundoAnimado as TipoFundo } from "@/config/estilos";
import { useEstilo } from "./EstiloProvider";

// Curvas de nível (mapa topográfico) para o estilo Aventura.
function Topografia() {
  const aneis = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg className="fundo-topografia h-full w-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g fill="none" strokeWidth="1.4">
        {aneis.map((i) => {
          const r = 40 + i * 42;
          return (
            <path
              key={i}
              style={{ animationDelay: `${i * 0.5}s` }}
              d={`M${400 - r} 300 C ${400 - r} ${300 - r * 0.8}, ${400 + r * 0.6} ${300 - r * 1.05}, ${400 + r} ${300 - r * 0.2} S ${400 + r * 0.7} ${300 + r}, ${400 - r * 0.2} ${300 + r * 0.85} S ${400 - r} ${300 + r * 0.3}, ${400 - r} 300Z`}
            />
          );
        })}
      </g>
    </svg>
  );
}

const CLASSES: Record<Exclude<TipoFundo, "topografia">, string> = {
  velocidade: "fundo-velocidade",
  pixeis: "fundo-pixeis",
  pista: "fundo-pista",
};

export function FundoAnimado({ className = "" }: { className?: string }) {
  const { estilo } = useEstilo();
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <AnimatePresence mode="popLayout">
        <motion.div
          key={estilo.fundo}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {estilo.fundo === "topografia" ? (
            <Topografia />
          ) : (
            <div className={`h-full w-full ${CLASSES[estilo.fundo]}`} />
          )}
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,var(--color-asfalto)_85%)]" />
    </div>
  );
}

"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { COOKIE_ESTILO, getEstilo, type Estilo } from "@/config/estilos";

type Contexto = { estilo: Estilo; mudarEstilo: (id: string) => void };
const EstiloContexto = createContext<Contexto | null>(null);

export function useEstilo(): Contexto {
  const c = useContext(EstiloContexto);
  if (!c) throw new Error("useEstilo fora do EstiloProvider");
  return c;
}

export function EstiloProvider({ inicial, children }: { inicial: string; children: ReactNode }) {
  const [estilo, setEstilo] = useState<Estilo>(() => getEstilo(inicial));
  const [transicao, setTransicao] = useState<{ chave: number; cor: string } | null>(null);

  const mudarEstilo = useCallback((id: string) => {
    const novo = getEstilo(id);
    setEstilo((atual) => {
      if (atual.id === novo.id) return atual;
      setTransicao({ chave: Date.now(), cor: novo.destaque });
      return novo;
    });
    const html = document.documentElement;
    html.style.setProperty("--destaque", novo.destaque);
    html.style.setProperty("--destaque-2", novo.destaque2);
    html.dataset.estilo = novo.id;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "#14110e");
    document.cookie = `${COOKIE_ESTILO}=${novo.id}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <EstiloContexto value={{ estilo, mudarEstilo }}>
        {children}
        <AnimatePresence>
          {transicao && (
            <motion.div
              key={transicao.chave}
              aria-hidden
              className="pointer-events-none fixed inset-0 z-[60]"
              style={{ background: transicao.cor, transformOrigin: "left" }}
              initial={{ scaleX: 0, opacity: 0.9 }}
              animate={{ scaleX: [0, 1, 1], opacity: [0.9, 0.9, 0] }}
              transition={{ duration: 0.7, times: [0, 0.45, 1], ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() => setTransicao(null)}
            />
          )}
        </AnimatePresence>
      </EstiloContexto>
    </MotionConfig>
  );
}

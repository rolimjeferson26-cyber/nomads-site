"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LIMITE_GRUPO } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";
import { IconeWhatsApp } from "./Icones";

// Mostrado quando há mais de 10 peças: o preço é o da tabela, mas convidamos a rever valores.
export function AvisoGrupo({ quantidade, pedido }: { quantidade: number; pedido: string }) {
  return (
    <AnimatePresence>
      {quantidade > LIMITE_GRUPO && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="rounded-2xl border border-[#25D366]/50 bg-[#25D366]/10 p-4">
            <p className="font-semibold">Mais de {LIMITE_GRUPO} peças? Fala connosco no WhatsApp e revemos os valores.</p>
            <a
              href={linkWhatsApp(`Olá NOMAD'S! Tenho um pedido com mais de ${LIMITE_GRUPO} peças e queria rever os valores: ${pedido}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="botao mt-3 !min-h-11 !bg-[#25D366] !text-white"
            >
              <IconeWhatsApp className="size-5" /> Falar no WhatsApp
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

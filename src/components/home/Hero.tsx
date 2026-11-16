"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";
import type { Estampa } from "@/config/estampas";
import { SITE } from "@/config/site";
import { useEstilo } from "../EstiloProvider";
import { FundoAnimado } from "../FundoAnimado";
import { IconeBussola, IconeSeta } from "../Icones";
import { Emblema } from "../Emblema";

export function Hero({ estampas }: { estampas: Estampa[] }) {
  const { estilo } = useEstilo();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yTexto = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const yPeca = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const rodar = useTransform(scrollYProgress, [0, 1], [-6, 10]);
  const opacidade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const destaque = estampas.find((e) => e.estilo === estilo.id) ?? estampas[0];
  const palavras = estilo.hero.titulo.split(" ");

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pt-20">
      <FundoAnimado />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 md:px-8 lg:grid-cols-[1.25fr_1fr]">
        <motion.div style={{ y: yTexto, opacity: opacidade }}>
          <AnimatePresence mode="wait">
            <motion.div key={estilo.id} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}>
              <motion.p className="kicker" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                {estilo.hero.kicker}
              </motion.p>
              <h1 className="titulo mt-4 text-[clamp(3.6rem,13vw,9.5rem)]">
                {palavras.map((p, i) => (
                  <span key={i} className="inline-block overflow-hidden pr-[0.18em] align-bottom">
                    <motion.span
                      className={`inline-block ${i === palavras.length - 1 ? "text-destaque" : ""}`}
                      initial={{ y: "105%" }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {p}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.p
                className="mt-6 max-w-xl text-lg text-marfim/85 md:text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {estilo.hero.texto}
              </motion.p>
            </motion.div>
          </AnimatePresence>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/configurador" className="botao text-lg">
              Criar a minha peça <IconeSeta className="size-5" />
            </Link>
            <Link href="/orcamentos" className="botao botao-linha text-lg">
              Pedir orçamento
            </Link>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-estrada">
            <li>✦ Desde 1 peça</li>
            <li>✦ Entrega até {SITE.prazoEntregaDias} dias</li>
            <li>✦ T-shirt desde 14 €</li>
          </ul>
        </motion.div>

        <motion.div style={{ y: yPeca, rotate: rodar }} className="relative mx-auto w-full max-w-[26rem]">
          <div className="absolute inset-[10%] rounded-full bg-destaque/30 blur-3xl transition-colors duration-700" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Emblema className="w-full drop-shadow-[0_40px_60px_rgba(0,0,0,.7)]" />
          </motion.div>
          {destaque && (
            <Link
              href={`/configurador?estampa=${destaque.id}`}
              className="absolute -bottom-4 -left-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-asfalto/85 p-2 pr-4 backdrop-blur md:-left-10"
            >
              <img src={destaque.imagemUrl} alt="" width={56} height={56} className="size-14 object-contain" />
              <span className="text-sm">
                <span className="block text-estrada">Estampa {estilo.nome}</span>
                <span className="font-semibold">{destaque.nome} <IconeBussola className="inline size-4 text-destaque" /></span>
              </span>
            </Link>
          )}
        </motion.div>
      </div>
      <motion.div
        aria-hidden
        className="absolute bottom-24 left-1/2 hidden h-12 w-7 -translate-x-1/2 rounded-full border-2 border-marfim/40 md:block"
      >
        <motion.span
          className="absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded bg-destaque"
          animate={{ y: [0, 14, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}

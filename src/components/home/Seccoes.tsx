"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { Estampa } from "@/config/estampas";
import { ESTILOS } from "@/config/estilos";
import { LIMITE_GRUPO, SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";
import { OCASIOES } from "@/lib/validacao";
import { useEstilo } from "../EstiloProvider";
import { IconeSeta, IconeWhatsApp } from "../Icones";
import { MockupPlano } from "../MockupPlano";
import { Revelar } from "../Revelar";

export function FaixaMovimento() {
  const itens = ["Estampagem DTF", "Desde 1 peça", `Pronto em ${SITE.prazoEntregaDias} dias`, "Cores que aguentam lavagens", "Murtosa · Aveiro", "Envios para todo o país"];
  const linha = [...itens, ...itens];
  return (
    <div className="relative -rotate-2 overflow-hidden border-y border-black/20 bg-destaque py-4 text-asfalto transition-colors duration-700">
      <div className="faixa-movimento flex w-max gap-10 whitespace-nowrap">
        {linha.map((t, i) => (
          <span key={i} className="titulo flex items-center gap-10 text-3xl md:text-4xl">
            {t} <span aria-hidden>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const CORES_PECA = ["#1b1b1d", "#f2f0ea", "#4b5a3a", "#1f2a44"];

export function Estilos({ estampas }: { estampas: Estampa[] }) {
  const { estilo: ativo, mudarEstilo } = useEstilo();
  const router = useRouter();
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
      <Revelar>
        <p className="kicker">Escolhe o teu caminho</p>
        <h2 className="titulo mt-3 text-6xl md:text-8xl">Quatro estilos.<br />Uma oficina.</h2>
      </Revelar>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ESTILOS.map((e, i) => {
          const amostra = estampas.find((x) => x.estilo === e.id);
          return (
            <Revelar key={e.id} atraso={i * 0.08}>
              <button
                type="button"
                onClick={() => {
                  mudarEstilo(e.id);
                  router.push("/loja");
                }}
                className="group relative block aspect-[3/4] w-full overflow-hidden rounded-3xl text-left"
                style={{ background: `linear-gradient(160deg, ${e.destaque}, #14110e 75%)` }}
              >
                <div className="absolute inset-x-6 top-10 transition-transform duration-500 ease-[var(--ease-estrada)] group-hover:-translate-y-3 group-hover:rotate-3">
                  <MockupPlano peca="tshirt" corHex={CORES_PECA[i % CORES_PECA.length]} face="frente" estampa={amostra} frente="25x25" costas={null} className="w-full drop-shadow-2xl" />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                  <span className="titulo text-5xl">{e.nome}</span>
                  <span className={`grid size-12 place-items-center rounded-full transition-transform group-hover:translate-x-1 ${ativo.id === e.id ? "bg-marfim text-asfalto" : "bg-asfalto/60"}`}>
                    <IconeSeta className="size-5" />
                  </span>
                </div>
              </button>
            </Revelar>
          );
        })}
      </div>
    </section>
  );
}

export function Destaques({ estampas }: { estampas: Estampa[] }) {
  const { estilo } = useEstilo();
  const lista = estampas.filter((e) => e.estilo === estilo.id).slice(0, 3);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Revelar>
          <p className="kicker">Estampas {estilo.nome}</p>
          <h2 className="titulo mt-3 text-5xl md:text-7xl">Prontas a vestir</h2>
        </Revelar>
        <Link href="/loja" className="botao botao-linha">Ver a loja toda</Link>
      </div>
      <motion.ul layout className="mt-10 grid gap-4 md:grid-cols-3">
        {lista.map((e, i) => (
          <motion.li key={e.id} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Link href={`/configurador?estampa=${e.id}`} className="cartao group block overflow-hidden p-6 transition-colors hover:border-destaque">
              <MockupPlano peca="tshirt" corHex="#f2f0ea" face="frente" estampa={e} frente="25x25" costas={null} className="mx-auto w-4/5 transition-transform duration-500 group-hover:scale-105" />
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-semibold">{e.nome}</span>
                <span className="text-destaque">desde 14 €</span>
              </div>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}

export function BlocoOrcamentos() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"]);
  return (
    <section ref={ref} className="relative overflow-hidden bg-marfim py-24 text-asfalto md:py-32">
      <motion.p aria-hidden style={{ x }} className="titulo pointer-events-none absolute -top-4 whitespace-nowrap text-[18vw] text-asfalto/[0.06]">
        Empresas · Festas · Formaturas ·
      </motion.p>
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
        <Revelar>
          <p className="kicker">Orçamentos para grupos</p>
          <h2 className="titulo mt-3 text-6xl md:text-8xl">Para a equipa toda.</h2>
          <p className="mt-6 max-w-xl text-lg text-asfalto/75">
            Fardamento para empresas, t-shirts de festa, formaturas, despedidas, eventos e associações.
            Em quatro passos recebes um pré-orçamento na hora.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/orcamentos" className="botao text-lg">Fazer orçamento <IconeSeta className="size-5" /></Link>
            <a
              href={linkWhatsApp(`Olá NOMAD'S! Precisamos de mais de ${LIMITE_GRUPO} peças estampadas. Podemos falar sobre valores?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="botao text-lg !bg-[#25D366] !text-white"
            >
              <IconeWhatsApp className="size-5" /> WhatsApp
            </a>
          </div>
          <p className="mt-6 inline-block -rotate-1 rounded-xl bg-asfalto px-5 py-3 text-lg font-semibold text-marfim">
            Mais de {LIMITE_GRUPO} peças? Fala connosco no WhatsApp e revemos os valores.
          </p>
        </Revelar>
        <Revelar atraso={0.15}>
          <ul className="flex flex-wrap gap-2">
            {OCASIOES.filter((o) => o !== "Outra").map((o, i) => (
              <motion.li
                key={o}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
              >
                <Link href="/orcamentos" className="block rounded-full border-2 border-asfalto px-5 py-3 font-semibold transition-colors hover:bg-asfalto hover:text-marfim">
                  {o}
                </Link>
              </motion.li>
            ))}
          </ul>
        </Revelar>
      </div>
    </section>
  );
}

const PASSOS = [
  { t: "Escolhes", d: "Uma estampa da loja, a tua arte ou só a ideia." },
  { t: "Vês em 3D", d: "Peça, cor, tamanho e posição, com o preço na hora." },
  { t: "Estampamos", d: "Impressão DTF e prensa, peça a peça, na Murtosa." },
  { t: "Vai contigo", d: `Levantas, entregamos na zona ou enviamos por CTT. Até ${SITE.prazoEntregaDias} dias.` },
];

export function ComoFunciona() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  return (
    <section ref={ref} className="mx-auto max-w-7xl px-4 py-24 md:px-8 md:py-32">
      <Revelar>
        <p className="kicker">A rota</p>
        <h2 className="titulo mt-3 text-6xl md:text-8xl">Da ideia à estrada</h2>
      </Revelar>
      <div className="relative mt-14">
        <svg className="absolute left-5 top-0 h-full w-4 md:left-0 md:top-7 md:h-4 md:w-full" preserveAspectRatio="none" viewBox="0 0 100 100" aria-hidden>
          <motion.line
            x1="50" y1="0" x2="50" y2="100"
            className="md:hidden"
            stroke="var(--destaque)" strokeWidth="6" strokeDasharray="6 6"
            style={{ pathLength: scrollYProgress }}
          />
          <motion.line
            x1="0" y1="50" x2="100" y2="50"
            className="hidden md:block"
            stroke="var(--destaque)" strokeWidth="6" strokeDasharray="2 2"
            style={{ pathLength: scrollYProgress }}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
          {PASSOS.map((p, i) => (
            <Revelar key={p.t} atraso={i * 0.12} className="relative pl-16 md:pl-0 md:pt-20">
              <li>
                <span className="titulo absolute left-0 top-0 grid size-14 place-items-center rounded-full border-2 border-destaque bg-asfalto text-2xl text-destaque">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="titulo text-4xl">{p.t}</h3>
                <p className="mt-2 text-estrada">{p.d}</p>
              </li>
            </Revelar>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Trabalhos() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
      <Revelar>
        <p className="kicker">Da prensa para a rua</p>
        <h2 className="titulo mt-3 text-5xl md:text-7xl">Trabalhos recentes</h2>
      </Revelar>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {[
          { src: "/video/decir.mp4", poster: "/video/decir-poster.jpg", legenda: "DECIR 2026 · t-shirts para equipa de combate a incêndios rurais" },
          { src: "/video/skyline.mp4", poster: "/video/skyline-poster.jpg", legenda: "Skyline · estampa a cores sobre t-shirt preta" },
        ].map((v, i) => (
          <Revelar key={v.src} atraso={i * 0.1}>
            <figure className="overflow-hidden rounded-3xl">
              <video className="aspect-video w-full object-cover" src={v.src} poster={v.poster} muted loop playsInline autoPlay preload="none" />
              <figcaption className="bg-asfalto-2 px-5 py-4 text-sm text-estrada">{v.legenda}</figcaption>
            </figure>
          </Revelar>
        ))}
      </div>
    </section>
  );
}

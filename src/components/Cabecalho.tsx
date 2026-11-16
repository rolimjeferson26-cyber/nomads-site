"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCarrinho } from "@/lib/carrinho";
import { IconeCarrinho, IconeConta, IconeFechar, IconeMenu } from "./Icones";

export const NAVEGACAO = [
  { href: "/loja", rotulo: "Loja" },
  { href: "/configurador", rotulo: "Configurador" },
  { href: "/orcamentos", rotulo: "Orçamentos", destaque: true },
  { href: "/sobre", rotulo: "Sobre" },
  { href: "/contactos", rotulo: "Contactos" },
];

export function Cabecalho() {
  const [aberto, setAberto] = useState(false);
  const [escondido, setEscondido] = useState(false);
  const [solido, setSolido] = useState(false);
  const caminho = usePathname();
  const linhas = useCarrinho();
  const total = linhas.reduce((s, l) => s + l.quantidade, 0);
  const { scrollY } = useScroll();

  // Esconde ao descer, mostra ao subir (como nos sites de desporto).
  useMotionValueEvent(scrollY, "change", (y) => {
    const anterior = scrollY.getPrevious() ?? 0;
    setEscondido(y > anterior && y > 160 && !aberto);
    setSolido(y > 24);
  });

  useEffect(() => setAberto(false), [caminho]);
  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
  }, [aberto]);

  return (
    <motion.header
      animate={{ y: escondido ? "-100%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300 ${solido || aberto ? "bg-asfalto/90 backdrop-blur-md" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:h-20 md:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="Página inicial">
          <img src="/img/logo-texto.webp" alt="NOMAD'S" width={1200} height={330} className="h-9 w-auto md:h-11" />
        </Link>

        <nav aria-label="Principal" className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
          {NAVEGACAO.map((n) => {
            const ativo = caminho.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={ativo ? "page" : undefined}
                className={`relative rounded-full px-4 py-2 font-semibold transition-colors ${
                  n.destaque ? "text-destaque hover:text-destaque-2" : "hover:text-destaque"
                }`}
              >
                {n.rotulo}
                {ativo && <motion.span layoutId="nav-ativo" className="absolute inset-x-4 -bottom-0.5 h-0.5 bg-destaque" />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/orcamentos" className="botao hidden !min-h-10 !px-4 text-sm md:inline-flex lg:hidden xl:inline-flex">
            Pedir orçamento
          </Link>
          <Link href="/conta" className="grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label="Área de cliente">
            <IconeConta className="size-6" />
          </Link>
          <Link href="/carrinho" className="relative grid size-11 place-items-center rounded-full hover:bg-white/10" aria-label={`Carrinho, ${total} peças`}>
            <IconeCarrinho className="size-6" />
            <AnimatePresence>
              {total > 0 && (
                <motion.span
                  key={total}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute right-0.5 top-0.5 grid min-w-5 place-items-center rounded-full bg-destaque px-1 text-xs font-bold text-asfalto"
                >
                  {total}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full hover:bg-white/10 lg:hidden"
            aria-expanded={aberto}
            aria-controls="menu-movel"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
            onClick={() => setAberto((a) => !a)}
          >
            {aberto ? <IconeFechar className="size-6" /> : <IconeMenu className="size-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {aberto && (
          <motion.nav
            id="menu-movel"
            aria-label="Menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-asfalto lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 pt-6">
              {NAVEGACAO.map((n, i) => (
                <motion.li key={n.href} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 * i }}>
                  <Link href={n.href} className={`titulo block py-2 text-5xl ${n.destaque ? "text-destaque" : ""}`}>
                    {n.rotulo}
                  </Link>
                </motion.li>
              ))}
              <li className="mt-6 flex gap-3">
                <Link href="/conta" className="botao botao-linha">Área de cliente</Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

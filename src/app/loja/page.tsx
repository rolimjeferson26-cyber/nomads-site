import type { Metadata } from "next";
import { Suspense } from "react";
import { GrelhaLoja } from "@/components/loja/GrelhaLoja";
import type { Peca } from "@/config/precos";
import { SITE } from "@/config/site";
import { obterEstampas, obterTabelaPrecos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Loja",
  description: "T-shirts e sweaters com estampas Aventura, Anime, Jogos e Racing. Estampagem DTF desde uma peça.",
};

export default async function PaginaLoja() {
  const [estampas, tabela] = await Promise.all([obterEstampas(), obterTabelaPrecos()]);
  const desde = (p: Peca) => {
    const precos = tabela.regras.filter((r) => r.peca === p).map((r) => r.precoCents);
    return precos.length ? Math.min(...precos) : null;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 md:px-8 md:pt-32">
      <header className="mb-8">
        <p className="kicker">Loja NOMAD&apos;S</p>
        <h1 className="titulo mt-2 text-6xl md:text-8xl">Escolhe a estampa</h1>
        <p className="mt-4 max-w-2xl text-estrada">
          Clica numa estampa para a pôr na peça em 3D, escolher cor, tamanho e posição. Preços finais, isentos de IVA.
          Prontas em até {SITE.prazoEntregaDias} dias.
        </p>
      </header>
      <Suspense>
        <GrelhaLoja estampas={estampas} desdeCents={{ tshirt: desde("tshirt"), sweater: desde("sweater") }} />
      </Suspense>
    </div>
  );
}

import type { Metadata } from "next";
import { Configurador } from "@/components/configurador/Configurador";
import { PECAS, type Peca } from "@/config/precos";
import { obterEstampas, obterTabelaPrecos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Configurador 3D",
  description: "Escolhe a estampa, a peça, a cor e o tamanho, e vê a tua t-shirt ou sweater em 3D com o preço ao vivo.",
};

export default async function PaginaConfigurador({ searchParams }: PageProps<"/configurador">) {
  const sp = await searchParams;
  const [estampas, tabela] = await Promise.all([obterEstampas(), obterTabelaPrecos()]);
  const estampaId = typeof sp.estampa === "string" ? sp.estampa : undefined;
  const peca = typeof sp.peca === "string" && sp.peca in PECAS ? (sp.peca as Peca) : undefined;

  return (
    <div className="pb-16 pt-20 md:pt-24">
      <header className="mx-auto mb-6 max-w-[1500px] px-4 lg:px-8">
        <p className="kicker">Configurador 3D</p>
        <h1 className="titulo mt-2 text-5xl md:text-7xl">Monta a tua peça</h1>
      </header>
      <Configurador estampas={estampas} tabela={tabela} inicial={{ estampaId, peca }} />
    </div>
  );
}

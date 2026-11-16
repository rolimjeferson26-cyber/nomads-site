import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { BlocoOrcamentos, ComoFunciona, Destaques, Estilos, FaixaMovimento, Trabalhos } from "@/components/home/Seccoes";
import { Revelar } from "@/components/Revelar";
import { obterEstampas } from "@/lib/dados";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Inicio() {
  const estampas = await obterEstampas();
  return (
    <>
      <Hero estampas={estampas} />
      <FaixaMovimento />
      <Estilos estampas={estampas} />
      <Destaques estampas={estampas} />
      <BlocoOrcamentos />
      <ComoFunciona />
      <Trabalhos />
      <section className="mx-auto max-w-7xl px-4 md:px-8">
        <Revelar className="cartao relative overflow-hidden p-10 text-center md:p-16">
          <h2 className="titulo text-5xl md:text-7xl">Pronto para a estrada?</h2>
          <p className="mx-auto mt-4 max-w-lg text-estrada">Monta a tua peça em 3D ou pede um orçamento para o grupo. Respondemos depressa.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/configurador" className="botao">Abrir o configurador</Link>
            <Link href="/orcamentos" className="botao botao-linha">Pedir orçamento</Link>
          </div>
        </Revelar>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Emblema } from "@/components/Emblema";
import { Revelar } from "@/components/Revelar";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  alternates: { canonical: "/sobre" },
  title: "Sobre",
  description: "A NOMAD'S é uma estamparia DTF na Murtosa, Aveiro. Marca própria e peças personalizadas desde uma unidade.",
};

const VALORES = [
  { t: "Sem mínimos", d: "Uma peça ou cem: o preço por peça é justo nas duas." },
  { t: "Cor que dura", d: "Impressão DTF com degradês e traço fino, flexível e resistente às lavagens." },
  { t: "Feito à mão", d: "Cada peça é prensada e verificada na nossa oficina, uma a uma." },
  { t: "Perto de ti", d: "Levantamento na Murtosa ou envio CTT para todo o país." },
];

export default function Sobre() {
  return (
    <div className="pb-16 pt-24 md:pt-32">
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 md:px-8 lg:grid-cols-[1.3fr_1fr]">
        <Revelar>
          <p className="kicker">Sobre nós</p>
          <h1 className="titulo mt-3 text-6xl md:text-8xl">Nascemos na estrada</h1>
          <div className="mt-6 grid gap-4 text-lg text-marfim/85">
            <p>
              A NOMAD&apos;S é uma pequena estamparia na {SITE.localidade}, entre a ria, o mar e a serra. Começámos por fazer
              as nossas próprias t-shirts para quem vive em movimento, e hoje estampamos também as ideias de quem nos procura.
            </p>
            <p>
              Trabalhamos com DTF (direct to film): imprimimos a arte num filme e prensamo-la na peça. O resultado são cores
              vivas, detalhe fino e uma estampa flexível que acompanha o tecido.
            </p>
            <p>Do presente para uma pessoa ao fardamento de uma empresa inteira, cada peça sai da oficina em até {SITE.prazoEntregaDias} dias.</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/configurador" className="botao">Criar a minha peça</Link>
            <Link href="/contactos" className="botao botao-linha">Visitar a oficina</Link>
          </div>
        </Revelar>
        <Revelar atraso={0.15} className="mx-auto w-full max-w-sm">
          <Emblema className="w-full" />
        </Revelar>
      </section>
      <section className="mx-auto mt-24 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {VALORES.map((v, i) => (
          <Revelar key={v.t} atraso={i * 0.08} className="cartao p-6">
            <h2 className="titulo text-3xl text-destaque">{v.t}</h2>
            <p className="mt-2 text-estrada">{v.d}</p>
          </Revelar>
        ))}
      </section>
    </div>
  );
}

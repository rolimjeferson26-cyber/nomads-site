import type { Metadata } from "next";
import { Assistente } from "@/components/orcamentos/Assistente";
import { obterTabelaPrecos } from "@/lib/dados";

export const metadata: Metadata = {
  title: "Orçamentos",
  description: "Pré-orçamento na hora para t-shirts e sweaters estampadas: empresas, festas, formaturas, equipas e associações.",
};

export default async function PaginaOrcamentos() {
  const tabela = await obterTabelaPrecos();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 md:px-8 md:pt-32">
      <header className="mb-8 max-w-3xl">
        <p className="kicker">Empresas · Festas · Formaturas · Equipas</p>
        <h1 className="titulo mt-2 text-6xl md:text-8xl">Orçamento em 5 passos</h1>
        <p className="mt-4 text-estrada">Escolhe a peça, o tecido e onde vai a estampa. O preço estimado atualiza enquanto escolhes.</p>
      </header>
      <Assistente tabela={tabela} />
    </div>
  );
}

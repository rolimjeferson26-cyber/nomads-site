import type { Metadata } from "next";
import { CarrinhoCheckout } from "@/components/loja/CarrinhoCheckout";
import { utilizadorAtual } from "@/lib/auth";
import { obterEstampas, obterTabelaPortes, obterTabelaPrecos } from "@/lib/dados";
import { segredo } from "@/lib/env";

export const metadata: Metadata = { title: "Carrinho", robots: { index: false } };

export default async function PaginaCarrinho({ searchParams }: PageProps<"/carrinho">) {
  const sp = await searchParams;
  const [estampas, tabelaPrecos, tabelaPortes, utilizador] = await Promise.all([
    obterEstampas(),
    obterTabelaPrecos(),
    obterTabelaPortes(),
    utilizadorAtual(),
  ]);
  const pagamentosAtivos = Boolean(segredo("STRIPE_SECRET_KEY") && segredo("SUPABASE_SECRET_KEY"));

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 md:px-8 md:pt-32">
      <h1 className="titulo mb-8 text-6xl md:text-7xl">Carrinho</h1>
      {sp.cancelado && (
        <p className="mb-6 rounded-xl bg-asfalto-2 p-4 text-estrada">O pagamento foi cancelado. O teu carrinho continua aqui.</p>
      )}
      <CarrinhoCheckout
        estampas={estampas}
        tabelaPrecos={tabelaPrecos}
        tabelaPortes={tabelaPortes}
        emailInicial={utilizador?.email ?? ""}
        pagamentosAtivos={pagamentosAtivos}
      />
    </div>
  );
}

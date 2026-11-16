import type { Metadata } from "next";
import Link from "next/link";
import { LimparCarrinho } from "@/components/loja/LimparCarrinho";
import { SITE } from "@/config/site";

export const metadata: Metadata = { title: "Encomenda recebida", robots: { index: false } };

// Esta página NÃO marca nada como pago: só o webhook da Stripe (assinatura verificada) o faz.
export default async function Sucesso({ searchParams }: PageProps<"/encomenda/sucesso">) {
  const { n } = await searchParams;
  const numero = typeof n === "string" && /^\d{1,12}$/.test(n) ? n : null;
  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-32 text-center">
      <LimparCarrinho />
      <p className="kicker">Obrigado!</p>
      <h1 className="titulo mt-3 text-6xl md:text-8xl">Já vai a caminho da prensa</h1>
      <p className="mt-6 text-lg text-estrada">
        {numero && <>Encomenda n.º {numero}. </>}Assim que o pagamento for confirmado recebes um email da Stripe com o
        recibo. Começamos a produção e entregamos em até {SITE.prazoEntregaDias} dias.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/conta" className="botao">Ver as minhas encomendas</Link>
        <Link href="/loja" className="botao botao-linha">Continuar na loja</Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLegal } from "@/components/PaginaLegal";
import { SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  alternates: { canonical: "/legal/termos" }, title: "Termos e Condições" };

export default function Termos() {
  return (
    <PaginaLegal titulo="Termos e Condições" atualizado="18 de novembro de 2026">
      <h2>1. Quem somos</h2>
      <p>
        Este site é explorado por {SITE.nomeLegal}, {SITE.formaJuridica}, NIF {SITE.nif}, com oficina em {SITE.morada}
        (“NOMAD&apos;S”). Contacto: WhatsApp{" "}
        <a href={linkWhatsApp("Olá NOMAD'S!")} target="_blank" rel="noopener noreferrer">
          {SITE.telefoneVisivel}
        </a>
        .
      </p>
      <h2>2. Produtos e personalização</h2>
      <p>
        Vendemos t-shirts e sweaters estampadas por DTF. As pré-visualizações (3D e 2D) são indicativas: podem existir
        pequenas diferenças de cor, posição e tamanho entre o ecrã e a peça final.
      </p>
      <p>
        Quando envias uma arte tua, garantes que tens o direito de a usar. Recusamos estampar conteúdos que violem direitos
        de autor, marcas registadas, a lei ou que sejam ofensivos.
      </p>
      <h2>3. Preços e pagamento</h2>
      <p>
        Os preços apresentados são finais, em euros, isentos de IVA ao abrigo do artigo 53.º do CIVA. Os portes são indicados
        antes do pagamento e correspondem ao preço de balcão CTT com IVA incluído. Combinações marcadas “Sob consulta” são
        orçamentadas à parte.
      </p>
      <p>
        O pagamento é feito na página segura da Stripe. Não guardamos nem temos acesso aos dados do teu cartão. A encomenda
        só é considerada paga quando a Stripe confirma o pagamento.
      </p>
      <h2>4. Prazos e entrega</h2>
      <p>
        Produzimos e entregamos no prazo máximo de {SITE.prazoEntregaDias} dias após a confirmação do pagamento. Podes levantar
        na oficina (grátis), pedir entrega na zona ou envio por CTT para Portugal continental e ilhas. Encomendas acima de
        10 kg têm portes a combinar.
      </p>
      <h2>5. Direito de livre resolução</h2>
      <p>
        <strong>
          Os artigos são confecionados segundo as especificações do cliente e claramente personalizados, pelo que não têm
          direito de livre resolução
        </strong>{" "}
        (alínea c) do n.º 1 do artigo 17.º do Decreto-Lei n.º 24/2014). Antes de pagar, confirma peça, cor, tamanho e posição.
      </p>
      <h2>6. Garantia e defeitos</h2>
      <p>
        Os bens têm a garantia legal de conformidade (Decreto-Lei n.º 84/2021). Se a peça chegar com defeito de fabrico ou
        de estampagem, contacta-nos com fotografias nos 30 dias seguintes à entrega: substituímos a peça ou devolvemos o valor.
      </p>
      <h2>7. Conta de cliente</h2>
      <p>És responsável por manter a palavra-passe segura. Podes eliminar a conta a qualquer momento na Área de Cliente.</p>
      <h2>8. Reclamações e litígios</h2>
      <p>
        Podes reclamar no <a href={SITE.livroReclamacoes} target="_blank" rel="noopener noreferrer">Livro de Reclamações Eletrónico</a>.
        Em caso de litígio de consumo, podes recorrer à entidade de resolução alternativa de litígios (Lei n.º 144/2015){" "}
        {SITE.ral.nome} (<a href={SITE.ral.url} target="_blank" rel="noopener noreferrer">{SITE.ral.site}</a>). Mais informação em{" "}
        <a href="https://www.consumidor.gov.pt" target="_blank" rel="noopener noreferrer">consumidor.gov.pt</a>.
      </p>
      <h2>9. Lei aplicável</h2>
      <p>Aplica-se a lei portuguesa. Ver também a <Link href="/legal/privacidade">Política de Privacidade</Link>.</p>
    </PaginaLegal>
  );
}

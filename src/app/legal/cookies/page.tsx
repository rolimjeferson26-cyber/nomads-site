import type { Metadata } from "next";
import { PaginaLegal } from "@/components/PaginaLegal";
import { COOKIE_ESTILO } from "@/config/estilos";

export const metadata: Metadata = { title: "Política de Cookies" };

export default function Cookies() {
  return (
    <PaginaLegal titulo="Política de Cookies" atualizado="16 de novembro de 2026">
      <p>
        Este site usa apenas cookies e armazenamento local <strong>estritamente necessários</strong> ao seu funcionamento.
        Não usamos cookies de publicidade, estatística de terceiros ou redes sociais, por isso não pedimos consentimento.
      </p>
      <h2>O que guardamos</h2>
      <ul>
        <li><strong>sb-…-auth-token</strong> (cookie): mantém a sessão iniciada na Área de Cliente. Dura enquanto a sessão estiver ativa.</li>
        <li><strong>{COOKIE_ESTILO}</strong> (cookie): lembra o estilo escolhido (Aventura, Anime, Jogos ou Racing). 1 ano.</li>
        <li><strong>nomads-carrinho-v1</strong> (armazenamento local do browser): guarda o carrinho. Não sai do teu dispositivo até pagares.</li>
      </ul>
      <h2>Serviços externos</h2>
      <p>
        Ao pagar, és enviado para a página da Stripe, que usa os seus próprios cookies para segurança e prevenção de fraude.
        Os links para WhatsApp, Instagram e Facebook levam a esses serviços, que têm as suas próprias políticas.
      </p>
      <h2>Como apagar</h2>
      <p>Podes apagar cookies e armazenamento local nas definições do teu browser. Se o fizeres, a sessão e o carrinho são perdidos.</p>
    </PaginaLegal>
  );
}

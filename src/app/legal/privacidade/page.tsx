import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLegal } from "@/components/PaginaLegal";
import { SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

export const metadata: Metadata = {
  alternates: { canonical: "/legal/privacidade" }, title: "Política de Privacidade" };

export default function Privacidade() {
  return (
    <PaginaLegal titulo="Política de Privacidade" atualizado="18 de novembro de 2026">
      <h2>Responsável pelo tratamento</h2>
      <p>
        {SITE.nomeLegal} ({SITE.formaJuridica}), NIF {SITE.nif}, {SITE.morada}. Para qualquer questão sobre os teus
        dados: WhatsApp{" "}
        <a href={linkWhatsApp("Olá NOMAD'S! Tenho uma questão sobre os meus dados.")} target="_blank" rel="noopener noreferrer">
          {SITE.telefoneVisivel}
        </a>
        .
      </p>
      <h2>Que dados tratamos e porquê</h2>
      <ul>
        <li><strong>Encomendas:</strong> nome, email, telefone, morada e peças compradas, para executar o contrato (art. 6.º, n.º 1, b) RGPD).</li>
        <li><strong>Pedidos de orçamento e contactos:</strong> nome, email, telefone, mensagem e arte enviada, para responder ao pedido (diligências pré-contratuais).</li>
        <li><strong>Conta de cliente:</strong> email, nome, telefone e moradas guardadas, com base no teu consentimento e no contrato.</li>
        <li><strong>Segurança:</strong> um código irreversível (hash) do endereço IP, guardado no máximo 24 horas, para limitar abusos nos formulários (interesse legítimo).</li>
      </ul>
      <p>Não fazemos perfis, publicidade direcionada nem vendemos dados.</p>
      <h2>Pagamentos</h2>
      <p>
        Os pagamentos são processados pela Stripe, numa página da própria Stripe. Os dados do cartão nunca passam pelo nosso
        site. A Stripe trata os dados de pagamento como responsável independente.
      </p>
      <h2>Subcontratantes</h2>
      <ul>
        <li>Supabase (alojamento da base de dados e ficheiros, servidores na União Europeia).</li>
        <li>Cloudflare (alojamento do site e entrega de conteúdos).</li>
        <li>Stripe (pagamentos).</li>
        <li>Resend (envio de emails de notificação).</li>
      </ul>
      <p>Quando há transferência para fora do Espaço Económico Europeu, é feita com base nas cláusulas contratuais-tipo da Comissão Europeia.</p>
      <h2>Durante quanto tempo</h2>
      <ul>
        <li>Dados de faturação e encomendas: 10 anos, por obrigação fiscal.</li>
        <li>Orçamentos e mensagens sem encomenda: até 2 anos.</li>
        <li>Artes enviadas: apagadas até 1 ano após o pedido, salvo se pedires antes.</li>
        <li>Conta: até a eliminares (podes fazê-lo na Área de Cliente).</li>
      </ul>
      <h2>Os teus direitos</h2>
      <p>
        Tens direito de acesso, retificação, apagamento, limitação, portabilidade e oposição, e de retirar o consentimento.
        Fala connosco pelo WhatsApp{" "}
        <a href={linkWhatsApp("Olá NOMAD'S! Quero exercer os meus direitos sobre os meus dados.")} target="_blank" rel="noopener noreferrer">
          {SITE.telefoneVisivel}
        </a>
        . Podes também apresentar reclamação à Comissão Nacional
        de Proteção de Dados (<a href="https://www.cnpd.pt" target="_blank" rel="noopener noreferrer">cnpd.pt</a>).
      </p>
      <h2>Cookies</h2>
      <p>Usamos apenas cookies essenciais. Ver a <Link href="/legal/cookies">Política de Cookies</Link>.</p>
    </PaginaLegal>
  );
}

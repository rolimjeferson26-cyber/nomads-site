import Link from "next/link";
import { SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";

const COLUNAS = [
  {
    titulo: "Loja",
    links: [
      { href: "/loja?peca=tshirt", rotulo: "T-shirts" },
      { href: "/loja?peca=sweater", rotulo: "Sweaters" },
      { href: "/configurador", rotulo: "Configurador 3D" },
      { href: "/orcamentos", rotulo: "Orçamentos" },
    ],
  },
  {
    titulo: "NOMAD'S",
    links: [
      { href: "/sobre", rotulo: "Sobre nós" },
      { href: "/contactos", rotulo: "Contactos" },
      { href: "/conta", rotulo: "Área de cliente" },
    ],
  },
  {
    titulo: "Legal",
    links: [
      { href: "/legal/termos", rotulo: "Termos e Condições" },
      { href: "/legal/privacidade", rotulo: "Política de Privacidade" },
      { href: "/legal/cookies", rotulo: "Política de Cookies" },
    ],
  },
];

export function Rodape() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-asfalto-2 pb-28 pt-16">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-8">
        <div>
          <img src="/img/logo-emblema.webp" alt="Emblema NOMAD'S" width={703} height={735} loading="lazy" className="h-32 w-auto" />
          <p className="mt-4 max-w-xs text-estrada">
            Estamparia DTF na {SITE.localidade}. Desde uma peça, entrega em até {SITE.prazoEntregaDias} dias.
          </p>
          <div className="mt-6 flex gap-3 text-sm font-semibold">
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-destaque">Instagram</a>
            <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-destaque">Facebook</a>
            <a href={linkWhatsApp()} target="_blank" rel="noopener noreferrer" className="hover:text-destaque">WhatsApp</a>
          </div>
        </div>
        {COLUNAS.map((c) => (
          <div key={c.titulo}>
            <h2 className="kicker !text-estrada">{c.titulo}</h2>
            <ul className="mt-4 grid gap-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-destaque">{l.rotulo}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 px-4 text-sm text-estrada md:flex-row md:items-center md:justify-between md:px-8">
        <p>
          &copy; {new Date().getFullYear()} {SITE.nomeLegal} · NIF {SITE.nif} · Preços finais, isentos de IVA.
        </p>
        <a
          href={SITE.livroReclamacoes}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/15 px-3 py-2 font-semibold text-marfim hover:border-destaque"
        >
          Livro de Reclamações Eletrónico
        </a>
      </div>
    </footer>
  );
}

import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { BotaoWhatsApp } from "@/components/BotaoWhatsApp";
import { Cabecalho } from "@/components/Cabecalho";
import { EstiloProvider } from "@/components/EstiloProvider";
import { Rodape } from "@/components/Rodape";
import { SeletorEstilo } from "@/components/SeletorEstilo";
import { COOKIE_ESTILO, getEstilo } from "@/config/estilos";
import { siteUrl } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "NOMAD'S | Estamparia DTF em Murtosa, Aveiro", template: "%s | NOMAD'S" },
  description:
    "T-shirts e sweaters estampadas em DTF, desde uma peça. Configurador 3D, loja por estilos e orçamentos para empresas, festas e formaturas. Murtosa, Aveiro.",
  icons: { icon: "/img/logo-emblema.webp" },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    siteName: "NOMAD'S",
    images: ["/video/skyline-poster.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#14110e",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Ler cookies torna a renderização dinâmica (necessário para o nonce da CSP).
  const estilo = getEstilo((await cookies()).get(COOKIE_ESTILO)?.value);
  const vars = { "--destaque": estilo.destaque, "--destaque-2": estilo.destaque2 } as React.CSSProperties;

  return (
    <html lang="pt-PT" data-estilo={estilo.id} style={vars}>
      <body className="min-h-dvh">
        <a href="#conteudo" className="sr-only z-[70] rounded bg-destaque px-4 py-2 text-asfalto focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Saltar para o conteúdo
        </a>
        <EstiloProvider inicial={estilo.id}>
          <Cabecalho />
          <main id="conteudo">{children}</main>
          <Rodape />
          <SeletorEstilo />
          <BotaoWhatsApp />
        </EstiloProvider>
      </body>
    </html>
  );
}

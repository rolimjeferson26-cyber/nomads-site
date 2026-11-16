import type { Metadata } from "next";
import Link from "next/link";
import { Campo, Formulario } from "@/components/Formulario";
import { IconeWhatsApp } from "@/components/Icones";
import { SITE } from "@/config/site";
import { linkWhatsApp } from "@/lib/whatsapp";
import { enviarContacto } from "./acoes";

export const metadata: Metadata = { title: "Contactos", description: `Fala com a NOMAD'S: WhatsApp ${SITE.telefoneVisivel}, email e oficina na Murtosa.` };

export default function Contactos() {
  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-24 md:px-8 md:pt-32 lg:grid-cols-2">
      <section>
        <p className="kicker">Contactos</p>
        <h1 className="titulo mt-3 text-6xl md:text-8xl">Fala connosco</h1>
        <ul className="mt-8 grid gap-4 text-lg">
          <li>
            <a href={linkWhatsApp("Olá NOMAD'S!")} target="_blank" rel="noopener noreferrer" className="botao !bg-[#25D366] !text-white">
              <IconeWhatsApp className="size-5" /> WhatsApp {SITE.telefoneVisivel}
            </a>
          </li>
          <li><span className="text-estrada">Email · </span><a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a></li>
          <li><span className="text-estrada">Oficina · </span>{SITE.morada}</li>
          <li><span className="text-estrada">Horário · </span>{SITE.horario}</li>
          <li className="flex gap-4 text-base">
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>
            <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="underline">Facebook</a>
          </li>
        </ul>
        <p className="mt-8 text-estrada">
          Para grupos e empresas, o mais rápido é o <Link href="/orcamentos" className="underline">assistente de orçamentos</Link>.
        </p>
      </section>
      <section className="cartao p-6 md:p-8">
        <h2 className="titulo text-4xl">Enviar mensagem</h2>
        <Formulario acao={enviarContacto} botao="Enviar" className="mt-6 grid gap-4">
          <Campo rotulo="Nome" name="nome" autoComplete="name" required maxLength={120} />
          <Campo rotulo="Email" name="email" type="email" autoComplete="email" required maxLength={200} />
          <label className="rotulo">
            Mensagem
            <textarea name="mensagem" className="campo min-h-32" required maxLength={2000} />
          </label>
          <div aria-hidden className="absolute -left-[9999px]">
            <input name="site" tabIndex={-1} autoComplete="off" />
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="consentimento" value="sim" required className="mt-0.5 size-5 accent-[var(--destaque)]" />
            <span>Aceito que usem estes dados para me responder (<Link href="/legal/privacidade" className="underline">Privacidade</Link>).</span>
          </label>
        </Formulario>
      </section>
    </div>
  );
}

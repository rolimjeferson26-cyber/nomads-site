import { linkWhatsApp } from "@/lib/whatsapp";
import { IconeWhatsApp } from "./Icones";

export function BotaoWhatsApp() {
  return (
    <a
      href={linkWhatsApp("Olá NOMAD'S! Tenho uma pergunta:")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar connosco no WhatsApp"
      className="group fixed bottom-[4.75rem] right-3 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,.7)] transition-transform hover:scale-110 md:bottom-6 md:right-6"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 motion-reduce:hidden" />
      <IconeWhatsApp className="relative size-7" />
    </a>
  );
}

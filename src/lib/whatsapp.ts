import { SITE } from "@/config/site";

export function linkWhatsApp(mensagem?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}

import type { Zona } from "@/config/portes";

const FORMATO = /^(\d{4})-(\d{3})$/;

export function normalizarCodigoPostal(valor: string): string | null {
  const limpo = valor.trim().replace(/\s+/g, "");
  const so = limpo.replace("-", "");
  if (!/^\d{7}$/.test(so)) return null;
  return `${so.slice(0, 4)}-${so.slice(4)}`;
}

// Continente: 1000-8999 · Madeira: 9000-9499 · Açores: 9500-9999
export function zonaDoCodigoPostal(codigo: string): Zona | null {
  const m = FORMATO.exec(codigo);
  if (!m) return null;
  const n = Number(m[1]);
  if (n >= 1000 && n <= 8999) return "continente";
  if (n >= 9000 && n <= 9499) return "madeira";
  if (n >= 9500 && n <= 9999) return "acores";
  return null;
}

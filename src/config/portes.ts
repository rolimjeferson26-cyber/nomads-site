// Portes de envio. Todos os valores em cêntimos e gramas.
// O Admin pode alterar estes valores; a versão editada fica na base de dados.

import type { Peca } from "./precos";

export type Zona = "continente" | "madeira" | "acores";

export const ZONAS: Record<Zona, string> = {
  continente: "Portugal continental",
  madeira: "Madeira",
  acores: "Açores",
};

export type Escalao = { ateGramas: number; precoCents: number };

export type TabelaPortes = {
  pesoPorPecaGramas: Record<Peca, number>;
  pesoEmbalagemGramas: number;
  ctt: Record<Zona, Escalao[]>;
  levantamento: { precoCents: number; local: string };
  entregaLocal: { precoCents: number; prefixosCodigoPostal: string[]; descricao: string };
};

// Base: CTT Expresso "Em 2 Dias", preço de balcão com IVA incluído (sem contrato CTT).
// Acima do último escalão (10 kg): portes a combinar pelo WhatsApp.
export const TABELA_PORTES: TabelaPortes = {
  pesoPorPecaGramas: { tshirt: 200, sweater: 500 },
  pesoEmbalagemGramas: 100,
  ctt: {
    continente: [
      { ateGramas: 2000, precoCents: 935 },
      { ateGramas: 5000, precoCents: 1405 },
      { ateGramas: 10000, precoCents: 1881 },
    ],
    madeira: [
      { ateGramas: 2000, precoCents: 1819 },
      { ateGramas: 5000, precoCents: 2606 },
      { ateGramas: 10000, precoCents: 4561 },
    ],
    acores: [
      { ateGramas: 2000, precoCents: 1819 },
      { ateGramas: 5000, precoCents: 2606 },
      { ateGramas: 10000, precoCents: 4561 },
    ],
  },
  levantamento: { precoCents: 0, local: "Oficina NOMAD'S, Murtosa" },
  entregaLocal: {
    precoCents: 300, // A CONFIRMAR (não indicado no complemento)
    // Primeiros 4 dígitos do código postal abrangidos. A CONFIRMAR
    prefixosCodigoPostal: ["3870", "3860", "3880"],
    descricao: "Murtosa, Estarreja e Ovar",
  },
};

// Portes de envio. Todos os valores em cêntimos e gramas. A CONFIRMAR com o balcão CTT.
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

export const TABELA_PORTES: TabelaPortes = {
  pesoPorPecaGramas: { tshirt: 200, sweater: 550 }, // A CONFIRMAR
  pesoEmbalagemGramas: 60, // A CONFIRMAR
  ctt: {
    // A CONFIRMAR: valores de referência, rever com a tabela CTT em vigor
    continente: [
      { ateGramas: 500, precoCents: 450 },
      { ateGramas: 1000, precoCents: 550 },
      { ateGramas: 2000, precoCents: 650 },
      { ateGramas: 5000, precoCents: 900 },
      { ateGramas: 10000, precoCents: 1250 },
    ],
    madeira: [
      { ateGramas: 500, precoCents: 650 },
      { ateGramas: 1000, precoCents: 850 },
      { ateGramas: 2000, precoCents: 1100 },
      { ateGramas: 5000, precoCents: 1600 },
    ],
    acores: [
      { ateGramas: 500, precoCents: 650 },
      { ateGramas: 1000, precoCents: 850 },
      { ateGramas: 2000, precoCents: 1100 },
      { ateGramas: 5000, precoCents: 1600 },
    ],
  },
  levantamento: { precoCents: 0, local: "Oficina NOMAD'S, Murtosa" }, // A CONFIRMAR: morada
  entregaLocal: {
    precoCents: 300, // A CONFIRMAR
    // Primeiros 4 dígitos do código postal abrangidos. A CONFIRMAR
    prefixosCodigoPostal: ["3870", "3860", "3880"],
    descricao: "Murtosa, Estarreja e Ovar",
  },
};

// Tabela de preços (valores finais, isentos de IVA, em cêntimos).
// Uma combinação que não esteja nesta lista é "Sob consulta".
// O Admin pode alterar estes valores; a versão editada fica na base de dados
// (tabela "definicoes") e esta serve de base.

export const PECAS = {
  tshirt: "T-shirt",
  sweater: "Sweater",
} as const;
export type Peca = keyof typeof PECAS;

export const TECIDOS = {
  algodao: "100% algodão",
  poliester: "Poliéster (técnico)",
  misto: "Misto algodão/poliéster",
} as const;
export type Tecido = keyof typeof TECIDOS;

export const DIMENSOES = {
  "10x10": { largura: 10, altura: 10, nome: "10 x 10 cm" },
  "25x25": { largura: 25, altura: 25, nome: "25 x 25 cm" },
  "25x35": { largura: 25, altura: 35, nome: "25 x 35 cm" },
} as const;
export type Dimensao = keyof typeof DIMENSOES;

export type RegraPreco = {
  peca: Peca;
  tecido: Tecido;
  frente: Dimensao | null;
  costas: Dimensao | null;
  precoCents: number;
  descricao: string;
};

export type TabelaPrecos = { regras: RegraPreco[] };

export const TABELA_PRECOS: TabelaPrecos = {
  regras: [
    { peca: "tshirt", tecido: "algodao", frente: "10x10", costas: null, precoCents: 1400, descricao: "Frente, peito 10x10" },
    { peca: "tshirt", tecido: "algodao", frente: "25x25", costas: null, precoCents: 1600, descricao: "Frente até 25x25" },
    { peca: "tshirt", tecido: "algodao", frente: null, costas: "25x25", precoCents: 1600, descricao: "Costas até 25x25" },
    { peca: "tshirt", tecido: "algodao", frente: "10x10", costas: "25x25", precoCents: 1600, descricao: "Costas 25x25 + peito 10x10" },
    { peca: "tshirt", tecido: "algodao", frente: "25x35", costas: null, precoCents: 1800, descricao: "Frente 25x35" },
    { peca: "tshirt", tecido: "algodao", frente: null, costas: "25x35", precoCents: 1800, descricao: "Costas 25x35" },
    // Sweaters: sem regras = "Sob consulta"
  ],
};

// Cores e tamanhos disponíveis no configurador. A CONFIRMAR com o stock real.
export const CORES = [
  { id: "preto", nome: "Preto", hex: "#1b1b1d" },
  { id: "branco", nome: "Branco", hex: "#f2f0ea" },
  { id: "cinza", nome: "Cinza mesclado", hex: "#8f9094" },
  { id: "areia", nome: "Areia", hex: "#d8c7a4" },
  { id: "verde", nome: "Verde tropa", hex: "#4b5a3a" },
  { id: "azul", nome: "Azul marinho", hex: "#1f2a44" },
] as const;
export type Cor = (typeof CORES)[number]["id"];

export const TAMANHOS = {
  tshirt: ["XS", "S", "M", "L", "XL", "XXL"],
  sweater: ["S", "M", "L", "XL", "XXL"],
} as const satisfies Record<Peca, readonly string[]>;

export const QUANTIDADE_MAXIMA_LOJA = 50;

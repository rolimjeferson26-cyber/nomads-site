// Silhuetas das peças, partilhadas pelo mockup 3D e pelo mockup 2D.
// Unidades: 1 = 10 cm. Origem no centro do corpo, y para cima.
// O mesmo modelo serve para todas as estampas.

import { DIMENSOES, type Dimensao, type Peca } from "@/config/precos";

type Ponto = [number, number];
export type Segmento = { tipo: "L"; p: Ponto } | { tipo: "Q"; c: Ponto; p: Ponto };

type MeiaSilhueta = { inicio: Ponto; segmentos: Segmento[] };

// Metade direita (do ponto de vista de quem olha), de baixo ao centro do decote.
const MEIAS: Record<Peca, MeiaSilhueta> = {
  tshirt: {
    inicio: [0, -3.72],
    segmentos: [
      { tipo: "Q", c: [1.3, -3.76], p: [2.45, -3.64] },
      { tipo: "Q", c: [2.32, -1.1], p: [2.52, 1.3] },
      { tipo: "L", p: [3.38, 0.72] },
      { tipo: "L", p: [4.12, 1.78] },
      { tipo: "Q", c: [3.25, 3.0], p: [2.15, 3.22] },
      { tipo: "L", p: [0.95, 3.46] },
      { tipo: "Q", c: [0.55, 2.74], p: [0, 2.7] },
    ],
  },
  sweater: {
    inicio: [0, -3.8],
    segmentos: [
      { tipo: "Q", c: [1.3, -3.84], p: [2.42, -3.74] },
      { tipo: "Q", c: [2.3, -1.0], p: [2.52, 1.15] },
      { tipo: "L", p: [3.02, -3.08] },
      { tipo: "L", p: [3.86, -3.24] },
      { tipo: "L", p: [3.98, -2.55] },
      { tipo: "Q", c: [3.7, 1.7], p: [2.2, 3.18] },
      { tipo: "L", p: [0.92, 3.44] },
      { tipo: "Q", c: [0.5, 2.96], p: [0, 2.94] },
    ],
  },
};

const espelhar = ([x, y]: Ponto): Ponto => [-x, y];

/** Contorno completo e fechado: metade direita + metade esquerda espelhada. */
export function contorno(peca: Peca): { inicio: Ponto; segmentos: Segmento[] } {
  const { inicio, segmentos } = MEIAS[peca];
  const pontos: Ponto[] = [inicio, ...segmentos.map((s) => s.p)];
  const esquerda: Segmento[] = [];
  for (let i = segmentos.length - 1; i >= 0; i--) {
    const s = segmentos[i];
    const destino = espelhar(pontos[i]);
    esquerda.push(s.tipo === "Q" ? { tipo: "Q", c: espelhar(s.c), p: destino } : { tipo: "L", p: destino });
  }
  return { inicio, segmentos: [...segmentos, ...esquerda] };
}

/** Caminho SVG (y invertido) para o mockup 2D. */
export function caminhoSvg(peca: Peca): string {
  const { inicio, segmentos } = contorno(peca);
  const f = ([x, y]: Ponto) => `${x.toFixed(3)} ${(-y).toFixed(3)}`;
  return (
    `M${f(inicio)} ` +
    segmentos.map((s) => (s.tipo === "Q" ? `Q${f(s.c)} ${f(s.p)}` : `L${f(s.p)}`)).join(" ") +
    " Z"
  );
}

export type Face = "frente" | "costas";
export type Area = { face: Face; x: number; y: number; largura: number; altura: number };

/** Onde fica cada estampa: peito 10x10 no lado esquerdo de quem veste; as grandes ao centro. */
export function areaEstampa(face: Face, dimensao: Dimensao): Area {
  const d = DIMENSOES[dimensao];
  const largura = d.largura / 10;
  const altura = d.altura / 10;
  if (face === "frente" && dimensao === "10x10") {
    return { face, x: 1.15, y: 1.95, largura, altura };
  }
  const topo = 2.25; // ~8 cm abaixo do decote
  return { face, x: 0, y: topo - altura / 2, largura, altura };
}

/** Ajusta a imagem dentro da área sem a deformar. */
export function encaixar(area: Area, proporcao: number): { largura: number; altura: number } {
  if (proporcao >= area.largura / area.altura) return { largura: area.largura, altura: area.largura / proporcao };
  return { largura: area.altura * proporcao, altura: area.altura };
}

/** Converte as escolhas do configurador em frente/costas para o cálculo do preço. */
export function posicionamento(
  posicao: Face,
  dimensao: Dimensao,
  peito: boolean,
): { frente: Dimensao | null; costas: Dimensao | null } {
  if (posicao === "frente") return { frente: dimensao, costas: null };
  return { frente: peito ? "10x10" : null, costas: dimensao };
}

export function areasDoPosicionamento(p: { frente: Dimensao | null; costas: Dimensao | null }): Area[] {
  const areas: Area[] = [];
  if (p.frente) areas.push(areaEstampa("frente", p.frente));
  if (p.costas) areas.push(areaEstampa("costas", p.costas));
  return areas;
}

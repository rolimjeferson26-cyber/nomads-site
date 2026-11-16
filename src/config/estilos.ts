// Estilos do site. Para acrescentar um estilo novo basta juntar um objeto à lista:
// as estampas com esse "id" passam a aparecer no filtro e o tema muda sozinho.
// "fundo" escolhe uma das animações de fundo existentes em components/FundoAnimado.tsx.

export type FundoAnimado = "topografia" | "velocidade" | "pixeis" | "pista";

export type Estilo = {
  id: string;
  nome: string;
  destaque: string; // cor principal (botões, links)
  destaque2: string; // cor secundária (hover, detalhes)
  fundo: FundoAnimado;
  hero: { kicker: string; titulo: string; texto: string };
};

export const ESTILOS: Estilo[] = [
  {
    id: "aventura",
    nome: "Aventura",
    destaque: "#E07A1F",
    destaque2: "#F2B01E",
    fundo: "topografia",
    hero: {
      kicker: "Estrada · Mapa · Montanha",
      titulo: "Feito para ir contigo",
      texto: "Estampas DTF para quem vive entre a estrada, o mar e a serra. Desde uma peça.",
    },
  },
  {
    id: "anime",
    nome: "Anime",
    destaque: "#FF4F8B",
    destaque2: "#7FE7FF",
    fundo: "velocidade",
    hero: {
      kicker: "Traço · Cor · Movimento",
      titulo: "O teu traço, à tua medida",
      texto: "Arte original com energia de manga, em cores vivas que aguentam as lavagens.",
    },
  },
  {
    id: "jogos",
    nome: "Jogos",
    destaque: "#7CFF4F",
    destaque2: "#B98BFF",
    fundo: "pixeis",
    hero: {
      kicker: "Nível · Pixel · Respawn",
      titulo: "Sobe de nível no estilo",
      texto: "Pixel art e grafismo de arcada, estampados peça a peça na nossa oficina.",
    },
  },
  {
    id: "racing",
    nome: "Racing",
    destaque: "#FF3B2F",
    destaque2: "#F5F5F5",
    fundo: "pista",
    hero: {
      kicker: "Grelha · Curva · Meta",
      titulo: "Acelera a tua ideia",
      texto: "Linhas de velocidade e bandeiras de meta, prontas em menos de 10 dias.",
    },
  },
];

export const ESTILO_PADRAO = ESTILOS[0].id;
export const COOKIE_ESTILO = "nomads-estilo";

export function getEstilo(id: string | undefined | null): Estilo {
  return ESTILOS.find((e) => e.id === id) ?? ESTILOS[0];
}

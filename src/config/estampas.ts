// Estampas de exemplo (arte original NOMAD'S, sem personagens nem marcas de terceiros).
// Quando a base de dados está ligada, a lista vem da tabela "estampas" e é gerida no Admin.

export type Estampa = {
  id: string;
  nome: string;
  estilo: string; // id de um estilo em config/estilos.ts
  imagemUrl: string;
  proporcao: number; // largura / altura
};

export const ESTAMPAS_BASE: Estampa[] = [
  { id: "bussola", nome: "Bússola", estilo: "aventura", imagemUrl: "/estampas/bussola.svg", proporcao: 1 },
  { id: "montanha", nome: "Vai e Volta", estilo: "aventura", imagemUrl: "/estampas/montanha.svg", proporcao: 1 },
  { id: "estrada", nome: "Estrada Sem Fim", estilo: "aventura", imagemUrl: "/estampas/estrada.svg", proporcao: 400 / 560 },
  { id: "onda-neon", nome: "Onda Neon", estilo: "anime", imagemUrl: "/estampas/onda-neon.svg", proporcao: 1 },
  { id: "lua-carmesim", nome: "Lua Carmesim", estilo: "anime", imagemUrl: "/estampas/lua-carmesim.svg", proporcao: 400 / 560 },
  { id: "raio", nome: "Raio", estilo: "anime", imagemUrl: "/estampas/raio.svg", proporcao: 1 },
  { id: "pixel-coracao", nome: "+1 Vida", estilo: "jogos", imagemUrl: "/estampas/pixel-coracao.svg", proporcao: 1 },
  { id: "comando-retro", nome: "Press Start", estilo: "jogos", imagemUrl: "/estampas/comando-retro.svg", proporcao: 1 },
  { id: "serra-pixel", nome: "Continuar?", estilo: "jogos", imagemUrl: "/estampas/serra-pixel.svg", proporcao: 400 / 560 },
  { id: "bandeira-meta", nome: "Meta", estilo: "racing", imagemUrl: "/estampas/bandeira-meta.svg", proporcao: 1 },
  { id: "pistao", nome: "V8", estilo: "racing", imagemUrl: "/estampas/pistao.svg", proporcao: 1 },
  { id: "curva-apex", nome: "Apex 26", estilo: "racing", imagemUrl: "/estampas/curva-apex.svg", proporcao: 400 / 560 },
];

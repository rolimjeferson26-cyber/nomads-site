import { describe, expect, it } from "vitest";
import { TABELA_PORTES } from "@/config/portes";
import { TABELA_PRECOS } from "@/config/precos";
import {
  esquemaCheckout,
  esquemaItemCarrinho,
  esquemaTabelaPortes,
  esquemaTabelaPrecos,
  tipoRealDaImagem,
} from "./validacao";

const item = { estampaId: "bussola", peca: "tshirt", cor: "preto", tamanho: "M", frente: "25x25", costas: null, quantidade: 2 };

describe("validação", () => {
  it("aceita um item válido e recusa tamanhos de outra peça", () => {
    expect(esquemaItemCarrinho.safeParse(item).success).toBe(true);
    expect(esquemaItemCarrinho.safeParse({ ...item, peca: "sweater", tamanho: "XS" }).success).toBe(false);
    expect(esquemaItemCarrinho.safeParse({ ...item, frente: null }).success).toBe(false);
    expect(esquemaItemCarrinho.safeParse({ ...item, quantidade: 999 }).success).toBe(false);
  });

  it("o checkout ignora campos de preço vindos do browser", () => {
    const r = esquemaCheckout.safeParse({
      itens: [{ ...item, precoCents: 1 }],
      email: "a@b.pt",
      nome: "Ana",
      metodo: "levantamento",
      morada: null,
      aceitaTermos: true,
      totalCents: 1,
    });
    expect(r.success).toBe(true);
    expect(JSON.stringify(r.data)).not.toContain("precoCents");
    expect(JSON.stringify(r.data)).not.toContain("totalCents");
  });

  it("o checkout exige morada fora do levantamento", () => {
    const base = { itens: [item], email: "a@b.pt", nome: "Ana", metodo: "ctt", morada: null, aceitaTermos: true };
    expect(esquemaCheckout.safeParse(base).success).toBe(false);
  });

  it("as tabelas de configuração são válidas", () => {
    expect(esquemaTabelaPrecos.safeParse(TABELA_PRECOS).success).toBe(true);
    expect(esquemaTabelaPortes.safeParse(TABELA_PORTES).success).toBe(true);
  });

  it("reconhece imagens pelos bytes e recusa o resto", () => {
    expect(tipoRealDaImagem(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(tipoRealDaImagem(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(tipoRealDaImagem(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
  });
});

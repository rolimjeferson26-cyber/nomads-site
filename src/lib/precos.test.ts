import { describe, expect, it } from "vitest";
import { TABELA_PRECOS } from "@/config/precos";
import { precoLinha, precoUnitario, type Estampagem } from "./precos";

const tshirt = (frente: Estampagem["frente"], costas: Estampagem["costas"]): Estampagem => ({
  peca: "tshirt",
  tecido: "algodao",
  frente,
  costas,
});

function cents(e: Estampagem) {
  const r = precoUnitario(TABELA_PRECOS, e);
  return r.tipo === "preco" ? r.unitarioCents : "consulta";
}

describe("preços T-shirt 100% algodão", () => {
  it("frente, peito 10x10 custa 14 €", () => expect(cents(tshirt("10x10", null))).toBe(1400));
  it("frente até 25x25 custa 16 €", () => expect(cents(tshirt("25x25", null))).toBe(1600));
  it("costas até 25x25 custa 16 €", () => expect(cents(tshirt(null, "25x25"))).toBe(1600));
  it("costas 25x25 com peito 10x10 custa 16 €", () => expect(cents(tshirt("10x10", "25x25"))).toBe(1600));
  it("frente 25x35 custa 18 €", () => expect(cents(tshirt("25x35", null))).toBe(1800));
  it("costas 25x35 custa 18 €", () => expect(cents(tshirt(null, "25x35"))).toBe(1800));
});

describe("sob consulta", () => {
  it("frente 25x25 + costas 25x25", () => expect(cents(tshirt("25x25", "25x25"))).toBe("consulta"));
  it("frente 25x35 + costas 25x35", () => expect(cents(tshirt("25x35", "25x35"))).toBe("consulta"));
  it("só peito 10x10 nas costas", () => expect(cents(tshirt(null, "10x10"))).toBe("consulta"));
  it("costas 25x35 + peito 10x10", () => expect(cents(tshirt("10x10", "25x35"))).toBe("consulta"));
  it("sem nenhuma estampa", () => expect(cents(tshirt(null, null))).toBe("consulta"));
  it("sweater é sempre sob consulta", () =>
    expect(cents({ peca: "sweater", tecido: "algodao", frente: "25x25", costas: null })).toBe("consulta"));
  it("tecido que não é 100% algodão", () =>
    expect(cents({ peca: "tshirt", tecido: "poliester", frente: "10x10", costas: null })).toBe("consulta"));
});

describe("linhas com quantidade", () => {
  it("multiplica o unitário pela quantidade", () => {
    const r = precoLinha(TABELA_PRECOS, tshirt("25x25", null), 12);
    expect(r).toMatchObject({ tipo: "preco", unitarioCents: 1600, totalCents: 19200 });
  });
  it("recusa quantidade zero, negativa ou decimal", () => {
    expect(precoLinha(TABELA_PRECOS, tshirt("25x25", null), 0).tipo).toBe("consulta");
    expect(precoLinha(TABELA_PRECOS, tshirt("25x25", null), -3).tipo).toBe("consulta");
    expect(precoLinha(TABELA_PRECOS, tshirt("25x25", null), 1.5).tipo).toBe("consulta");
  });
  it("usa a tabela recebida (edição no Admin)", () => {
    const tabela = { regras: [{ ...TABELA_PRECOS.regras[0], precoCents: 1500 }] };
    expect(precoUnitario(tabela, tshirt("10x10", null))).toMatchObject({ unitarioCents: 1500 });
  });
});

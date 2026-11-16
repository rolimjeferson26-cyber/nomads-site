import { describe, expect, it } from "vitest";
import { TABELA_PORTES, type TabelaPortes } from "@/config/portes";
import { cotarEnvio, normalizarCodigoPostal, zonaDoCodigoPostal } from "./index";
import { CttExpressoProvider, pesoTotalGramas } from "./providers";

const tabela: TabelaPortes = {
  pesoPorPecaGramas: { tshirt: 200, sweater: 500 },
  pesoEmbalagemGramas: 50,
  ctt: {
    continente: [
      { ateGramas: 500, precoCents: 400 },
      { ateGramas: 1000, precoCents: 500 },
      { ateGramas: 2000, precoCents: 700 },
    ],
    madeira: [{ ateGramas: 1000, precoCents: 900 }],
    acores: [{ ateGramas: 1000, precoCents: 1000 }],
  },
  levantamento: { precoCents: 0, local: "Oficina" },
  entregaLocal: { precoCents: 300, prefixosCodigoPostal: ["3870"], descricao: "Murtosa" },
};

const camisolas = (n: number) => [{ peca: "tshirt" as const, quantidade: n }];

describe("código postal", () => {
  it("normaliza formatos comuns", () => {
    expect(normalizarCodigoPostal("3870-123")).toBe("3870-123");
    expect(normalizarCodigoPostal(" 3870123 ")).toBe("3870-123");
    expect(normalizarCodigoPostal("3870-12")).toBeNull();
    expect(normalizarCodigoPostal("abcd-efg")).toBeNull();
  });
  it("identifica as zonas", () => {
    expect(zonaDoCodigoPostal("1000-001")).toBe("continente");
    expect(zonaDoCodigoPostal("8999-999")).toBe("continente");
    expect(zonaDoCodigoPostal("9000-000")).toBe("madeira");
    expect(zonaDoCodigoPostal("9499-999")).toBe("madeira");
    expect(zonaDoCodigoPostal("9500-000")).toBe("acores");
    expect(zonaDoCodigoPostal("9999-999")).toBe("acores");
    expect(zonaDoCodigoPostal("0999-999")).toBeNull();
  });
});

describe("Tabela CTT", () => {
  it("soma o peso das peças e da embalagem", () => {
    expect(pesoTotalGramas(tabela, { codigoPostal: null, pecas: camisolas(3) })).toBe(650);
  });
  it("escolhe o escalão certo no continente", async () => {
    const r1 = await cotarEnvio(tabela, "ctt", { codigoPostal: "4000-001", pecas: camisolas(2) }); // 450 g
    expect(r1).toMatchObject({ ok: true, cotacao: { precoCents: 400, zona: "continente" } });
    const r2 = await cotarEnvio(tabela, "ctt", { codigoPostal: "4000-001", pecas: camisolas(3) }); // 650 g
    expect(r2).toMatchObject({ ok: true, cotacao: { precoCents: 500 } });
  });
  it("o limite do escalão é inclusivo", async () => {
    // 50 + 225*2 = 500 g exatos
    const t = { ...tabela, pesoPorPecaGramas: { tshirt: 225, sweater: 500 } };
    const r = await cotarEnvio(t, "ctt", { codigoPostal: "4000-001", pecas: camisolas(2) });
    expect(r).toMatchObject({ ok: true, cotacao: { precoCents: 400 } });
  });
  it("usa a tabela da Madeira e dos Açores", async () => {
    expect(await cotarEnvio(tabela, "ctt", { codigoPostal: "9050-001", pecas: camisolas(1) })).toMatchObject({
      ok: true,
      cotacao: { precoCents: 900, zona: "madeira" },
    });
    expect(await cotarEnvio(tabela, "ctt", { codigoPostal: "9500-001", pecas: camisolas(1) })).toMatchObject({
      ok: true,
      cotacao: { precoCents: 1000, zona: "acores" },
    });
  });
  it("acima do último escalão fica sob consulta", async () => {
    const r = await cotarEnvio(tabela, "ctt", { codigoPostal: "9050-001", pecas: camisolas(10) });
    expect(r.ok).toBe(false);
  });
  it("recusa código postal inválido e carrinho vazio", async () => {
    expect((await cotarEnvio(tabela, "ctt", { codigoPostal: "123", pecas: camisolas(1) })).ok).toBe(false);
    expect((await cotarEnvio(tabela, "ctt", { codigoPostal: "4000-001", pecas: [] })).ok).toBe(false);
  });
});

describe("Levantamento e entrega na zona", () => {
  it("levantamento é grátis e não precisa de código postal", async () => {
    const r = await cotarEnvio(tabela, "levantamento", { codigoPostal: null, pecas: camisolas(5) });
    expect(r).toMatchObject({ ok: true, cotacao: { precoCents: 0 } });
  });
  it("entrega local só nos códigos postais configurados", async () => {
    expect(await cotarEnvio(tabela, "entrega_local", { codigoPostal: "3870-200", pecas: camisolas(1) })).toMatchObject({
      ok: true,
      cotacao: { precoCents: 300 },
    });
    expect((await cotarEnvio(tabela, "entrega_local", { codigoPostal: "4000-001", pecas: camisolas(1) })).ok).toBe(false);
  });
});

describe("CTT Expresso", () => {
  it("fica desativado até haver contrato", async () => {
    const p = new CttExpressoProvider();
    expect(p.ativo).toBe(false);
    expect((await cotarEnvio(TABELA_PORTES, "ctt_expresso", { codigoPostal: "4000-001", pecas: camisolas(1) })).ok).toBe(false);
  });
});

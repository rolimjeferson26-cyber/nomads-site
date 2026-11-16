import { ZONAS, type TabelaPortes } from "@/config/portes";
import { normalizarCodigoPostal, zonaDoCodigoPostal } from "./codigo-postal";
import type { PedidoEnvio, ProviderEnvio, ResultadoCotacao } from "./tipos";

export function pesoTotalGramas(tabela: TabelaPortes, pedido: PedidoEnvio): number {
  const pecas = pedido.pecas.reduce((s, p) => s + tabela.pesoPorPecaGramas[p.peca] * p.quantidade, 0);
  return pecas + tabela.pesoEmbalagemGramas;
}

function semPecas(pedido: PedidoEnvio): boolean {
  return pedido.pecas.length === 0 || pedido.pecas.some((p) => !Number.isInteger(p.quantidade) || p.quantidade < 1);
}

// Tabela CTT por escalão de peso e zona (não há API pública dos CTT; preço de balcão).
export class TabelaCTT implements ProviderEnvio {
  readonly metodo = "ctt" as const;
  readonly nome = "CTT Expresso Em 2 Dias";
  readonly ativo = true;
  constructor(private tabela: TabelaPortes) {}

  async cotar(pedido: PedidoEnvio): Promise<ResultadoCotacao> {
    if (semPecas(pedido)) return { ok: false, motivo: "Carrinho vazio." };
    const cp = pedido.codigoPostal ? normalizarCodigoPostal(pedido.codigoPostal) : null;
    if (!cp) return { ok: false, motivo: "Indica um código postal válido (0000-000)." };
    const zona = zonaDoCodigoPostal(cp);
    if (!zona) return { ok: false, motivo: "Código postal fora de Portugal." };

    const peso = pesoTotalGramas(this.tabela, pedido);
    const escaloes = [...this.tabela.ctt[zona]].sort((a, b) => a.ateGramas - b.ateGramas);
    const escalao = escaloes.find((e) => peso <= e.ateGramas);
    if (!escalao) {
      return { ok: false, motivo: "Acima de 10 kg: portes a combinar connosco pelo WhatsApp." };
    }
    return {
      ok: true,
      cotacao: {
        metodo: this.metodo,
        nome: this.nome,
        precoCents: escalao.precoCents,
        detalhe: `${ZONAS[zona]} · até ${escalao.ateGramas / 1000} kg`,
        zona,
        pesoGramas: peso,
      },
    };
  }
}

// Levantamento na oficina (Murtosa): grátis.
export class Levantamento implements ProviderEnvio {
  readonly metodo = "levantamento" as const;
  readonly nome = "Levantamento na oficina";
  readonly ativo = true;
  constructor(private tabela: TabelaPortes) {}

  async cotar(pedido: PedidoEnvio): Promise<ResultadoCotacao> {
    if (semPecas(pedido)) return { ok: false, motivo: "Carrinho vazio." };
    return {
      ok: true,
      cotacao: {
        metodo: this.metodo,
        nome: this.nome,
        precoCents: this.tabela.levantamento.precoCents,
        detalhe: this.tabela.levantamento.local,
      },
    };
  }
}

// Entrega em mão na zona (lista de códigos postais em configuração).
export class EntregaLocal implements ProviderEnvio {
  readonly metodo = "entrega_local" as const;
  readonly nome = "Entrega na zona";
  readonly ativo = true;
  constructor(private tabela: TabelaPortes) {}

  async cotar(pedido: PedidoEnvio): Promise<ResultadoCotacao> {
    if (semPecas(pedido)) return { ok: false, motivo: "Carrinho vazio." };
    const cp = pedido.codigoPostal ? normalizarCodigoPostal(pedido.codigoPostal) : null;
    if (!cp) return { ok: false, motivo: "Indica um código postal válido (0000-000)." };
    const coberto = this.tabela.entregaLocal.prefixosCodigoPostal.some((p) => cp.startsWith(p));
    if (!coberto) {
      return { ok: false, motivo: `A entrega em mão só cobre ${this.tabela.entregaLocal.descricao}.` };
    }
    return {
      ok: true,
      cotacao: {
        metodo: this.metodo,
        nome: this.nome,
        precoCents: this.tabela.entregaLocal.precoCents,
        detalhe: this.tabela.entregaLocal.descricao,
      },
    };
  }
}

// Esqueleto para quando houver contrato com a CTT Expresso.
// Passos para ativar:
// 1. Pedir credenciais da API (contrato CTT Expresso).
// 2. Definir CTT_EXPRESSO_API_URL, CTT_EXPRESSO_CLIENT_ID e CTT_EXPRESSO_API_KEY.
// 3. Implementar o pedido de cotação em cotar() e mudar "ativo" para depender das credenciais.
export class CttExpressoProvider implements ProviderEnvio {
  readonly metodo = "ctt_expresso" as const;
  readonly nome = "CTT Expresso";
  readonly ativo: boolean;

  constructor(
    private config: { apiUrl?: string; clientId?: string; apiKey?: string } = {},
  ) {
    // Desativado até a integração estar implementada e testada.
    this.ativo = false;
  }

  async cotar(_pedido: PedidoEnvio): Promise<ResultadoCotacao> {
    if (!this.config.apiUrl || !this.config.clientId || !this.config.apiKey) {
      return { ok: false, motivo: "CTT Expresso ainda não está disponível." };
    }
    // TODO quando houver contrato: chamar a API de cotação da CTT Expresso.
    return { ok: false, motivo: "CTT Expresso ainda não está disponível." };
  }
}

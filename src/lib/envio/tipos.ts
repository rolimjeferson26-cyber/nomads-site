import type { Peca } from "@/config/precos";
import type { Zona } from "@/config/portes";

export type MetodoEnvio = "levantamento" | "entrega_local" | "ctt" | "ctt_expresso";

export type PedidoEnvio = {
  codigoPostal: string | null; // formato 0000-000; null no levantamento
  pecas: { peca: Peca; quantidade: number }[];
};

export type CotacaoEnvio = {
  metodo: MetodoEnvio;
  nome: string;
  precoCents: number;
  detalhe: string;
  zona?: Zona;
  pesoGramas?: number;
};

export type ResultadoCotacao =
  | { ok: true; cotacao: CotacaoEnvio }
  | { ok: false; motivo: string };

// Cada transportadora/modalidade implementa esta interface.
// Para ligar outra (ex.: CTT Expresso com contrato), basta criar um provider novo
// e registá-lo em envio/index.ts.
export interface ProviderEnvio {
  readonly metodo: MetodoEnvio;
  readonly nome: string;
  readonly ativo: boolean;
  cotar(pedido: PedidoEnvio): Promise<ResultadoCotacao>;
}

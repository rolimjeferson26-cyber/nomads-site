import type { TabelaPortes } from "@/config/portes";
import { CttExpressoProvider, EntregaLocal, Levantamento, TabelaCTT } from "./providers";
import type { MetodoEnvio, PedidoEnvio, ProviderEnvio, ResultadoCotacao } from "./tipos";

export * from "./tipos";
export { normalizarCodigoPostal, zonaDoCodigoPostal } from "./codigo-postal";

export function criarProviders(tabela: TabelaPortes): ProviderEnvio[] {
  return [
    new Levantamento(tabela),
    new EntregaLocal(tabela),
    new TabelaCTT(tabela),
    new CttExpressoProvider({
      apiUrl: process.env.CTT_EXPRESSO_API_URL,
      clientId: process.env.CTT_EXPRESSO_CLIENT_ID,
      apiKey: process.env.CTT_EXPRESSO_API_KEY,
    }),
  ];
}

export function metodosAtivos(tabela: TabelaPortes): { metodo: MetodoEnvio; nome: string }[] {
  return criarProviders(tabela)
    .filter((p) => p.ativo)
    .map((p) => ({ metodo: p.metodo, nome: p.nome }));
}

export function precisaMorada(metodo: MetodoEnvio): boolean {
  return metodo !== "levantamento";
}

export async function cotarEnvio(
  tabela: TabelaPortes,
  metodo: MetodoEnvio,
  pedido: PedidoEnvio,
): Promise<ResultadoCotacao> {
  const provider = criarProviders(tabela).find((p) => p.metodo === metodo && p.ativo);
  if (!provider) return { ok: false, motivo: "Método de envio indisponível." };
  return provider.cotar(pedido);
}

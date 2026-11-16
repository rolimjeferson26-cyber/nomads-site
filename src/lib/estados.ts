export const ESTADOS_ENCOMENDA = {
  pendente: "A aguardar pagamento",
  paga: "Paga",
  em_producao: "Em produção",
  enviada: "Enviada",
  entregue: "Entregue",
  cancelada: "Cancelada",
} as const;
export type EstadoEncomenda = keyof typeof ESTADOS_ENCOMENDA;

export const ESTADOS_ORCAMENTO = {
  novo: "Recebido",
  respondido: "Respondido",
  aceite: "Aceite",
  recusado: "Recusado",
} as const;
export type EstadoOrcamento = keyof typeof ESTADOS_ORCAMENTO;

export function dataCurta(iso: string): string {
  return new Intl.DateTimeFormat("pt-PT", { dateStyle: "medium", timeZone: "Europe/Lisbon" }).format(new Date(iso));
}

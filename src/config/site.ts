// Dados gerais da NOMAD'S.
// Tudo o que está marcado "A CONFIRMAR" tem de ser revisto (só nos comentários, nunca visível no site).

export const SITE = {
  nome: "NOMAD'S",
  nomeLegal: "Jeferson Francisco Rolim Junior",
  formaJuridica: "empresário em nome individual",
  nif: "314604685",
  regimeIva: "isento de IVA ao abrigo do artigo 53.º do CIVA",
  morada: "Murtosa, Aveiro", // A CONFIRMAR: morada completa da oficina
  localidade: "Murtosa, região de Aveiro",
  // Sem email público até haver um endereço confirmado: o contacto oficial é o WhatsApp.
  // Número de WhatsApp com indicativo, só números (veio do site atual)
  whatsapp: "351915907886",
  telefoneVisivel: "915 907 886",
  instagram: "https://www.instagram.com/nomad.textil/",
  facebook: "https://www.facebook.com/share/18MqGuUEzL/",
  prazoEntregaDias: 10,
  horario: "Segunda a sexta, 9h às 19h. Sábado por marcação.", // A CONFIRMAR
  livroReclamacoes: "https://www.livroreclamacoes.pt/Inicio/",
  // Entidade de resolução alternativa de litígios (Lei 144/2015, art. 18.º)
  ral: {
    nome: "CNIACC – Centro Nacional de Informação e Arbitragem de Conflitos de Consumo",
    url: "https://www.cniacc.pt",
    site: "www.cniacc.pt",
  },
} as const;

// O domínio do site vive SÓ nesta variável de ambiente (hoje um endereço workers.dev).
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

// A partir daqui mostramos o convite para rever valores no WhatsApp.
export const LIMITE_GRUPO = 10;

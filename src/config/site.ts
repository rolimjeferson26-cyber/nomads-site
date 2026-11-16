// Dados gerais da NOMAD'S.
// Tudo o que está marcado "A CONFIRMAR" tem de ser revisto antes de publicar.

export const SITE = {
  nome: "NOMAD'S",
  nomeLegal: "NOMAD'S Têxtil", // A CONFIRMAR: nome da empresa/empresário em nome individual
  nif: "000000000", // A CONFIRMAR
  morada: "Murtosa, 3870 Aveiro", // A CONFIRMAR: morada completa da oficina
  localidade: "Murtosa, região de Aveiro",
  email: "geral@nomads.pt", // A CONFIRMAR
  // Número de WhatsApp com indicativo, só números (veio do site atual)
  whatsapp: "351915907886",
  telefoneVisivel: "915 907 886",
  instagram: "https://www.instagram.com/nomad.textil/",
  facebook: "https://www.facebook.com/share/18MqGuUEzL/",
  prazoEntregaDias: 10,
  horario: "Segunda a sexta, 9h às 19h. Sábado por marcação.", // A CONFIRMAR
  livroReclamacoes: "https://www.livroreclamacoes.pt/Inicio/",
  // Entidade de resolução alternativa de litígios (Lei 144/2015)
  ral: {
    nome: "CNIACC – Centro Nacional de Informação e Arbitragem de Conflitos de Consumo", // A CONFIRMAR
    url: "https://www.cniacc.pt",
  },
} as const;

// O domínio do site vive SÓ nesta variável de ambiente (hoje um endereço workers.dev).
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

// A partir daqui mostramos o convite para rever valores no WhatsApp.
export const LIMITE_GRUPO = 10;

// Esquemas de validação (zod). Tudo o que chega do browser passa por aqui no servidor.
import { z } from "zod";
import { CORES, DIMENSOES, PECAS, QUANTIDADE_MAXIMA_LOJA, TAMANHOS, TECIDOS } from "@/config/precos";

const chaves = <T extends object>(o: T) => Object.keys(o) as [Extract<keyof T, string>, ...Extract<keyof T, string>[]];

export const esquemaPeca = z.enum(chaves(PECAS));
export const esquemaTecido = z.enum(chaves(TECIDOS));
export const esquemaDimensao = z.enum(chaves(DIMENSOES));
export const esquemaCor = z.enum(CORES.map((c) => c.id) as [string, ...string[]]);
const texto = (max: number) => z.string().trim().max(max);
const obrigatorio = (max: number, msg = "Campo obrigatório.") => z.string().trim().min(1, msg).max(max);

export const esquemaEmail = z.string().trim().toLowerCase().pipe(z.email("Email inválido.")).pipe(z.string().max(200));
export const esquemaTelefone = z
  .string()
  .trim()
  .max(30)
  .regex(/^[+\d\s()-]*$/, "Telefone inválido.")
  .optional()
  .or(z.literal(""));
export const esquemaCodigoPostal = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{3}$/, "Código postal no formato 0000-000.");

export const esquemaItemCarrinho = z
  .object({
    estampaId: z.string().regex(/^[a-z0-9-]{2,60}$/),
    peca: esquemaPeca,
    cor: esquemaCor,
    tamanho: z.string().max(5),
    frente: esquemaDimensao.nullable(),
    costas: esquemaDimensao.nullable(),
    quantidade: z.number().int().min(1).max(QUANTIDADE_MAXIMA_LOJA),
  })
  .refine((i) => (TAMANHOS[i.peca] as readonly string[]).includes(i.tamanho), { message: "Tamanho inválido." })
  .refine((i) => i.frente || i.costas, { message: "Escolhe uma posição para a estampa." });
export type ItemCarrinho = z.infer<typeof esquemaItemCarrinho>;

export const esquemaMorada = z.object({
  nome: obrigatorio(120),
  morada: obrigatorio(200),
  codigoPostal: esquemaCodigoPostal,
  localidade: obrigatorio(80),
  telefone: esquemaTelefone,
});

export const esquemaCheckout = z
  .object({
    itens: z.array(esquemaItemCarrinho).min(1, "O carrinho está vazio.").max(20),
    email: esquemaEmail,
    nome: obrigatorio(120, "Indica o teu nome."),
    telefone: esquemaTelefone,
    metodo: z.enum(["levantamento", "entrega_local", "ctt"]),
    morada: z
      .object({ morada: obrigatorio(200), codigoPostal: esquemaCodigoPostal, localidade: obrigatorio(80) })
      .nullable(),
    aceitaTermos: z.literal(true, { error: "Tens de aceitar os Termos e Condições." }),
  })
  .refine((c) => c.metodo === "levantamento" || c.morada !== null, {
    message: "Indica a morada de entrega.",
    path: ["morada"],
  });

export const OCASIOES = [
  "Empresa / fardamento",
  "Festa / despedida",
  "Formatura / curso",
  "Evento desportivo / equipa",
  "Associação / corporação",
  "Casamento / família",
  "Outra",
] as const;

export const esquemaOrcamento = z
  .object({
    peca: esquemaPeca,
    tecido: esquemaTecido,
    frente: esquemaDimensao.nullable(),
    costas: esquemaDimensao.nullable(),
    quantidade: z.coerce.number().int().min(1, "Quantidade mínima: 1.").max(100000),
    ocasiao: z.enum(OCASIOES),
    nome: obrigatorio(120, "Indica o teu nome."),
    email: esquemaEmail,
    telefone: esquemaTelefone,
    mensagem: texto(2000).optional(),
    consentimento: z.literal(true, { error: "Tens de aceitar a Política de Privacidade." }),
  })
  .refine((o) => o.frente || o.costas, { message: "Escolhe onde vai a estampa.", path: ["frente"] });

export const esquemaContacto = z.object({
  nome: obrigatorio(120, "Indica o teu nome."),
  email: esquemaEmail,
  mensagem: obrigatorio(2000, "Escreve a tua mensagem."),
  consentimento: z.literal(true, { error: "Tens de aceitar a Política de Privacidade." }),
});

const cents = z.number().int().min(0).max(1_000_000);

export const esquemaTabelaPrecos = z.object({
  regras: z
    .array(
      z.object({
        peca: esquemaPeca,
        tecido: esquemaTecido,
        frente: esquemaDimensao.nullable(),
        costas: esquemaDimensao.nullable(),
        precoCents: cents,
        descricao: texto(80),
      }),
    )
    .max(100),
});

const escaloes = z
  .array(z.object({ ateGramas: z.number().int().min(1).max(100000), precoCents: cents }))
  .min(1)
  .max(20);

export const esquemaTabelaPortes = z.object({
  pesoPorPecaGramas: z.object({ tshirt: z.number().int().min(1).max(5000), sweater: z.number().int().min(1).max(5000) }),
  pesoEmbalagemGramas: z.number().int().min(0).max(5000),
  ctt: z.object({ continente: escaloes, madeira: escaloes, acores: escaloes }),
  levantamento: z.object({ precoCents: cents, local: texto(120) }),
  entregaLocal: z.object({
    precoCents: cents,
    prefixosCodigoPostal: z.array(z.string().regex(/^\d{4}$/)).max(50),
    descricao: texto(120),
  }),
});

// ---------- Uploads de imagens ----------
export const TIPOS_IMAGEM = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
} as const;

// Confirma o tipo pelos primeiros bytes do ficheiro (não confia no nome nem no tipo enviado).
export function tipoRealDaImagem(bytes: Uint8Array): keyof typeof TIPOS_IMAGEM | null {
  const b = bytes;
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (
    b.length >= 12 &&
    b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
    b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50
  )
    return "image/webp";
  return null;
}

export async function validarImagem(
  ficheiro: unknown,
  maxBytes: number,
): Promise<{ ok: true; bytes: Uint8Array; tipo: keyof typeof TIPOS_IMAGEM } | { ok: false; erro: string } | null> {
  if (!(ficheiro instanceof File) || ficheiro.size === 0) return null; // sem ficheiro
  if (ficheiro.size > maxBytes) {
    return { ok: false, erro: `A imagem tem de ter no máximo ${Math.round(maxBytes / 1024 / 1024)} MB.` };
  }
  const bytes = new Uint8Array(await ficheiro.arrayBuffer());
  const tipo = tipoRealDaImagem(bytes);
  if (!tipo) return { ok: false, erro: "Só aceitamos imagens PNG, JPG ou WebP." };
  return { ok: true, bytes, tipo };
}

export function primeiroErro(e: z.ZodError): string {
  return e.issues[0]?.message ?? "Dados inválidos.";
}

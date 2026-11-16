"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { iniciarPagamento } from "@/app/carrinho/acoes";
import type { Estampa } from "@/config/estampas";
import type { TabelaPortes } from "@/config/portes";
import { CORES, DIMENSOES, PECAS, type TabelaPrecos } from "@/config/precos";
import { SITE } from "@/config/site";
import { carrinho, useCarrinho } from "@/lib/carrinho";
import { cotarEnvio, normalizarCodigoPostal, type ResultadoCotacao } from "@/lib/envio";
import { formatarEuros, precoLinha } from "@/lib/precos";
import { linkWhatsApp } from "@/lib/whatsapp";
import { AvisoGrupo } from "../AvisoGrupo";
import { MockupPlano } from "../MockupPlano";

type Metodo = "levantamento" | "entrega_local" | "ctt";

type Props = {
  estampas: Estampa[];
  tabelaPrecos: TabelaPrecos;
  tabelaPortes: TabelaPortes;
  emailInicial: string;
  pagamentosAtivos: boolean;
};

export function CarrinhoCheckout({ estampas, tabelaPrecos, tabelaPortes, emailInicial, pagamentosAtivos }: Props) {
  const linhas = useCarrinho();
  const [metodo, setMetodo] = useState<Metodo>("ctt");
  const [form, setForm] = useState({ nome: "", email: emailInicial, telefone: "", morada: "", codigoPostal: "", localidade: "" });
  const [aceita, setAceita] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [cotacao, setCotacao] = useState<ResultadoCotacao | null>(null);
  const [aEnviar, iniciar] = useTransition();

  const calculadas = useMemo(
    () =>
      linhas.map((l) => ({
        linha: l,
        estampa: estampas.find((e) => e.id === l.estampaId),
        preco: precoLinha(tabelaPrecos, { peca: l.peca, tecido: "algodao", frente: l.frente, costas: l.costas }, l.quantidade),
      })),
    [linhas, estampas, tabelaPrecos],
  );
  const subtotal = calculadas.reduce((t, c) => t + (c.preco.tipo === "preco" ? c.preco.totalCents : 0), 0);
  const temConsulta = calculadas.some((c) => c.preco.tipo !== "preco" || !c.estampa);
  const totalPecas = linhas.reduce((t, l) => t + l.quantidade, 0);

  // Estimativa de portes no browser (o servidor recalcula ao pagar)
  useEffect(() => {
    let ativo = true;
    const cp = normalizarCodigoPostal(form.codigoPostal);
    cotarEnvio(tabelaPortes, metodo, {
      codigoPostal: metodo === "levantamento" ? null : cp,
      pecas: linhas.map((l) => ({ peca: l.peca, quantidade: l.quantidade })),
    }).then((r) => ativo && setCotacao(r));
    return () => {
      ativo = false;
    };
  }, [metodo, form.codigoPostal, linhas, tabelaPortes]);

  const portes = cotacao?.ok ? cotacao.cotacao.precoCents : null;
  const resumo = linhas
    .map((l) => `${l.quantidade}x ${PECAS[l.peca]} "${estampas.find((e) => e.id === l.estampaId)?.nome ?? l.estampaId}" ${l.tamanho}`)
    .join("; ");

  function pagar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    const cp = normalizarCodigoPostal(form.codigoPostal);
    iniciar(async () => {
      const r = await iniciarPagamento({
        itens: linhas.map((l) => ({ estampaId: l.estampaId, peca: l.peca, cor: l.cor, tamanho: l.tamanho, frente: l.frente, costas: l.costas, quantidade: l.quantidade })),
        email: form.email,
        nome: form.nome,
        telefone: form.telefone,
        metodo,
        morada: metodo === "levantamento" ? null : { morada: form.morada, codigoPostal: cp ?? form.codigoPostal, localidade: form.localidade },
        aceitaTermos: aceita,
      });
      if (r.ok) window.location.assign(r.url);
      else setErro(r.erro);
    });
  }

  if (linhas.length === 0) {
    return (
      <div className="cartao p-10 text-center">
        <p className="titulo text-4xl">O carrinho está vazio</p>
        <p className="mt-3 text-estrada">Escolhe uma estampa e monta a tua peça.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/loja" className="botao">Ir à loja</Link>
          <Link href="/configurador" className="botao botao-linha">Configurador</Link>
        </div>
      </div>
    );
  }

  const campo = (k: keyof typeof form, rotulo: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="rotulo">
      {rotulo}
      <input className="campo" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...extra} />
    </label>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
      <section aria-label="Peças no carrinho">
        <ul className="grid gap-3">
          <AnimatePresence initial={false}>
            {calculadas.map(({ linha: l, estampa, preco }) => (
              <motion.li key={l.id} layout exit={{ opacity: 0, x: -40 }} className="cartao flex gap-4 p-4">
                <div className="size-24 shrink-0 rounded-xl bg-asfalto p-1 md:size-28">
                  <MockupPlano
                    peca={l.peca}
                    corHex={CORES.find((c) => c.id === l.cor)?.hex ?? "#222"}
                    face={l.frente ? "frente" : "costas"}
                    estampa={estampa}
                    frente={l.frente}
                    costas={l.costas}
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <p className="font-semibold">{PECAS[l.peca]} “{estampa?.nome ?? "indisponível"}”</p>
                    <p className="font-semibold">{preco.tipo === "preco" ? formatarEuros(preco.totalCents) : "Sob consulta"}</p>
                  </div>
                  <p className="text-sm text-estrada">
                    {CORES.find((c) => c.id === l.cor)?.nome} · {l.tamanho}
                    {l.frente && ` · frente ${DIMENSOES[l.frente].nome}`}
                    {l.costas && ` · costas ${DIMENSOES[l.costas].nome}`}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center rounded-full border border-asfalto-3">
                      <button type="button" className="size-9" aria-label="Menos uma" onClick={() => carrinho.quantidade(l.id, l.quantidade - 1)}>−</button>
                      <span className="w-8 text-center text-sm font-semibold">{l.quantidade}</span>
                      <button type="button" className="size-9" aria-label="Mais uma" onClick={() => carrinho.quantidade(l.id, l.quantidade + 1)}>+</button>
                    </div>
                    <button type="button" onClick={() => carrinho.remover(l.id)} className="text-sm text-estrada underline hover:text-erro">Remover</button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <div className="mt-4">
          <AvisoGrupo quantidade={totalPecas} pedido={resumo} />
        </div>
      </section>

      <form onSubmit={pagar} className="cartao grid content-start gap-4 p-5 md:p-6" noValidate>
        <h2 className="titulo text-3xl">Entrega e pagamento</h2>
        <fieldset className="grid gap-2">
          <legend className="mb-2 font-semibold">Como queres receber?</legend>
          {(
            [
              ["ctt", "CTT Expresso Em 2 Dias", "Para todo o país"],
              ["levantamento", "Levantamento na oficina", "Murtosa · grátis"],
              ["entrega_local", "Entrega na zona", tabelaPortes.entregaLocal.descricao],
            ] as const
          ).map(([m, nome, detalhe]) => (
            <label key={m} className="opcao flex cursor-pointer items-center gap-3">
              <input type="radio" name="metodo" checked={metodo === m} onChange={() => setMetodo(m)} className="size-4 accent-[var(--destaque)]" />
              <span>
                <span className="block font-semibold">{nome}</span>
                <span className="text-sm text-estrada">{detalhe}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {campo("nome", "Nome", { autoComplete: "name", required: true, maxLength: 120 })}
        {campo("email", "Email", { type: "email", autoComplete: "email", required: true, maxLength: 200 })}
        {campo("telefone", "Telemóvel (opcional)", { type: "tel", autoComplete: "tel", maxLength: 30 })}
        {metodo !== "levantamento" && (
          <>
            {campo("morada", "Morada", { autoComplete: "street-address", required: true, maxLength: 200 })}
            <div className="grid grid-cols-[1fr_1.4fr] gap-3">
              {campo("codigoPostal", "Código postal", { autoComplete: "postal-code", inputMode: "numeric", placeholder: "0000-000", required: true, maxLength: 8 })}
              {campo("localidade", "Localidade", { autoComplete: "address-level2", required: true, maxLength: 80 })}
            </div>
          </>
        )}

        <dl className="grid gap-1 border-t border-white/10 pt-4">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatarEuros(subtotal)}</dd></div>
          <div className="flex justify-between gap-4">
            <dt>Portes</dt>
            <dd className="text-right">{portes !== null ? formatarEuros(portes) : <span className="text-sm text-estrada">{cotacao && !cotacao.ok ? cotacao.motivo : "—"}</span>}</dd>
          </div>
          <div className="mt-2 flex justify-between text-xl font-semibold">
            <dt>Total</dt>
            <dd className="text-destaque">{formatarEuros(subtotal + (portes ?? 0))}</dd>
          </div>
          <p className="text-xs text-estrada">
            Preços finais, isentos de IVA. Portes CTT a preço de balcão (IVA incluído). Produção e entrega em até {SITE.prazoEntregaDias} dias.
          </p>
        </dl>
        {cotacao && !cotacao.ok && cotacao.motivo.includes("10 kg") && (
          <a href={linkWhatsApp(`Olá NOMAD'S! Encomenda acima de 10 kg, portes a combinar: ${resumo}`)} target="_blank" rel="noopener noreferrer" className="botao !bg-[#25D366] !text-white">
            Combinar portes no WhatsApp
          </a>
        )}

        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={aceita} onChange={(e) => setAceita(e.target.checked)} className="mt-0.5 size-5 accent-[var(--destaque)]" />
          <span>
            Li e aceito os <Link href="/legal/termos" className="underline" target="_blank">Termos e Condições</Link>. Sei que peças personalizadas não têm direito de livre resolução.
          </span>
        </label>

        {erro && <p role="alert" className="rounded-xl bg-erro/15 p-3 text-sm text-erro">{erro}</p>}
        {temConsulta && <p className="text-sm text-estrada">Há peças sob consulta no carrinho: remove-as ou pede orçamento.</p>}

        <button type="submit" className="botao w-full text-lg" disabled={aEnviar || temConsulta || portes === null || !pagamentosAtivos}>
          {aEnviar ? "A abrir o pagamento…" : "Pagar com segurança"}
        </button>
        {!pagamentosAtivos && (
          <p className="text-sm text-estrada">
            Pagamentos online em ativação.{" "}
            <a className="underline" href={linkWhatsApp(`Olá NOMAD'S! Quero encomendar: ${resumo}`)} target="_blank" rel="noopener noreferrer">
              Encomenda pelo WhatsApp
            </a>
            .
          </p>
        )}
        <p className="text-xs text-estrada">Pagamento processado pela Stripe (cartão, MB WAY, Multibanco conforme disponível). Os dados do cartão nunca passam pelo nosso site.</p>
      </form>
    </div>
  );
}

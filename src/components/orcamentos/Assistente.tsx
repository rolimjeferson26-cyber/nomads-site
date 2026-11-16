"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { enviarOrcamento } from "@/app/orcamentos/acoes";
import { DIMENSOES, PECAS, TECIDOS, type Dimensao, type Peca, type TabelaPrecos, type Tecido } from "@/config/precos";
import { formatarEuros, precoLinha } from "@/lib/precos";
import { areaEstampa, caminhoSvg, type Face } from "@/lib/silhueta";
import { OCASIOES } from "@/lib/validacao";
import { linkWhatsApp } from "@/lib/whatsapp";
import { AvisoGrupo } from "../AvisoGrupo";
import { IconeSeta, IconeWhatsApp } from "../Icones";

const PASSOS = ["Peça", "Tecido", "Estampa", "Detalhes", "Resumo"];
const ORDEM: Dimensao[] = ["25x35", "25x25", "10x10"]; // as maiores primeiro, para as pequenas ficarem clicáveis por cima

function DesenhoPeca({ peca, face, valor, aoMudar }: { peca: Peca; face: Face; valor: Dimensao | null; aoMudar: (d: Dimensao | null) => void }) {
  return (
    <figure className="grid gap-3">
      <figcaption className="text-center font-semibold capitalize">{face}</figcaption>
      <svg viewBox="-4.6 -3.9 9.2 7.9" className="w-full" role="group" aria-label={`Tamanho da estampa: ${face}`}>
        <path d={caminhoSvg(peca)} fill="#2a231c" stroke="#9a9083" strokeWidth="0.05" transform={face === "costas" ? "scale(-1 1)" : undefined} />
        {ORDEM.map((d) => {
          const a = areaEstampa(face, d);
          const ativo = valor === d;
          return (
            <rect
              key={d}
              x={a.x - a.largura / 2}
              y={-a.y - a.altura / 2}
              width={a.largura}
              height={a.altura}
              rx="0.08"
              className="cursor-pointer transition-all"
              fill={ativo ? "var(--destaque)" : "transparent"}
              fillOpacity={ativo ? 0.55 : 1}
              stroke={ativo ? "var(--destaque)" : "#ede3cf"}
              strokeOpacity={ativo ? 1 : 0.35}
              strokeWidth="0.05"
              strokeDasharray={ativo ? undefined : "0.15 0.1"}
              onClick={() => aoMudar(ativo ? null : d)}
            >
              <title>{DIMENSOES[d].nome}</title>
            </rect>
          );
        })}
        {valor && (
          <text x={areaEstampa(face, valor).x} y={-areaEstampa(face, valor).y + 0.12} fontSize="0.38" textAnchor="middle" fill="#14110e" fontWeight="700" pointerEvents="none">
            {valor}
          </text>
        )}
      </svg>
      <div className="grid grid-cols-4 gap-1.5">
        {([null, "10x10", "25x25", "25x35"] as const).map((d) => (
          <button key={d ?? "nada"} type="button" aria-pressed={valor === d} onClick={() => aoMudar(d)} className="opcao !min-h-10 !px-1 text-xs font-semibold">
            {d ?? "Nada"}
          </button>
        ))}
      </div>
    </figure>
  );
}

export function Assistente({ tabela }: { tabela: TabelaPrecos }) {
  const [passo, setPasso] = useState(0);
  const [direcao, setDirecao] = useState(1);
  const [peca, setPeca] = useState<Peca>("tshirt");
  const [tecido, setTecido] = useState<Tecido>("algodao");
  const [frente, setFrente] = useState<Dimensao | null>("25x25");
  const [costas, setCostas] = useState<Dimensao | null>(null);
  const [quantidade, setQuantidade] = useState(20);
  const [ocasiao, setOcasiao] = useState<(typeof OCASIOES)[number]>(OCASIOES[0]);
  const [arte, setArte] = useState<File | null>(null);
  const [contacto, setContacto] = useState({ nome: "", email: "", telefone: "", mensagem: "" });
  const [consentimento, setConsentimento] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<{ numero: number | null } | null>(null);
  const [aEnviar, iniciar] = useTransition();
  const ficheiro = useRef<HTMLInputElement>(null);

  const temEstampa = Boolean(frente || costas);
  const linha = precoLinha(tabela, { peca, tecido, frente, costas }, quantidade);
  const resumoTexto = [
    `${quantidade}x ${PECAS[peca]} (${TECIDOS[tecido]})`,
    `frente: ${frente ? DIMENSOES[frente].nome : "nada"}`,
    `costas: ${costas ? DIMENSOES[costas].nome : "nada"}`,
    `ocasião: ${ocasiao}`,
    linha.tipo === "preco" ? `pré-orçamento: ${formatarEuros(linha.totalCents)}` : "pré-orçamento: sob consulta",
  ].join("; ");

  const ir = (n: number) => {
    setDirecao(n > passo ? 1 : -1);
    setPasso(n);
    setErro(null);
  };
  const podeAvancar = passo !== 2 || temEstampa;

  function enviar() {
    setErro(null);
    const fd = new FormData();
    fd.set("peca", peca);
    fd.set("tecido", tecido);
    fd.set("frente", frente ?? "");
    fd.set("costas", costas ?? "");
    fd.set("quantidade", String(quantidade));
    fd.set("ocasiao", ocasiao);
    Object.entries(contacto).forEach(([k, val]) => fd.set(k, val));
    if (consentimento) fd.set("consentimento", "sim");
    if (arte) fd.set("arte", arte);
    const armadilha = (document.getElementById("campo-site") as HTMLInputElement | null)?.value;
    if (armadilha) fd.set("site", armadilha);
    iniciar(async () => {
      const r = await enviarOrcamento(fd);
      if (r.ok) setEnviado({ numero: r.numero });
      else setErro(r.erro);
    });
  }

  if (enviado) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="cartao p-10 text-center">
        <p className="kicker">Pedido enviado</p>
        <h2 className="titulo mt-3 text-5xl">Obrigado, {contacto.nome.split(" ")[0]}!</h2>
        <p className="mt-4 text-estrada">
          {enviado.numero && <>Pedido n.º {enviado.numero}. </>}Respondemos por email ou telefone em breve, normalmente no próprio dia útil.
        </p>
        <Link href="/loja" className="botao mt-8">Ver a loja</Link>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="cartao overflow-hidden">
        <ol className="flex border-b border-white/10" aria-label="Passos">
          {PASSOS.map((p, i) => (
            <li key={p} className="flex-1">
              <button
                type="button"
                onClick={() => i < passo && ir(i)}
                aria-current={i === passo ? "step" : undefined}
                disabled={i > passo}
                className={`relative w-full px-1 py-4 text-center text-xs font-semibold md:text-sm ${i <= passo ? "text-marfim" : "text-estrada"}`}
              >
                <span className="hidden sm:inline">{i + 1}. </span>{p}
                {i <= passo && <motion.span layoutId={i === passo ? "passo" : undefined} className={`absolute inset-x-0 bottom-0 h-1 ${i === passo ? "bg-destaque" : "bg-destaque/40"}`} />}
              </button>
            </li>
          ))}
        </ol>

        <div className="relative min-h-[460px] overflow-hidden p-5 md:p-8">
          <AnimatePresence mode="wait" custom={direcao}>
            <motion.div
              key={passo}
              custom={direcao}
              initial={{ x: 60 * direcao, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -60 * direcao, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {passo === 0 && (
                <fieldset>
                  <legend className="titulo mb-6 text-4xl">Que peça?</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {(Object.keys(PECAS) as Peca[]).map((p) => (
                      <button key={p} type="button" aria-pressed={peca === p} onClick={() => setPeca(p)} className="opcao grid place-items-center gap-3 !p-6">
                        <svg viewBox="-4.6 -3.9 9.2 7.9" className="w-32"><path d={caminhoSvg(p)} fill="currentColor" opacity=".8" /></svg>
                        <span className="text-xl font-semibold">{PECAS[p]}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {passo === 1 && (
                <fieldset>
                  <legend className="titulo mb-6 text-4xl">Que tecido?</legend>
                  <div className="grid gap-3">
                    {(Object.keys(TECIDOS) as Tecido[]).map((t) => (
                      <button key={t} type="button" aria-pressed={tecido === t} onClick={() => setTecido(t)} className="opcao flex items-center justify-between !p-5 text-left">
                        <span className="text-lg font-semibold">{TECIDOS[t]}</span>
                        <span className="text-sm text-estrada">{t === "algodao" ? "Preço na hora" : "Sob consulta"}</span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              )}
              {passo === 2 && (
                <fieldset>
                  <legend className="titulo mb-2 text-4xl">Onde vai a estampa?</legend>
                  <p className="mb-6 text-estrada">Toca no desenho para escolher o tamanho na frente, nas costas ou nos dois.</p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <DesenhoPeca peca={peca} face="frente" valor={frente} aoMudar={setFrente} />
                    <DesenhoPeca peca={peca} face="costas" valor={costas} aoMudar={setCostas} />
                  </div>
                  {!temEstampa && <p className="mt-4 text-sm text-erro">Escolhe pelo menos uma posição.</p>}
                </fieldset>
              )}
              {passo === 3 && (
                <div className="grid gap-5">
                  <h2 className="titulo text-4xl">Quantas e para quê?</h2>
                  <label className="rotulo">
                    Quantidade
                    <div className="flex items-center gap-3">
                      <input type="range" min={1} max={200} value={Math.min(quantidade, 200)} onChange={(e) => setQuantidade(Number(e.target.value))} className="flex-1 accent-[var(--destaque)]" aria-label="Quantidade (deslizar)" />
                      <input type="number" min={1} max={100000} inputMode="numeric" value={quantidade} onChange={(e) => setQuantidade(Math.max(1, Math.floor(Number(e.target.value) || 1)))} className="campo !w-28 text-center" />
                    </div>
                  </label>
                  <fieldset>
                    <legend className="mb-2 text-sm font-medium">Ocasião</legend>
                    <div className="flex flex-wrap gap-2">
                      {OCASIOES.map((o) => (
                        <button key={o} type="button" aria-pressed={ocasiao === o} onClick={() => setOcasiao(o)} className="opcao !rounded-full text-sm">
                          {o}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <div className="rotulo">
                    Arte (opcional)
                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-asfalto-3 p-4">
                      <input
                        ref={ficheiro}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        id="arte"
                        onChange={(e) => {
                          const f = e.target.files?.[0] ?? null;
                          if (f && f.size > 5 * 1024 * 1024) {
                            setErro("A imagem tem de ter no máximo 5 MB.");
                            e.target.value = "";
                            return;
                          }
                          setErro(null);
                          setArte(f);
                        }}
                      />
                      <label htmlFor="arte" className="botao botao-linha cursor-pointer !min-h-10">Escolher imagem</label>
                      <span className="text-sm text-estrada">{arte ? arte.name : "PNG, JPG ou WebP até 5 MB"}</span>
                      {arte && (
                        <button type="button" className="text-sm underline" onClick={() => { setArte(null); if (ficheiro.current) ficheiro.current.value = ""; }}>
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {passo === 4 && (
                <div className="grid gap-4">
                  <h2 className="titulo text-4xl">Quase lá</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="rotulo">Nome<input className="campo" autoComplete="name" maxLength={120} value={contacto.nome} onChange={(e) => setContacto({ ...contacto, nome: e.target.value })} /></label>
                    <label className="rotulo">Email<input className="campo" type="email" autoComplete="email" maxLength={200} value={contacto.email} onChange={(e) => setContacto({ ...contacto, email: e.target.value })} /></label>
                    <label className="rotulo">Telemóvel (opcional)<input className="campo" type="tel" autoComplete="tel" maxLength={30} value={contacto.telefone} onChange={(e) => setContacto({ ...contacto, telefone: e.target.value })} /></label>
                  </div>
                  <label className="rotulo">
                    Mensagem (opcional)
                    <textarea className="campo min-h-24" maxLength={2000} placeholder="Cores das peças, tamanhos, prazo, ideias…" value={contacto.mensagem} onChange={(e) => setContacto({ ...contacto, mensagem: e.target.value })} />
                  </label>
                  {/* armadilha para robôs */}
                  <div aria-hidden className="absolute -left-[9999px]">
                    <label>Site<input id="campo-site" tabIndex={-1} autoComplete="off" /></label>
                  </div>
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" checked={consentimento} onChange={(e) => setConsentimento(e.target.checked)} className="mt-0.5 size-5 accent-[var(--destaque)]" />
                    <span>Aceito que a NOMAD&apos;S use estes dados para responder ao pedido (<Link href="/legal/privacidade" className="underline" target="_blank">Política de Privacidade</Link>).</span>
                  </label>
                  {erro && <p role="alert" className="rounded-xl bg-erro/15 p-3 text-sm text-erro">{erro}</p>}
                  <div className="flex flex-wrap gap-3">
                    <button type="button" className="botao" onClick={enviar} disabled={aEnviar}>
                      {aEnviar ? "A enviar…" : "Enviar pedido"}
                    </button>
                    <a
                      className="botao !bg-[#25D366] !text-white"
                      href={linkWhatsApp(`Olá NOMAD'S! Pedido de orçamento: ${resumoTexto}.${contacto.mensagem ? ` Notas: ${contacto.mensagem}` : ""}${arte ? " (envio a arte a seguir)" : ""}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconeWhatsApp className="size-5" /> Enviar pelo WhatsApp
                    </a>
                  </div>
                  {arte && <p className="text-xs text-estrada">Pelo WhatsApp, anexa a imagem na conversa.</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between border-t border-white/10 p-4 md:px-8">
          <button type="button" className="botao botao-linha" onClick={() => ir(passo - 1)} disabled={passo === 0}>Voltar</button>
          {passo < PASSOS.length - 1 && (
            <button type="button" className="botao" onClick={() => podeAvancar && ir(passo + 1)} disabled={!podeAvancar}>
              Seguinte <IconeSeta className="size-5" />
            </button>
          )}
        </div>
      </div>

      <aside className="cartao sticky top-24 grid content-start gap-3 self-start p-6" aria-live="polite">
        <p className="kicker">Pré-orçamento</p>
        <AnimatePresence mode="wait">
          <motion.p key={linha.tipo === "preco" ? linha.totalCents : "c"} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} className="titulo text-6xl text-destaque">
            {linha.tipo === "preco" ? formatarEuros(linha.totalCents) : "Sob consulta"}
          </motion.p>
        </AnimatePresence>
        {linha.tipo === "preco" && <p className="text-sm text-estrada">{formatarEuros(linha.unitarioCents)} por peça · {linha.descricao}</p>}
        <dl className="grid gap-1 text-sm">
          <div className="flex justify-between"><dt className="text-estrada">Peça</dt><dd>{PECAS[peca]}</dd></div>
          <div className="flex justify-between"><dt className="text-estrada">Tecido</dt><dd>{TECIDOS[tecido]}</dd></div>
          <div className="flex justify-between"><dt className="text-estrada">Frente</dt><dd>{frente ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-estrada">Costas</dt><dd>{costas ?? "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-estrada">Quantidade</dt><dd>{quantidade}</dd></div>
        </dl>
        <p className="text-xs text-estrada">Valor indicativo, sem portes. Preços finais isentos de IVA. Confirmamos tudo na resposta.</p>
        <AvisoGrupo quantidade={quantidade} pedido={resumoTexto} />
      </aside>
    </div>
  );
}

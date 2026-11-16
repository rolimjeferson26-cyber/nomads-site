"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import type { Estampa } from "@/config/estampas";
import { ESTILOS } from "@/config/estilos";
import { CORES, DIMENSOES, PECAS, TAMANHOS, type Dimensao, type Peca, type TabelaPrecos } from "@/config/precos";
import { SITE } from "@/config/site";
import { carrinho } from "@/lib/carrinho";
import { formatarEuros, precoUnitario } from "@/lib/precos";
import { areasDoPosicionamento, posicionamento, type Face } from "@/lib/silhueta";
import { linkWhatsApp } from "@/lib/whatsapp";
import { AvisoGrupo } from "../AvisoGrupo";
import { useEstilo } from "../EstiloProvider";
import { IconeRodar, IconeWhatsApp } from "../Icones";
import { MockupPlano } from "../MockupPlano";
import type { EstadoRotacao } from "./Cena3D";

const Cena3D = dynamic(() => import("./Cena3D"), { ssr: false });

type Props = {
  estampas: Estampa[];
  tabela: TabelaPrecos;
  inicial: { estampaId?: string; peca?: Peca };
};

let webglEmCache: boolean | null = null;
function temWebGL(): boolean {
  if (webglEmCache === null) {
    try {
      const c = document.createElement("canvas");
      webglEmCache = Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
    } catch {
      webglEmCache = false;
    }
  }
  return webglEmCache;
}

const semSubscricao = () => () => {};
const MQ_MOVEL = "(max-width: 1023px)";
function subscreverMovel(f: () => void) {
  const mq = window.matchMedia(MQ_MOVEL);
  mq.addEventListener("change", f);
  return () => mq.removeEventListener("change", f);
}

type Voo = { chave: number; url: string; de: DOMRect; para: DOMRect };

export function Configurador({ estampas, tabela, inicial }: Props) {
  const { estilo } = useEstilo();
  const reduzir = useReducedMotion() ?? false;
  const [filtro, setFiltro] = useState<string>(
    () => estampas.find((e) => e.id === inicial.estampaId)?.estilo ?? estilo.id,
  );
  const [estampaId, setEstampaId] = useState<string | null>(inicial.estampaId ?? null);
  const [peca, setPeca] = useState<Peca>(inicial.peca ?? "tshirt");
  const [cor, setCor] = useState<string>("preto");
  const [tamanho, setTamanho] = useState<string>("M");
  const [face, setFace] = useState<Face>("frente");
  const [dimensao, setDimensao] = useState<Dimensao>("25x25");
  const [peito, setPeito] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const webgl = useSyncExternalStore(semSubscricao, temWebGL, () => null);
  const modo = webgl === null ? "a-verificar" : webgl ? "3d" : "2d";
  const mobile = useSyncExternalStore(subscreverMovel, () => window.matchMedia(MQ_MOVEL).matches, () => false);
  const contadorVoo = useRef(0);
  const [adicionado, setAdicionado] = useState(0);
  const [voo, setVoo] = useState<Voo | null>(null);
  const palco = useRef<HTMLDivElement>(null);
  const rotacao = useRef<EstadoRotacao>({ atual: 0, alvo: 0, velocidade: 0, aArrastar: false });
  const arrasto = useRef<{ x: number; ultimo: number } | null>(null);

  // O filtro acompanha o seletor de estilo do site.
  const [estiloAnterior, setEstiloAnterior] = useState(estilo.id);
  if (estiloAnterior !== estilo.id) {
    setEstiloAnterior(estilo.id);
    setFiltro(estilo.id);
  }

  function escolherPeca(p: Peca) {
    setPeca(p);
    if (!(TAMANHOS[p] as readonly string[]).includes(tamanho)) setTamanho("M");
  }

  // Roda a peça para o lado onde vai a estampa (pelo caminho mais curto).
  useEffect(() => {
    const r = rotacao.current;
    const base = face === "frente" ? 0 : Math.PI;
    const voltas = Math.round((r.atual - base) / (2 * Math.PI));
    r.alvo = base + voltas * 2 * Math.PI;
    r.velocidade = 0;
  }, [face]);

  // Partilhar a configuração pelo endereço
  useEffect(() => {
    const p = new URLSearchParams();
    if (estampaId) p.set("estampa", estampaId);
    p.set("peca", peca);
    window.history.replaceState(null, "", `?${p.toString()}`);
  }, [estampaId, peca]);

  const estampa = estampas.find((e) => e.id === estampaId) ?? null;
  const visiveis = filtro === "todos" ? estampas : estampas.filter((e) => e.estilo === filtro);
  const corAtual = CORES.find((c) => c.id === cor) ?? CORES[0];
  const pos = posicionamento(face, dimensao, peito);
  const areas = useMemo(() => areasDoPosicionamento(pos), [pos.frente, pos.costas]); // eslint-disable-line react-hooks/exhaustive-deps
  const preco = precoUnitario(tabela, { peca, tecido: "algodao", ...pos });

  const descricao = [
    `${PECAS[peca]} ${corAtual.nome}, tamanho ${tamanho}`,
    estampa ? `estampa "${estampa.nome}"` : "estampa por escolher",
    pos.frente ? `frente ${DIMENSOES[pos.frente].nome}` : null,
    pos.costas ? `costas ${DIMENSOES[pos.costas].nome}` : null,
    `${quantidade} ${quantidade === 1 ? "peça" : "peças"}`,
  ]
    .filter(Boolean)
    .join(", ");

  function escolherEstampa(e: Estampa, botao: HTMLElement) {
    setEstampaId(e.id);
    const alvo = palco.current?.getBoundingClientRect();
    if (alvo && !reduzir) {
      contadorVoo.current += 1;
      setVoo({ chave: contadorVoo.current, url: e.imagemUrl, de: botao.getBoundingClientRect(), para: alvo });
    }
  }

  const contadorAdicionado = useRef(0);
  function adicionar() {
    if (!estampa || preco.tipo !== "preco") return;
    carrinho.adicionar({
      estampaId: estampa.id,
      peca,
      cor,
      tamanho,
      frente: pos.frente,
      costas: pos.costas,
      quantidade,
    });
    contadorAdicionado.current += 1;
    setAdicionado(contadorAdicionado.current);
  }

  // Arrastar para rodar (rato e toque). Na vertical deixa a página fazer scroll.
  const aoPressionar = (e: PointerEvent<HTMLDivElement>) => {
    arrasto.current = { x: e.clientX, ultimo: e.clientX };
    rotacao.current.aArrastar = true;
    rotacao.current.velocidade = 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const aoMover = (e: PointerEvent<HTMLDivElement>) => {
    if (!arrasto.current) return;
    const dx = e.clientX - arrasto.current.ultimo;
    arrasto.current.ultimo = e.clientX;
    rotacao.current.atual += dx * 0.012;
    rotacao.current.velocidade = dx * 0.012;
  };
  const aoLargar = () => {
    arrasto.current = null;
    rotacao.current.aArrastar = false;
    rotacao.current.alvo = rotacao.current.atual;
  };

  const mockup2D = (
    <MockupPlano
      peca={peca}
      corHex={corAtual.hex}
      face={face}
      estampa={estampa}
      frente={pos.frente}
      costas={pos.costas}
      className="h-full w-full drop-shadow-[0_30px_40px_rgba(0,0,0,.5)]"
    />
  );

  return (
    <div className="mx-auto grid max-w-[1500px] gap-6 px-4 lg:grid-cols-[230px_minmax(0,1fr)_380px] lg:px-8">
      {/* ---------- Estampas ---------- */}
      <section aria-labelledby="titulo-estampas" className="order-2 min-w-0 lg:order-1">
        <h2 id="titulo-estampas" className="kicker mb-3">1 · Estampa</h2>
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible" role="group" aria-label="Filtrar por estilo">
          {[{ id: "todos", nome: "Todos" }, ...ESTILOS].map((e) => (
            <button
              key={e.id}
              type="button"
              aria-pressed={filtro === e.id}
              onClick={() => setFiltro(e.id)}
              className="opcao shrink-0 !min-h-9 !rounded-full !px-3 !py-1 text-sm"
            >
              {e.nome}
            </button>
          ))}
        </div>
        <ul className="flex snap-x gap-3 overflow-x-auto pb-3 lg:max-h-[68vh] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pr-2">
          {visiveis.map((e) => (
            <li key={e.id} className="shrink-0 snap-start">
              <button
                type="button"
                aria-pressed={estampaId === e.id}
                onClick={(ev) => escolherEstampa(e, ev.currentTarget)}
                className="opcao group flex w-32 flex-col items-center gap-2 !p-3 lg:w-full lg:flex-row"
              >
                <img src={e.imagemUrl} alt="" width={80} height={80} className="size-20 object-contain transition-transform group-hover:scale-110 lg:size-16" />
                <span className="text-sm font-semibold">{e.nome}</span>
              </button>
            </li>
          ))}
          {visiveis.length === 0 && <li className="text-estrada">Ainda não há estampas neste estilo.</li>}
        </ul>
      </section>

      {/* ---------- Palco (mockup) ---------- */}
      <section aria-label="Pré-visualização da peça" className="order-1 lg:order-2">
        <div
          ref={palco}
          className="relative h-[52vh] min-h-[340px] cursor-grab touch-pan-y select-none overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_50%_40%,#2d261f,#14110e_70%)] active:cursor-grabbing lg:h-[74vh]"
          onPointerDown={modo === "3d" ? aoPressionar : undefined}
          onPointerMove={modo === "3d" ? aoMover : undefined}
          onPointerUp={aoLargar}
          onPointerCancel={aoLargar}
        >
          {modo === "3d" ? (
            <Cena3D
              peca={peca}
              corHex={corAtual.hex}
              estampa={estampa}
              areas={areas}
              rotacao={rotacao}
              reduzirMovimento={reduzir}
              origemVoo={mobile ? "baixo" : "esquerda"}
            />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={face + peca}
                className="absolute inset-6"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {mockup2D}
              </motion.div>
            </AnimatePresence>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-4 text-sm text-estrada">
            <span className="inline-flex items-center gap-2">
              {modo === "3d" ? (
                <>
                  <IconeRodar className="size-4" /> Arrasta para rodar
                </>
              ) : modo === "2d" ? (
                "Pré-visualização 2D"
              ) : null}
            </span>
            {!estampa && <span>Escolhe uma estampa</span>}
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-4">
            {(["frente", "costas"] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={face === f}
                onClick={() => setFace(f)}
                className="opcao !rounded-full bg-asfalto/80 px-5 font-semibold capitalize backdrop-blur"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Opções ---------- */}
      <section aria-labelledby="titulo-opcoes" className="order-3 grid content-start gap-6">
        <h2 id="titulo-opcoes" className="kicker">2 · A tua peça</h2>

        <fieldset className="grid gap-2">
          <legend className="mb-2 font-semibold">Peça</legend>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(PECAS) as Peca[]).map((p) => (
              <button key={p} type="button" aria-pressed={peca === p} onClick={() => escolherPeca(p)} className="opcao font-semibold">
                {PECAS[p]}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold">
            Cor <span className="font-normal text-estrada">· {corAtual.nome}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {CORES.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={cor === c.id}
                aria-label={c.nome}
                title={c.nome}
                onClick={() => setCor(c.id)}
                className={`size-11 rounded-full border-2 transition-transform hover:scale-110 ${cor === c.id ? "scale-110 border-destaque ring-2 ring-destaque ring-offset-2 ring-offset-asfalto" : "border-white/20"}`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold">Tamanho</legend>
          <div className="flex flex-wrap gap-2">
            {TAMANHOS[peca].map((t) => (
              <button key={t} type="button" aria-pressed={tamanho === t} onClick={() => setTamanho(t)} className="opcao min-w-12 font-semibold">
                {t}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold">Posição e dimensão</legend>
          <div className="mb-2 grid grid-cols-2 gap-2">
            {(["frente", "costas"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={face === f} onClick={() => setFace(f)} className="opcao font-semibold capitalize">
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(DIMENSOES) as Dimensao[]).map((d) => (
              <button key={d} type="button" aria-pressed={dimensao === d} onClick={() => setDimensao(d)} className="opcao text-sm font-semibold">
                {d}
                <span className="block text-xs font-normal text-estrada">{d === "10x10" ? (face === "frente" ? "peito" : "pequena") : "cm"}</span>
              </button>
            ))}
          </div>
          {face === "costas" && (
            <label className="opcao mt-2 flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={peito} onChange={(e) => setPeito(e.target.checked)} className="size-5 accent-[var(--destaque)]" />
              <span>Juntar 10x10 no peito</span>
            </label>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-2 font-semibold">Quantidade</legend>
          <div className="inline-flex items-center rounded-full border border-asfalto-3">
            <button type="button" className="size-11 text-xl" aria-label="Menos uma" onClick={() => setQuantidade((q) => Math.max(1, q - 1))}>−</button>
            <output className="w-10 text-center font-semibold" aria-live="polite">{quantidade}</output>
            <button type="button" className="size-11 text-xl" aria-label="Mais uma" onClick={() => setQuantidade((q) => Math.min(50, q + 1))}>+</button>
          </div>
        </fieldset>

        <div className="cartao sticky bottom-20 z-10 grid gap-3 p-5 lg:static">
          <div className="flex items-end justify-between gap-4" aria-live="polite">
            <div>
              <p className="text-sm text-estrada">{preco.tipo === "preco" ? preco.descricao : "Preço"}</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={preco.tipo === "preco" ? preco.unitarioCents * quantidade : "consulta"}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  className="titulo text-5xl text-destaque"
                >
                  {preco.tipo === "preco" ? formatarEuros(preco.unitarioCents * quantidade) : "Sob consulta"}
                </motion.p>
              </AnimatePresence>
            </div>
            {preco.tipo === "preco" && quantidade > 1 && (
              <p className="text-right text-sm text-estrada">{formatarEuros(preco.unitarioCents)} / peça</p>
            )}
          </div>
          <p className="text-xs text-estrada">Preço final, isento de IVA. Entrega em até {SITE.prazoEntregaDias} dias.</p>
          <AvisoGrupo quantidade={quantidade} pedido={descricao} />

          {preco.tipo === "preco" ? (
            <button type="button" className="botao w-full" onClick={adicionar} disabled={!estampa}>
              {estampa ? "Adicionar ao carrinho" : "Escolhe uma estampa"}
            </button>
          ) : (
            <div className="grid gap-2">
              <a
                className="botao w-full !bg-[#25D366] !text-white"
                href={linkWhatsApp(`Olá NOMAD'S! Queria um preço para: ${descricao}.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconeWhatsApp className="size-5" /> Pedir preço no WhatsApp
              </a>
              <Link href="/orcamentos" className="botao botao-linha w-full">Fazer pedido de orçamento</Link>
            </div>
          )}
          <AnimatePresence>
            {adicionado > 0 && (
              <motion.p
                key={adicionado}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-ok"
                role="status"
              >
                Adicionado! <Link href="/carrinho" className="underline">Ver carrinho</Link>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Miniatura a voar da lista para a peça */}
      <AnimatePresence>
        {voo && (
          <motion.img
            key={voo.chave}
            src={voo.url}
            alt=""
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-[55] object-contain"
            style={{ width: voo.de.width, height: voo.de.height }}
            initial={{ x: voo.de.left, y: voo.de.top, scale: 1, opacity: 1, rotate: 0 }}
            animate={{
              x: voo.para.left + voo.para.width / 2 - voo.de.width / 2,
              y: voo.para.top + voo.para.height / 2.6 - voo.de.height / 2,
              scale: 1.6,
              opacity: 0,
              rotate: 12,
            }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            onAnimationComplete={() => setVoo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Mockup 2D (SVG): usado nas montras da loja e como alternativa quando não há WebGL.
import type { Dimensao, Peca } from "@/config/precos";
import { areasDoPosicionamento, caminhoSvg, encaixar, type Face } from "@/lib/silhueta";

type Props = {
  peca: Peca;
  corHex: string;
  face: Face;
  estampa?: { imagemUrl: string; proporcao: number; nome: string } | null;
  frente: Dimensao | null;
  costas: Dimensao | null;
  className?: string;
};

export function MockupPlano({ peca, corHex, face, estampa, frente, costas, className }: Props) {
  const caminho = caminhoSvg(peca);
  const areas = areasDoPosicionamento({ frente, costas }).filter((a) => a.face === face);
  const id = `${peca}-${face}`;
  return (
    <svg viewBox="-4.6 -3.9 9.2 7.9" className={className} role="img" aria-label={`${peca === "tshirt" ? "T-shirt" : "Sweater"}, vista de ${face}`}>
      <defs>
        <clipPath id={`clip-${id}`}>
          <path d={caminho} />
        </clipPath>
        <linearGradient id={`luz-${id}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <g transform={face === "costas" ? "scale(-1 1)" : undefined}>
        <path d={caminho} fill={corHex} stroke="rgba(0,0,0,.35)" strokeWidth="0.04" />
        <g clipPath={`url(#clip-${id})`}>
          <path d={caminho} fill={`url(#luz-${id})`} />
          {/* decote e bainha */}
          <path
            d={face === "frente" ? "M-0.95 -3.46 Q0 -2.3 0.95 -3.46" : "M-0.95 -3.46 Q0 -3.1 0.95 -3.46"}
            fill="none"
            stroke="rgba(0,0,0,.35)"
            strokeWidth="0.12"
          />
          <path d="M-2.6 3.45 Q0 3.56 2.6 3.45" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="0.05" />
        </g>
      </g>
      {estampa &&
        areas.map((a, i) => {
          const t = encaixar(a, estampa.proporcao);
          const x = face === "costas" ? -a.x : a.x;
          return (
            <image
              key={i}
              href={estampa.imagemUrl}
              x={x - t.largura / 2}
              y={-a.y - t.altura / 2}
              width={t.largura}
              height={t.altura}
              preserveAspectRatio="xMidYMid meet"
            />
          );
        })}
    </svg>
  );
}

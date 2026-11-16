import type { ReactNode } from "react";

export function PaginaLegal({ titulo, atualizado, children }: { titulo: string; atualizado: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 pb-16 pt-24 md:pt-32">
      <p className="kicker">Informação legal</p>
      <h1 className="titulo mt-3 text-5xl md:text-7xl">{titulo}</h1>
      <p className="mt-3 text-sm text-estrada">Última atualização: {atualizado}</p>
      <p className="mt-6 rounded-xl border border-white/10 p-4 text-sm text-estrada">
        Texto-modelo conforme o RGPD e a legislação portuguesa de consumo, ainda sem revisão jurídica.
      </p>
      <div className="prosa mt-6">{children}</div>
    </article>
  );
}

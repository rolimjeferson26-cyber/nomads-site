"use client";

import { useActionState, type ReactNode } from "react";

export type EstadoForm = { erro?: string; ok?: string } | null;
type Acao = (anterior: EstadoForm, fd: FormData) => Promise<EstadoForm>;

// Formulário ligado a uma Server Action, com mensagens de erro/sucesso acessíveis.
export function Formulario({
  acao,
  children,
  botao,
  className = "grid gap-4",
  perigo = false,
}: {
  acao: Acao;
  children: ReactNode;
  botao: string;
  className?: string;
  perigo?: boolean;
}) {
  const [estado, executar, aEnviar] = useActionState(acao, null);
  return (
    <form action={executar} className={className}>
      {children}
      {estado?.erro && <p role="alert" className="rounded-xl bg-erro/15 p-3 text-sm text-erro">{estado.erro}</p>}
      {estado?.ok && <p role="status" className="rounded-xl bg-ok/15 p-3 text-sm text-ok">{estado.ok}</p>}
      <button type="submit" disabled={aEnviar} className={`botao justify-self-start ${perigo ? "!bg-erro !text-white" : ""}`}>
        {aEnviar ? "Um momento…" : botao}
      </button>
    </form>
  );
}

export function Campo({ rotulo, ...props }: { rotulo: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="rotulo">
      {rotulo}
      <input className="campo" {...props} />
    </label>
  );
}

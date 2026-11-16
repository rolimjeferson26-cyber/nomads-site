import Link from "next/link";
import { IconeBussola } from "@/components/Icones";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 pb-16 pt-36 text-center">
      <IconeBussola className="mx-auto size-16 animate-spin text-destaque [animation-duration:6s]" />
      <h1 className="titulo mt-6 text-7xl">Saíste do mapa</h1>
      <p className="mt-4 text-estrada">Esta página não existe. Volta à estrada principal.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="botao">Início</Link>
        <Link href="/loja" className="botao botao-linha">Loja</Link>
      </div>
    </div>
  );
}

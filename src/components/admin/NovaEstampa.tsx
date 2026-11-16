"use client";

import { useState } from "react";
import { novaEstampa } from "@/app/admin/acoes";
import { Campo, Formulario } from "../Formulario";

export function NovaEstampa({ estilos }: { estilos: { id: string; nome: string }[] }) {
  const [proporcao, setProporcao] = useState("1");
  const [previa, setPrevia] = useState<string | null>(null);
  return (
    <div className="cartao p-6">
      <h2 className="mb-4 font-semibold">Nova estampa</h2>
      <Formulario acao={novaEstampa} botao="Adicionar estampa" className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <Campo rotulo="Nome" name="nome" required maxLength={80} />
        <label className="rotulo">
          Estilo
          <select name="estilo" className="campo">
            {estilos.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
          </select>
        </label>
        <label className="rotulo">
          Imagem (PNG/JPG/WebP, fundo transparente, máx. 3 MB)
          <input
            name="imagem"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            className="campo"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const url = URL.createObjectURL(f);
              const img = new Image();
              img.onload = () => {
                setProporcao((img.naturalWidth / img.naturalHeight).toFixed(4));
                setPrevia(url);
              };
              img.src = url;
            }}
          />
        </label>
        <input type="hidden" name="proporcao" value={proporcao} />
        {previa && <img src={previa} alt="Pré-visualização" className="size-24 rounded-lg bg-asfalto object-contain" />}
      </Formulario>
    </div>
  );
}

import { EditorTabelas } from "@/components/admin/EditorTabelas";
import { exigirAdmin } from "@/lib/auth";
import { obterTabelaPortes, obterTabelaPrecos } from "@/lib/dados";

export default async function AdminPrecos() {
  await exigirAdmin();
  const [precos, portes] = await Promise.all([obterTabelaPrecos(), obterTabelaPortes()]);
  return (
    <section>
      <h1 className="titulo mb-6 text-5xl">Preços e portes</h1>
      <EditorTabelas precosIniciais={precos} portesIniciais={portes} />
    </section>
  );
}

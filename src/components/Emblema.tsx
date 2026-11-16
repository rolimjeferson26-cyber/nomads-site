// Emblema NOMAD'S em camadas: base + sol (pulsa) + agulha da bússola (roda e assenta).
// As camadas foram geradas a partir de public/img/logo-emblema.png.
export function Emblema({ className = "", animado = true }: { className?: string; animado?: boolean }) {
  if (!animado) {
    return <img src="/img/logo-emblema.webp" alt="Emblema NOMAD'S" width={703} height={735} className={className} />;
  }
  return (
    <div className={`emblema relative aspect-[703/735] ${className}`} role="img" aria-label="Emblema NOMAD'S: sol, bússola, montanha, onda e carrinha">
      <img src="/img/emblema-base.webp" alt="" width={703} height={735} className="absolute inset-0 h-full w-full" />
      <img
        src="/img/emblema-sol.webp"
        alt=""
        className="emblema-sol absolute"
        style={{ left: "30.87%", top: "-2.72%", width: "36.42%", height: "34.83%" }}
      />
      <img
        src="/img/emblema-agulha.webp"
        alt=""
        className="emblema-agulha absolute"
        style={{ left: "30.87%", top: "24.76%", width: "36.98%", height: "35.37%" }}
      />
    </div>
  );
}

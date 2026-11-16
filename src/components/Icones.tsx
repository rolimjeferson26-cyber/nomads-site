// Ícones simples em SVG (sem bibliotecas externas).
type P = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const IconeCarrinho = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}><path d="M6 7h12l-1 13H7L6 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></svg>
);
export const IconeConta = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></svg>
);
export const IconeMenu = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
export const IconeFechar = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const IconeSeta = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const IconeBussola = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></svg>
);
export const IconeRodar = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden {...base}><path d="M3 12a9 9 0 0 1 15.5-6.2M21 4v5h-5" /><path d="M21 12a9 9 0 0 1-15.5 6.2M3 20v-5h5" /></svg>
);
export const IconeWhatsApp = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5.1 5.1 0 0 0 1.1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.6.7 2.3.7 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
  </svg>
);

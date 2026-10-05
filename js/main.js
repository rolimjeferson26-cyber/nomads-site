// =========================================================
// NOMAD'S | comportamento da página
// =========================================================

// ▼▼▼ MUDA AQUI: o teu número de WhatsApp com o código do país, só números ▼▼▼
const WHATSAPP = "351915907886";

// Ano automático no rodapé
document.getElementById("ano").textContent = new Date().getFullYear();

// Link de WhatsApp no rodapé
document.querySelectorAll("[data-whatsapp]").forEach((link) => {
  link.href = `https://wa.me/${WHATSAPP}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

// ---------------------------------------------------------
// Vídeos: só tocam quando aparecem no ecrã (poupa dados no telemóvel)
// e não tocam sozinhos se a pessoa pediu "reduzir movimento" no sistema.
// ---------------------------------------------------------
const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const videos = document.querySelectorAll("video[data-auto]");

if (reduzirMovimento) {
  videos.forEach((v) => {
    v.removeAttribute("autoplay");
    v.pause();
    v.controls = true;
  });
} else {
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    });
  }, { threshold: 0.25 });
  videos.forEach((v) => observador.observe(v));
}

// ---------------------------------------------------------
// Formulário de orçamento: monta a mensagem e abre o WhatsApp
// ---------------------------------------------------------
const form = document.getElementById("form-orcamento");
const erro = document.getElementById("form-erro");

form.addEventListener("submit", (evento) => {
  evento.preventDefault(); // não recarrega a página

  const dados = new FormData(form);
  const nome = dados.get("nome").trim();

  if (!nome) {
    erro.textContent = "Escreve o teu nome para sabermos a quem responder.";
    form.nome.focus();
    return;
  }
  erro.textContent = "";

  const mensagem =
    `Olá NOMAD'S! Chamo-me ${nome}.\n` +
    `Queria um orçamento:\n` +
    `• Peça: ${dados.get("peca")}\n` +
    `• Quantidade: ${dados.get("quantidade") || 1}\n` +
    `• Ideia: ${dados.get("ideia").trim() || "(vou enviar a imagem)"}`;

  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`, "_blank", "noopener,noreferrer");
});

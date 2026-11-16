# Relatório final · NOMAD'S v2

Branch `v2` em `rolimjeferson26-cyber/nomads-site`. O site antigo (branch `main`, GitHub Pages) não foi alterado.

**Versão de testes publicada:** https://nomads-site.rolimjeferson-26.workers.dev

## Nameservers para pôr no painel da Amen

```
collins.ns.cloudflare.com
santino.ns.cloudflare.com
```

Ao trocar na Amen, a zona `nomadstextil.store` fica ativa na Cloudflare (já criada no plano Free, com HTTPS forçado
e redirecionamento `www → nomadstextil.store`). O site **ainda não** está ligado ao domínio: os passos para a troca
estão no README, secção “Passar para o domínio nomadstextil.store”.

## O que foi feito

- **Base**: Next.js 16 + TypeScript + Tailwind 4, pt-PT, mobile-first, tema escuro com textura vintage e a paleta dos logótipos.
- **Marca**: lettering no cabeçalho; emblema no hero com a agulha da bússola a rodar e o sol a pulsar (camadas geradas a partir do PNG original), no rodapé, em Sobre e no favicon.
- **Seletor de estilo** sempre visível (Aventura, Anime, Jogos, Racing): muda a cor de destaque, o fundo animado (curvas de nível, linhas de velocidade, grelha de píxeis, pista) e os textos do hero, com transição; filtra as estampas. Configurado num só ficheiro.
- **Páginas**: Início (hero, faixa em movimento, estilos, destaques, bloco de empresas, rota “como funciona”, trabalhos), Loja (T-shirts/Sweaters por estilo), Configurador, Orçamentos, Sobre, Contactos, Área de Cliente, Admin, Termos, Privacidade, Cookies, 404, robots e sitemap.
- **Configurador 3D**: peça modelada em código a partir de uma silhueta (o mesmo modelo para todas as estampas), roda ao arrastar com rato e toque, estampa “voa” da lista para a peça e assenta com efeito de prensa, roda sozinha para a frente/costas. Peça, cor, tamanho, posição, dimensão, peito 10x10 e quantidade, com preço ao vivo. Fallback 2D em SVG sem WebGL. 12 estampas originais em SVG (3 por estilo).
- **Preços**: tabela num só ficheiro (editável no Admin), cálculo sempre no servidor; combinações fora da tabela e sweaters dão “Sob consulta” com WhatsApp.
- **Mais de 10 peças**: aviso com WhatsApp e mensagem preenchida no configurador, no carrinho, nos orçamentos e destacado na secção de empresas.
- **Orçamentos**: assistente em 5 passos com tamanho escolhido no desenho da peça, pré-orçamento ao vivo, upload opcional de arte, “Enviar pedido” e “Enviar pelo WhatsApp”.
- **Portes**: interface de provider com `TabelaCTT` (CTT Expresso Em 2 Dias, balcão: continente 9,35/14,05/18,81 €; ilhas 18,19/26,06/45,61 €; acima de 10 kg a combinar), `Levantamento` (grátis), `EntregaLocal` e `CttExpressoProvider` (esqueleto desativado).
- **Pagamentos**: Stripe Checkout alojado, modo de teste; encomenda criada “pendente” e só marcada “paga” pelo webhook com assinatura verificada, verificação do valor e idempotência.
- **Área de cliente**: registo/login, encomendas com estado, orçamentos, moradas, dados, palavra-passe e eliminação de conta.
- **Admin**: encomendas e orçamentos (estados, notas, arte por link temporário), estampas (upload, estilo, ativa/inativa), edição da tabela de preços e de portes. Email ao dono por encomenda paga, orçamento e contacto (Resend).
- **Segurança**: RLS em todas as tabelas, validação zod, uploads verificados pelos bytes em bucket privado, rate limiting com IP em hash, CSP com nonce, HSTS e restantes cabeçalhos, segredos só em variáveis de ambiente.
- **Testes**: 36 testes (preços, portes, código postal, validação) com `npm test`, todos a passar. Lint e TypeScript sem erros. Build OpenNext e deploy verificados (todas as páginas respondem 200, 404 correto, CSP ativa, 3D a funcionar em produção sem erros na consola).

## Decisões tomadas

1. **Supabase não foi criado**: a conta gratuita já tem 2 projetos ativos (prontidao, ria-apps) e a Supabase recusou um terceiro. Não pausei nem apaguei projetos teus. As migrações estão em `supabase/migrations/`, prontas a aplicar. Até lá o site funciona em “modo montra” (estampas e preços dos ficheiros de configuração, orçamentos pelo WhatsApp).
2. **Modelo 3D criado em código** em vez de um GLB descarregado: evita dúvidas de licença e partilha a silhueta com o mockup 2D.
3. **Cache Components do Next desligado** e todas as páginas dinâmicas: necessário para a CSP com nonce e mais compatível com OpenNext/Workers.
4. **`style-src 'unsafe-inline'`** na CSP: as animações e o tema usam estilos inline. Os scripts continuam protegidos por nonce.
5. **Estampas da loja num bucket público** (`estampas`), artes dos clientes num bucket **privado** (`artes`). SVG não é aceite em uploads (risco de XSS).
6. **Carrinho no browser sem preços**; checkout como convidado permitido (a encomenda liga-se à conta se a pessoa tiver sessão).
7. **25x35 com preço de 18 €** tanto na frente como nas costas; costas 25x35 + peito 10x10 fica sob consulta.
8. **Tecidos que não sejam 100% algodão**: sob consulta.
9. **“Entrega na zona”** mantida (pedida no primeiro briefing) com valor e códigos postais a confirmar.
10. **Rate limiting em Postgres** (funciona entre instâncias dos Workers), com reserva em memória sem base de dados.
11. **Imagens sem otimização da Cloudflare** (`images.unoptimized`): já são SVG/WebP leves e evita um serviço pago extra.
12. **Domínio**: zona criada no plano Free, HTTPS forçado, `www` (registo proxied para 192.0.2.1) com redirecionamento 301 para a raiz. A ligação ao Worker fica comentada em `wrangler.jsonc` até à troca.
13. **Cabeçalho na largura de telemóvel não foi verificado visualmente** (a janela do Chrome não redimensionou); o layout é responsivo por construção, mas convém confirmar num telemóvel.

## A CONFIRMAR

| Item | Onde |
|---|---|
| Nome legal da empresa / empresário | `src/config/site.ts` (`nomeLegal`) |
| NIF | `src/config/site.ts` (`nif`) |
| Morada completa da oficina | `src/config/site.ts` (`morada`) e `src/config/portes.ts` (`levantamento.local`) |
| Email de contacto | `src/config/site.ts` (`email`) |
| Horário | `src/config/site.ts` (`horario`) |
| Entidade de resolução de litígios (RAL) | `src/config/site.ts` (`ral`) |
| Regime de isenção de IVA (art. 53.º CIVA?) indicado nos Termos | `src/app/legal/termos/page.tsx` |
| Entrega na zona: preço (3 €) e códigos postais (3870, 3860, 3880) | `src/config/portes.ts` / Admin |
| Cores e tamanhos em stock | `src/config/precos.ts` (`CORES`, `TAMANHOS`) |
| Revisão jurídica dos textos legais | `src/app/legal/*` |
| Criar o projeto Supabase “nomads” (libertar um dos 2 projetos gratuitos ou passar a plano pago) | README, passo 1 |
| Chaves Stripe de teste e webhook | README, passo 2 |
| Conta Resend, domínio verificado, `OWNER_EMAIL` e `EMAIL_FROM` | README, passo 3 |
| Email do dono para o tornar admin | SQL no README |
| Trocar nameservers na Amen e fazer a troca para nomadstextil.store | README |
| Fotos reais de trabalhos (o script `tools/otimizar_fotos.py` continua disponível) | `public/img/trabalhos/` |
| Contrato CTT Expresso (se um dia houver) | `src/lib/envio/providers.ts` |

# Relatório final · NOMAD'S v2

> **Atualização (base de dados e telemóvel):** ver a secção “Base de dados no ria-apps” no fim.

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
| Pôr o segredo `SUPABASE_SECRET_KEY` (chave secret do ria-apps) com `wrangler secret put` | README, passo 1 |
| Chaves Stripe de teste e webhook | README, passo 2 |
| Conta Resend, domínio verificado, `OWNER_EMAIL` e `EMAIL_FROM` | README, passo 3 |
| Correr o SQL de admin (abaixo) | Supabase › SQL Editor |
| Trocar nameservers na Amen e fazer a troca para nomadstextil.store | README |
| Fotos reais de trabalhos (o script `tools/otimizar_fotos.py` continua disponível) | `public/img/trabalhos/` |
| Contrato CTT Expresso (se um dia houver) | `src/lib/envio/providers.ts` |

## Base de dados no ria-apps (atualização)

**O que mudou**
- Sem projeto novo: tudo vive no schema **`nomads`** do projeto **ria-apps** (`zvahdgyqxkevpbekhsvq`, eu-west-3). `public`, `auto` e `auth` não foram tocados.
- Migrações substituídas por `supabase/migrations/20261117000000_nomads_schema.sql`, `…0100_nomads_dados_iniciais.sql` e `…0200_nomads_expor_api.sql`, já aplicadas: 9 tabelas, funções `nomads.is_admin()` e `nomads.registar_pedido()`, RLS em todas as tabelas, grants explícitos e mínimos (o mesmo padrão do schema `auto`), 12 estampas de exemplo.
- API: `pgrst.db_schemas` passou de `public, auto` para **`public, auto, nomads`**. Testado: o PostgREST responde “Only the following schemas are exposed: public, auto, nomads”; o `anon` lê `nomads.estampas` mas recebe *permission denied* em encomendas, rate limiting e no RPC; o `auto` continua com as mesmas permissões que tinha.
- Storage: criado `nomads-estampas` (público, 3 MB, PNG/JPG/WebP); reutilizado `nomads-artes` (privado, limite ajustado para 5 MB, PNG/JPG/WebP). 4 políticas novas em `storage.objects`, todas presas a estes buckets.
- Auth: só foram **acrescentados** 2 Redirect URLs (`https://nomads-site.rolimjeferson-26.workers.dev/**` e `https://nomadstextil.store/**`). Os 5 URLs da Ria, o Site URL, os templates e as restantes definições ficaram iguais.
- Sem trigger em `auth.users` (um erro aí bloquearia os registos das apps da Ria): o perfil NOMAD'S é criado quando a pessoa guarda os dados; o nome do registo fica nos metadados do utilizador.
- Site: clientes Supabase (browser, servidor, service role e proxy) com `db: { schema: "nomads" }`; buckets em `src/lib/supabase/config.ts`. `.env.production` tem o URL e a chave publicável. Segredo `RATE_LIMIT_SALT` gerado e posto com `wrangler secret put`. Site republicado; 36 testes, lint e TypeScript a passar.
- Atenção: como o login é partilhado, os emails de confirmação e de recuperação usam os templates da Ria e quem já tem conta na Ria entra na NOMAD'S com a mesma conta.

**Avisos de segurança da Supabase**: nenhuma tabela `nomads` sem RLS. Só 2 avisos INFO em `nomads.limites_pedidos` e `nomads.eventos_stripe` (“RLS sem políticas”), intencionais: são só da service role. Os WARN restantes são do `public` (Ria Agenda) e o de “leaked password protection” é uma definição de Auth partilhada; não foram alterados.

**Falta (tens de ser tu):** a chave secreta não sai pelas ferramentas que tenho e não tive permissão para a procurar nos teus ficheiros. Sem ela o site lê estampas, faz login e mostra a área de cliente, mas não grava orçamentos/encomendas nem faz uploads. No terminal:

```
npx wrangler secret put SUPABASE_SECRET_KEY
```
(colar a chave *secret* / service role do ria-apps quando pedir; não é preciso republicar).

**SQL para te tornares admin** (Supabase › SQL Editor do ria-apps; a conta tem de existir, pode ser a mesma das apps da Ria):

```sql
insert into nomads.admins (user_id)
select id from auth.users where email = 'rolimjeferson.26@gmail.com'
on conflict do nothing;
```

## Correção em telemóvel

A 390 e 360 px o botão do WhatsApp tapava “Racing”. Em ecrãs pequenos o WhatsApp sobe para cima da barra de estilos e a barra usa a largura toda; o cartão de preço do configurador deixa de ficar colado ao fundo em telemóvel e o rodapé reserva espaço para os dois. Verificado com emulação de dispositivo (390 e 360 px) em Início, Loja e Configurador, local e em produção: as 4 opções ficam dentro do ecrã, clicáveis, sem sobreposição e sem scroll horizontal.

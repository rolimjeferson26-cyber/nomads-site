# NOMAD'S · site v2

Loja, configurador 3D e orçamentos da NOMAD'S (estamparia DTF, Murtosa, Aveiro).

- **Site:** https://nomadstextil.store (o `www` redireciona para a raiz)
- **Testes:** https://nomads-site.rolimjeferson-26.workers.dev (mesmo Worker, continua ligado)
- O site antigo (HTML estático) continua na branch `main` / GitHub Pages até a v2 ir para o ar.

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind 4 · react-three-fiber/three.js (3D) · Framer Motion ·
Supabase (Auth, Postgres com RLS, Storage) · Stripe Checkout · Cloudflare Workers via OpenNext.

## Onde mudar as coisas

| O quê | Ficheiro |
|---|---|
| Estilos (Aventura, Anime, Jogos, Racing), cores, textos do hero | `src/config/estilos.ts` |
| Tabela de preços, cores e tamanhos | `src/config/precos.ts` (e no Admin › Preços e portes) |
| Portes CTT, pesos, levantamento, entrega na zona | `src/config/portes.ts` (e no Admin) |
| Dados da empresa, WhatsApp, NIF, morada, email | `src/config/site.ts` |
| Estampas de exemplo | `src/config/estampas.ts` + `public/estampas/` (e no Admin › Estampas) |
| Domínio do site | `.env.production` → `NEXT_PUBLIC_SITE_URL` |

Para acrescentar um estilo novo basta juntar um objeto a `ESTILOS`; as estampas com esse `estilo` aparecem no filtro.

## Comandos

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # testes de preços, portes e validação (vitest)
npm run lint
npm run typecheck
npm run preview      # build OpenNext + runtime Workers local
npm run deploy       # build + publicar na Cloudflare
```

## Variáveis de ambiente

Ver `.env.example`. Os valores públicos (`NEXT_PUBLIC_*`) ficam em `.env.production` e entram na build.
Os segredos **nunca** vão para o Git; em produção:

```bash
npx wrangler secret put SUPABASE_SECRET_KEY
npx wrangler secret put STRIPE_SECRET_KEY        # sk_test_... (modo de teste)
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put OWNER_EMAIL
npx wrangler secret put EMAIL_FROM
npx wrangler secret put RATE_LIMIT_SALT
```

| Variável | Para quê |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL pública (links de email, Stripe, sitemap, canonical) |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Ligação ao Supabase (respeita RLS) |
| `SUPABASE_SECRET_KEY` | Operações do servidor: criar encomendas/orçamentos, uploads, rate limiting, eliminar conta |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Checkout e confirmação do pagamento |
| `RESEND_API_KEY`, `OWNER_EMAIL`, `EMAIL_FROM` | Email ao dono por cada encomenda paga, orçamento ou contacto |
| `RATE_LIMIT_SALT` | Sal do hash do IP usado no rate limiting |
| `CTT_EXPRESSO_*` | Para quando houver contrato CTT Expresso |

Sem Supabase/Stripe o site funciona em modo montra: loja, configurador e orçamentos (envio pelo WhatsApp);
pagamentos e área de cliente mostram uma mensagem e o WhatsApp.

## Pôr a funcionar (primeira vez)

1. **Supabase** (feito): a NOMAD'S usa o projeto partilhado **ria-apps** (`zvahdgyqxkevpbekhsvq`, eu-west-3),
   num schema próprio **`nomads`** (como a Ria Auto usa `auto`). Buckets `nomads-estampas` (público) e `nomads-artes` (privado).
   - Migrações já aplicadas: `supabase/migrations/2026111700*.sql`. A última expõe o schema na API
     (`pgrst.db_schemas = 'public, auto, nomads'` — nunca remover `public` nem `auto`).
   - O login é partilhado com as apps da Ria: **não alterar** Site URL, templates de email nem definições de Auth.
     Só foram acrescentados os Redirect URLs `https://nomads-site.rolimjeferson-26.workers.dev/**` e `https://nomadstextil.store/**`.
   - Não há trigger em `auth.users`: o perfil NOMAD'S (`nomads.perfis`) é criado quando a pessoa guarda os dados.
   - Tornar-se admin: `insert into nomads.admins (user_id) select id from auth.users where email = 'O_TEU_EMAIL';`
   - Falta só o segredo: `npx wrangler secret put SUPABASE_SECRET_KEY` (chave *secret*/service role do ria-apps).
2. **Stripe (modo de teste)**: Developers › API keys › `sk_test_...` → `STRIPE_SECRET_KEY`.
   Webhooks › endpoint `<SITE_URL>/api/stripe/webhook` com os eventos `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`
   → copiar o *signing secret* para `STRIPE_WEBHOOK_SECRET`. Ativar MB WAY/Multibanco em Payment methods, se quiseres.
   Cartão de teste: `4242 4242 4242 4242`, data futura, qualquer CVC.
3. **Resend**: verificar o domínio `nomadstextil.store` e criar a chave.
4. `npm run deploy`.

## Domínio nomadstextil.store (feito a 16/11/2026)

Zona ativa na Cloudflare (Free), HTTPS forçado, `www → raiz` (301), Worker ligado por *custom domain*.
Passos que foram seguidos (para referência):

1. Na **Amen**, trocar os nameservers para `collins.ns.cloudflare.com` e `santino.ns.cloudflare.com` e esperar que a zona fique *Active*.
2. Em `.env.production`: `NEXT_PUBLIC_SITE_URL=https://nomadstextil.store`.
3. Em `wrangler.jsonc`, descomentar `"routes": [{ "pattern": "nomadstextil.store", "custom_domain": true }]`.
4. `npm run deploy`.
5. Supabase Auth: nada a fazer (o Redirect URL `https://nomadstextil.store/**` já existe; o Site URL é o da Ria e não se muda).
6. Stripe: endpoint do webhook para `https://nomadstextil.store/api/stripe/webhook` (novo signing secret → `wrangler secret put STRIPE_WEBHOOK_SECRET`).

As URLs de sucesso/cancelamento do Stripe, o sitemap, o canonical e o Open Graph derivam todos de `NEXT_PUBLIC_SITE_URL`.

## Contas (login partilhado com a Ria Digital)

Os emails de conta saem dos templates da Ria e trazem um **código**, não um link:
- Registo → `/confirmar` (código + reenviar). Quem entra com conta por confirmar também vai para lá.
- Esqueci a palavra-passe → `/recuperar` → `/recuperar/codigo` (código + nova palavra-passe).
- `/auth/callback` continua a aceitar links (fluxo PKCE), caso os templates passem a enviar links.
- A política de palavras-passe é a do Auth partilhado (maiúsculas, minúsculas, números e símbolos).
- O email pendente fica num cookie httpOnly de 1 hora; tentativas de código limitadas (6 por 15 min por IP + email).

## Encomenda de teste (Stripe, modo de teste)

1. `npx wrangler secret put STRIPE_SECRET_KEY` (sk_test da conta Ninho Casa), `STRIPE_WEBHOOK_SECRET` e `SUPABASE_SECRET_KEY`.
2. Abrir o site, escolher uma estampa no configurador (t-shirt, frente 25x25) e “Adicionar ao carrinho”.
3. No carrinho: CTT com código postal (ex. 3870-100) ou Levantamento; nome, email, aceitar os Termos; “Pagar com segurança”.
4. Na página da Stripe: cartão `4242 4242 4242 4242`, data futura, CVC qualquer, código postal qualquer.
5. Volta a `/encomenda/sucesso`. Em segundos o webhook marca a encomenda como **Paga** (Admin › Encomendas) e chega o email ao dono (se o Resend estiver configurado).
6. Na Stripe (modo de teste) › Pagamentos aparece o pagamento com o descritivo terminado em **NOMADS**.

## Segurança

- RLS em todas as tabelas; o admin é verificado no servidor **e** na base de dados (`public.is_admin()`).
- Preços e portes calculados sempre no servidor; o carrinho no browser não guarda preços.
- Encomenda só passa a “paga” pelo webhook Stripe com assinatura verificada, valor confirmado e idempotência.
- Validação zod de todos os inputs; uploads só PNG/JPG/WebP verificados pelos bytes, com limite, no bucket privado `artes`.
- Rate limiting (Postgres) em login, registo, recuperação, orçamentos, contactos e checkout; o IP é guardado só como hash.
- CSP com nonce e `strict-dynamic`, HSTS, `X-Frame-Options`, `Permissions-Policy`, etc. (`src/proxy.ts`, `src/lib/seguranca.ts`).
- Nenhum dado de cartão passa pelo site (Stripe Checkout alojado).

## Estrutura

```
src/app/            páginas (loja, configurador, orcamentos, conta, admin, legal…) e server actions
src/components/     UI (configurador 3D, emblema animado, seletor de estilo…)
src/config/         configuração editável (estilos, preços, portes, site, estampas)
src/lib/            preços, envio (providers), validação, Supabase, Stripe, rate limit, email
supabase/migrations esquema SQL com RLS e dados iniciais
public/             fontes OFL, logótipos, emblema em camadas, estampas SVG, vídeos
tools/              script para otimizar fotos de trabalhos
```

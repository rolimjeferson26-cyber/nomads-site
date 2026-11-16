# NOMAD'S · site v2

Loja, configurador 3D e orçamentos da NOMAD'S (estamparia DTF, Murtosa, Aveiro).

- **Testes:** https://nomads-site.rolimjeferson-26.workers.dev
- **Domínio final (ainda não ligado):** https://nomadstextil.store
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

1. **Supabase**: criar o projeto `nomads` (região UE, ex. `eu-west-3`). A conta gratuita só permite 2 projetos ativos.
   - Aplicar `supabase/migrations/*.sql` por ordem (SQL Editor ou `supabase db push`).
   - Authentication › URL Configuration: *Site URL* = `NEXT_PUBLIC_SITE_URL`; *Redirect URLs* = `<SITE_URL>/auth/callback`
     (juntar os dois endereços, workers.dev e nomadstextil.store, durante a transição).
   - Criar a tua conta no site e torná-la admin:
     `insert into public.admins (user_id) select id from auth.users where email = 'O_TEU_EMAIL';`
   - Preencher `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em `.env.production` e o segredo `SUPABASE_SECRET_KEY`.
2. **Stripe (modo de teste)**: Developers › API keys › `sk_test_...` → `STRIPE_SECRET_KEY`.
   Webhooks › endpoint `<SITE_URL>/api/stripe/webhook` com os eventos `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`
   → copiar o *signing secret* para `STRIPE_WEBHOOK_SECRET`. Ativar MB WAY/Multibanco em Payment methods, se quiseres.
   Cartão de teste: `4242 4242 4242 4242`, data futura, qualquer CVC.
3. **Resend**: verificar o domínio `nomadstextil.store` e criar a chave.
4. `npm run deploy`.

## Passar para o domínio nomadstextil.store

A zona já está na Cloudflare (plano Free) com HTTPS forçado e redirecionamento `www → raiz`.
Falta, por esta ordem:

1. Na **Amen**, trocar os nameservers para `collins.ns.cloudflare.com` e `santino.ns.cloudflare.com` e esperar que a zona fique *Active*.
2. Em `.env.production`: `NEXT_PUBLIC_SITE_URL=https://nomadstextil.store`.
3. Em `wrangler.jsonc`, descomentar `"routes": [{ "pattern": "nomadstextil.store", "custom_domain": true }]`.
4. `npm run deploy`.
5. Supabase Auth: Site URL e Redirect URLs para `https://nomadstextil.store`.
6. Stripe: endpoint do webhook para `https://nomadstextil.store/api/stripe/webhook` (novo signing secret → `wrangler secret put STRIPE_WEBHOOK_SECRET`).

As URLs de sucesso/cancelamento do Stripe, o sitemap, o canonical e o Open Graph derivam todos de `NEXT_PUBLIC_SITE_URL`.

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

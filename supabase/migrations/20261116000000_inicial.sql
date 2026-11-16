-- NOMAD'S · esquema inicial
-- RLS ativo em TODAS as tabelas. Escritas sensíveis (encomendas, orçamentos,
-- preços cobrados) são feitas no servidor com a service role, depois de validadas.

-- ============ Administradores ============
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

create policy "admins: ver o próprio registo" on public.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- ============ Perfis ============
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text check (char_length(nome) <= 120),
  telefone text check (char_length(telefone) <= 30),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
alter table public.perfis enable row level security;

create policy "perfis: ver o próprio" on public.perfis
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "perfis: editar o próprio" on public.perfis
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create or replace function public.criar_perfil()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfis (id, nome)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'nome', ''), 120));
  return new;
end;
$$;
create trigger ao_criar_utilizador
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ============ Moradas ============
create table public.moradas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  morada text not null check (char_length(morada) between 1 and 200),
  codigo_postal text not null check (codigo_postal ~ '^\d{4}-\d{3}$'),
  localidade text not null check (char_length(localidade) between 1 and 80),
  telefone text check (char_length(telefone) <= 30),
  criado_em timestamptz not null default now()
);
create index moradas_user_id_idx on public.moradas (user_id);
alter table public.moradas enable row level security;

create policy "moradas: ver as próprias" on public.moradas
  for select to authenticated using (user_id = (select auth.uid()));
create policy "moradas: criar as próprias" on public.moradas
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "moradas: editar as próprias" on public.moradas
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "moradas: apagar as próprias" on public.moradas
  for delete to authenticated using (user_id = (select auth.uid()));

-- ============ Estampas ============
create table public.estampas (
  id text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  nome text not null check (char_length(nome) between 1 and 80),
  estilo text not null check (estilo ~ '^[a-z0-9-]{2,30}$'),
  imagem_url text not null,
  proporcao numeric not null default 1 check (proporcao > 0.2 and proporcao < 5),
  ativa boolean not null default true,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.estampas enable row level security;

create policy "estampas: ver as ativas" on public.estampas
  for select to anon, authenticated using (ativa or (select public.is_admin()));
create policy "estampas: admin cria" on public.estampas
  for insert to authenticated with check ((select public.is_admin()));
create policy "estampas: admin edita" on public.estampas
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "estampas: admin apaga" on public.estampas
  for delete to authenticated using ((select public.is_admin()));

-- ============ Definições (tabela de preços e de portes editáveis) ============
create table public.definicoes (
  chave text primary key check (chave in ('precos', 'portes')),
  valor jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table public.definicoes enable row level security;

create policy "definicoes: leitura pública" on public.definicoes
  for select to anon, authenticated using (true);
create policy "definicoes: admin cria" on public.definicoes
  for insert to authenticated with check ((select public.is_admin()));
create policy "definicoes: admin edita" on public.definicoes
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ============ Encomendas ============
create table public.encomendas (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  user_id uuid references auth.users (id) on delete set null,
  email text not null check (char_length(email) <= 200),
  nome text not null check (char_length(nome) <= 120),
  telefone text check (char_length(telefone) <= 30),
  estado text not null default 'pendente'
    check (estado in ('pendente', 'paga', 'em_producao', 'enviada', 'entregue', 'cancelada')),
  itens jsonb not null,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  portes_cents integer not null check (portes_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  envio jsonb not null,
  stripe_session_id text unique,
  stripe_payment_intent text,
  pago_em timestamptz,
  notas_admin text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index encomendas_user_id_idx on public.encomendas (user_id);
create index encomendas_estado_idx on public.encomendas (estado, criado_em desc);
alter table public.encomendas enable row level security;

create policy "encomendas: ver as próprias" on public.encomendas
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "encomendas: admin atualiza" on public.encomendas
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
-- Sem política de insert: só o servidor (service role) cria encomendas, com preço calculado no servidor.

-- ============ Orçamentos ============
create table public.orcamentos (
  id uuid primary key default gen_random_uuid(),
  numero bigint generated always as identity unique,
  user_id uuid references auth.users (id) on delete set null,
  nome text not null check (char_length(nome) between 1 and 120),
  email text not null check (char_length(email) <= 200),
  telefone text check (char_length(telefone) <= 30),
  peca text not null,
  tecido text not null,
  frente text,
  costas text,
  quantidade integer not null check (quantidade between 1 and 100000),
  ocasiao text not null,
  mensagem text check (char_length(mensagem) <= 2000),
  arte_path text,
  estimativa_cents integer,
  estado text not null default 'novo' check (estado in ('novo', 'respondido', 'aceite', 'recusado')),
  notas_admin text,
  criado_em timestamptz not null default now()
);
create index orcamentos_user_id_idx on public.orcamentos (user_id);
create index orcamentos_estado_idx on public.orcamentos (estado, criado_em desc);
alter table public.orcamentos enable row level security;

create policy "orcamentos: ver os próprios" on public.orcamentos
  for select to authenticated using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "orcamentos: admin atualiza" on public.orcamentos
  for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- ============ Rate limiting (só service role) ============
create table public.limites_pedidos (
  chave text primary key,
  janela_inicio timestamptz not null,
  contagem integer not null
);
alter table public.limites_pedidos enable row level security;
-- Sem políticas: inacessível a anon/authenticated.

create or replace function public.registar_pedido(p_chave text, p_max integer, p_janela_segundos integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contagem integer;
begin
  insert into public.limites_pedidos as l (chave, janela_inicio, contagem)
  values (p_chave, now(), 1)
  on conflict (chave) do update
    set contagem = case
          when l.janela_inicio < now() - make_interval(secs => p_janela_segundos) then 1
          else l.contagem + 1 end,
        janela_inicio = case
          when l.janela_inicio < now() - make_interval(secs => p_janela_segundos) then now()
          else l.janela_inicio end
  returning contagem into v_contagem;

  -- limpeza ocasional de registos antigos
  if random() < 0.01 then
    delete from public.limites_pedidos where janela_inicio < now() - interval '1 day';
  end if;

  return v_contagem <= p_max;
end;
$$;
revoke all on function public.registar_pedido(text, integer, integer) from public, anon, authenticated;
grant execute on function public.registar_pedido(text, integer, integer) to service_role;

-- ============ Eventos Stripe já processados (idempotência) ============
create table public.eventos_stripe (
  id text primary key,
  tipo text not null,
  recebido_em timestamptz not null default now()
);
alter table public.eventos_stripe enable row level security;

-- ============ Atualizado em ============
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;
create trigger perfis_atualizado before update on public.perfis
  for each row execute function public.tocar_atualizado_em();
create trigger encomendas_atualizado before update on public.encomendas
  for each row execute function public.tocar_atualizado_em();

-- ============ Storage ============
-- estampas: público (imagens da loja), só o admin escreve.
-- artes: PRIVADO (artes enviadas nos orçamentos), só imagens, máx. 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('estampas', 'estampas', true, 3145728, array['image/png', 'image/jpeg', 'image/webp']),
  ('artes', 'artes', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "estampas: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'estampas' and (select public.is_admin()));
create policy "estampas: admin altera" on storage.objects
  for update to authenticated using (bucket_id = 'estampas' and (select public.is_admin()));
create policy "estampas: admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'estampas' and (select public.is_admin()));
create policy "artes: admin vê" on storage.objects
  for select to authenticated using (bucket_id = 'artes' and (select public.is_admin()));
-- Uploads para "artes" são feitos pelo servidor (service role) depois de validados.

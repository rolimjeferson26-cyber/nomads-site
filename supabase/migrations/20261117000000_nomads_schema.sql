-- NOMAD'S · schema próprio "nomads" no projeto partilhado ria-apps.
-- Não toca em "public" nem em "auto", nem em auth.* (o login é partilhado com as apps da Ria).
-- RLS ativo em TODAS as tabelas. Grants explícitos e mínimos (mesmo padrão do schema "auto").
-- Escritas sensíveis (encomendas, orçamentos, rate limiting) são feitas pelo servidor com a service role.

create schema if not exists nomads;
revoke all on schema nomads from public;
grant usage on schema nomads to anon, authenticated, service_role;

-- ============ Administradores ============
create table nomads.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);
alter table nomads.admins enable row level security;

create or replace function nomads.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from nomads.admins a where a.user_id = (select auth.uid()));
$$;
revoke all on function nomads.is_admin() from public;
grant execute on function nomads.is_admin() to anon, authenticated, service_role;

create policy "admins: ver o próprio registo" on nomads.admins
  for select to authenticated using (user_id = (select auth.uid()));

-- ============ Perfis (criados pela app quando necessário; sem trigger em auth.users) ============
create table nomads.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text check (char_length(nome) <= 120),
  telefone text check (char_length(telefone) <= 30),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
alter table nomads.perfis enable row level security;

create policy "perfis: ver o próprio" on nomads.perfis
  for select to authenticated using (id = (select auth.uid()) or (select nomads.is_admin()));
create policy "perfis: criar o próprio" on nomads.perfis
  for insert to authenticated with check (id = (select auth.uid()));
create policy "perfis: editar o próprio" on nomads.perfis
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- ============ Moradas ============
create table nomads.moradas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 120),
  morada text not null check (char_length(morada) between 1 and 200),
  codigo_postal text not null check (codigo_postal ~ '^[0-9]{4}-[0-9]{3}$'),
  localidade text not null check (char_length(localidade) between 1 and 80),
  telefone text check (char_length(telefone) <= 30),
  criado_em timestamptz not null default now()
);
create index moradas_user_id_idx on nomads.moradas (user_id);
alter table nomads.moradas enable row level security;

create policy "moradas: ver as próprias" on nomads.moradas
  for select to authenticated using (user_id = (select auth.uid()));
create policy "moradas: criar as próprias" on nomads.moradas
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "moradas: editar as próprias" on nomads.moradas
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "moradas: apagar as próprias" on nomads.moradas
  for delete to authenticated using (user_id = (select auth.uid()));

-- ============ Estampas ============
create table nomads.estampas (
  id text primary key check (id ~ '^[a-z0-9-]{2,60}$'),
  nome text not null check (char_length(nome) between 1 and 80),
  estilo text not null check (estilo ~ '^[a-z0-9-]{2,30}$'),
  imagem_url text not null,
  proporcao numeric not null default 1 check (proporcao > 0.2 and proporcao < 5),
  ativa boolean not null default true,
  ordem integer not null default 0,
  criado_em timestamptz not null default now()
);
alter table nomads.estampas enable row level security;

create policy "estampas: ver as ativas" on nomads.estampas
  for select to anon, authenticated using (ativa or (select nomads.is_admin()));
create policy "estampas: admin cria" on nomads.estampas
  for insert to authenticated with check ((select nomads.is_admin()));
create policy "estampas: admin edita" on nomads.estampas
  for update to authenticated using ((select nomads.is_admin())) with check ((select nomads.is_admin()));
create policy "estampas: admin apaga" on nomads.estampas
  for delete to authenticated using ((select nomads.is_admin()));

-- ============ Definições (tabelas de preços e portes editáveis no Admin) ============
create table nomads.definicoes (
  chave text primary key check (chave in ('precos', 'portes')),
  valor jsonb not null,
  atualizado_em timestamptz not null default now()
);
alter table nomads.definicoes enable row level security;

create policy "definicoes: leitura pública" on nomads.definicoes
  for select to anon, authenticated using (true);
create policy "definicoes: admin cria" on nomads.definicoes
  for insert to authenticated with check ((select nomads.is_admin()));
create policy "definicoes: admin edita" on nomads.definicoes
  for update to authenticated using ((select nomads.is_admin())) with check ((select nomads.is_admin()));

-- ============ Encomendas ============
create table nomads.encomendas (
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
create index encomendas_user_id_idx on nomads.encomendas (user_id);
create index encomendas_estado_idx on nomads.encomendas (estado, criado_em desc);
alter table nomads.encomendas enable row level security;

create policy "encomendas: ver as próprias" on nomads.encomendas
  for select to authenticated using (user_id = (select auth.uid()) or (select nomads.is_admin()));
create policy "encomendas: admin atualiza" on nomads.encomendas
  for update to authenticated using ((select nomads.is_admin())) with check ((select nomads.is_admin()));
-- Sem política de insert: só o servidor (service role) cria encomendas, com preço calculado no servidor.

-- ============ Orçamentos ============
create table nomads.orcamentos (
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
create index orcamentos_user_id_idx on nomads.orcamentos (user_id);
create index orcamentos_estado_idx on nomads.orcamentos (estado, criado_em desc);
alter table nomads.orcamentos enable row level security;

create policy "orcamentos: ver os próprios" on nomads.orcamentos
  for select to authenticated using (user_id = (select auth.uid()) or (select nomads.is_admin()));
create policy "orcamentos: admin atualiza" on nomads.orcamentos
  for update to authenticated using ((select nomads.is_admin())) with check ((select nomads.is_admin()));

-- ============ Rate limiting (só service role) ============
create table nomads.limites_pedidos (
  chave text primary key,
  janela_inicio timestamptz not null,
  contagem integer not null
);
alter table nomads.limites_pedidos enable row level security;

create or replace function nomads.registar_pedido(p_chave text, p_max integer, p_janela_segundos integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contagem integer;
begin
  insert into nomads.limites_pedidos as l (chave, janela_inicio, contagem)
  values (p_chave, now(), 1)
  on conflict (chave) do update
    set contagem = case
          when l.janela_inicio < now() - make_interval(secs => p_janela_segundos) then 1
          else l.contagem + 1 end,
        janela_inicio = case
          when l.janela_inicio < now() - make_interval(secs => p_janela_segundos) then now()
          else l.janela_inicio end
  returning contagem into v_contagem;

  if random() < 0.01 then
    delete from nomads.limites_pedidos where janela_inicio < now() - interval '1 day';
  end if;

  return v_contagem <= p_max;
end;
$$;
revoke all on function nomads.registar_pedido(text, integer, integer) from public, anon, authenticated;
grant execute on function nomads.registar_pedido(text, integer, integer) to service_role;

-- ============ Eventos Stripe já processados (idempotência) ============
create table nomads.eventos_stripe (
  id text primary key,
  tipo text not null,
  recebido_em timestamptz not null default now()
);
alter table nomads.eventos_stripe enable row level security;

-- ============ Atualizado em ============
create or replace function nomads.tocar_atualizado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;
revoke all on function nomads.tocar_atualizado_em() from public, anon, authenticated;
create trigger perfis_atualizado before update on nomads.perfis
  for each row execute function nomads.tocar_atualizado_em();
create trigger encomendas_atualizado before update on nomads.encomendas
  for each row execute function nomads.tocar_atualizado_em();

-- ============ Grants (o RLS decide as linhas) ============
grant all on all tables in schema nomads to service_role;
grant usage, select on all sequences in schema nomads to service_role;

grant select on nomads.estampas, nomads.definicoes to anon;

grant select on nomads.admins to authenticated;
grant select, insert, update on nomads.perfis to authenticated;
grant select, insert, update, delete on nomads.moradas to authenticated;
grant select, insert, update, delete on nomads.estampas to authenticated;
grant select, insert, update on nomads.definicoes to authenticated;
grant select, update on nomads.encomendas to authenticated;
grant select, update on nomads.orcamentos to authenticated;
-- limites_pedidos e eventos_stripe: sem grants para anon/authenticated.

alter default privileges in schema nomads grant all on tables to service_role;
alter default privileges in schema nomads grant usage, select on sequences to service_role;
alter default privileges in schema nomads revoke execute on functions from public;

-- ============ Storage (buckets com prefixo nomads-) ============
-- nomads-estampas: público (imagens da loja), só o admin escreve.
-- nomads-artes: PRIVADO (artes dos orçamentos), já existia; uploads feitos pelo servidor.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('nomads-estampas', 'nomads-estampas', true, 3145728, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;
update storage.buckets
  set public = false, file_size_limit = 5242880, allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']
  where id = 'nomads-artes';

create policy "nomads_estampas_admin_enviar" on storage.objects
  for insert to authenticated with check (bucket_id = 'nomads-estampas' and (select nomads.is_admin()));
create policy "nomads_estampas_admin_alterar" on storage.objects
  for update to authenticated using (bucket_id = 'nomads-estampas' and (select nomads.is_admin()));
create policy "nomads_estampas_admin_apagar" on storage.objects
  for delete to authenticated using (bucket_id = 'nomads-estampas' and (select nomads.is_admin()));
create policy "nomads_artes_admin_ler" on storage.objects
  for select to authenticated using (bucket_id = 'nomads-artes' and (select nomads.is_admin()));

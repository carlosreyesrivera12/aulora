-- AULORA · esquema multi-colegio (Supabase / Postgres). Correr en SQL Editor.
create extension if not exists pgcrypto;

create table colegios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, pais text default 'AR', creado timestamptz default now());

create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  colegio_id uuid references colegios(id) on delete set null,
  nombre text, email text, rol text default 'admin', activo boolean default true);

create table colegio_datos (
  colegio_id uuid primary key references colegios(id) on delete cascade,
  data jsonb not null default '{}', updated_at timestamptz default now());

create or replace function mi_colegio() returns uuid
  language sql security definer stable as $$ select colegio_id from perfiles where id = auth.uid() $$;

alter table colegios enable row level security;
alter table perfiles enable row level security;
alter table colegio_datos enable row level security;

create policy col_sel   on colegios      for select using (id = mi_colegio());
create policy perf_sel  on perfiles      for select using (id = auth.uid() or colegio_id = mi_colegio());
create policy perf_upd  on perfiles      for update using (colegio_id = mi_colegio());
create policy perf_ins  on perfiles      for insert with check (colegio_id = mi_colegio() or id = auth.uid());
create policy datos_all on colegio_datos for all
  using (colegio_id = mi_colegio()) with check (colegio_id = mi_colegio());

-- Vincular tu usuario (crealo antes en Authentication > Users) — reemplazá TU_EMAIL:
-- with u as (select id, email from auth.users where email='TU_EMAIL'),
--      c as (insert into colegios (nombre,pais) values ('Mi Colegio','AR') returning id)
-- insert into perfiles (id,colegio_id,nombre,email,rol,activo)
-- select u.id, c.id, 'Super Admin', u.email, 'super_admin', true from u,c;

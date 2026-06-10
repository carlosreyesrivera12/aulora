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
create or replace function mi_rol() returns text
  language sql security definer stable as $$ select rol from perfiles where id = auth.uid() $$;

alter table colegios enable row level security;
alter table perfiles enable row level security;
alter table colegio_datos enable row level security;

create policy col_sel   on colegios      for select using (id = mi_colegio());
create policy perf_sel  on perfiles      for select using (id = auth.uid() or colegio_id = mi_colegio());
create policy perf_upd  on perfiles      for update using (colegio_id = mi_colegio() and mi_rol() in ('super_admin','supervisor','admin'));
create policy perf_ins  on perfiles      for insert with check (colegio_id = mi_colegio() and mi_rol() in ('super_admin','supervisor','admin'));
create policy datos_all on colegio_datos for all
  using (colegio_id = mi_colegio()) with check (colegio_id = mi_colegio());

-- Vincular tu usuario (crealo antes en Authentication > Users) — reemplazá TU_EMAIL:
-- with u as (select id, email from auth.users where email='TU_EMAIL'),
--      c as (insert into colegios (nombre,pais) values ('Mi Colegio','AR') returning id)
-- insert into perfiles (id,colegio_id,nombre,email,rol,activo)
-- select u.id, c.id, 'Super Admin', u.email, 'super_admin', true from u,c;

-- ===== Endurecimiento server-side: acceso a datos solo vía funciones que validan rol =====
revoke all on colegio_datos from anon, authenticated;

create or replace function aulora_load()
returns jsonb language sql security definer stable as $$
  select data from colegio_datos where colegio_id = mi_colegio();
$$;

create or replace function aulora_save(new_data jsonb)
returns void language plpgsql security definer as $$
declare cid uuid; r text;
begin
  cid := mi_colegio();
  r := mi_rol();
  if cid is null then raise exception 'sin colegio asignado'; end if;
  -- portal (familia/alumno), auditor (solo lectura) y roles desconocidos NO pueden escribir la base
  if r not in ('super_admin','supervisor','admin','contador','profesor','comedor','proveedor_actividades','afa') then
    raise exception 'rol % no autorizado para escribir', r;
  end if;
  insert into colegio_datos(colegio_id, data, updated_at) values (cid, new_data, now())
    on conflict (colegio_id) do update set data = excluded.data, updated_at = now();
end;
$$;

grant execute on function aulora_load() to authenticated;
grant execute on function aulora_save(jsonb) to authenticated;

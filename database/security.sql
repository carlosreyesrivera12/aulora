-- AULORA · migración de seguridad (idempotente). Pegar en SQL Editor y Run. No recrea tablas.

create or replace function mi_colegio() returns uuid
  language sql security definer stable as $$ select colegio_id from perfiles where id = auth.uid() $$;
create or replace function mi_rol() returns text
  language sql security definer stable as $$ select rol from perfiles where id = auth.uid() $$;

-- perfiles: cerrar escalada (solo admins del propio colegio crean/editan perfiles)
drop policy if exists perf_sel on perfiles;
drop policy if exists perf_upd on perfiles;
drop policy if exists perf_ins on perfiles;
create policy perf_sel on perfiles for select
  using (id = auth.uid() or colegio_id = mi_colegio());
create policy perf_ins on perfiles for insert
  with check (colegio_id = mi_colegio() and mi_rol() in ('super_admin','supervisor','admin'));
create policy perf_upd on perfiles for update
  using (colegio_id = mi_colegio() and mi_rol() in ('super_admin','supervisor','admin'));

-- colegio_datos: sin acceso directo; solo vía funciones que validan rol
drop policy if exists datos_all on colegio_datos;
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
  if r not in ('super_admin','supervisor','admin','contador','profesor','comedor','proveedor_actividades','afa') then
    raise exception 'rol % no autorizado para escribir', r;
  end if;
  insert into colegio_datos(colegio_id, data, updated_at) values (cid, new_data, now())
    on conflict (colegio_id) do update set data = excluded.data, updated_at = now();
end;
$$;

grant execute on function aulora_load() to authenticated;
grant execute on function aulora_save(jsonb) to authenticated;

-- Sincroniza un perfil de la app con la tabla `perfiles` por email.
-- Si el usuario aún no existe en auth.users (no inició sesión nunca), guarda el perfil
-- en `perfiles_pendientes` y se aplica cuando el usuario hace su primer login.
create table if not exists perfiles_pendientes (
  email text not null,
  colegio_id uuid not null references colegios(id) on delete cascade,
  nombre text, rol text not null, activo boolean default true,
  creado timestamptz default now(),
  primary key (email, colegio_id)
);
alter table perfiles_pendientes enable row level security;
drop policy if exists pend_sel on perfiles_pendientes;
drop policy if exists pend_ins on perfiles_pendientes;
drop policy if exists pend_upd on perfiles_pendientes;
drop policy if exists pend_del on perfiles_pendientes;
create policy pend_sel on perfiles_pendientes for select using (colegio_id = mi_colegio());
create policy pend_ins on perfiles_pendientes for insert with check (colegio_id = mi_colegio() and mi_rol() in ('super_admin','supervisor','admin'));
create policy pend_upd on perfiles_pendientes for update using (colegio_id = mi_colegio() and mi_rol() in ('super_admin','supervisor','admin'));
create policy pend_del on perfiles_pendientes for delete using (colegio_id = mi_colegio() and mi_rol() in ('super_admin','supervisor','admin'));

create or replace function aulora_upsert_perfil(p_email text, p_nombre text, p_rol text, p_activo boolean)
returns text language plpgsql security definer as $$
declare cid uuid; r text; target_id uuid; em text;
begin
  cid := mi_colegio();
  r := mi_rol();
  if cid is null then raise exception 'sin colegio asignado'; end if;
  if r not in ('super_admin','supervisor','admin') then raise exception 'rol % no autorizado', r; end if;
  if p_email is null or length(trim(p_email))=0 then raise exception 'email requerido'; end if;
  if p_rol not in ('super_admin','supervisor','admin','auditor','contador','profesor','comedor','proveedor_actividades','afa') then
    raise exception 'rol % inválido', p_rol;
  end if;
  em := lower(trim(p_email));
  select id into target_id from auth.users where lower(email)=em limit 1;
  if target_id is not null then
    insert into perfiles (id, colegio_id, nombre, email, rol, activo)
      values (target_id, cid, p_nombre, em, p_rol, coalesce(p_activo,true))
      on conflict (id) do update set colegio_id=excluded.colegio_id, nombre=excluded.nombre, email=excluded.email, rol=excluded.rol, activo=excluded.activo;
    delete from perfiles_pendientes where email=em and colegio_id=cid;
    return 'aplicado';
  else
    insert into perfiles_pendientes (email, colegio_id, nombre, rol, activo)
      values (em, cid, p_nombre, p_rol, coalesce(p_activo,true))
      on conflict (email, colegio_id) do update set nombre=excluded.nombre, rol=excluded.rol, activo=excluded.activo;
    return 'pendiente';
  end if;
end;
$$;
grant execute on function aulora_upsert_perfil(text,text,text,boolean) to authenticated;

create or replace function aulora_eliminar_perfil(p_email text)
returns void language plpgsql security definer as $$
declare cid uuid; r text; em text;
begin
  cid := mi_colegio(); r := mi_rol();
  if cid is null then raise exception 'sin colegio asignado'; end if;
  if r not in ('super_admin','supervisor','admin') then raise exception 'rol % no autorizado', r; end if;
  em := lower(trim(p_email));
  delete from perfiles where colegio_id=cid and lower(email)=em;
  delete from perfiles_pendientes where colegio_id=cid and email=em;
end;
$$;
grant execute on function aulora_eliminar_perfil(text) to authenticated;

-- Vincula automáticamente perfiles pendientes cuando un usuario hace su primer login.
create or replace function aulora_vincular_pendientes()
returns void language plpgsql security definer as $$
declare em text; rec record;
begin
  select lower(email) into em from auth.users where id = auth.uid();
  if em is null then return; end if;
  for rec in select * from perfiles_pendientes where lower(email)=em loop
    insert into perfiles (id, colegio_id, nombre, email, rol, activo)
      values (auth.uid(), rec.colegio_id, rec.nombre, em, rec.rol, rec.activo)
      on conflict (id) do update set colegio_id=excluded.colegio_id, nombre=excluded.nombre, email=excluded.email, rol=excluded.rol, activo=excluded.activo;
    delete from perfiles_pendientes where email=rec.email and colegio_id=rec.colegio_id;
  end loop;
end;
$$;
grant execute on function aulora_vincular_pendientes() to authenticated;

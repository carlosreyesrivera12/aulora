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

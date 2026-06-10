# Aulora — Gestión Escolar (multi-colegio, Supabase)

App estática (GitHub Pages) + backend **Supabase** (Postgres + Auth + RLS multi-tenant).
Sin Supabase configurado, corre en modo local (localStorage) con accesos demo.

## Estructura
```
index.html            Shell + CDNs + carga core.js (clásico) y backend.js (módulo)
src/styles.css        Estilos
src/core.js           App (roles, multipaís AR/ES, calendario, contabilidad, AFA)
src/config.js         ← pegar SUPABASE_URL y ANON key
src/backend.js        Conexión Supabase (Auth + datos por colegio, RLS) / fallback local
database/schema.sql   Tablas + RLS multi-colegio (correr en SQL Editor)
.github/workflows/deploy.yml  Deploy automático a GitHub Pages
```

## Puesta en marcha (5 min)
1. supabase.com → New project.
2. SQL Editor → pegar `database/schema.sql` → Run.
3. Authentication → Providers → Email (Confirm email = off).
4. Authentication → Users → crear tu usuario (email + pass).
5. SQL Editor → correr el bloque comentado al final de `schema.sql` con tu email
   (crea el colegio y te asigna rol super_admin).
6. Settings → API → copiar **Project URL** y **anon key** a `src/config.js`.
7. Abrir la app y entrar con tu email/contraseña.

> Modelo: 1 fila por colegio en `colegio_datos.data` (JSONB, sin el límite de 1 MB de Firestore).
> RLS aísla cada colegio: un usuario solo ve los datos de su colegio.

## Deploy (GitHub Pages)
Push a `main` → Settings → Pages → Source = GitHub Actions.

## Roles
super_admin, supervisor, admin, auditor, contador, profesor, comedor,
proveedor_actividades, afa (AFA/AMPA), familia/alumno (portal).

## Escalado posterior (no bloquea hoy)
- Fotos/documentos a Supabase Storage (bucket) en vez de base64 en el JSONB.
- Normalizar a tablas por entidad (alumnos, pagos…) cuando haga falta SQL/reportes pesados.

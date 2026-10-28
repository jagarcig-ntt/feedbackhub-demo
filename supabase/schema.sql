-- =====================================================================
-- FeedbackHub demo · esquema de la base de datos
-- =====================================================================
-- Se aplica IGUAL en los dos proyectos de Supabase (staging y producción):
-- mismo código, distinta configuración (Familia 2).
-- Es idempotente: se puede volver a ejecutar sin romper nada.
--
-- Quién puede hacer qué (lo decide la base de datos, no el frontend):
--   · cualquiera (anon)          → enviar feedback
--   · administrador (admins)     → leer el feedback
--   · nadie desde la API         → leer o tocar la tabla de administradores
-- La app no usa nunca la clave secreta: solo la pública + estos permisos (RLS).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Tablas
-- ---------------------------------------------------------------------

-- Feedback enviado desde el formulario público.
-- Las reglas de validación viven aquí además de en la API: si alguien
-- salta la API y llama directamente a la base de datos, siguen aplicando.
create table if not exists public.feedback (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text        not null check (char_length(name) between 1 and 100),
  email       text        not null check (char_length(email) between 3 and 254 and position('@' in email) > 1),
  message     text        not null check (char_length(message) between 1 and 2000),
  -- Detrás del feature flag FEATURE_VALORACION: si está apagado, la API no lo guarda.
  rating      smallint    check (rating between 1 and 5)
);

-- Quién es administrador. Se rellena a mano desde el panel de Supabase.
create table if not exists public.admins (
  user_id     uuid        primary key references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 2. ¿Es administrador el usuario que hace la petición?
-- ---------------------------------------------------------------------
-- "security definer" permite consultar admins aunque esa tabla no sea
-- legible desde la API. search_path vacío: siempre nombres completos.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


-- ---------------------------------------------------------------------
-- 3. Permisos de tabla (qué operaciones existen para cada rol)
-- ---------------------------------------------------------------------
revoke all on public.feedback from anon, authenticated;
revoke all on public.admins   from anon, authenticated;

grant insert on public.feedback to anon, authenticated;
grant select on public.feedback to authenticated;
-- admins: ningún permiso para anon ni authenticated.


-- ---------------------------------------------------------------------
-- 4. Row Level Security (qué filas puede ver o escribir cada uno)
-- ---------------------------------------------------------------------
alter table public.feedback enable row level security;
alter table public.admins   enable row level security;

drop policy if exists "Cualquiera puede enviar feedback" on public.feedback;
create policy "Cualquiera puede enviar feedback"
  on public.feedback
  for insert
  to anon, authenticated
  with check (true);   -- la validación la hacen los CHECK de la tabla

drop policy if exists "Solo administradores leen el feedback" on public.feedback;
create policy "Solo administradores leen el feedback"
  on public.feedback
  for select
  to authenticated
  using (public.is_admin());

-- admins: RLS activado y SIN políticas → nadie la lee ni la escribe desde la API.

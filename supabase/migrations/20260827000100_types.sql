-- ═══════════════════════════════════════════════════════════════
--  ARTE GOGO — tipet, ndihmësat dhe funksionet e përbashkëta
-- ═══════════════════════════════════════════════════════════════
--
-- Ekzekutohet i pari: çdo migrim tjetër varet nga tipet dhe funksionet këtu.

-- Pa `create extension pgcrypto`: `gen_random_uuid()` bën pjesë në bërthamën e
-- Postgres-it që nga versioni 13, dhe Supabase punon mbi 15. Ekstensioni do të
-- ishte varësi e panevojshme — dhe dështon aty ku nuk është i disponueshëm.

-- ---------------------------------------------------------------
--  TIPET E NUMËRUARA
-- ---------------------------------------------------------------
-- Të gjashtë sipas specifikimit. Përdoren tipe dhe jo `CHECK IN (...)`
-- sepse një tip i vetëm nuk mund të shkruhet gabim në dy tabela të
-- ndryshme — dhe `subscription_status` shfaqet te dy vende.

do $$ begin
  create type subscription_status as enum ('active', 'cancelled', 'expired', 'trial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_plan as enum ('monthly', 'yearly', 'lifetime');
exception when duplicate_object then null; end $$;

do $$ begin
  create type post_type as enum ('frymezim', 'njoftim', 'meditim', 'informacion');
exception when duplicate_object then null; end $$;

do $$ begin
  create type medal_type as enum ('bronze', 'silver', 'gold');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reminder_type as enum ('morning', 'midday', 'evening');
exception when duplicate_object then null; end $$;

do $$ begin
  create type session_source as enum ('today', 'library', 'program', 'creation', 'search');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------
--  updated_at
-- ---------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

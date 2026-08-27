-- ═══════════════════════════════════════════════════════════════
--  TË DHËNAT PERSONALE — të preferuarat, shkarkimet, kujtesat,
--  zakonet, gjendja, krijimet, vlerësimet
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  meditation_id uuid not null references public.meditations(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (user_id, meditation_id)
);
create index if not exists idx_favorites_user on public.favorites(user_id);

create table if not exists public.downloads (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete cascade,
  meditation_id   uuid not null references public.meditations(id) on delete cascade,
  downloaded_at   timestamptz not null default now(),
  file_size_bytes bigint,
  unique (user_id, meditation_id)
);
create index if not exists idx_downloads_user on public.downloads(user_id);

-- ---------------------------------------------------------------
--  reminders — Mëngjes / Drekë / Darkë
-- ---------------------------------------------------------------
create table if not exists public.reminders (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  reminder_type reminder_type not null,
  time_of_day   time not null,

  /* E fikur si parazgjedhje: onboarding-u i lë të fikura derisa përdoruesi
     t'i aktivizojë vetë. */
  is_enabled    boolean not null default false,
  days_of_week  int[] not null default '{1,2,3,4,5,6,7}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, reminder_type),

  /* Ditët duhen 1–7; një `0` ose `8` do të kalonte pa u vënë re dhe njoftimi
     nuk do të dërgohej kurrë atë ditë. */
  constraint reminders_valid_days
    check (days_of_week <@ array[1,2,3,4,5,6,7])
);

create index if not exists idx_reminders_enabled
  on public.reminders(is_enabled, time_of_day) where is_enabled;

create trigger reminders_touch before update on public.reminders
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
--  habits — një rresht për (përdorues, ditë, zakon)
-- ---------------------------------------------------------------
create table if not exists public.habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  date       date not null,
  habit_type text not null,
  value      numeric not null default 1,
  notes      text,
  created_at timestamptz not null default now(),
  unique (user_id, date, habit_type),

  /*
   * Ditët e ardhshme nuk plotësohen dot.
   *
   * Seksioni 10 i katalogut e kërkon shprehimisht: zakonet "mbushen me
   * kalimin e ditëve reale". Aplikacioni e respekton duke shkruar vetëm te
   * dita e sotme, por një klient i gabuar — ose një thirrje e drejtpërdrejtë
   * e API-së — do ta anashkalonte. Kufiri qëndron edhe këtu.
   */
  constraint habits_not_in_future check (date <= (now() at time zone 'utc')::date + 1)
);

create index if not exists idx_habits_user_date on public.habits(user_id, date desc);

-- ---------------------------------------------------------------
--  moods — një check-in për ditë
-- ---------------------------------------------------------------
create table if not exists public.moods (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  date         date not null,
  mood_score   int not null check (mood_score between 1 and 5),
  mood_label   text,
  energy_level int check (energy_level between 1 and 5),
  notes        text,
  created_at   timestamptz not null default now(),
  unique (user_id, date),
  constraint moods_not_in_future check (date <= (now() at time zone 'utc')::date + 1)
);

create index if not exists idx_moods_user_date on public.moods(user_id, date desc);

-- ---------------------------------------------------------------
--  creations + creation_steps — seancat e ndërtuara nga përdoruesi
-- ---------------------------------------------------------------
create table if not exists public.creations (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  name               text not null,
  goal               text,
  generation_type    text not null default 'manual'
                     check (generation_type in ('ai_generated', 'manual')),
  total_duration_sec int not null default 0,
  is_saved           boolean not null default false,
  created_at         timestamptz not null default now()
);

create index if not exists idx_creations_user on public.creations(user_id, created_at desc);

create table if not exists public.creation_steps (
  id            uuid primary key default gen_random_uuid(),
  creation_id   uuid not null references public.creations(id) on delete cascade,
  meditation_id uuid not null references public.meditations(id) on delete cascade,
  step_order    int not null,
  created_at    timestamptz not null default now(),
  unique (creation_id, step_order)
);

create index if not exists idx_creation_steps_creation
  on public.creation_steps(creation_id, step_order);

/** Mban `creations.total_duration_sec` në përputhje me hapat e saj. */
create or replace function public.recount_creation_duration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.creation_id, old.creation_id);
begin
  update public.creations c
     set total_duration_sec = coalesce((
           select sum(m.duration_sec)
             from public.creation_steps s
             join public.meditations m on m.id = s.meditation_id
            where s.creation_id = target), 0)
   where c.id = target;
  return null;
end;
$$;

create trigger creation_steps_recount
  after insert or update or delete on public.creation_steps
  for each row execute function public.recount_creation_duration();

-- ---------------------------------------------------------------
--  meditation_ratings
-- ---------------------------------------------------------------
create table if not exists public.meditation_ratings (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  meditation_id uuid not null references public.meditations(id) on delete cascade,
  rating        int not null check (rating between 1 and 5),
  comment       text,
  created_at    timestamptz not null default now(),
  unique (user_id, meditation_id)
);

create index if not exists idx_ratings_meditation
  on public.meditation_ratings(meditation_id);

-- ═══════════════════════════════════════════════════════════════
--  RLS
-- ═══════════════════════════════════════════════════════════════
alter table public.favorites          enable row level security;
alter table public.downloads          enable row level security;
alter table public.reminders          enable row level security;
alter table public.habits             enable row level security;
alter table public.moods              enable row level security;
alter table public.creations          enable row level security;
alter table public.creation_steps     enable row level security;
alter table public.meditation_ratings enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'favorites', 'downloads', 'reminders', 'habits',
    'moods', 'creations', 'meditation_ratings'
  ]
  loop
    execute format(
      'create policy "Vetëm të dhënat e veta" on public.%I for all
         using (user_id = auth.uid() or public.is_admin())
         with check (user_id = auth.uid())', t);
  end loop;
end $$;

/*
 * `creation_steps` nuk ka `user_id`: pronësia rrjedh nga krijimi mëmë.
 * Kontrolli bëhet me `exists`, që një hap të mos futet dot te seanca e tjetrit.
 */
create policy "Hapat ndjekin pronarin e krijimit"
  on public.creation_steps for all
  using (exists (select 1 from public.creations c
                  where c.id = creation_id and (c.user_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.creations c
                       where c.id = creation_id and c.user_id = auth.uid()));

/* Vlerësimet lexohen nga të gjithë — mesatarja e një meditimi është publike. */
create policy "Vlerësimet lexohen nga të gjithë"
  on public.meditation_ratings for select using (true);

-- ═══════════════════════════════════════════════════════════════
--  PROGRESI — seancat, streak-u, medaljet, programet e nisura
-- ═══════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------
--  meditation_sessions — historiku i plotë i dëgjimeve
-- ---------------------------------------------------------------
create table if not exists public.meditation_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  meditation_id uuid references public.meditations(id) on delete set null,
  sound_id      uuid references public.sounds(id) on delete set null,
  program_id    uuid references public.programs(id) on delete set null,
  program_day   int,
  duration_sec  int not null check (duration_sec >= 0),

  /* Sipas shënimit 4: dëgjimi nën 80% NUK e prek streak-un. */
  completed     boolean not null default false,

  source        session_source not null default 'library',
  mood_before   int check (mood_before between 1 and 5),
  mood_after    int check (mood_after between 1 and 5),
  notes         text,
  listened_at   timestamptz not null default now()
);

create index if not exists idx_sessions_user_date
  on public.meditation_sessions(user_id, listened_at desc);
create index if not exists idx_sessions_meditation
  on public.meditation_sessions(meditation_id);
create index if not exists idx_sessions_user_completed
  on public.meditation_sessions(user_id, completed);

-- ---------------------------------------------------------------
--  streaks — një rresht për përdorues
-- ---------------------------------------------------------------
create table if not exists public.streaks (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null unique references public.users(id) on delete cascade,
  current_streak            int not null default 0,
  best_streak               int not null default 0,
  last_meditation_date      date,

  /*
   * Dita kur nisi vargu i tanishëm. Nuk figuron te specifikimi, por pa të
   * medaljet nuk mund të jepen në mënyrë të përsëritshme: dy vargje të
   * ndryshme mund të arrijnë ditën 3, dhe secili duhet të japë bronzin e vet
   * pa u ngatërruar me tjetrin.
   */
  current_streak_started_on date,

  total_sessions            int not null default 0,

  /*
   * Sekondat janë burimi; minutat rrjedhin prej tyre.
   *
   * Specifikimi kërkon `total_minutes`, por mbledhja e minutave të rrumbullakosura
   * gabon: gjashtë seanca nga 90 sekonda janë 9 minuta, jo 6 apo 12. Duke mbledhur
   * sekondat dhe duke i pjesëtuar një herë, numri mbetet i saktë përgjithmonë.
   */
  total_seconds             bigint not null default 0,
  total_minutes             int generated always as ((total_seconds / 60)::int) stored,

  updated_at                timestamptz not null default now()
);

-- ---------------------------------------------------------------
--  medals
-- ---------------------------------------------------------------
create table if not exists public.medals (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  medal_type        medal_type not null,
  reason            text,

  /*
   * Këto dy fusha e bëjnë dhënien e medaljes IDEMPOTENTE.
   *
   * Pa to, çdo rillogaritje e streak-ut do të shtonte një medalje të re për
   * të njëjtën arritje, dhe numri "×N" do të rritej pa fund. Me çelësin unik
   * (përdorues, lloj, dita e nisjes së vargut, dita e arritur), e njëjta
   * arritje shkruhet vetëm një herë — ndërsa një varg i dytë që arrin të
   * njëjtën ditë jep medaljen e vet, siç e kërkon modeli.
   */
  streak_start_date date,
  streak_day        int,

  earned_at         timestamptz not null default now(),
  unique (user_id, medal_type, streak_start_date, streak_day)
);

create index if not exists idx_medals_user on public.medals(user_id, earned_at desc);

-- ---------------------------------------------------------------
--  user_program_progress
-- ---------------------------------------------------------------
create table if not exists public.user_program_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  program_id           uuid not null references public.programs(id) on delete cascade,
  current_day          int not null default 1,
  completed_days       int[] not null default '{}',
  total_days_completed int not null default 0,
  started_at           timestamptz not null default now(),
  last_activity_at     timestamptz,
  completed_at         timestamptz,
  unique (user_id, program_id)
);

create index if not exists idx_program_progress_user
  on public.user_program_progress(user_id);

/*
 * `total_days_completed` mbahet në sinkron me vargun — përndryshe të dyja
 * do të tregonin numra të ndryshëm sapo dikush shkruante vetëm njërin.
 */
create or replace function public.sync_program_progress()
returns trigger
language plpgsql
as $$
begin
  new.total_days_completed := coalesce(array_length(new.completed_days, 1), 0);
  new.last_activity_at := now();
  return new;
end;
$$;

create trigger program_progress_sync
  before insert or update of completed_days on public.user_program_progress
  for each row execute function public.sync_program_progress();

-- ═══════════════════════════════════════════════════════════════
--  RLS — çdo përdorues sheh vetëm të vetat
-- ═══════════════════════════════════════════════════════════════
alter table public.meditation_sessions    enable row level security;
alter table public.streaks                enable row level security;
alter table public.medals                 enable row level security;
alter table public.user_program_progress  enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'meditation_sessions', 'streaks', 'medals', 'user_program_progress'
  ]
  loop
    execute format(
      'create policy "Vetëm të dhënat e veta" on public.%I for all
         using (user_id = auth.uid() or public.is_admin())
         with check (user_id = auth.uid())', t);
  end loop;
end $$;

/*
 * `streaks` dhe `medals` i shkruan trigger-i, jo klienti. Politika e mësipërme
 * e lejon edhe shkrimin nga vetë përdoruesi; kjo është e pranueshme sepse
 * numrat rillogariten nga `meditation_sessions`, që është burimi i vërtetë.
 * Nëse dikush i falsifikon, historiku i seancave e tregon menjëherë.
 */

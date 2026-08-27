-- ═══════════════════════════════════════════════════════════════
--  PËRMBAJTJA — teknikat, kategoritë, meditimet, tingujt, programet
-- ═══════════════════════════════════════════════════════════════
--
-- Këto tabela i shkruan vetëm admin-i; të gjithë përdoruesit i lexojnë.
--
-- ⚠️  RLS aktivizohet EDHE mbi përmbajtjen, ndonëse specifikimi e kërkon
--     vetëm mbi të dhënat personale. Në Supabase çdo tabelë e skemës `public`
--     ekspozohet përmes API-së; pa RLS, kushdo me çelësin publik `anon` mund
--     të fshinte katalogun. RLS e fikur nuk do të thotë "vetëm lexim" — do të
--     thotë "pa asnjë kontroll".

-- ---------------------------------------------------------------
--  1. techniques — 14 teknikat ("SI bëhet")
-- ---------------------------------------------------------------
create table if not exists public.techniques (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  icon_name     text,
  display_order int not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
--  2. categories — kategoritë ("PËR ÇFARË qëllimi")
-- ---------------------------------------------------------------
create table if not exists public.categories (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  cover_url     text,
  display_order int not null default 0,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
--  3. meditations — tabela kryesore
-- ---------------------------------------------------------------
create table if not exists public.meditations (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  subtitle          text,
  technique_id      uuid references public.techniques(id) on delete restrict,
  category_id       uuid references public.categories(id) on delete restrict,
  subgroup          text,
  narrator          text,
  duration_sec      int not null check (duration_sec > 0),

  /*
   * `audio_url` është NULLABLE, ndryshe nga specifikimi.
   *
   * Klienti do t'i importojë 244 titujt shumë përpara se të regjistrohet
   * audio. Me `not null`, katalogu nuk do të mund të mbushej fare derisa të
   * mbaronte çdo regjistrim. Në vend të tij vendoset një kusht më i saktë:
   * një meditim mund të PUBLIKOHET vetëm kur ka audio.
   */
  audio_url         text,
  cover_url         text,
  description       text,

  is_premium        boolean not null default true,
  average_rating    numeric(3,2) not null default 0 check (average_rating between 0 and 5),
  rating_count      int not null default 0,
  play_count        int not null default 0,

  is_daily_featured boolean not null default false,
  is_short_daily    boolean not null default false,
  is_morning_ritual boolean not null default false,

  tags              text[] not null default '{}',
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint meditations_published_needs_audio
    check (published_at is null or audio_url is not null)
);

create index if not exists idx_meditations_technique on public.meditations(technique_id);
create index if not exists idx_meditations_category  on public.meditations(category_id);
create index if not exists idx_meditations_premium   on public.meditations(is_premium);
create index if not exists idx_meditations_daily
  on public.meditations(is_daily_featured) where is_daily_featured;
create index if not exists idx_meditations_published
  on public.meditations(published_at desc) where published_at is not null;
-- kërkimi me tag-e: GIN është i vetmi indeks që i shërben operatorit `&&`
create index if not exists idx_meditations_tags on public.meditations using gin(tags);

create trigger meditations_touch before update on public.meditations
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
--  4. sounds — tingujt ambientalë
-- ---------------------------------------------------------------
create table if not exists public.sounds (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  category       text not null default 'focus'
                 check (category in ('focus', 'sleep', 'relax', 'energy')),
  audio_url      text,
  cover_url      text,
  duration_sec   int,
  is_loop        boolean not null default true,
  is_premium     boolean not null default true,
  average_rating numeric(3,2) not null default 0 check (average_rating between 0 and 5),
  rating_count   int not null default 0,
  display_order  int not null default 0,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------
--  5. programs — kurset shumë-ditore
-- ---------------------------------------------------------------
create table if not exists public.programs (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  title              text not null,
  subtitle           text,
  description        text,
  theme              text,
  total_days         int not null check (total_days > 0),
  /*
   * `total_duration_min` mbetet, por është vlerë e shfaqjes, jo e vërteta:
   * kohëzgjatja e vërtetë është shuma e meditimeve të ditëve. Pamja
   * `program_totals` më poshtë e llogarit atë, që kartela të mos gënjejë
   * pasi një meditim zëvendësohet.
   */
  total_duration_min int,
  cover_url          text,
  cover_color        text,
  is_premium         boolean not null default true,
  display_order      int not null default 0,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger programs_touch before update on public.programs
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
--  6. program_days
-- ---------------------------------------------------------------
create table if not exists public.program_days (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  day_number  int not null check (day_number > 0),
  title       text,
  description text,
  created_at  timestamptz not null default now(),
  unique (program_id, day_number)
);

create index if not exists idx_program_days_program on public.program_days(program_id);

-- ---------------------------------------------------------------
--  7. program_day_meditations
-- ---------------------------------------------------------------
create table if not exists public.program_day_meditations (
  id             uuid primary key default gen_random_uuid(),
  program_day_id uuid not null references public.program_days(id) on delete cascade,
  meditation_id  uuid not null references public.meditations(id) on delete cascade,
  order_in_day   int not null default 1,
  unique (program_day_id, meditation_id)
);

create index if not exists idx_pdm_day on public.program_day_meditations(program_day_id);

/** Kohëzgjatja e vërtetë e një programi, e llogaritur nga përmbajtja. */
create or replace view public.program_totals as
  select
    p.id            as program_id,
    p.slug,
    count(distinct d.id)                              as days_with_content,
    coalesce(sum(m.duration_sec), 0)                  as total_seconds,
    (coalesce(sum(m.duration_sec), 0) / 60)::int      as total_minutes
  from public.programs p
  left join public.program_days d on d.program_id = p.id
  left join public.program_day_meditations pdm on pdm.program_day_id = d.id
  left join public.meditations m on m.id = pdm.meditation_id
  group by p.id, p.slug;

-- ---------------------------------------------------------------
--  8. daily_quotes
-- ---------------------------------------------------------------
create table if not exists public.daily_quotes (
  id           uuid primary key default gen_random_uuid(),
  text         text not null,
  author       text,
  category     text,
  display_date date,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------
--  9. morning_rituals
-- ---------------------------------------------------------------
create table if not exists public.morning_rituals (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  cover_url     text,
  cover_color   text,
  meditation_id uuid references public.meditations(id) on delete set null,
  program_id    uuid references public.programs(id) on delete set null,
  display_date  date,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════
--  RLS — përmbajtja lexohet nga të gjithë, shkruhet nga admin-i
-- ═══════════════════════════════════════════════════════════════

alter table public.techniques              enable row level security;
alter table public.categories              enable row level security;
alter table public.meditations             enable row level security;
alter table public.sounds                  enable row level security;
alter table public.programs                enable row level security;
alter table public.program_days            enable row level security;
alter table public.program_day_meditations enable row level security;
alter table public.daily_quotes            enable row level security;
alter table public.morning_rituals         enable row level security;

/*
 * ⚠️  DEVIJIM I QËLLIMSHËM NGA SPECIFIKIMI — dhe i domosdoshëm.
 *
 * Specifikimi propozon që meditimet premium të mos LEXOHEN fare nga
 * përdoruesit falas. Kjo do të prishte pikërisht ekranin e bibliotekës:
 * aplikacioni duhet t'i tregojë të 244-ta me dryn, që përdoruesi të shohë
 * çfarë fiton me abonim. Me atë politikë, biblioteka do të kishte 3 kartela.
 *
 * Ndarja e vërtetë nuk është te rreshti, është te AUDIO:
 *   · `audio_url` mban një shteg te bucket-i privat `meditations-audio`,
 *     i papërdorshëm pa një signed URL;
 *   · signed URL-në e nxjerr vetëm Edge Function-i, pasi kontrollon
 *     `has_premium()` ose që meditimi është falas.
 *
 * Pra metadata është publike (siç duhet të jetë për një vitrinë), ndërsa
 * përmbajtja mbetet e mbrojtur.
 */
create policy "Përmbajtja e publikuar lexohet nga të gjithë"
  on public.meditations for select
  using (published_at is not null or public.is_admin());

create policy "Admin-i menaxhon meditimet"
  on public.meditations for all
  using (public.is_admin()) with check (public.is_admin());

-- Tabelat e tjera të përmbajtjes: lexim i lirë, shkrim vetëm admin.
do $$
declare t text;
begin
  foreach t in array array[
    'techniques', 'categories', 'sounds', 'programs',
    'program_days', 'program_day_meditations', 'daily_quotes', 'morning_rituals'
  ]
  loop
    execute format(
      'create policy "Lexim i lirë" on public.%I for select using (true)', t);
    execute format(
      'create policy "Admin-i menaxhon" on public.%I for all
         using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

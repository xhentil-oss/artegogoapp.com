-- ═══════════════════════════════════════════════════════════════
--  PËRDORUESIT
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.users (
  /*
   * ⚠️  ZGJIDHJE E NJË KUNDËRSHTIMI NË SPECIFIKIM.
   *
   * Tabela e specifikimit thotë `default gen_random_uuid()`, ndërsa shënimi
   * final thotë se `id` duhet të përkojë me `auth.uid()`. Të dyja bashkë nuk
   * qëndrojnë: një ID e gjeneruar vetë nuk do të përputhej kurrë me atë të
   * Supabase Auth, dhe çdo politikë RLS `auth.uid() = user_id` do të dështonte
   * në heshtje — përdoruesi do të hynte dhe nuk do të shihte asgjë.
   *
   * Ndaj `id` është ÇELËS I HUAJ te `auth.users`, pa default. Rreshti krijohet
   * nga trigger-i i regjistrimit, jo me dorë.
   */
  id                     uuid primary key references auth.users(id) on delete cascade,

  /* Kopje e `auth.users.email`, e mbajtur në sinkron nga trigger-i. Ekziston
     sepse `auth` nuk lexohet dot nga API-ja publike, dhe admin-it i duhet. */
  email                  text unique not null,
  phone                  text unique,
  name                   text not null,
  avatar_url             text,

  /*
   * `is_admin` nuk figuron te specifikimi, por politikat e tij flasin për
   * admin ("Admins lexojnë të gjithë") — pa këtë kolonë ato nuk shkruhen dot.
   * Ndryshohet vetëm nga `service_role`, kurrë nga vetë përdoruesi: shih
   * politikën e përditësimit më poshtë.
   */
  is_admin               boolean not null default false,

  /*
   * Zona kohore, gjithashtu jashtë specifikimit.
   *
   * Streak-u matet në ditë. Pa zonë kohore, dita llogaritet në UTC — dhe një
   * meditim në orën 23:00 në Tiranë (UTC+2) do të numërohej si i nesërmja,
   * duke i dhënë përdoruesit dy ditë për një, ose duke ia këputur vargun.
   */
  timezone               text not null default 'Europe/Tirane',

  is_premium             boolean not null default false,
  subscription_status    subscription_status not null default 'expired',
  subscription_plan      subscription_plan,
  subscription_price_eur numeric(6,2),
  subscription_start_at  timestamptz,
  subscription_end_at    timestamptz,

  onboarding_completed   boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  constraint users_subscription_window
    check (subscription_start_at is null
           or subscription_end_at is null
           or subscription_end_at > subscription_start_at)
);

create index if not exists idx_users_premium on public.users(is_premium)
  where is_premium;
create index if not exists idx_users_subscription_end on public.users(subscription_end_at);

create trigger users_touch before update on public.users
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
--  NDIHMËSAT E RLS-së
-- ---------------------------------------------------------------
/*
 * Qëndrojnë KËTU, menjëherë pas tabelës `users`, dhe kjo radhë është e
 * detyrueshme. Postgres i kontrollon trupat e funksioneve `language sql` në
 * çastin e krijimit: po t'i vendosje para tabelës, migrimi dështon me
 * «relation "public.users" does not exist». Ndërsa politikat e `users` më
 * poshtë i thërrasin — pra as më vonë nuk shkojnë dot.
 *
 * `language sql` u zgjodh me qëllim mbi `plpgsql`: vetëm funksionet SQL të
 * shënuara `stable` mund të "inline"-hen nga planifikuesi brenda politikave
 * RLS. Në një tabelë me mijëra rreshta, kjo është dallimi mes një kontrolli
 * të vetëm dhe një thirrjeje funksioni për çdo rresht.
 *
 * ⚠️  `security definer` NUK është zbukurim.
 *     Një politikë mbi `users` që lexon `users` do të thërriste sërish
 *     politikën e vetë tabelës — rekursion, dhe Postgres e ndal query-n.
 *     Funksioni me `security definer` e anashkalon RLS-në brenda vetes.
 *
 *     `set search_path = public` është i detyrueshëm: pa të, kushdo që mund
 *     të krijojë skema do t'i mashtronte këto funksione të lexonin një tabelë
 *     `users` të tijën.
 */
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select u.is_admin from public.users u where u.id = uid), false);
$$;

/*
 * A ka abonim të vlefshëm.
 *
 * Sipas shënimit 5 të specifikimit, statusi i vetëm nuk mjafton: kontrollohet
 * edhe `subscription_end_at > now()`. Një abonim i anuluar mbetet i vlefshëm
 * deri në fund të periudhës së paguar — pikërisht sjellja që kërkojnë
 * App Store dhe Google Play.
 */
create or replace function public.has_premium(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select u.is_premium
       and u.subscription_end_at is not null
       and u.subscription_end_at > now()
     from public.users u
     where u.id = uid),
    false);
$$;

comment on function public.is_admin is
  'Kontroll admin-i pa rekursion RLS. Përdorur nga politikat e shkrimit.';
comment on function public.has_premium is
  'Abonim i vlefshëm = statusi PLUS data e mbarimit në të ardhmen.';

-- ---------------------------------------------------------------
--  Krijimi automatik i rreshtit pas regjistrimit
-- ---------------------------------------------------------------
/*
 * Supabase Auth shkruan te `auth.users`; aplikacioni lexon nga `public.users`.
 * Pa këtë trigger, çdo llogari e re do të kishte identitet por asnjë profil,
 * dhe ekrani i parë do të gjendej me `name` bosh.
 *
 * Krijohen njëkohësisht edhe rreshti i streak-ut dhe tri kujtesat, të fikura —
 * kështu asnjë pjesë e aplikacionit nuk merret me "po nëse mungon rreshti".
 */
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;

  insert into public.streaks (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.reminders (user_id, reminder_type, time_of_day, is_enabled)
  values (new.id, 'morning', '07:30', false),
         (new.id, 'midday',  '13:00', false),
         (new.id, 'evening', '21:00', false)
  on conflict (user_id, reminder_type) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

/** Mban email-in e kopjuar në sinkron kur përdoruesi e ndryshon te Auth. */
create or replace function public.sync_auth_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.users set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.sync_auth_email();

-- ═══════════════════════════════════════════════════════════════
--  RLS
-- ═══════════════════════════════════════════════════════════════
alter table public.users enable row level security;

create policy "Përdoruesi lexon veten"
  on public.users for select
  using (id = auth.uid() or public.is_admin());

/*
 * ⚠️  Përdoruesi NUK i prek dot fushat e abonimit dhe as `is_admin`.
 *
 * Pa këtë kufizim, kushdo me çelësin publik do të mund të shkruante
 * `is_premium = true` mbi rreshtin e vet dhe do ta hapte katalogun falas —
 * ose `is_admin = true` dhe do të merrte panelin. Këto fusha i shkruan vetëm
 * `service_role`: webhook-u i faturave dhe paneli i admin-it, që të dy nga
 * serveri, ku RLS nuk zbatohet.
 */
create policy "Përdoruesi përditëson profilin e vet"
  on public.users for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and is_admin            = (select u.is_admin            from public.users u where u.id = auth.uid())
    and is_premium          = (select u.is_premium          from public.users u where u.id = auth.uid())
    and subscription_status = (select u.subscription_status from public.users u where u.id = auth.uid())
    and subscription_end_at is not distinct from
        (select u.subscription_end_at from public.users u where u.id = auth.uid())
  );

comment on column public.users.is_admin is
  'Vetëm service_role e ndryshon; politika e UPDATE e ndalon përdoruesin.';
comment on column public.users.timezone is
  'Zona kohore e përdoruesit — baza e llogaritjes së ditëve për streak-un.';

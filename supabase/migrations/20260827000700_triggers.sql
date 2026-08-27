-- ═══════════════════════════════════════════════════════════════
--  AUTOMATIZIMET — streak, medalje, vlerësime, numërues
-- ═══════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------
--  1. Streak-u pas çdo seance të kryer
-- ---------------------------------------------------------------
/*
 * Dita llogaritet në ZONËN KOHORE TË PËRDORUESIT, jo në UTC.
 *
 * Kjo nuk është hollësi: një meditim në orën 23:00 në Tiranë (UTC+2) bie më
 * 01:00 UTC të nesërmen. Me UTC, përdoruesi që mediton çdo mbrëmje do të
 * shihte dy ditë për një — ose, në rastin e kundërt, vargun e këputur pa
 * arsye. Streak-u është premtim i numëruar; duhet numëruar ashtu si e jeton
 * përdoruesi ditën.
 *
 * Seancat e papërfunduara (nën 80%) nuk e prekin — shënimi 4 i specifikimit.
 */
create or replace function public.apply_session_to_streak()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tz        text;
  local_day date;
begin
  if not new.completed then
    return null;
  end if;

  select coalesce(u.timezone, 'Europe/Tirane') into tz
    from public.users u where u.id = new.user_id;

  local_day := (new.listened_at at time zone coalesce(tz, 'Europe/Tirane'))::date;

  insert into public.streaks as s (
    user_id, current_streak, best_streak, current_streak_started_on,
    last_meditation_date, total_sessions, total_seconds, updated_at
  )
  values (
    new.user_id, 1, 1, local_day, local_day, 1, new.duration_sec, now()
  )
  on conflict (user_id) do update set
    current_streak = case
      when s.last_meditation_date = local_day     then s.current_streak
      when s.last_meditation_date = local_day - 1 then s.current_streak + 1
      else 1
    end,
    current_streak_started_on = case
      when s.last_meditation_date in (local_day, local_day - 1)
        then coalesce(s.current_streak_started_on, local_day)
      else local_day
    end,
    best_streak = greatest(s.best_streak, case
      when s.last_meditation_date = local_day     then s.current_streak
      when s.last_meditation_date = local_day - 1 then s.current_streak + 1
      else 1
    end),
    /*
     * `greatest` mbron nga një seancë e vjetër e futur me vonesë (sinkronizim
     * offline): ajo nuk duhet ta tërheqë datën e fundit prapa në kohë.
     */
    last_meditation_date = greatest(s.last_meditation_date, local_day),
    total_sessions = s.total_sessions + 1,
    total_seconds  = s.total_seconds + new.duration_sec,
    updated_at     = now();

  return null;
end;
$$;

create trigger session_updates_streak
  after insert on public.meditation_sessions
  for each row execute function public.apply_session_to_streak();

-- ---------------------------------------------------------------
--  2. Medaljet — bronz/3, argjend/7, ar/21
-- ---------------------------------------------------------------
/*
 * Rregullat e seksionit 7: një medalje e re për çdo cikël të plotësuar, dhe
 * medaljet e fituara MBETEN edhe pasi vargu këputet.
 *
 * Prandaj dhënia lidhet me ditën e arritur BRENDA vargut aktual, dhe çelësi
 * unik përfshin datën e nisjes së vargut: dy vargje të ndryshme që të dyja
 * arrijnë ditën 3 japin secili bronzin e vet, ndërsa i njëjti varg nuk e jep
 * dot dy herë sado të rillogaritet.
 */
create or replace function public.award_streak_medals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  tier record;
begin
  if tg_op = 'UPDATE' and new.current_streak = old.current_streak then
    return null;
  end if;

  for tier in
    select * from (values
      ('bronze'::medal_type, 3),
      ('silver'::medal_type, 7),
      ('gold'::medal_type,  21)
    ) as t(kind, every_days)
  loop
    if new.current_streak > 0 and new.current_streak % tier.every_days = 0 then
      insert into public.medals (user_id, medal_type, reason, streak_start_date, streak_day)
      values (
        new.user_id,
        tier.kind,
        new.current_streak || ' ditë rresht',
        new.current_streak_started_on,
        new.current_streak
      )
      on conflict (user_id, medal_type, streak_start_date, streak_day) do nothing;
    end if;
  end loop;

  return null;
end;
$$;

create trigger streak_awards_medals
  after insert or update of current_streak on public.streaks
  for each row execute function public.award_streak_medals();

-- ---------------------------------------------------------------
--  3. Mesatarja e vlerësimeve
-- ---------------------------------------------------------------
create or replace function public.recount_meditation_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.meditation_id, old.meditation_id);
begin
  update public.meditations m
     set average_rating = coalesce(
           (select round(avg(r.rating)::numeric, 2)
              from public.meditation_ratings r
             where r.meditation_id = target), 0),
         rating_count = (select count(*)
                           from public.meditation_ratings r
                          where r.meditation_id = target)
   where m.id = target;
  return null;
end;
$$;

create trigger ratings_recount
  after insert or update or delete on public.meditation_ratings
  for each row execute function public.recount_meditation_rating();

-- ---------------------------------------------------------------
--  4. Numëruesit e postimeve
-- ---------------------------------------------------------------
/*
 * Numëruesit rillogariten me `count(*)`, jo me `+1` / `-1`.
 *
 * Shtimi dhe zbritja duket më e lirë, por çdo gabim — një fshirje kaskadë, një
 * transaksion i ndërprerë — e lë numrin përgjithmonë të gabuar, pa asnjë rrugë
 * për ta vënë re. Rillogaritja mbi një indeks të vetin është e shpejtë dhe
 * gjithmonë e vërtetë.
 */
create or replace function public.recount_post_reactions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.post_id, old.post_id);
begin
  update public.community_posts p
     set reaction_count = (select count(*) from public.post_reactions r where r.post_id = target)
   where p.id = target;
  return null;
end;
$$;

create trigger post_reactions_recount
  after insert or delete on public.post_reactions
  for each row execute function public.recount_post_reactions();

create or replace function public.recount_post_comments()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.post_id, old.post_id);
begin
  update public.community_posts p
     set comment_count = (select count(*) from public.post_comments c where c.post_id = target)
   where p.id = target;
  return null;
end;
$$;

create trigger post_comments_recount
  after insert or delete on public.post_comments
  for each row execute function public.recount_post_comments();

-- ---------------------------------------------------------------
--  5. Numëruesi i dëgjimeve
-- ---------------------------------------------------------------
create or replace function public.bump_meditation_plays()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.meditation_id is not null then
    update public.meditations set play_count = play_count + 1 where id = new.meditation_id;
  end if;
  return null;
end;
$$;

create trigger session_bumps_play_count
  after insert on public.meditation_sessions
  for each row execute function public.bump_meditation_plays();

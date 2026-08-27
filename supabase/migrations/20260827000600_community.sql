-- ═══════════════════════════════════════════════════════════════
--  KOMUNITETI — postimet, reagimet, komentet, ruajtjet, njoftimet
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.community_posts (
  id                uuid primary key default gen_random_uuid(),
  author_name       text not null,
  author_avatar_url text,
  author_role       text not null default 'Arte Gogo',
  is_verified       boolean not null default true,
  post_type         post_type not null default 'frymezim',
  text_content      text not null,
  media_url         text,
  media_type        text check (media_type in ('image', 'video')),
  meditation_id     uuid references public.meditations(id) on delete set null,
  reaction_count    int not null default 0,
  comment_count     int not null default 0,
  is_published      boolean not null default true,
  published_at      timestamptz not null default now(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  /* Një media pa lloj nuk vizatohet dot; një lloj pa media nuk ka kuptim. */
  constraint posts_media_pair
    check ((media_url is null) = (media_type is null))
);

create index if not exists idx_posts_published
  on public.community_posts(published_at desc) where is_published;
create index if not exists idx_posts_meditation
  on public.community_posts(meditation_id);

create trigger posts_touch before update on public.community_posts
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
--  post_reactions
-- ---------------------------------------------------------------
create table if not exists public.post_reactions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  post_id       uuid not null references public.community_posts(id) on delete cascade,
  reaction_type text not null default 'like'
                check (reaction_type in ('like', 'love', 'fire', 'clap')),
  created_at    timestamptz not null default now(),
  unique (user_id, post_id)
);

create index if not exists idx_post_reactions_post on public.post_reactions(post_id);

-- ---------------------------------------------------------------
--  post_comments
-- ---------------------------------------------------------------
create table if not exists public.post_comments (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.community_posts(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  content           text not null check (length(trim(content)) > 0),
  parent_comment_id uuid references public.post_comments(id) on delete cascade,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_post_comments_post
  on public.post_comments(post_id, created_at);
create index if not exists idx_post_comments_parent
  on public.post_comments(parent_comment_id);

create trigger post_comments_touch before update on public.post_comments
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------
--  post_saves
-- ---------------------------------------------------------------
create table if not exists public.post_saves (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index if not exists idx_post_saves_user on public.post_saves(user_id);

-- ---------------------------------------------------------------
--  notifications
-- ---------------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  title      text not null,
  body       text not null,
  type       text not null
             check (type in ('reminder', 'new_meditation', 'program_update',
                             'streak', 'medal', 'community')),
  related_id uuid,
  is_read    boolean not null default false,
  sent_at    timestamptz not null default now()
);

create index if not exists idx_notifications_unread
  on public.notifications(user_id, sent_at desc) where not is_read;

-- ═══════════════════════════════════════════════════════════════
--  RLS
-- ═══════════════════════════════════════════════════════════════
alter table public.community_posts enable row level security;
alter table public.post_reactions  enable row level security;
alter table public.post_comments   enable row level security;
alter table public.post_saves      enable row level security;
alter table public.notifications   enable row level security;

/* Postimet: i lexojnë të gjithë, i shkruan vetëm admin-i (seksioni 6.6). */
create policy "Postimet e publikuara lexohen nga të gjithë"
  on public.community_posts for select
  using (is_published or public.is_admin());

create policy "Admin-i menaxhon postimet"
  on public.community_posts for all
  using (public.is_admin()) with check (public.is_admin());

/* Reagimet dhe komentet: lexohen nga të gjithë, shkruhen nga vetë autori. */
create policy "Reagimet lexohen nga të gjithë"
  on public.post_reactions for select using (true);
create policy "Reagimi i vetes"
  on public.post_reactions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Komentet lexohen nga të gjithë"
  on public.post_comments for select using (true);
create policy "Komenti i vetes"
  on public.post_comments for insert with check (user_id = auth.uid());
create policy "Redaktim i komentit të vet"
  on public.post_comments for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
/* Fshirjen e bën autori — ose admin-i, për moderim. */
create policy "Fshirje e komentit"
  on public.post_comments for delete
  using (user_id = auth.uid() or public.is_admin());

create policy "Ruajtjet janë private"
  on public.post_saves for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

/*
 * Njoftimet i krijon serveri (`service_role`), jo klienti: përndryshe kushdo
 * do të mund t'i shkruante vetes një njoftim të rremë. Klienti vetëm i lexon
 * dhe i shënon si të lexuara.
 */
create policy "Njoftimet e veta"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());
create policy "Shënimi si i lexuar"
  on public.notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

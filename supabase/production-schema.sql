create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^@[a-z0-9_]{3,20}$'),
  name text not null,
  email text,
  avatar text not null default '',
  avatar_url text,
  bio text not null default '',
  is_creator boolean not null default false,
  is_verified boolean not null default false,
  is_premium boolean not null default false,
  followers integer not null default 0,
  followers_count integer not null default 0,
  following integer not null default 0,
  following_count integer not null default 0,
  posts integer not null default 0,
  posts_count integer not null default 0,
  balance numeric(12,2) not null default 0,
  plan text not null default 'free',
  intimacy_score integer not null default 0,
  mode text not null default 'member',
  joined_at timestamptz not null default now(),
  cover_image text,
  website text,
  location text,
  niche text,
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid generated always as (user_id) stored,
  content text not null default '',
  media jsonb,
  media_url text,
  is_locked boolean not null default false,
  price numeric(10,2),
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  liked_by uuid[] not null default '{}',
  saved_by uuid[] not null default '{}',
  hashtags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.momentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid generated always as (user_id) stored,
  media text not null,
  media_type text not null default 'image',
  is_locked boolean not null default false,
  price numeric(10,2),
  daily_free_count integer not null default 3,
  view_count integer not null default 0,
  duration integer not null default 5000,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  creator_profile_id uuid not null references public.profiles(id) on delete cascade,
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  last_message text,
  last_message_time timestamptz,
  unread_count_a integer not null default 0,
  unread_count_b integer not null default 0,
  intimacy_score integer not null default 0,
  auction_active boolean not null default false,
  current_bid numeric(10,2),
  created_at timestamptz not null default now(),
  constraint conversations_distinct_users check (user_a <> user_b)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  type text not null default 'text',
  media_url text,
  is_locked boolean not null default false,
  price numeric(10,2),
  auction_bid numeric(10,2),
  auction_status text,
  timestamp timestamptz not null default now(),
  is_read boolean not null default false
);

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('like', 'comment', 'follow', 'share', 'message', 'system')),
  title text not null,
  description text not null,
  post_id uuid references public.posts(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_created_idx
on public.notifications (recipient_id, created_at desc);

alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists followers_count integer not null default 0;
alter table public.profiles add column if not exists following_count integer not null default 0;
alter table public.profiles add column if not exists posts_count integer not null default 0;
alter table public.profiles add column if not exists mode text not null default 'member';
alter table public.profiles add column if not exists cover_image text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists niche text;
alter table public.posts add column if not exists media_url text;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.momentos enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.follows enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles readable by everyone" on public.profiles;
create policy "profiles readable by everyone"
on public.profiles for select
using (true);

drop policy if exists "profiles owner updates" on public.profiles;
create policy "profiles owner updates"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "posts readable by everyone" on public.posts;
create policy "posts readable by everyone"
on public.posts for select
using (true);

drop policy if exists "posts insert by owner" on public.posts;
create policy "posts insert by owner"
on public.posts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "posts update by owner" on public.posts;
create policy "posts update by owner"
on public.posts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "posts delete by owner" on public.posts;
create policy "posts delete by owner"
on public.posts for delete
to authenticated
using (auth.uid() = user_id);

create or replace function public.toggle_post_like(target_post_id uuid)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  updated_post public.posts;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  update public.posts
  set liked_by = case
    when current_user_id = any(coalesce(liked_by, '{}'::uuid[]))
      then array_remove(coalesce(liked_by, '{}'::uuid[]), current_user_id)
    else array_append(coalesce(liked_by, '{}'::uuid[]), current_user_id)
  end
  where id = target_post_id;

  update public.posts
  set likes_count = coalesce(array_length(liked_by, 1), 0)
  where id = target_post_id
  returning * into updated_post;

  if updated_post.id is null then
    raise exception 'post_not_found';
  end if;

  return updated_post;
end;
$$;

grant execute on function public.toggle_post_like(uuid) to authenticated;

create or replace function public.toggle_post_save(target_post_id uuid)
returns public.posts
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  updated_post public.posts;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  update public.posts
  set saved_by = case
    when current_user_id = any(coalesce(saved_by, '{}'::uuid[]))
      then array_remove(coalesce(saved_by, '{}'::uuid[]), current_user_id)
    else array_append(coalesce(saved_by, '{}'::uuid[]), current_user_id)
  end
  where id = target_post_id
  returning * into updated_post;

  if updated_post.id is null then
    raise exception 'post_not_found';
  end if;

  return updated_post;
end;
$$;

grant execute on function public.toggle_post_save(uuid) to authenticated;

drop policy if exists "momentos readable by everyone" on public.momentos;
create policy "momentos readable by everyone"
on public.momentos for select
using (true);

drop policy if exists "momentos writable by owner" on public.momentos;
create policy "momentos writable by owner"
on public.momentos for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "conversations visible to participants" on public.conversations;
create policy "conversations visible to participants"
on public.conversations for select
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "conversations writable by participants" on public.conversations;
create policy "conversations writable by participants"
on public.conversations for all
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b)
with check (auth.uid() = user_a or auth.uid() = user_b);

drop policy if exists "messages visible to participants" on public.messages;
create policy "messages visible to participants"
on public.messages for select
to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "messages insert by sender" on public.messages;
create policy "messages insert by sender"
on public.messages for insert
to authenticated
with check (auth.uid() = sender_id);

drop policy if exists "messages update by participants" on public.messages;
create policy "messages update by participants"
on public.messages for update
to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id)
with check (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "follows readable by everyone" on public.follows;
create policy "follows readable by everyone"
on public.follows for select
using (true);

drop policy if exists "follows writable by follower" on public.follows;
create policy "follows writable by follower"
on public.follows for all
to authenticated
using (auth.uid() = follower_id)
with check (auth.uid() = follower_id);

drop policy if exists "notifications visible to recipient" on public.notifications;
create policy "notifications visible to recipient"
on public.notifications for select
to authenticated
using (auth.uid() = recipient_id);

drop policy if exists "notifications insert by actor" on public.notifications;
create policy "notifications insert by actor"
on public.notifications for insert
to authenticated
with check (actor_id is null or auth.uid() = actor_id);

drop policy if exists "notifications update by recipient" on public.notifications;
create policy "notifications update by recipient"
on public.notifications for update
to authenticated
using (auth.uid() = recipient_id)
with check (auth.uid() = recipient_id);

create or replace function public.handle_confirmed_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  normalized_username text := lower(regexp_replace(coalesce(metadata ->> 'username', ''), '^@+', ''));
  fallback_username text := 'user_' || left(replace(new.id::text, '-', ''), 12);
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  if normalized_username !~ '^[a-z0-9_]{3,20}$' then
    normalized_username := fallback_username;
  end if;

  insert into public.profiles (
    id, username, name, email, avatar, avatar_url, bio, is_creator, is_verified,
    is_premium, followers, followers_count, following, following_count, posts,
    posts_count, balance, plan, intimacy_score, mode, joined_at, cover_image,
    website, location, niche, updated_at
  )
  values (
    new.id,
    '@' || normalized_username,
    coalesce(nullif(metadata ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Usuario OnlyDay'),
    new.email,
    coalesce(nullif(metadata ->> 'avatar', ''), ''),
    coalesce(nullif(metadata ->> 'avatar', ''), ''),
    coalesce(nullif(metadata ->> 'bio', ''), 'Novo no OnlyDay'),
    coalesce((metadata ->> 'isCreator')::boolean, false),
    coalesce((metadata ->> 'isCreator')::boolean, false),
    false,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    'free',
    0,
    case when coalesce((metadata ->> 'isCreator')::boolean, false) then 'creator' else 'member' end,
    coalesce(new.created_at, now()),
    nullif(metadata ->> 'coverImage', ''),
    nullif(metadata ->> 'website', ''),
    nullif(metadata ->> 'location', ''),
    nullif(metadata ->> 'niche', ''),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    is_verified = excluded.is_creator,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed_create_profile on auth.users;
create trigger on_auth_user_confirmed_create_profile
after insert or update of email_confirmed_at on auth.users
for each row
execute function public.handle_confirmed_auth_user_profile();

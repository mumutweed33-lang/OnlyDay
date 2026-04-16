create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key,
  name text not null,
  username text not null unique,
  email text,
  avatar text not null,
  bio text not null default '',
  is_creator boolean not null default false,
  is_verified boolean not null default false,
  is_premium boolean not null default false,
  followers integer not null default 0,
  following integer not null default 0,
  posts integer not null default 0,
  balance numeric(12,2) not null default 0,
  plan text not null default 'free',
  joined_at timestamptz not null default now(),
  cover_image text,
  website text,
  location text,
  intimacy_score integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '',
  media jsonb,
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
  created_at timestamptz not null default now()
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

create table if not exists public.momentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
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

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.momentos enable row level security;

create policy "profiles readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "profiles writable by owner"
on public.profiles for all
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "posts readable by authenticated users"
on public.posts for select
to authenticated
using (true);

create policy "posts writable by owner"
on public.posts for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "conversations visible to participants"
on public.conversations for select
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b);

create policy "conversations writable by participants"
on public.conversations for all
to authenticated
using (auth.uid() = user_a or auth.uid() = user_b)
with check (auth.uid() = user_a or auth.uid() = user_b);

create policy "messages visible to participants"
on public.messages for select
to authenticated
using (
  auth.uid() = sender_id
  or auth.uid() = receiver_id
);

create policy "messages writable by sender"
on public.messages for insert
to authenticated
with check (auth.uid() = sender_id);

create policy "messages update by participants"
on public.messages for update
to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id)
with check (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "momentos readable by authenticated users"
on public.momentos for select
to authenticated
using (true);

create policy "momentos writable by owner"
on public.momentos for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

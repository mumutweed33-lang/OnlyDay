alter table public.posts add column if not exists liked_by uuid[] not null default '{}';
alter table public.posts add column if not exists likes_count integer not null default 0;
alter table public.posts add column if not exists comments_count integer not null default 0;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists comments_post_created_idx
on public.comments (post_id, created_at asc);

alter table public.comments enable row level security;

drop policy if exists "comments readable by everyone" on public.comments;
create policy "comments readable by everyone"
on public.comments for select
using (true);

drop policy if exists "comments insert by owner" on public.comments;
create policy "comments insert by owner"
on public.comments for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "comments delete by owner" on public.comments;
create policy "comments delete by owner"
on public.comments for delete
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

create or replace function public.refresh_post_comment_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_post_id uuid;
begin
  target_post_id := coalesce(new.post_id, old.post_id);

  update public.posts
  set comments_count = (
    select count(*)::integer
    from public.comments
    where post_id = target_post_id
  )
  where id = target_post_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists comments_refresh_post_count on public.comments;
create trigger comments_refresh_post_count
after insert or delete on public.comments
for each row execute function public.refresh_post_comment_count();

update public.posts
set comments_count = counts.total
from (
  select post_id, count(*)::integer as total
  from public.comments
  group by post_id
) counts
where public.posts.id = counts.post_id;

update public.posts
set comments_count = 0
where id not in (select distinct post_id from public.comments);

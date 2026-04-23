alter table public.posts add column if not exists liked_by uuid[] not null default '{}';
alter table public.posts add column if not exists likes_count integer not null default 0;

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

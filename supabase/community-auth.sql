create or replace function public.handle_confirmed_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  fallback_username text := '@' || left(replace(new.id::text, '-', ''), 12);
begin
  if new.email_confirmed_at is null then
    return new;
  end if;

  insert into public.profiles (
    id,
    name,
    username,
    email,
    avatar,
    bio,
    is_creator,
    is_verified,
    is_premium,
    followers,
    following,
    posts,
    balance,
    plan,
    joined_at,
    intimacy_score,
    updated_at
  )
  values (
    new.id,
    coalesce(nullif(metadata ->> 'name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Usuario OnlyDay'),
    coalesce(nullif(metadata ->> 'username', ''), fallback_username),
    new.email,
    coalesce(
      nullif(metadata ->> 'avatar', ''),
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(new.email, new.id::text) || '&backgroundColor=7C3AED'
    ),
    coalesce(nullif(metadata ->> 'bio', ''), 'Novo no OnlyDay'),
    coalesce((metadata ->> 'isCreator')::boolean, false),
    true,
    false,
    0,
    0,
    0,
    0,
    'free',
    coalesce(new.created_at, now()),
    0,
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    is_verified = true,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed_create_profile on auth.users;

create trigger on_auth_user_confirmed_create_profile
after insert or update of email_confirmed_at on auth.users
for each row
execute function public.handle_confirmed_auth_user_profile();

insert into public.profiles (
  id,
  name,
  username,
  email,
  avatar,
  bio,
  is_creator,
  is_verified,
  is_premium,
  followers,
  following,
  posts,
  balance,
  plan,
  joined_at,
  intimacy_score,
  updated_at
)
select
  users.id,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(users.email, ''), '@', 1),
    'Usuario OnlyDay'
  ),
  coalesce(
    nullif(users.raw_user_meta_data ->> 'username', ''),
    '@' || left(replace(users.id::text, '-', ''), 12)
  ),
  users.email,
  coalesce(
    nullif(users.raw_user_meta_data ->> 'avatar', ''),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(users.email, users.id::text) || '&backgroundColor=7C3AED'
  ),
  coalesce(nullif(users.raw_user_meta_data ->> 'bio', ''), 'Novo no OnlyDay'),
  coalesce((users.raw_user_meta_data ->> 'isCreator')::boolean, false),
  true,
  false,
  0,
  0,
  0,
  0,
  'free',
  coalesce(users.created_at, now()),
  0,
  now()
from auth.users
where users.email_confirmed_at is not null
on conflict (id) do update set
  email = excluded.email,
  is_verified = true,
  updated_at = now();

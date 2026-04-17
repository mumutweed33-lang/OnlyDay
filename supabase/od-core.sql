create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'od_event_type') then
    create type public.od_event_type as enum (
      'feed_impression',
      'post_view',
      'post_like',
      'post_save',
      'post_comment',
      'post_share',
      'profile_view',
      'follow',
      'story_open',
      'story_complete',
      'story_skip',
      'story_unlock_click',
      'story_unlock_paid',
      'vault_open',
      'vault_unlock_click',
      'vault_unlock_paid',
      'auction_view',
      'auction_bid',
      'auction_win',
      'chat_open',
      'chat_reply',
      'chat_paid_open',
      'subscription_start',
      'subscription_cancel',
      'tip_sent',
      'report_content',
      'block_user'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'od_surface') then
    create type public.od_surface as enum (
      'feed',
      'explore',
      'vault',
      'auction',
      'chat_vip'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'od_entity_type') then
    create type public.od_entity_type as enum (
      'post',
      'momento',
      'creator',
      'conversation'
    );
  end if;
end $$;

create table if not exists public.od_event_log (
  id uuid primary key default gen_random_uuid(),
  actor_profile_id uuid references public.profiles(id) on delete cascade,
  target_profile_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  momento_id uuid references public.momentos(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete cascade,
  surface public.od_surface not null,
  event_type public.od_event_type not null,
  session_id text,
  metadata jsonb not null default '{}'::jsonb,
  event_value numeric(12,4) not null default 1,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (num_nonnulls(post_id, momento_id, conversation_id, target_profile_id) >= 1)
);

create index if not exists od_event_log_actor_idx on public.od_event_log (actor_profile_id, occurred_at desc);
create index if not exists od_event_log_target_idx on public.od_event_log (target_profile_id, occurred_at desc);
create index if not exists od_event_log_surface_type_idx on public.od_event_log (surface, event_type, occurred_at desc);
create index if not exists od_event_log_post_idx on public.od_event_log (post_id, occurred_at desc) where post_id is not null;
create index if not exists od_event_log_momento_idx on public.od_event_log (momento_id, occurred_at desc) where momento_id is not null;

create table if not exists public.od_fan_creator_affinity_daily (
  snapshot_date date not null,
  fan_profile_id uuid not null references public.profiles(id) on delete cascade,
  creator_profile_id uuid not null references public.profiles(id) on delete cascade,
  intent_score numeric(14,6) not null default 0,
  bond_score numeric(14,6) not null default 0,
  payment_score numeric(14,6) not null default 0,
  negative_score numeric(14,6) not null default 0,
  final_affinity_score numeric(14,6) not null default 0,
  views_30d integer not null default 0,
  saves_30d integer not null default 0,
  comments_30d integer not null default 0,
  shares_30d integer not null default 0,
  follows_30d integer not null default 0,
  unlocks_30d integer not null default 0,
  bids_30d integer not null default 0,
  chat_replies_30d integer not null default 0,
  subscription_events_30d integer not null default 0,
  negative_events_30d integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (snapshot_date, fan_profile_id, creator_profile_id)
);

create index if not exists od_fan_creator_affinity_lookup_idx
  on public.od_fan_creator_affinity_daily (fan_profile_id, snapshot_date desc, final_affinity_score desc);

create table if not exists public.od_fan_niche_affinity_daily (
  snapshot_date date not null,
  fan_profile_id uuid not null references public.profiles(id) on delete cascade,
  niche text not null,
  affinity_score numeric(14,6) not null default 0,
  interactions_30d integer not null default 0,
  paid_events_30d integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (snapshot_date, fan_profile_id, niche)
);

create table if not exists public.od_creator_quality_daily (
  snapshot_date date not null,
  creator_profile_id uuid not null references public.profiles(id) on delete cascade,
  posting_consistency_score numeric(14,6) not null default 0,
  chat_reply_score numeric(14,6) not null default 0,
  subscriber_health_score numeric(14,6) not null default 0,
  monetization_balance_score numeric(14,6) not null default 0,
  safety_score numeric(14,6) not null default 0,
  creator_quality_score numeric(14,6) not null default 0,
  active_posts_30d integer not null default 0,
  reply_messages_30d integer not null default 0,
  total_messages_30d integer not null default 0,
  reports_30d integer not null default 0,
  blocks_30d integer not null default 0,
  subscriptions_started_30d integer not null default 0,
  subscriptions_cancelled_30d integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (snapshot_date, creator_profile_id)
);
create table if not exists public.od_content_quality_daily (
  snapshot_date date not null,
  entity_type public.od_entity_type not null,
  entity_id uuid not null,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  quality_score numeric(14,6) not null default 0,
  conversion_score numeric(14,6) not null default 0,
  risk_score numeric(14,6) not null default 0,
  freshness_score numeric(14,6) not null default 0,
  views_7d integer not null default 0,
  likes_7d integer not null default 0,
  saves_7d integer not null default 0,
  comments_7d integer not null default 0,
  unlocks_7d integer not null default 0,
  reports_7d integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (snapshot_date, entity_type, entity_id)
);

create index if not exists od_content_quality_owner_idx
  on public.od_content_quality_daily (owner_profile_id, snapshot_date desc);

create table if not exists public.od_rank_scores (
  viewer_profile_id uuid not null references public.profiles(id) on delete cascade,
  surface public.od_surface not null,
  entity_type public.od_entity_type not null,
  entity_id uuid not null,
  owner_profile_id uuid references public.profiles(id) on delete cascade,
  payment_intent_score numeric(14,6) not null default 0,
  bond_score numeric(14,6) not null default 0,
  freshness_score numeric(14,6) not null default 0,
  creator_quality_score numeric(14,6) not null default 0,
  content_quality_score numeric(14,6) not null default 0,
  diversity_score numeric(14,6) not null default 0,
  discovery_score numeric(14,6) not null default 0,
  risk_penalty numeric(14,6) not null default 0,
  saturation_penalty numeric(14,6) not null default 0,
  final_score numeric(14,6) not null default 0,
  explanation jsonb not null default '{}'::jsonb,
  snapshot_at timestamptz not null default now(),
  primary key (viewer_profile_id, surface, entity_type, entity_id)
);

create index if not exists od_rank_scores_surface_idx
  on public.od_rank_scores (viewer_profile_id, surface, final_score desc);

create table if not exists public.od_post_score_factors (
  snapshot_at timestamptz not null default now(),
  viewer_profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  factor_key text not null,
  factor_value numeric(14,6) not null default 0,
  factor_direction text not null check (factor_direction in ('positive', 'negative')),
  explanation text not null,
  primary key (snapshot_at, viewer_profile_id, post_id, factor_key)
);

create table if not exists public.od_reach_explanations (
  snapshot_date date not null,
  creator_profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  impressions integer not null default 0,
  relative_reach_delta numeric(14,6) not null default 0,
  primary_positive_reason text,
  primary_negative_reason text,
  explanation jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (snapshot_date, creator_profile_id, post_id)
);

create or replace function public.od_safe_ratio(numerator numeric, denominator numeric, fallback numeric default 0)
returns numeric
language sql
immutable
as $$
  select case
    when denominator is null or denominator = 0 then fallback
    else numerator / denominator
  end;
$$;

create or replace function public.od_event_weight(p_event_type public.od_event_type)
returns numeric
language sql
immutable
as $$
  select case p_event_type
    when 'vault_unlock_paid' then 10
    when 'story_unlock_paid' then 10
    when 'auction_win' then 10
    when 'subscription_start' then 9
    when 'chat_reply' then 9
    when 'follow' then 8
    when 'auction_bid' then 8
    when 'post_save' then 7
    when 'post_comment' then 7
    when 'post_share' then 7
    when 'story_complete' then 6
    when 'vault_open' then 5
    when 'profile_view' then 5
    when 'chat_open' then 4
    when 'post_like' then 3
    when 'post_view' then 1
    when 'feed_impression' then 0.25
    when 'story_skip' then -4
    when 'subscription_cancel' then -8
    when 'report_content' then -10
    when 'block_user' then -10
    else 0
  end;
$$;

create or replace function public.od_refresh_fan_creator_affinity(p_as_of_date date default current_date)
returns void
language sql
as $$
  with event_window as (
    select
      actor_profile_id as fan_profile_id,
      coalesce(target_profile_id, p.user_id, m.user_id, c.creator_profile_id) as creator_profile_id,
      event_type,
      count(*)::integer as event_count,
      sum(public.od_event_weight(event_type))::numeric(14,6) as weighted_score
    from public.od_event_log e
    left join public.posts p on p.id = e.post_id
    left join public.momentos m on m.id = e.momento_id
    left join public.conversations c on c.id = e.conversation_id
    where e.actor_profile_id is not null
      and e.occurred_at >= (p_as_of_date - interval '30 days')
    group by 1, 2, 3
  ),
  aggregated as (
    select
      p_as_of_date as snapshot_date,
      fan_profile_id,
      creator_profile_id,
      coalesce(sum(weighted_score) filter (
        where event_type in (
          'vault_open','vault_unlock_click','vault_unlock_paid',
          'story_unlock_click','story_unlock_paid',
          'auction_view','auction_bid','auction_win',
          'chat_paid_open','tip_sent','subscription_start'
        )
      ), 0)::numeric(14,6) as intent_score,
      coalesce(sum(weighted_score) filter (
        where event_type in (
          'post_save','post_comment','post_share',
          'profile_view','story_complete','chat_reply','follow'
        )
      ), 0)::numeric(14,6) as bond_score,
      coalesce(sum(weighted_score) filter (
        where event_type in (
          'vault_unlock_paid','story_unlock_paid',
          'auction_bid','auction_win','tip_sent','subscription_start'
        )
      ), 0)::numeric(14,6) as payment_score,
      abs(coalesce(sum(weighted_score) filter (
        where event_type in ('report_content','block_user','subscription_cancel','story_skip')
      ), 0))::numeric(14,6) as negative_score,
      coalesce(sum(event_count) filter (where event_type in ('post_view','feed_impression')), 0)::integer as views_30d,
      coalesce(sum(event_count) filter (where event_type = 'post_save'), 0)::integer as saves_30d,
      coalesce(sum(event_count) filter (where event_type = 'post_comment'), 0)::integer as comments_30d,
      coalesce(sum(event_count) filter (where event_type = 'post_share'), 0)::integer as shares_30d,
      coalesce(sum(event_count) filter (where event_type = 'follow'), 0)::integer as follows_30d,
      coalesce(sum(event_count) filter (where event_type in ('vault_unlock_paid','story_unlock_paid')), 0)::integer as unlocks_30d,
      coalesce(sum(event_count) filter (where event_type in ('auction_bid','auction_win')), 0)::integer as bids_30d,
      coalesce(sum(event_count) filter (where event_type = 'chat_reply'), 0)::integer as chat_replies_30d,
      coalesce(sum(event_count) filter (where event_type in ('subscription_start','subscription_cancel')), 0)::integer as subscription_events_30d,
      coalesce(sum(event_count) filter (where event_type in ('report_content','block_user','story_skip')), 0)::integer as negative_events_30d
    from event_window
    where creator_profile_id is not null
    group by 1, 2, 3
  )
  insert into public.od_fan_creator_affinity_daily (
    snapshot_date, fan_profile_id, creator_profile_id, intent_score, bond_score, payment_score,
    negative_score, final_affinity_score, views_30d, saves_30d, comments_30d, shares_30d,
    follows_30d, unlocks_30d, bids_30d, chat_replies_30d, subscription_events_30d,
    negative_events_30d, updated_at
  )
  select
    snapshot_date,
    fan_profile_id,
    creator_profile_id,
    intent_score,
    bond_score,
    payment_score,
    negative_score,
    greatest(0, intent_score * 0.34 + bond_score * 0.30 + payment_score * 0.24 - negative_score * 0.18)::numeric(14,6),
    views_30d, saves_30d, comments_30d, shares_30d, follows_30d, unlocks_30d, bids_30d,
    chat_replies_30d, subscription_events_30d, negative_events_30d, now()
  from aggregated
  on conflict (snapshot_date, fan_profile_id, creator_profile_id)
  do update set
    intent_score = excluded.intent_score,
    bond_score = excluded.bond_score,
    payment_score = excluded.payment_score,
    negative_score = excluded.negative_score,
    final_affinity_score = excluded.final_affinity_score,
    views_30d = excluded.views_30d,
    saves_30d = excluded.saves_30d,
    comments_30d = excluded.comments_30d,
    shares_30d = excluded.shares_30d,
    follows_30d = excluded.follows_30d,
    unlocks_30d = excluded.unlocks_30d,
    bids_30d = excluded.bids_30d,
    chat_replies_30d = excluded.chat_replies_30d,
    subscription_events_30d = excluded.subscription_events_30d,
    negative_events_30d = excluded.negative_events_30d,
    updated_at = now();
$$;
create or replace function public.od_refresh_fan_niche_affinity(p_as_of_date date default current_date)
returns void
language sql
as $$
  with niche_events as (
    select
      e.actor_profile_id as fan_profile_id,
      lower(tag) as niche,
      count(*)::integer as interactions_30d,
      sum(case when e.event_type in ('vault_unlock_paid','story_unlock_paid','subscription_start','auction_bid','auction_win','tip_sent') then 1 else 0 end)::integer as paid_events_30d,
      sum(public.od_event_weight(e.event_type))::numeric(14,6) as affinity_score
    from public.od_event_log e
    join public.posts p on p.id = e.post_id
    join lateral unnest(coalesce(p.hashtags, array[]::text[])) tag on true
    where e.actor_profile_id is not null
      and e.occurred_at >= (p_as_of_date - interval '30 days')
    group by 1, 2
  )
  insert into public.od_fan_niche_affinity_daily (
    snapshot_date, fan_profile_id, niche, affinity_score, interactions_30d, paid_events_30d, updated_at
  )
  select p_as_of_date, fan_profile_id, niche, greatest(0, affinity_score)::numeric(14,6), interactions_30d, paid_events_30d, now()
  from niche_events
  on conflict (snapshot_date, fan_profile_id, niche)
  do update set
    affinity_score = excluded.affinity_score,
    interactions_30d = excluded.interactions_30d,
    paid_events_30d = excluded.paid_events_30d,
    updated_at = now();
$$;

create or replace function public.od_refresh_creator_quality(p_as_of_date date default current_date)
returns void
language sql
as $$
  with post_window as (
    select
      x.creator_profile_id,
      count(*)::integer as active_posts_30d,
      coalesce(avg(x.gap_hours), 72)::numeric(14,6) as avg_gap_hours
    from (
      select
        p.user_id as creator_profile_id,
        extract(epoch from (p.created_at - lag(p.created_at) over (partition by p.user_id order by p.created_at))) / 3600 as gap_hours
      from public.posts p
      where p.created_at >= (p_as_of_date - interval '30 days')
    ) x
    group by x.creator_profile_id
  ),
  message_window as (
    select
      c.creator_profile_id,
      count(*) filter (where m.sender_id = c.creator_profile_id)::integer as reply_messages_30d,
      count(*)::integer as total_messages_30d
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.timestamp >= (p_as_of_date - interval '30 days')
    group by c.creator_profile_id
  ),
  event_window as (
    select
      coalesce(e.target_profile_id, p.user_id, m.user_id, c.creator_profile_id) as creator_profile_id,
      count(*) filter (where e.event_type = 'report_content')::integer as reports_30d,
      count(*) filter (where e.event_type = 'block_user')::integer as blocks_30d,
      count(*) filter (where e.event_type = 'subscription_start')::integer as subscriptions_started_30d,
      count(*) filter (where e.event_type = 'subscription_cancel')::integer as subscriptions_cancelled_30d
    from public.od_event_log e
    left join public.posts p on p.id = e.post_id
    left join public.momentos m on m.id = e.momento_id
    left join public.conversations c on c.id = e.conversation_id
    where e.occurred_at >= (p_as_of_date - interval '30 days')
    group by 1
  ),
  assembled as (
    select
      p_as_of_date as snapshot_date,
      pr.id as creator_profile_id,
      greatest(0, least(1.0, 1 - abs(coalesce(pw.avg_gap_hours, 72) - 72) / 168))::numeric(14,6) as posting_consistency_score,
      least(1.0, public.od_safe_ratio(coalesce(mw.reply_messages_30d, 0), greatest(coalesce(mw.total_messages_30d, 0), 1), 0) * 1.6)::numeric(14,6) as chat_reply_score,
      greatest(0, 1 - public.od_safe_ratio(coalesce(ew.subscriptions_cancelled_30d, 0), greatest(coalesce(ew.subscriptions_started_30d, 0), 1), 0))::numeric(14,6) as subscriber_health_score,
      least(1.0, case when pr.plan = 'free' then 0.45 when pr.plan = 'bronze' then 0.60 when pr.plan = 'gold' then 0.75 when pr.plan = 'diamond' then 0.90 else 0.50 end)::numeric(14,6) as monetization_balance_score,
      greatest(0, 1 - ((coalesce(ew.reports_30d, 0) * 0.12) + (coalesce(ew.blocks_30d, 0) * 0.10)))::numeric(14,6) as safety_score,
      coalesce(pw.active_posts_30d, 0)::integer as active_posts_30d,
      coalesce(mw.reply_messages_30d, 0)::integer as reply_messages_30d,
      coalesce(mw.total_messages_30d, 0)::integer as total_messages_30d,
      coalesce(ew.reports_30d, 0)::integer as reports_30d,
      coalesce(ew.blocks_30d, 0)::integer as blocks_30d,
      coalesce(ew.subscriptions_started_30d, 0)::integer as subscriptions_started_30d,
      coalesce(ew.subscriptions_cancelled_30d, 0)::integer as subscriptions_cancelled_30d
    from public.profiles pr
    left join post_window pw on pw.creator_profile_id = pr.id
    left join message_window mw on mw.creator_profile_id = pr.id
    left join event_window ew on ew.creator_profile_id = pr.id
    where pr.is_creator = true
  )
  insert into public.od_creator_quality_daily (
    snapshot_date, creator_profile_id, posting_consistency_score, chat_reply_score, subscriber_health_score,
    monetization_balance_score, safety_score, creator_quality_score, active_posts_30d,
    reply_messages_30d, total_messages_30d, reports_30d, blocks_30d,
    subscriptions_started_30d, subscriptions_cancelled_30d, updated_at
  )
  select
    snapshot_date,
    creator_profile_id,
    posting_consistency_score,
    chat_reply_score,
    subscriber_health_score,
    monetization_balance_score,
    safety_score,
    (posting_consistency_score * 0.22 + chat_reply_score * 0.22 + subscriber_health_score * 0.26 + monetization_balance_score * 0.12 + safety_score * 0.18)::numeric(14,6),
    active_posts_30d,
    reply_messages_30d,
    total_messages_30d,
    reports_30d,
    blocks_30d,
    subscriptions_started_30d,
    subscriptions_cancelled_30d,
    now()
  from assembled
  on conflict (snapshot_date, creator_profile_id)
  do update set
    posting_consistency_score = excluded.posting_consistency_score,
    chat_reply_score = excluded.chat_reply_score,
    subscriber_health_score = excluded.subscriber_health_score,
    monetization_balance_score = excluded.monetization_balance_score,
    safety_score = excluded.safety_score,
    creator_quality_score = excluded.creator_quality_score,
    active_posts_30d = excluded.active_posts_30d,
    reply_messages_30d = excluded.reply_messages_30d,
    total_messages_30d = excluded.total_messages_30d,
    reports_30d = excluded.reports_30d,
    blocks_30d = excluded.blocks_30d,
    subscriptions_started_30d = excluded.subscriptions_started_30d,
    subscriptions_cancelled_30d = excluded.subscriptions_cancelled_30d,
    updated_at = now();
$$;

create or replace function public.od_refresh_content_quality(p_as_of_date date default current_date)
returns void
language sql
as $$
  with post_metrics as (
    select
      'post'::public.od_entity_type as entity_type,
      p.id as entity_id,
      p.user_id as owner_profile_id,
      count(*) filter (where e.event_type in ('post_view','feed_impression'))::integer as views_7d,
      count(*) filter (where e.event_type = 'post_like')::integer as likes_7d,
      count(*) filter (where e.event_type = 'post_save')::integer as saves_7d,
      count(*) filter (where e.event_type = 'post_comment')::integer as comments_7d,
      count(*) filter (where e.event_type in ('vault_unlock_paid','story_unlock_paid'))::integer as unlocks_7d,
      count(*) filter (where e.event_type = 'report_content')::integer as reports_7d,
      greatest(0, 1 - extract(epoch from (now() - p.created_at)) / 86400 / 14)::numeric(14,6) as freshness_score,
      p.is_locked,
      p.price
    from public.posts p
    left join public.od_event_log e on e.post_id = p.id and e.occurred_at >= (p_as_of_date - interval '7 days')
    group by p.id, p.user_id, p.created_at, p.is_locked, p.price
  ),
  momento_metrics as (
    select
      'momento'::public.od_entity_type as entity_type,
      m.id as entity_id,
      m.user_id as owner_profile_id,
      count(*) filter (where e.event_type in ('story_open','feed_impression'))::integer as views_7d,
      0::integer as likes_7d,
      count(*) filter (where e.event_type = 'story_complete')::integer as saves_7d,
      0::integer as comments_7d,
      count(*) filter (where e.event_type in ('story_unlock_paid','vault_unlock_paid'))::integer as unlocks_7d,
      count(*) filter (where e.event_type = 'report_content')::integer as reports_7d,
      greatest(0, 1 - extract(epoch from (now() - m.created_at)) / 86400 / 3)::numeric(14,6) as freshness_score,
      m.is_locked,
      m.price
    from public.momentos m
    left join public.od_event_log e on e.momento_id = m.id and e.occurred_at >= (p_as_of_date - interval '7 days')
    group by m.id, m.user_id, m.created_at, m.is_locked, m.price
  ),
  unioned as (
    select * from post_metrics
    union all
    select * from momento_metrics
  )
  insert into public.od_content_quality_daily (
    snapshot_date, entity_type, entity_id, owner_profile_id, quality_score, conversion_score,
    risk_score, freshness_score, views_7d, likes_7d, saves_7d, comments_7d, unlocks_7d, reports_7d, updated_at
  )
  select
    p_as_of_date,
    entity_type,
    entity_id,
    owner_profile_id,
    least(1.5, ((public.od_safe_ratio(likes_7d, greatest(views_7d, 1), 0) * 0.20 + public.od_safe_ratio(saves_7d, greatest(views_7d, 1), 0) * 0.35 + public.od_safe_ratio(comments_7d, greatest(views_7d, 1), 0) * 0.25 + public.od_safe_ratio(unlocks_7d, greatest(views_7d, 1), 0) * 0.20) * 10))::numeric(14,6),
    least(1.5, ((public.od_safe_ratio(unlocks_7d, greatest(views_7d, 1), 0) * 0.70 + case when is_locked then 0.20 else 0.05 end + case when price is not null and price > 0 then 0.10 else 0 end) * 10))::numeric(14,6),
    least(1.5, reports_7d * 0.15)::numeric(14,6),
    freshness_score,
    views_7d,
    likes_7d,
    saves_7d,
    comments_7d,
    unlocks_7d,
    reports_7d,
    now()
  from unioned
  on conflict (snapshot_date, entity_type, entity_id)
  do update set
    owner_profile_id = excluded.owner_profile_id,
    quality_score = excluded.quality_score,
    conversion_score = excluded.conversion_score,
    risk_score = excluded.risk_score,
    freshness_score = excluded.freshness_score,
    views_7d = excluded.views_7d,
    likes_7d = excluded.likes_7d,
    saves_7d = excluded.saves_7d,
    comments_7d = excluded.comments_7d,
    unlocks_7d = excluded.unlocks_7d,
    reports_7d = excluded.reports_7d,
    updated_at = now();
$$;
create or replace function public.od_refresh_rank_scores_for_viewer(p_viewer_profile_id uuid, p_as_of_date date default current_date)
returns void
language sql
as $$
  delete from public.od_rank_scores where viewer_profile_id = p_viewer_profile_id;
  delete from public.od_post_score_factors where viewer_profile_id = p_viewer_profile_id;

  with affinity as (
    select * from public.od_fan_creator_affinity_daily where snapshot_date = p_as_of_date and fan_profile_id = p_viewer_profile_id
  ),
  creator_quality as (
    select * from public.od_creator_quality_daily where snapshot_date = p_as_of_date
  ),
  content_quality as (
    select * from public.od_content_quality_daily where snapshot_date = p_as_of_date
  ),
  follow_state as (
    select creator_profile_id from affinity where follows_30d > 0 or final_affinity_score > 0
  ),
  feed_posts as (
    select p_viewer_profile_id as viewer_profile_id, 'feed'::public.od_surface as surface, 'post'::public.od_entity_type as entity_type, p.id as entity_id, p.user_id as owner_profile_id,
      least(1.5, coalesce(a.payment_score, 0) * 0.10 + coalesce(cq.conversion_score, 0) * 0.45 + case when p.is_locked then 0.35 else 0.12 end)::numeric(14,6) as payment_intent_score,
      least(1.5, coalesce(a.bond_score, 0) * 0.18 + coalesce(a.final_affinity_score, 0) * 0.22)::numeric(14,6) as bond_score,
      coalesce(cq.freshness_score, 0.20)::numeric(14,6) as freshness_score,
      coalesce(cq2.creator_quality_score, 0.35)::numeric(14,6) as creator_quality_score,
      coalesce(cq.quality_score, 0.20)::numeric(14,6) as content_quality_score,
      case when exists (select 1 from follow_state f where f.creator_profile_id = p.user_id) then 0.10 else 0.32 end::numeric(14,6) as diversity_score,
      case when exists (select 1 from follow_state f where f.creator_profile_id = p.user_id) then 0.08 else 0.24 end::numeric(14,6) as discovery_score,
      coalesce(cq.risk_score, 0)::numeric(14,6) as risk_penalty,
      greatest(0, coalesce(a.views_30d, 0) - 8) * 0.03::numeric(14,6) as saturation_penalty
    from public.posts p
    left join affinity a on a.creator_profile_id = p.user_id
    left join creator_quality cq2 on cq2.creator_profile_id = p.user_id
    left join content_quality cq on cq.entity_type = 'post' and cq.entity_id = p.id
    where p.created_at >= (p_as_of_date - interval '30 days')
  ),
  explore_creators as (
    select p_viewer_profile_id as viewer_profile_id, 'explore'::public.od_surface as surface, 'creator'::public.od_entity_type as entity_type, pr.id as entity_id, pr.id as owner_profile_id,
      least(1.5, coalesce(a.payment_score, 0) * 0.08 + case when pr.is_premium then 0.24 else 0.12 end)::numeric(14,6) as payment_intent_score,
      least(1.5, coalesce(a.final_affinity_score, 0) * 0.20)::numeric(14,6) as bond_score,
      least(1.0, greatest(0, coalesce(cq.active_posts_30d, 0)) / 12.0)::numeric(14,6) as freshness_score,
      coalesce(cq.creator_quality_score, 0.35)::numeric(14,6) as creator_quality_score,
      least(1.0, greatest(0, coalesce(cq.active_posts_30d, 0)) / 10.0)::numeric(14,6) as content_quality_score,
      case when coalesce(a.final_affinity_score, 0) = 0 then 0.60 else 0.20 end::numeric(14,6) as diversity_score,
      case when coalesce(a.final_affinity_score, 0) = 0 then 0.70 else 0.15 end::numeric(14,6) as discovery_score,
      greatest(0, 1 - coalesce(cq.safety_score, 0.85))::numeric(14,6) as risk_penalty,
      greatest(0, coalesce(a.views_30d, 0) - 10) * 0.02::numeric(14,6) as saturation_penalty
    from public.profiles pr
    left join affinity a on a.creator_profile_id = pr.id
    left join creator_quality cq on cq.creator_profile_id = pr.id
    where pr.is_creator = true and pr.id <> p_viewer_profile_id
  ),
  vault_content as (
    select p_viewer_profile_id as viewer_profile_id, 'vault'::public.od_surface as surface, 'post'::public.od_entity_type as entity_type, p.id as entity_id, p.user_id as owner_profile_id,
      least(2.0, coalesce(a.payment_score, 0) * 0.16 + coalesce(cq.conversion_score, 0) * 0.58 + 0.34)::numeric(14,6) as payment_intent_score,
      least(1.5, coalesce(a.bond_score, 0) * 0.20 + coalesce(a.final_affinity_score, 0) * 0.18)::numeric(14,6) as bond_score,
      coalesce(cq.freshness_score, 0.18)::numeric(14,6) as freshness_score,
      coalesce(cq2.creator_quality_score, 0.35)::numeric(14,6) as creator_quality_score,
      coalesce(cq.quality_score, 0.25)::numeric(14,6) as content_quality_score,
      0.12::numeric(14,6) as diversity_score,
      0.18::numeric(14,6) as discovery_score,
      coalesce(cq.risk_score, 0)::numeric(14,6) as risk_penalty,
      greatest(0, coalesce(a.unlocks_30d, 0) - 4) * 0.04::numeric(14,6) as saturation_penalty
    from public.posts p
    left join affinity a on a.creator_profile_id = p.user_id
    left join creator_quality cq2 on cq2.creator_profile_id = p.user_id
    left join content_quality cq on cq.entity_type = 'post' and cq.entity_id = p.id
    where p.is_locked = true
  ),
  vault_momentos as (
    select p_viewer_profile_id as viewer_profile_id, 'vault'::public.od_surface as surface, 'momento'::public.od_entity_type as entity_type, m.id as entity_id, m.user_id as owner_profile_id,
      least(2.0, coalesce(a.payment_score, 0) * 0.14 + coalesce(cq.conversion_score, 0) * 0.56 + 0.30)::numeric(14,6) as payment_intent_score,
      least(1.5, coalesce(a.bond_score, 0) * 0.16 + coalesce(a.final_affinity_score, 0) * 0.16)::numeric(14,6) as bond_score,
      coalesce(cq.freshness_score, 0.35)::numeric(14,6) as freshness_score,
      coalesce(cq2.creator_quality_score, 0.35)::numeric(14,6) as creator_quality_score,
      coalesce(cq.quality_score, 0.20)::numeric(14,6) as content_quality_score,
      0.10::numeric(14,6) as diversity_score,
      0.14::numeric(14,6) as discovery_score,
      coalesce(cq.risk_score, 0)::numeric(14,6) as risk_penalty,
      greatest(0, coalesce(a.unlocks_30d, 0) - 3) * 0.05::numeric(14,6) as saturation_penalty
    from public.momentos m
    left join affinity a on a.creator_profile_id = m.user_id
    left join creator_quality cq2 on cq2.creator_profile_id = m.user_id
    left join content_quality cq on cq.entity_type = 'momento' and cq.entity_id = m.id
    where m.is_locked = true and m.expires_at > now()
  ),
  auction_candidates as (
    select p_viewer_profile_id as viewer_profile_id, 'auction'::public.od_surface as surface, 'conversation'::public.od_entity_type as entity_type, c.id as entity_id, c.creator_profile_id as owner_profile_id,
      least(2.0, coalesce(a.payment_score, 0) * 0.20 + 0.40)::numeric(14,6) as payment_intent_score,
      least(1.5, coalesce(a.bond_score, 0) * 0.22 + coalesce(a.chat_replies_30d, 0) * 0.04)::numeric(14,6) as bond_score,
      0.85::numeric(14,6) as freshness_score,
      coalesce(cq.creator_quality_score, 0.35)::numeric(14,6) as creator_quality_score,
      least(1.2, greatest(0, coalesce(c.current_bid, 0)) / 100.0)::numeric(14,6) as content_quality_score,
      0.10::numeric(14,6) as diversity_score,
      0.18::numeric(14,6) as discovery_score,
      greatest(0, 1 - coalesce(cq.safety_score, 0.85))::numeric(14,6) as risk_penalty,
      greatest(0, coalesce(a.bids_30d, 0) - 3) * 0.05::numeric(14,6) as saturation_penalty
    from public.conversations c
    left join affinity a on a.creator_profile_id = c.creator_profile_id
    left join creator_quality cq on cq.creator_profile_id = c.creator_profile_id
    where c.auction_active = true
  ),
  chat_candidates as (
    select p_viewer_profile_id as viewer_profile_id, 'chat_vip'::public.od_surface as surface, 'conversation'::public.od_entity_type as entity_type, c.id as entity_id, c.creator_profile_id as owner_profile_id,
      least(1.5, coalesce(a.payment_score, 0) * 0.14 + 0.18)::numeric(14,6) as payment_intent_score,
      least(1.8, coalesce(a.bond_score, 0) * 0.24 + coalesce(a.chat_replies_30d, 0) * 0.06 + greatest(c.intimacy_score, 0) / 100.0)::numeric(14,6) as bond_score,
      least(1.0, greatest(0, 1 - extract(epoch from (now() - coalesce(c.last_message_time, c.created_at))) / 86400 / 14))::numeric(14,6) as freshness_score,
      coalesce(cq.creator_quality_score, 0.35)::numeric(14,6) as creator_quality_score,
      least(1.0, greatest(c.intimacy_score, 0) / 100.0)::numeric(14,6) as content_quality_score,
      0.08::numeric(14,6) as diversity_score,
      0.10::numeric(14,6) as discovery_score,
      greatest(0, 1 - coalesce(cq.safety_score, 0.85))::numeric(14,6) as risk_penalty,
      greatest(0, coalesce(a.chat_replies_30d, 0) - 8) * 0.03::numeric(14,6) as saturation_penalty
    from public.conversations c
    left join affinity a on a.creator_profile_id = c.creator_profile_id
    left join creator_quality cq on cq.creator_profile_id = c.creator_profile_id
    where c.user_a = p_viewer_profile_id or c.user_b = p_viewer_profile_id
  ),
  unioned as (
    select * from feed_posts
    union all select * from explore_creators
    union all select * from vault_content
    union all select * from vault_momentos
    union all select * from auction_candidates
    union all select * from chat_candidates
  )
  insert into public.od_rank_scores (
    viewer_profile_id, surface, entity_type, entity_id, owner_profile_id,
    payment_intent_score, bond_score, freshness_score, creator_quality_score,
    content_quality_score, diversity_score, discovery_score, risk_penalty,
    saturation_penalty, final_score, explanation, snapshot_at
  )
  select
    viewer_profile_id, surface, entity_type, entity_id, owner_profile_id,
    payment_intent_score, bond_score, freshness_score, creator_quality_score,
    content_quality_score, diversity_score, discovery_score, risk_penalty,
    saturation_penalty,
    greatest(0, payment_intent_score * 0.30 + bond_score * 0.22 + freshness_score * 0.14 + creator_quality_score * 0.14 + content_quality_score * 0.10 + diversity_score * 0.05 + discovery_score * 0.05 - risk_penalty * 0.18 - saturation_penalty * 0.12)::numeric(14,6) as final_score,
    jsonb_build_object(
      'surface', surface,
      'entity_type', entity_type,
      'payment_intent_score', payment_intent_score,
      'bond_score', bond_score,
      'freshness_score', freshness_score,
      'creator_quality_score', creator_quality_score,
      'content_quality_score', content_quality_score,
      'diversity_score', diversity_score,
      'discovery_score', discovery_score,
      'risk_penalty', risk_penalty,
      'saturation_penalty', saturation_penalty
    ),
    now()
  from unioned;

  insert into public.od_post_score_factors (
    snapshot_at,
    viewer_profile_id,
    post_id,
    factor_key,
    factor_value,
    factor_direction,
    explanation
  )
  select
    factors.snapshot_at,
    factors.viewer_profile_id,
    factors.post_id,
    factors.factor_key,
    factors.factor_value,
    factors.factor_direction,
    factors.explanation
  from (
    select
      r.snapshot_at,
      r.viewer_profile_id,
      r.entity_id as post_id,
      'payment_intent'::text as factor_key,
      r.payment_intent_score as factor_value,
      'positive'::text as factor_direction,
      case
        when r.surface = 'vault' then 'O conteudo mostrou forte intencao de unlock e compra.'
        else 'O post gerou sinais de interesse premium e aprofundamento.'
      end as explanation
    from public.od_rank_scores r
    where r.viewer_profile_id = p_viewer_profile_id
      and r.entity_type = 'post'
      and r.payment_intent_score > 0

    union all

    select
      r.snapshot_at,
      r.viewer_profile_id,
      r.entity_id as post_id,
      'bond'::text as factor_key,
      r.bond_score as factor_value,
      'positive'::text as factor_direction,
      'Existe afinidade ativa entre o fa e o criador deste post.' as explanation
    from public.od_rank_scores r
    where r.viewer_profile_id = p_viewer_profile_id
      and r.entity_type = 'post'
      and r.bond_score > 0

    union all

    select
      r.snapshot_at,
      r.viewer_profile_id,
      r.entity_id as post_id,
      'freshness'::text as factor_key,
      r.freshness_score as factor_value,
      'positive'::text as factor_direction,
      'A recencia do conteudo ajudou a puxar distribuicao.' as explanation
    from public.od_rank_scores r
    where r.viewer_profile_id = p_viewer_profile_id
      and r.entity_type = 'post'
      and r.freshness_score > 0.20

    union all

    select
      r.snapshot_at,
      r.viewer_profile_id,
      r.entity_id as post_id,
      'creator_quality'::text as factor_key,
      r.creator_quality_score as factor_value,
      'positive'::text as factor_direction,
      'A qualidade historica do criador reforcou a distribuicao deste post.' as explanation
    from public.od_rank_scores r
    where r.viewer_profile_id = p_viewer_profile_id
      and r.entity_type = 'post'
      and r.creator_quality_score > 0.30

    union all

    select
      r.snapshot_at,
      r.viewer_profile_id,
      r.entity_id as post_id,
      'content_quality'::text as factor_key,
      r.content_quality_score as factor_value,
      'positive'::text as factor_direction,
      'O proprio conteudo mostrou qualidade e chance de resposta acima da base.' as explanation
    from public.od_rank_scores r
    where r.viewer_profile_id = p_viewer_profile_id
      and r.entity_type = 'post'
      and r.content_quality_score > 0.20

    union all

    select
      r.snapshot_at,
      r.viewer_profile_id,
      r.entity_id as post_id,
      'discovery'::text as factor_key,
      r.discovery_score as factor_value,
      'positive'::text as factor_direction,
      'O OD Core abriu espaco de descoberta para este post atingir mais gente elegivel.' as explanation
    from public.od_rank_scores r
    where r.viewer_profile_id = p_viewer_profile_id
      and r.entity_type = 'post'
      and r.discovery_score > 0.12

    union all

    select
      r.snapshot_at,
      r.viewer_profile_id,
      r.entity_id as post_id,
      'risk_penalty'::text as factor_key,
      r.risk_penalty as factor_value,
      'negative'::text as factor_direction,
      'Sinais de risco ou seguranca reduziram a distribuicao potencial do post.' as explanation
    from public.od_rank_scores r
    where r.viewer_profile_id = p_viewer_profile_id
      and r.entity_type = 'post'
      and r.risk_penalty > 0

    union all

    select
      r.snapshot_at,
      r.viewer_profile_id,
      r.entity_id as post_id,
      'saturation_penalty'::text as factor_key,
      r.saturation_penalty as factor_value,
      'negative'::text as factor_direction,
      'A audiencia ja recebeu exposicao demais deste criador ou oferta em janela curta.' as explanation
    from public.od_rank_scores r
    where r.viewer_profile_id = p_viewer_profile_id
      and r.entity_type = 'post'
      and r.saturation_penalty > 0
  ) as factors;
$$;
create or replace function public.od_refresh_reach_explanations(p_as_of_date date default current_date)
returns void
language sql
as $$
  with creator_post_stats as (
    select
      p.user_id as creator_profile_id,
      p.id as post_id,
      count(*) filter (where e.event_type in ('feed_impression','post_view'))::integer as impressions,
      public.od_safe_ratio(count(*) filter (where e.event_type in ('vault_unlock_paid','story_unlock_paid','post_save','post_comment')), greatest(count(*) filter (where e.event_type in ('feed_impression','post_view')), 1), 0)::numeric(14,6) as performance_ratio,
      count(*) filter (where e.event_type = 'report_content')::integer as reports
    from public.posts p
    left join public.od_event_log e on e.post_id = p.id and e.occurred_at >= (p_as_of_date - interval '7 days')
    group by p.user_id, p.id
  ),
  creator_baseline as (
    select creator_profile_id, avg(impressions)::numeric(14,6) as avg_impressions
    from creator_post_stats
    group by creator_profile_id
  )
  insert into public.od_reach_explanations (
    snapshot_date, creator_profile_id, post_id, impressions, relative_reach_delta,
    primary_positive_reason, primary_negative_reason, explanation, updated_at
  )
  select
    p_as_of_date,
    cps.creator_profile_id,
    cps.post_id,
    cps.impressions,
    (cps.impressions - coalesce(cb.avg_impressions, 0))::numeric(14,6),
    case
      when cps.performance_ratio >= 0.20 then 'Alta taxa de aprofundamento do publico premium.'
      when cps.impressions > coalesce(cb.avg_impressions, 0) then 'Post acima da media recente do criador.'
      else 'Distribuicao normal dentro do seu publico atual.'
    end,
    case
      when cps.reports > 0 then 'Sinais negativos de seguranca reduziram a distribuicao.'
      when cps.impressions < coalesce(cb.avg_impressions, 0) then 'Alcance abaixo da media recente do criador.'
      else null
    end,
    jsonb_build_object('performance_ratio', cps.performance_ratio, 'avg_impressions', coalesce(cb.avg_impressions, 0), 'reports', cps.reports),
    now()
  from creator_post_stats cps
  left join creator_baseline cb on cb.creator_profile_id = cps.creator_profile_id
  on conflict (snapshot_date, creator_profile_id, post_id)
  do update set
    impressions = excluded.impressions,
    relative_reach_delta = excluded.relative_reach_delta,
    primary_positive_reason = excluded.primary_positive_reason,
    primary_negative_reason = excluded.primary_negative_reason,
    explanation = excluded.explanation,
    updated_at = now();
$$;

alter table public.od_event_log enable row level security;
alter table public.od_fan_creator_affinity_daily enable row level security;
alter table public.od_fan_niche_affinity_daily enable row level security;
alter table public.od_creator_quality_daily enable row level security;
alter table public.od_content_quality_daily enable row level security;
alter table public.od_rank_scores enable row level security;
alter table public.od_post_score_factors enable row level security;
alter table public.od_reach_explanations enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'od_event_log' and policyname = 'od_event_log readable by own actor') then
    create policy "od_event_log readable by own actor" on public.od_event_log for select to authenticated using (actor_profile_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'od_event_log' and policyname = 'od_event_log insert by authenticated actor') then
    create policy "od_event_log insert by authenticated actor" on public.od_event_log for insert to authenticated with check (actor_profile_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'od_rank_scores' and policyname = 'od_rank_scores readable by owner') then
    create policy "od_rank_scores readable by owner" on public.od_rank_scores for select to authenticated using (viewer_profile_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'od_fan_creator_affinity_daily' and policyname = 'od_fan_creator_affinity readable by owner') then
    create policy "od_fan_creator_affinity readable by owner" on public.od_fan_creator_affinity_daily for select to authenticated using (fan_profile_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'od_fan_niche_affinity_daily' and policyname = 'od_fan_niche_affinity readable by owner') then
    create policy "od_fan_niche_affinity readable by owner" on public.od_fan_niche_affinity_daily for select to authenticated using (fan_profile_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'od_post_score_factors' and policyname = 'od_post_score_factors readable by owner') then
    create policy "od_post_score_factors readable by owner" on public.od_post_score_factors for select to authenticated using (viewer_profile_id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'od_reach_explanations' and policyname = 'od_reach_explanations readable by creator') then
    create policy "od_reach_explanations readable by creator" on public.od_reach_explanations for select to authenticated using (creator_profile_id = auth.uid());
  end if;
end $$;

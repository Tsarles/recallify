create table if not exists public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  subject text not null default '' check (char_length(subject) <= 80),
  cards jsonb not null default '[]'::jsonb check (jsonb_typeof(cards) = 'array'),
  timer_seconds integer not null default 20 check (timer_seconds between 5 and 300),
  history jsonb not null default '[]'::jsonb check (jsonb_typeof(history) = 'array'),
  archived_at timestamptz,
  is_public boolean not null default false,
  notes text not null default '' check (char_length(notes) <= 1000),
  show_answer_labels boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.decks add column if not exists notes text not null default '';
alter table public.decks add column if not exists show_answer_labels boolean not null default false;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 50),
  bio text not null default '' check (char_length(bio) <= 240),
  avatar_key text not null default 'pencil' check (avatar_key in ('pencil', 'book', 'flask', 'planet', 'leaf', 'music', 'code', 'star')),
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_interests_limit check (cardinality(interests) <= 8)
);

create table if not exists public.site_stats (
  key text primary key check (key in ('visitors', 'hearts')),
  count bigint not null default 0 check (count >= 0),
  updated_at timestamptz not null default now()
);

insert into public.site_stats (key, count)
values ('visitors', 0), ('hearts', 0)
on conflict (key) do nothing;

alter table public.decks enable row level security;
alter table public.profiles enable row level security;
alter table public.site_stats enable row level security;

create index if not exists decks_user_id_idx on public.decks (user_id);
create index if not exists decks_public_id_idx on public.decks (id) where is_public;
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));

create policy "owners read decks" on public.decks for select
to authenticated using ((select auth.uid()) = user_id);

create policy "anyone reads shared decks" on public.decks for select
to anon, authenticated using (is_public = true);

create policy "owners create decks" on public.decks for insert
to authenticated with check ((select auth.uid()) = user_id);

create policy "owners update decks" on public.decks for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "owners delete decks" on public.decks for delete
to authenticated using ((select auth.uid()) = user_id);

create policy "profiles are public" on public.profiles for select
to anon, authenticated using (true);

create policy "owners create profiles" on public.profiles for insert
to authenticated with check ((select auth.uid()) = id);

create policy "owners update profiles" on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "owners delete profiles" on public.profiles for delete
to authenticated using ((select auth.uid()) = id);

create policy "site stats are public" on public.site_stats for select
to anon, authenticated using (true);

create or replace function public.increment_site_stat(stat_name text)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_count bigint;
begin
  if stat_name not in ('visitors', 'hearts') then
    raise exception 'Unsupported site statistic';
  end if;

  update public.site_stats
  set count = count + 1,
      updated_at = now()
  where key = stat_name
  returning count into next_count;

  return next_count;
end;
$$;

revoke all on function public.increment_site_stat(text) from public;
grant execute on function public.increment_site_stat(text) to anon, authenticated;

grant select on public.decks to anon;
grant select, insert, update, delete on public.decks to authenticated;
grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant select on public.site_stats to anon, authenticated;

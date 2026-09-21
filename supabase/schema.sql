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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.decks enable row level security;

create index if not exists decks_user_id_idx on public.decks (user_id);
create index if not exists decks_public_id_idx on public.decks (id) where is_public;

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

grant select on public.decks to anon;
grant select, insert, update, delete on public.decks to authenticated;

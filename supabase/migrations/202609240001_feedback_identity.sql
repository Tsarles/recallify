alter table public.decks
  add column if not exists source_owner_username text,
  add column if not exists source_owner_display_name text,
  add column if not exists source_owner_avatar_key text;

alter table public.profiles
  add column if not exists username_confirmed boolean not null default false;

-- Preserve explicitly chosen usernames; generated legacy handles must be confirmed.
update public.profiles
set username_confirmed = (username not like 'learner\_%' escape '\')
where username_confirmed = false;

alter table public.decks
  add constraint decks_source_username_length
  check (source_owner_username is null or char_length(source_owner_username) between 3 and 24) not valid;

alter table public.decks
  add constraint decks_source_display_name_length
  check (source_owner_display_name is null or char_length(source_owner_display_name) <= 50) not valid;

-- Bilik Keluaran — Supabase schema
-- Run this in the Supabase SQL Editor after creating your project.

create extension if not exists "uuid-ossp";

-- Enums
create type public.user_role as enum ('fan', 'producer', 'artist');
create type public.post_type as enum (
  'new_release',
  'discussion',
  'gig_event',
  'collab_feedback',
  'discovery'
);
create type public.report_target_type as enum ('post', 'comment', 'user');
create type public.report_status as enum ('pending', 'reviewed', 'dismissed', 'actioned');
create type public.moderation_status as enum ('active', 'suspended', 'banned');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  role public.user_role not null default 'fan',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

-- User moderation
create table public.user_moderation (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  status public.moderation_status not null default 'active',
  reason text,
  banned_by uuid references public.profiles (id),
  banned_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Posts
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_type public.post_type not null,
  body text not null,
  track_url text,
  track_metadata jsonb,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint new_release_requires_track check (
    post_type != 'new_release' or track_url is not null
  ),
  constraint body_not_empty check (char_length(trim(body)) > 0)
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_user_id_idx on public.posts (user_id);

-- Comments
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  constraint comment_body_not_empty check (char_length(trim(body)) > 0)
);

create index comments_post_id_idx on public.comments (post_id, created_at asc);

-- Mentions
create table public.mentions (
  id uuid primary key default uuid_generate_v4(),
  mentioned_user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint mention_target check (
    (post_id is not null and comment_id is null)
    or (post_id is null and comment_id is not null)
  )
);

create index mentions_user_idx on public.mentions (mentioned_user_id);

-- Reports
create table public.reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason text not null,
  status public.report_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  constraint report_reason_not_empty check (char_length(trim(reason)) > 0)
);

create index reports_status_idx on public.reports (status, created_at desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_username text;
  final_username text;
begin
  raw_username := lower(coalesce(new.raw_user_meta_data->>'username', ''));
  if raw_username = '' or raw_username !~ '^[a-z0-9_]{3,20}$' then
    final_username := 'user_' || substr(replace(new.id::text, '-', ''), 1, 8);
  else
    final_username := raw_username;
  end if;

  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    final_username,
    coalesce(nullif(trim(new.raw_user_meta_data->>'display_name'), ''), final_username),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'fan')
  );

  insert into public.user_moderation (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helpers
create or replace function public.is_user_active(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select status = 'active' from public.user_moderation where user_id = uid),
    false
  );
$$;

create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select is_admin from public.profiles where id = uid),
    false
  );
$$;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.mentions enable row level security;
alter table public.reports enable row level security;
alter table public.user_moderation enable row level security;

-- Profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id and public.is_user_active(auth.uid()));

-- Posts
create policy "Posts are viewable by everyone"
  on public.posts for select using (true);

create policy "Active users can create posts"
  on public.posts for insert
  with check (auth.uid() = user_id and public.is_user_active(auth.uid()));

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = user_id and public.is_user_active(auth.uid()));

create policy "Users and admins can delete posts"
  on public.posts for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Comments
create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Active users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id and public.is_user_active(auth.uid()));

create policy "Users and admins can delete comments"
  on public.comments for delete
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

-- Mentions
create policy "Mentions are viewable by everyone"
  on public.mentions for select using (true);

create policy "Active users can create mentions"
  on public.mentions for insert
  with check (public.is_user_active(auth.uid()));

-- Reports
create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id and public.is_user_active(auth.uid()));

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Admins can view all reports"
  on public.reports for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update reports"
  on public.reports for update
  using (public.is_admin(auth.uid()));

-- Moderation
create policy "Users can view own moderation status"
  on public.user_moderation for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Admins can manage moderation"
  on public.user_moderation for all
  using (public.is_admin(auth.uid()));

-- Storage buckets
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Post images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Users can upload post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Promote your first admin (replace username after signup):
-- update public.profiles set is_admin = true where username = 'your_username';

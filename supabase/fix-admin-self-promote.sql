-- Hotfix: prevent users from elevating themselves to admin
-- Run this in the Supabase SQL Editor on existing projects.

drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id and public.is_user_active(auth.uid()))
  with check (
    auth.uid() = id
    and public.is_user_active(auth.uid())
    and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid())
  );

-- Roles live in their own table (never on profiles) to avoid privilege escalation.
do $$ begin
  create type public.app_role as enum ('student', 'admin');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'student',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "read own roles" on public.user_roles;
create policy "read own roles" on public.user_roles
  for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

drop policy if exists "admins manage roles" on public.user_roles;
create policy "admins manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Admin write access to shared reference tables; students keep read-only.
grant insert, update, delete on public.subjects to authenticated;
grant insert, update, delete on public.topic_library to authenticated;
grant insert, update, delete on public.past_papers to authenticated;
grant insert, update, delete on public.revision_sites to authenticated;
grant all on public.subjects to service_role;
grant all on public.topic_library to service_role;
grant all on public.past_papers to service_role;
grant all on public.revision_sites to service_role;

drop policy if exists "admins write subjects" on public.subjects;
create policy "admins write subjects" on public.subjects
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins read all subjects" on public.subjects;
create policy "admins read all subjects" on public.subjects
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins write topic library" on public.topic_library;
create policy "admins write topic library" on public.topic_library
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins write past papers" on public.past_papers;
create policy "admins write past papers" on public.past_papers
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins write revision sites" on public.revision_sites;
create policy "admins write revision sites" on public.revision_sites
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
-- Run this ONCE in Supabase > SQL Editor
create table if not exists public.site_settings (
  id integer primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated can insert site settings" on public.site_settings;
create policy "Authenticated can insert site settings"
on public.site_settings for insert
to authenticated
with check (true);

drop policy if exists "Authenticated can update site settings" on public.site_settings;
create policy "Authenticated can update site settings"
on public.site_settings for update
to authenticated
using (true)
with check (true);

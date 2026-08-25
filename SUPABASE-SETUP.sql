-- PORTFOLIO CMS — run once in Supabase SQL Editor

create table if not exists public.site_settings (
  id integer primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  order_index integer not null default 99,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.projects enable row level security;

drop policy if exists "public read site" on public.site_settings;
create policy "public read site" on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "admin write site" on public.site_settings;
create policy "admin write site" on public.site_settings for all to authenticated using (true) with check (true);

drop policy if exists "public read projects" on public.projects;
create policy "public read projects" on public.projects for select to anon, authenticated using (published = true or auth.role() = 'authenticated');

drop policy if exists "admin write projects" on public.projects;
create policy "admin write projects" on public.projects for all to authenticated using (true) with check (true);

insert into storage.buckets (id,name,public)
values ('portfolio','portfolio',true)
on conflict (id) do update set public = true;

drop policy if exists "public read portfolio images" on storage.objects;
create policy "public read portfolio images" on storage.objects for select to public using (bucket_id = 'portfolio');

drop policy if exists "admin upload portfolio images" on storage.objects;
create policy "admin upload portfolio images" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio');

drop policy if exists "admin update portfolio images" on storage.objects;
create policy "admin update portfolio images" on storage.objects for update to authenticated using (bucket_id = 'portfolio') with check (bucket_id = 'portfolio');

drop policy if exists "admin delete portfolio images" on storage.objects;
create policy "admin delete portfolio images" on storage.objects for delete to authenticated using (bucket_id = 'portfolio');

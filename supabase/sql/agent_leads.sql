-- Run this in Supabase → SQL Editor
create table if not exists public.agent_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  created_at timestamptz not null default now()
);

create index if not exists agent_leads_created_at_idx on public.agent_leads (created_at desc);

alter table public.agent_leads enable row level security;

-- Agents can register from the public app (anon key)
create policy "agent_leads_insert_anon"
  on public.agent_leads
  for insert
  to anon, authenticated
  with check (true);

-- No SELECT for anon/authenticated on rows: admin list uses service role API only.

-- Safe total count for the operator dashboard (does not expose rows)
create or replace function public.agent_leads_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint from public.agent_leads;
$$;

revoke all on function public.agent_leads_count() from public;
grant execute on function public.agent_leads_count() to anon, authenticated;

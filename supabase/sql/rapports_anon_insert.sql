-- À exécuter dans Supabase → SQL Editor si l’insert des alertes échoue (RLS).
-- Le front utilise la clé anon pour insérer dans `rapports`.

alter table public.rapports enable row level security;

drop policy if exists "rapports_insert_anon" on public.rapports;

create policy "rapports_insert_anon"
  on public.rapports
  for insert
  to anon, authenticated
  with check (true);

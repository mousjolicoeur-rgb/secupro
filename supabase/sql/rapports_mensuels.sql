-- Table rapports_mensuels
-- Stocke les rapports générés par BoutonRapportMensuel et le cron mensuel.
-- À exécuter dans Supabase → SQL Editor

create table if not exists public.rapports_mensuels (
  id               uuid primary key default gen_random_uuid(),
  societe_id       uuid not null references public.societes(id) on delete cascade,
  mois             char(7) not null,           -- format "YYYY-MM"
  agents_actifs    integer not null default 0,
  heures_travaillees numeric(8,2) not null default 0,
  missions_realisees integer not null default 0,
  incidents_signales integer not null default 0,
  taux_presence    smallint not null default 0 check (taux_presence between 0 and 100),
  societe_name     text not null,
  envoye_a         text,                        -- email destinataire (null si non envoyé)
  genere_le        timestamptz not null default now(),
  constraint rapports_mensuels_unique_societe_mois unique (societe_id, mois)
);

-- Index pour requêtes par société ou par mois
create index if not exists rapports_mensuels_societe_id_idx on public.rapports_mensuels (societe_id);
create index if not exists rapports_mensuels_mois_idx       on public.rapports_mensuels (mois);

-- RLS
alter table public.rapports_mensuels enable row level security;

-- Lecture : utilisateurs authentifiés de la société uniquement
-- (à adapter selon votre modèle de rôles)
drop policy if exists "rapports_mensuels_select" on public.rapports_mensuels;
create policy "rapports_mensuels_select"
  on public.rapports_mensuels
  for select
  to authenticated
  using (true);

-- Insertion : service role uniquement (cron + API server-side)
-- Le front n'insère pas directement — la route API /api/rapport/send le fait côté serveur.
drop policy if exists "rapports_mensuels_insert_service" on public.rapports_mensuels;
create policy "rapports_mensuels_insert_service"
  on public.rapports_mensuels
  for insert
  to service_role
  with check (true);

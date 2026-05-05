-- Ajoute la colonne is_approved à la table profiles
-- À exécuter dans Supabase → SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- Les comptes existants restent à false (en attente de validation manuelle)
-- Pour approuver un utilisateur manuellement :
-- UPDATE public.profiles SET is_approved = true WHERE email = 'agent@example.com';
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
drop function if exists public.agent_leads_count();

create or replace function public.get_agent_leads_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint from public.agent_leads;
$$;

revoke all on function public.get_agent_leads_count() from public;
grant execute on function public.get_agent_leads_count() to anon, authenticated;
-- Créer la table agents avec org_id
CREATE TABLE IF NOT EXISTS agents (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id          UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email           VARCHAR(255) UNIQUE NOT NULL,
  nom             VARCHAR(255) NOT NULL,
  prenom          VARCHAR(255) NOT NULL,
  telephone       VARCHAR(20),
  adresse         TEXT,
  statut          VARCHAR(50)  DEFAULT 'actif',
  date_embauche   DATE,
  specialite      VARCHAR(255),
  salaire_brut    DECIMAL(10, 2),
  password_hash   VARCHAR(255),
  import_batch_id UUID,
  created_at      TIMESTAMP    DEFAULT NOW(),
  updated_at      TIMESTAMP    DEFAULT NOW()
);

-- Table d'audit pour les imports
CREATE TABLE IF NOT EXISTS import_audits (
  id                  UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id              UUID         NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  filename            VARCHAR(255),
  total_rows          INT,
  successful_imports  INT,
  failed_imports      INT,
  duplicates_found    INT,
  errors              JSONB,
  graph_data          JSONB,
  created_at          TIMESTAMP    DEFAULT NOW()
);

-- Index pour les requêtes rapides
CREATE INDEX idx_agents_org_id       ON agents(org_id);
CREATE INDEX idx_agents_email        ON agents(email);
CREATE INDEX idx_import_audits_org_id ON import_audits(org_id);
-- ============================================================
-- TRIGGER : création automatique du profil à l'inscription
-- À exécuter dans Supabase → SQL Editor
-- ============================================================

-- Fonction appelée à chaque nouvel utilisateur dans auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    false  -- en attente de validation admin
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Attache le trigger sur l'insertion dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- VÉRIFICATION : colonnes minimales attendues dans public.profiles
-- Assure-toi que ces colonnes existent avant d'exécuter :
--   id         uuid  PRIMARY KEY REFERENCES auth.users(id)
--   email      text
--   is_approved boolean NOT NULL DEFAULT false
-- ============================================================
-- À exécuter dans Supabase → SQL Editor si l’insert des alertes échoue (RLS).
-- Le front utilise la clé anon pour insérer dans `rapports`.

alter table public.rapports enable row level security;

drop policy if exists "rapports_insert_anon" on public.rapports;

create policy "rapports_insert_anon"
  on public.rapports
  for insert
  to anon, authenticated
  with check (true);
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
-- Si PostgREST renvoie encore PGRST204 après avoir ajouté une colonne :
-- dans Supabase SQL Editor, exécuter une fois :
-- notify pgrst, 'reload schema';
-- (ou via Dashboard : Settings → API → recharger / attendre la propagation)
-- ============================================================
-- RLS SECURITY POLICIES
-- Run in Supabase → SQL Editor
-- ============================================================

-- 1. PROFILES — utilisateur voit uniquement son propre profil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.profiles;
CREATE POLICY "Users can see their own profile"
ON public.profiles FOR ALL
USING (auth.uid() = id);

-- 2. PAYSLIPS — utilisateur voit uniquement ses fiches de paie
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own payslips" ON public.payslips;
CREATE POLICY "Users can see their own payslips"
ON public.payslips FOR ALL
USING (auth.uid() = user_id);

-- 3. RAPPORTS — utilisateur voit uniquement ses rapports
ALTER TABLE public.rapports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own rapports" ON public.rapports;
CREATE POLICY "Users can see their own rapports"
ON public.rapports FOR ALL
USING (auth.uid() = user_id);

-- 4. AGENT_LEADS — pas de colonne user_id, politique spécifique
ALTER TABLE public.agent_leads ENABLE ROW LEVEL SECURITY;

-- Autoriser l'insertion anonyme (formulaire public)
DROP POLICY IF EXISTS "agent_leads_insert_anon" ON public.agent_leads;
CREATE POLICY "agent_leads_insert_anon"
ON public.agent_leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Bloquer la lecture pour tout le monde (seul service_role peut lire)
DROP POLICY IF EXISTS "agent_leads_no_select" ON public.agent_leads;
CREATE POLICY "agent_leads_no_select"
ON public.agent_leads FOR SELECT
USING (false);

-- 5. Fix Search Path Mutable (sécurité des fonctions)
ALTER FUNCTION public.get_agent_leads_count() SET search_path = public;
ALTER FUNCTION public.profiles_touch_updated_at() SET search_path = public;
-- Supprimer les données précédentes si elles existent
DELETE FROM contrats;
DELETE FROM performances;

-- Générer 45 contrats pour les 50 agents (actifs)
INSERT INTO contrats (societe_id, agent_id, client_nom, type_mission, montant, date_debut, date_fin, status)
SELECT
  a.societe_id,
  a.id,
  CASE (RANDOM() * 10)::INT
    WHEN 0 THEN 'Carrefour Lyon Part-Dieu'
    WHEN 1 THEN 'Centre Commercial Confluence'
    WHEN 2 THEN 'Hôpital Edouard Herriot'
    WHEN 3 THEN 'Banque Crédit Agricole'
    WHEN 4 THEN 'Stade de Gerland'
    WHEN 5 THEN 'Musée des Confluences'
    WHEN 6 THEN 'Festival Nuits Sonores'
    WHEN 7 THEN 'Aéroport Lyon-Saint-Exupéry'
    WHEN 8 THEN 'Tour Incity'
    ELSE 'Parc de la Tête d''Or'
  END as client_nom,
  CASE (RANDOM() * 5)::INT
    WHEN 0 THEN 'Gardiennage'
    WHEN 1 THEN 'Surveillance événementielle'
    WHEN 2 THEN 'Maître-chien'
    WHEN 3 THEN 'Protection rapprochée'
    ELSE 'Vidéosurveillance'
  END as type_mission,
  (RANDOM() * 15000 + 3000)::DECIMAL(10,2) as montant,
  CURRENT_DATE - (RANDOM() * 180)::INT as date_debut,
  CURRENT_DATE + (RANDOM() * 180)::INT as date_fin,
  CASE WHEN RANDOM() < 0.85 THEN 'actif' ELSE 'termine' END as status
FROM agents a
WHERE a.statut = 'actif'
LIMIT 45;

-- Générer 6 mois de performances pour chaque agent
INSERT INTO performances (agent_id, mois, missions_effectuees, heures_travaillees, score, ponctualite, retards)
SELECT
  a.id,
  DATE_TRUNC('month', CURRENT_DATE - (n.num * INTERVAL '1 month'))::DATE as mois,
  (RANDOM() * 20 + 5)::INT as missions_effectuees,
  (RANDOM() * 50 + 120)::DECIMAL(5,2) as heures_travaillees,
  (RANDOM() * 25 + 70)::DECIMAL(5,2) as score,
  (RANDOM() * 20 + 80)::INT as ponctualite,
  (RANDOM() * 5)::INT as retards
FROM agents a
CROSS JOIN (
  SELECT generate_series(0, 5) as num
) n
WHERE a.statut = 'actif';

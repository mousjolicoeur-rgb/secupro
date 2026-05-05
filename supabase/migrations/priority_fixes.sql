-- ==============================================================================
-- PACK DE CORRECTIFS PRIORITAIRES (SQL) - SECUPRO
-- ==============================================================================
-- Ce script est à exécuter directement dans le SQL Editor de Supabase.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------
ALTER TABLE plannings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contrats ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiches_paie ENABLE ROW LEVEL SECURITY;
ALTER TABLE performances ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------------------------
-- 2. POLITIQUES RLS (LECTURE & ISOLATION DES DONNÉES)
-- ------------------------------------------------------------------------------
-- Note: Les ID auth.uid() sont supposés correspondre aux ID d'agents ou sociétés.

-- Plannings
CREATE POLICY "Lecture plannings (Agent/Societe)" 
ON plannings FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM agents WHERE agents.id = plannings.agent_id) OR 
  auth.uid() IN (SELECT id FROM societes WHERE societes.id = plannings.societe_id)
);

-- Contrats
CREATE POLICY "Lecture contrats (Agent/Societe)" 
ON contrats FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM agents WHERE agents.id = contrats.agent_id) OR 
  auth.uid() IN (SELECT id FROM societes WHERE societes.id = (SELECT societe_id FROM agents WHERE agents.id = contrats.agent_id))
);

-- Documents
CREATE POLICY "Lecture documents (Agent/Societe)" 
ON documents FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM agents WHERE agents.id = documents.agent_id) OR 
  auth.uid() IN (SELECT id FROM societes WHERE societes.id = (SELECT societe_id FROM agents WHERE agents.id = documents.agent_id))
);

-- Vacations
CREATE POLICY "Lecture vacations (Agent/Societe)" 
ON vacations FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM agents WHERE agents.id = vacations.agent_id) OR 
  auth.uid() IN (SELECT id FROM societes WHERE societes.id = vacations.societe_id)
);

-- Fiches de paie
CREATE POLICY "Lecture fiches_paie (Agent/Societe)" 
ON fiches_paie FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM agents WHERE agents.id = fiches_paie.agent_id) OR 
  auth.uid() IN (SELECT id FROM societes WHERE societes.id = (SELECT societe_id FROM agents WHERE agents.id = fiches_paie.agent_id))
);

-- Performances
CREATE POLICY "Lecture performances (Agent/Societe)" 
ON performances FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM agents WHERE agents.id = performances.agent_id) OR 
  auth.uid() IN (SELECT id FROM societes WHERE societes.id = (SELECT societe_id FROM agents WHERE agents.id = performances.agent_id))
);


-- ------------------------------------------------------------------------------
-- 3. CRÉATION DES INDEX (OPTIMISATION DES REQUÊTES)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_agents_societe_id ON agents(societe_id);
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);

CREATE INDEX IF NOT EXISTS idx_plannings_agent_id ON plannings(agent_id);
CREATE INDEX IF NOT EXISTS idx_plannings_societe_id ON plannings(societe_id);

CREATE INDEX IF NOT EXISTS idx_actualites_categorie ON actualites(categorie);
CREATE INDEX IF NOT EXISTS idx_articles_droit_categorie ON articles_droit(categorie);

CREATE INDEX IF NOT EXISTS idx_contrats_agent_id ON contrats(agent_id);

-- ==============================================================================
-- FIN DU SCRIPT
-- ==============================================================================

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

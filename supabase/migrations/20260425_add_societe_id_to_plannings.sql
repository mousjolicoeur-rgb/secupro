-- Migration pour ajouter societe_id à la table plannings
ALTER TABLE plannings
ADD COLUMN IF NOT EXISTS societe_id uuid REFERENCES societes(id) ON DELETE CASCADE;

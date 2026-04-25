-- Migration pour ajouter l'analyse IA (JSONB) à la table fiches_paie
ALTER TABLE fiches_paie
ADD COLUMN IF NOT EXISTS analyse_ia jsonb;

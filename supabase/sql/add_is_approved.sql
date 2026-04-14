-- Ajoute la colonne is_approved à la table profiles
-- À exécuter dans Supabase → SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- Les comptes existants restent à false (en attente de validation manuelle)
-- Pour approuver un utilisateur manuellement :
-- UPDATE public.profiles SET is_approved = true WHERE email = 'agent@example.com';

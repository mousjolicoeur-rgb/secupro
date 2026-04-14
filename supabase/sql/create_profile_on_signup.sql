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

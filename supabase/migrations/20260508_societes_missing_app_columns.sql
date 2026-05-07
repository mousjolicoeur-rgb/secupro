-- Colonnes référencées par webhooks, activation et anciennes versions du dashboard
-- (à appliquer si information_schema ne les liste pas encore).
-- Sur les BDD déjà complètes, les ADD COLUMN sont no-op grâce à IF NOT EXISTS.

ALTER TABLE public.societes
  ADD COLUMN IF NOT EXISTS created_at timestamptz;

UPDATE public.societes
SET created_at = date_creation
WHERE created_at IS NULL AND date_creation IS NOT NULL;

UPDATE public.societes
SET created_at = now()
WHERE created_at IS NULL;

ALTER TABLE public.societes
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_plan text,
  ADD COLUMN IF NOT EXISTS activation_code text;

COMMENT ON COLUMN public.societes.subscription_status IS 'trial | active | expired';

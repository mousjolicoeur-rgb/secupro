-- =============================================================================
-- Migration : nettoyage profiles — espace agent devient 100% gratuit
-- À appliquer APRÈS avoir retiré du code toutes les références à
-- profiles.plan, profiles.trial_ends_at, profiles.stripe_id, profiles.plan_updated
-- (lib/useTrial.ts, TrialBanner, lib/subscription.ts, pages agent)
-- =============================================================================

ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS plan,
  DROP COLUMN IF EXISTS trial_ends_at,
  DROP COLUMN IF EXISTS stripe_id,
  DROP COLUMN IF EXISTS plan_updated;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

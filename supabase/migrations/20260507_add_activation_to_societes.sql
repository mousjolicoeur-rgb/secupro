-- Système d'accès : essai 7 jours + code d'activation post-paiement

ALTER TABLE societes
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_plan    text,
  ADD COLUMN IF NOT EXISTS activation_code      text;

-- Index pour les lookups rapides sur le code d'activation
CREATE UNIQUE INDEX IF NOT EXISTS idx_societes_activation_code
  ON societes (activation_code)
  WHERE activation_code IS NOT NULL;

-- Commentaires
COMMENT ON COLUMN societes.subscription_status IS 'trial | active | expired';
COMMENT ON COLUMN societes.subscription_plan   IS 'essentiel | pro | premium';
COMMENT ON COLUMN societes.activation_code     IS 'Code XXXX-XXXX-XXXX-XXXX généré après paiement Stripe';

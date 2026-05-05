-- Migration pour ajouter les informations Stripe à la table societes
ALTER TABLE societes
ADD COLUMN IF NOT EXISTS plan text DEFAULT 'gratuit',
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

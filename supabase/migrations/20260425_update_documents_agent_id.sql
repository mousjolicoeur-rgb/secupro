-- Migration pour s'assurer que la table documents utilise agent_id
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='entreprise_id') THEN
    ALTER TABLE documents RENAME COLUMN entreprise_id TO agent_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='documents' AND column_name='agent_id') THEN
    ALTER TABLE documents ADD COLUMN agent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

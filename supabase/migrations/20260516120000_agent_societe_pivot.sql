-- =============================================================================
-- Migration : table pivot agent_societe + nettoyage profiles
-- Espace Agent devient 100% gratuit — Espace Société reste payant
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABLE PIVOT agent_societe
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_societe (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  societe_id   uuid        NOT NULL REFERENCES public.societes(id) ON DELETE CASCADE,
  status       text        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'approved', 'rejected')),
  role         text        NOT NULL DEFAULT 'agent'
                             CHECK (role IN ('agent', 'chef_de_poste', 'superviseur')),
  invited_at   timestamptz DEFAULT now(),
  responded_at timestamptz,
  invited_by   uuid        REFERENCES auth.users(id),
  note         text,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (agent_id, societe_id)
);

-- -----------------------------------------------------------------------------
-- 2. TRIGGER updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER agent_societe_updated_at
  BEFORE UPDATE ON public.agent_societe
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. INDEX DE PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_agent_societe_agent_id   ON public.agent_societe(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_societe_societe_id ON public.agent_societe(societe_id);
CREATE INDEX IF NOT EXISTS idx_agent_societe_status     ON public.agent_societe(status);

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
ALTER TABLE public.agent_societe ENABLE ROW LEVEL SECURITY;

-- Un agent voit ses propres liaisons
CREATE POLICY "agent_societe_select_agent"
  ON public.agent_societe FOR SELECT
  USING (agent_id = auth.uid());

-- Une société voit les liaisons qui la concernent
CREATE POLICY "agent_societe_select_societe"
  ON public.agent_societe FOR SELECT
  USING (
    societe_id IN (
      SELECT id FROM public.societes WHERE user_id = auth.uid()
    )
  );

-- Une société peut inviter un agent (INSERT)
CREATE POLICY "agent_societe_insert_societe"
  ON public.agent_societe FOR INSERT
  WITH CHECK (
    societe_id IN (
      SELECT id FROM public.societes WHERE user_id = auth.uid()
    )
  );

-- Une société peut modifier le statut ; un agent peut répondre (responded_at)
CREATE POLICY "agent_societe_update"
  ON public.agent_societe FOR UPDATE
  USING (
    -- société propriétaire
    societe_id IN (SELECT id FROM public.societes WHERE user_id = auth.uid())
    OR
    -- agent concerné
    agent_id = auth.uid()
  );

-- Une société peut supprimer une liaison
CREATE POLICY "agent_societe_delete_societe"
  ON public.agent_societe FOR DELETE
  USING (
    societe_id IN (
      SELECT id FROM public.societes WHERE user_id = auth.uid()
    )
  );


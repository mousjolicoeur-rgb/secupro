-- ============================================================
-- Espace PRO : tables prises_service, rapports_vacation,
-- messages_vacation + colonne code_acces sur societes
-- ============================================================

-- 1. code_acces sur societes (6 chiffres) ─────────────────────
ALTER TABLE public.societes
  ADD COLUMN IF NOT EXISTS code_acces varchar(6);

UPDATE public.societes
SET code_acces = lpad(((floor(random() * 900000) + 100000)::bigint)::text, 6, '0')
WHERE code_acces IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_societes_code_acces
  ON public.societes(code_acces)
  WHERE code_acces IS NOT NULL;

-- 2. site_affecte dans profiles ────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS site_affecte text;

-- 3. prises_service ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.prises_service (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  societe_id     uuid        NOT NULL REFERENCES public.societes(id)  ON DELETE CASCADE,
  site           text,
  vacation_debut text,
  vacation_fin   text,
  heure_debut    timestamptz NOT NULL DEFAULT now(),
  heure_fin      timestamptz,
  materiels      jsonb       NOT NULL DEFAULT '[]',
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE public.prises_service ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_ps_agent_id   ON public.prises_service(agent_id);
CREATE INDEX IF NOT EXISTS idx_ps_societe_id ON public.prises_service(societe_id);

CREATE POLICY "ps_select_agent"
  ON public.prises_service FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "ps_select_societe"
  ON public.prises_service FOR SELECT
  USING (societe_id IN (SELECT id FROM public.societes WHERE user_id = auth.uid()));

CREATE POLICY "ps_insert_agent"
  ON public.prises_service FOR INSERT WITH CHECK (agent_id = auth.uid());

CREATE POLICY "ps_update_agent"
  ON public.prises_service FOR UPDATE USING (agent_id = auth.uid());

-- 4. rapports_vacation ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rapports_vacation (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  prise_service_id uuid        NOT NULL REFERENCES public.prises_service(id) ON DELETE CASCADE,
  agent_id         uuid        NOT NULL REFERENCES public.profiles(id),
  type             text        NOT NULL DEFAULT 'ras'
                                 CHECK (type IN ('ras','incident','anomalie','urgence')),
  contenu          text,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE public.rapports_vacation ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_rv_prise_id ON public.rapports_vacation(prise_service_id);
CREATE INDEX IF NOT EXISTS idx_rv_agent_id ON public.rapports_vacation(agent_id);

CREATE POLICY "rv_select"
  ON public.rapports_vacation FOR SELECT
  USING (
    agent_id = auth.uid()
    OR prise_service_id IN (
      SELECT id FROM public.prises_service
      WHERE societe_id IN (SELECT id FROM public.societes WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "rv_insert_agent"
  ON public.rapports_vacation FOR INSERT WITH CHECK (agent_id = auth.uid());

-- 5. messages_vacation ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages_vacation (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id   uuid        NOT NULL REFERENCES public.profiles(id),
  societe_id uuid        NOT NULL REFERENCES public.societes(id),
  expediteur text        NOT NULL CHECK (expediteur IN ('agent','societe')),
  contenu    text        NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages_vacation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_vacation REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_mv_agent_id   ON public.messages_vacation(agent_id);
CREATE INDEX IF NOT EXISTS idx_mv_societe_id ON public.messages_vacation(societe_id);
CREATE INDEX IF NOT EXISTS idx_mv_created_at ON public.messages_vacation(created_at);

CREATE POLICY "mv_select"
  ON public.messages_vacation FOR SELECT
  USING (
    agent_id = auth.uid()
    OR societe_id IN (SELECT id FROM public.societes WHERE user_id = auth.uid())
  );

CREATE POLICY "mv_insert"
  ON public.messages_vacation FOR INSERT
  WITH CHECK (
    agent_id = auth.uid()
    OR societe_id IN (SELECT id FROM public.societes WHERE user_id = auth.uid())
  );

-- 6. Realtime ──────────────────────────────────────────────────
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages_vacation;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rapports_vacation;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

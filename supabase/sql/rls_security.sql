-- ============================================================
-- RLS SECURITY POLICIES
-- Run in Supabase → SQL Editor
-- ============================================================

-- 1. PROFILES — utilisateur voit uniquement son propre profil
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.profiles;
CREATE POLICY "Users can see their own profile"
ON public.profiles FOR ALL
USING (auth.uid() = id);

-- 2. PAYSLIPS — utilisateur voit uniquement ses fiches de paie
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own payslips" ON public.payslips;
CREATE POLICY "Users can see their own payslips"
ON public.payslips FOR ALL
USING (auth.uid() = user_id);

-- 3. RAPPORTS — utilisateur voit uniquement ses rapports
ALTER TABLE public.rapports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see their own rapports" ON public.rapports;
CREATE POLICY "Users can see their own rapports"
ON public.rapports FOR ALL
USING (auth.uid() = user_id);

-- 4. AGENT_LEADS — pas de colonne user_id, politique spécifique
ALTER TABLE public.agent_leads ENABLE ROW LEVEL SECURITY;

-- Autoriser l'insertion anonyme (formulaire public)
DROP POLICY IF EXISTS "agent_leads_insert_anon" ON public.agent_leads;
CREATE POLICY "agent_leads_insert_anon"
ON public.agent_leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Bloquer la lecture pour tout le monde (seul service_role peut lire)
DROP POLICY IF EXISTS "agent_leads_no_select" ON public.agent_leads;
CREATE POLICY "agent_leads_no_select"
ON public.agent_leads FOR SELECT
USING (false);

-- 5. Fix Search Path Mutable (sécurité des fonctions)
ALTER FUNCTION public.get_agent_leads_count() SET search_path = public;
ALTER FUNCTION public.profiles_touch_updated_at() SET search_path = public;

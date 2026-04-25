import { supabase } from '@/lib/supabaseClient';

export type PlanType = 'gratuit' | 'essentiel' | 'pro' | 'premium';

/**
 * Récupère le plan actuel d'une société.
 * Si l'API échoue, on fallback sur 'gratuit' par sécurité.
 */
export async function getCurrentSocietePlan(societeId: string): Promise<PlanType> {
  try {
    const { data, error } = await supabase
      .from('societes')
      .select('plan')
      .eq('id', societeId)
      .single();
      
    if (error || !data) return 'gratuit';
    
    // Normaliser la casse au cas où
    const plan = data.plan?.toLowerCase() as PlanType;
    if (['gratuit', 'essentiel', 'pro', 'premium'].includes(plan)) {
      return plan;
    }
    
    return 'gratuit';
  } catch (err) {
    console.error('[SecuPRO] Erreur lors de la récupération du plan:', err);
    return 'gratuit';
  }
}

/**
 * Vérifie si le plan permet d'accéder aux fonctionnalités Pro/Premium (SecuIA, Dashboard).
 */
export function hasProAccess(plan: PlanType): boolean {
  return ['pro', 'premium'].includes(plan);
}

/**
 * Retourne la limite d'agents selon le plan pour le provisioning.
 */
export function getAgentLimit(plan: PlanType): number {
  switch (plan) {
    case 'essentiel': return 25;
    case 'pro': return 100;
    case 'premium': return Infinity;
    default: return 5; // Limite stricte pour le plan gratuit/démo
  }
}

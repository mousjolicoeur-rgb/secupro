'use server';

import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';

// Schéma de validation Zod basé sur AGENTS.md et le schéma de base de données
const agentSchema = z.object({
  societe_id: z.string().uuid("L'identifiant de la société doit être un UUID valide"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Format d'email invalide").optional().or(z.literal('')),
  carte_pro: z.string().regex(
    /^(CAR|AUT|MAC|REC)-/i, 
    "Format CNAPS invalide. La carte professionnelle doit commencer par CAR-, AUT-, MAC- ou REC-"
  ).optional().or(z.literal('')),
  statut: z.enum(['actif', 'inactif', 'suspendu']).optional().default('actif'),
});

export async function createAgent(data: z.infer<typeof agentSchema>) {
  try {
    // 1. Validation des données avec Zod
    const validatedData = agentSchema.parse(data);

    // 2. Insertion en base de données avec Supabase
    const { data: agent, error } = await supabase
      .from('agents')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      console.error('[SecuPRO] Erreur Supabase lors de la création de l\\'agent:', error);
      return { success: false, error: error.message };
    }

    // 3. Retour du pattern standard
    return { success: true, data: agent };
  } catch (error) {
    console.error('[SecuPRO] Erreur inattendue:', error);
    
    // Traitement spécifique des erreurs de validation Zod
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Erreur de validation : ${errorMessage}` };
    }
    
    return { success: false, error: 'Une erreur est survenue lors de la création de l\\'agent.' };
  }
}

export async function getAgentsBySociete(societeId: string) {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select(`
        *,
        contrats(*),
        performances(*)
      `)
      .eq('societe_id', societeId)
      .order('nom', { ascending: true });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('[SecuPRO] Erreur getAgentsBySociete:', error);
    return { success: false, error: 'Une erreur est survenue lors de la récupération des agents.' };
  }
}

export async function updateAgentStatus(
  agentId: string,
  statut: 'actif' | 'inactif' | 'suspendu'
) {
  try {
    const { error } = await supabase
      .from('agents')
      .update({ statut })
      .eq('id', agentId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('[SecuPRO] Erreur updateAgentStatus:', error);
    return { success: false, error: 'Une erreur est survenue lors de la mise à jour du statut.' };
  }
}

export async function deactivateAgent(agentId: string) {
  // Soft delete : on passe en inactif plutôt que de supprimer
  return updateAgentStatus(agentId, 'inactif');
}

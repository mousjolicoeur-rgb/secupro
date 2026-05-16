'use client';

import { supabase } from '@/lib/supabaseClient';
import type {
  AgentSociete,
  AgentSocieteStatus,
  AgentSocieteWithAgent,
  AgentSocieteWithSociete,
} from '@/types/database.types';

/** Toutes les sociétés d'un agent (toutes liaisons confondues) */
export async function getAgentSocietes(
  agentId: string
): Promise<AgentSocieteWithSociete[]> {
  const { data, error } = await supabase
    .from('agent_societe')
    .select(`
      *,
      societes (
        id, nom, email, telephone, adresse,
        subscription_status, subscription_plan
      )
    `)
    .eq('agent_id', agentId)
    .order('invited_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AgentSocieteWithSociete[];
}

/** Uniquement les liaisons approved pour un agent */
export async function getApprovedSocietesForAgent(
  agentId: string
): Promise<AgentSocieteWithSociete[]> {
  const { data, error } = await supabase
    .from('agent_societe')
    .select(`
      *,
      societes (
        id, nom, email, telephone, adresse,
        subscription_status, subscription_plan
      )
    `)
    .eq('agent_id', agentId)
    .eq('status', 'approved')
    .order('invited_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AgentSocieteWithSociete[];
}

/** Tous les agents d'une société (toutes liaisons confondues) */
export async function getSocieteAgents(
  societeId: string
): Promise<AgentSocieteWithAgent[]> {
  const { data, error } = await supabase
    .from('agent_societe')
    .select(`
      *,
      profiles (
        id, full_name, email, avatar_url, is_active
      )
    `)
    .eq('societe_id', societeId)
    .order('invited_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as AgentSocieteWithAgent[];
}

/**
 * Invite un agent à rejoindre une société via son email.
 * Résout d'abord l'agent_id depuis son email dans profiles.
 */
export async function inviteAgent(
  societeId: string,
  agentEmail: string
): Promise<AgentSociete> {
  // Résolution de l'agent par email
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', agentEmail)
    .single();

  if (profileError || !profile) {
    throw new Error(`Aucun agent trouvé avec l'email : ${agentEmail}`);
  }

  const { data: session } = await supabase.auth.getSession();

  const { data, error } = await supabase
    .from('agent_societe')
    .insert({
      agent_id: profile.id,
      societe_id: societeId,
      status: 'pending',
      invited_by: session?.session?.user?.id ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as AgentSociete;
}

/** L'agent accepte ou refuse une invitation */
export async function respondToInvitation(
  liaisonId: string,
  response: Extract<AgentSocieteStatus, 'approved' | 'rejected'>
): Promise<AgentSociete> {
  const { data, error } = await supabase
    .from('agent_societe')
    .update({
      status: response,
      responded_at: new Date().toISOString(),
    })
    .eq('id', liaisonId)
    .select()
    .single();

  if (error) throw error;
  return data as AgentSociete;
}

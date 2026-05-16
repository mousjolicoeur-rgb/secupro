'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabaseServer'
import { getServerUserForAction } from '@/lib/supabase/server-session'
import type { AgentSocieteRole } from '@/types/database.types'

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string }

export async function inviteAgentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getServerUserForAction()
  if (!user) return { success: false, error: 'Non authentifié' }

  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const role = ((formData.get('role') as string) || 'agent') as AgentSocieteRole
  const note = ((formData.get('note') as string) || '').trim() || null

  if (!email) return { success: false, error: "L'email est requis" }

  const supabase = createServerClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (profileError || !profile) {
    return { success: false, error: 'agent_not_found' }
  }

  const { error } = await supabase.from('agent_societe').insert({
    agent_id: profile.id,
    societe_id: user.id,
    status: 'pending',
    role,
    note,
    invited_by: user.id,
  })

  if (error) {
    if (error.code === '23505') return { success: false, error: 'already_invited' }
    return { success: false, error: error.message }
  }

  revalidatePath('/entreprises/agents/invite')
  return { success: true, message: `Invitation envoyée à ${email}` }
}

export async function revokeAgentAction(liaisonId: string): Promise<ActionResult> {
  const user = await getServerUserForAction()
  if (!user) return { success: false, error: 'Non authentifié' }

  const supabase = createServerClient()

  const { error } = await supabase
    .from('agent_societe')
    .delete()
    .eq('id', liaisonId)
    .eq('societe_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/entreprises/agents/invite')
  return { success: true, message: 'Liaison supprimée' }
}

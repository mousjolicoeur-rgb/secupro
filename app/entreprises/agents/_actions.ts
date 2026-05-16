'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabaseServer'
import { getServerUserForAction } from '@/lib/supabase/server-session'

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string }

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

  revalidatePath('/entreprises/agents')
  revalidatePath('/entreprises/agents/invite')
  return { success: true, message: 'Agent révoqué' }
}

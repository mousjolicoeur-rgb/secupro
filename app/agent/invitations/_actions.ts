'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabaseServer'
import { getServerUserForAction } from '@/lib/supabase/server-session'
import type { AgentSocieteStatus } from '@/types/database.types'

export type RespondResult =
  | { success: true }
  | { success: false; error: string }

export async function respondToInvitationAction(
  liaisonId: string,
  response: Extract<AgentSocieteStatus, 'approved' | 'rejected'>,
): Promise<RespondResult> {
  const user = await getServerUserForAction()
  if (!user) return { success: false, error: 'Non authentifié' }

  const supabase = createServerClient()

  const { error } = await supabase
    .from('agent_societe')
    .update({
      status: response,
      responded_at: new Date().toISOString(),
    })
    .eq('id', liaisonId)
    .eq('agent_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/agent/invitations')
  return { success: true }
}

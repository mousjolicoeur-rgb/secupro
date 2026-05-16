import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase/server-session'
import { createServerClient } from '@/lib/supabaseServer'
import type { AgentSocieteWithSociete } from '@/types/database.types'
import InvitationsClient from './_client'

export const dynamic = 'force-dynamic'

export default async function InvitationsPage() {
  const user = await getServerUser()
  if (!user) redirect('/login')

  const supabase = createServerClient()

  const { data: invitations } = await supabase
    .from('agent_societe')
    .select(`
      *,
      societes (
        id, nom, email, telephone, adresse,
        subscription_status, subscription_plan
      )
    `)
    .eq('agent_id', user.id)
    .order('invited_at', { ascending: false })

  return (
    <InvitationsClient
      initialInvitations={(invitations ?? []) as AgentSocieteWithSociete[]}
    />
  )
}

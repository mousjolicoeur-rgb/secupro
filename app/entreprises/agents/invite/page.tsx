import { redirect } from 'next/navigation'
import { getServerUser } from '@/lib/supabase/server-session'
import { createServerClient } from '@/lib/supabaseServer'
import type { AgentSocieteWithAgent } from '@/types/database.types'
import InvitePageClient from './_client'

export const dynamic = 'force-dynamic'

export default async function InviteAgentsPage() {
  const user = await getServerUser()
  if (!user) redirect('/espace-societe')

  const supabase = createServerClient()

  const { data: agents } = await supabase
    .from('agent_societe')
    .select(`
      *,
      profiles (
        id, full_name, email, avatar_url, is_active
      )
    `)
    .eq('societe_id', user.id)
    .order('invited_at', { ascending: false })

  return (
    <InvitePageClient initialAgents={(agents ?? []) as AgentSocieteWithAgent[]} />
  )
}

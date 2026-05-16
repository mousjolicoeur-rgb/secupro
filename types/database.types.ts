// Types de base SecuPRO — table pivot agent_societe

export type AgentSocieteStatus = 'pending' | 'approved' | 'rejected';
export type AgentSocieteRole = 'agent' | 'chef_de_poste' | 'superviseur';

export interface AgentSociete {
  id: string;
  agent_id: string;
  societe_id: string;
  status: AgentSocieteStatus;
  role: AgentSocieteRole;
  invited_at: string | null;
  responded_at: string | null;
  invited_by: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentSocieteWithSociete extends AgentSociete {
  societes: {
    id: string;
    nom: string;
    email: string | null;
    telephone: string | null;
    adresse: string | null;
    subscription_status: string | null;
    subscription_plan: string | null;
  };
}

export interface AgentSocieteWithAgent extends AgentSociete {
  profiles: {
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
    is_active: boolean;
  };
}

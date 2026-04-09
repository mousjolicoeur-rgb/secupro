import { supabase } from "@/lib/supabaseClient";

export type AgentLeadInput = {
  name: string;
  email: string;
  company: string;
};

/** Insert via le même client public (anon) que le reste de l’app agent. */
export async function insertAgentLead(input: AgentLeadInput) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const company = input.company.trim();

  if (!name || !email || !company) {
    return { error: new Error("Missing fields") };
  }

  const { error } = await supabase.from("agent_leads").insert({
    name,
    email,
    company,
  });

  return { error };
}

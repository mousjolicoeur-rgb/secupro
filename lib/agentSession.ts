/**
 * Funnel agent : landing → code entreprise → mission.
 * Utilise le client Supabase anon (@/lib/supabaseClient) pour agent_leads.
 */

export const AGENT_LEAD_SESSION_KEY = "secupro_agent_lead_submitted";

/** Persiste sur l’appareil après inscription réussie (session ou onglet fermé). */
export const LS_AGENT_LEAD_REGISTERED = "secupro_agent_lead_registered";

export const LS_ENTREPRISE_ID = "entreprise_id";
export const LS_ENTREPRISE_NOM = "entreprise_nom";

/** Nom affiché sur le rapport (formulaire landing). */
export const LS_AGENT_NAME = "secupro_agent_display_name";

export function setAgentDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  const n = name.trim();
  if (n) localStorage.setItem(LS_AGENT_NAME, n);
}

export function getAgentDisplayName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_AGENT_NAME)?.trim() ?? "";
}

export function markAgentLeadComplete(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AGENT_LEAD_SESSION_KEY, "1");
  localStorage.setItem(LS_AGENT_LEAD_REGISTERED, "1");
}

export function hasCompletedAgentLead(): boolean {
  if (typeof window === "undefined") return false;
  return (
    sessionStorage.getItem(AGENT_LEAD_SESSION_KEY) === "1" ||
    localStorage.getItem(LS_AGENT_LEAD_REGISTERED) === "1"
  );
}

export function clearAgentLeadFlags(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AGENT_LEAD_SESSION_KEY);
  localStorage.removeItem(LS_AGENT_LEAD_REGISTERED);
  localStorage.removeItem(LS_AGENT_NAME);
}

export function getEntrepriseId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_ENTREPRISE_ID)?.trim() ?? "";
}

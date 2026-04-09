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

// Profil agent (stockage local)
export const LS_AGENT_EMAIL = "secupro_agent_email";
export const LS_AGENT_COMPANY = "secupro_agent_company";
export const LS_AGENT_ADDRESS = "secupro_agent_address";
export const LS_AGENT_PHONE = "secupro_agent_phone";
export const LS_AGENT_JOB = "secupro_agent_job";
export const LS_AGENT_AVATAR_DATAURL = "secupro_agent_avatar_dataurl";

export function setAgentDisplayName(name: string): void {
  if (typeof window === "undefined") return;
  const n = name.trim();
  if (n) localStorage.setItem(LS_AGENT_NAME, n);
}

export function getAgentDisplayName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_AGENT_NAME)?.trim() ?? "";
}

export type AgentProfile = {
  fullName: string;
  email: string;
  company: string;
  address: string;
  phone: string;
  jobFunction: string;
  avatarDataUrl: string;
};

export function getAgentProfile(): AgentProfile {
  if (typeof window === "undefined") {
    return {
      fullName: "",
      email: "",
      company: "",
      address: "",
      phone: "",
      jobFunction: "",
      avatarDataUrl: "",
    };
  }
  return {
    fullName: getAgentDisplayName(),
    email: localStorage.getItem(LS_AGENT_EMAIL)?.trim() ?? "",
    company: localStorage.getItem(LS_AGENT_COMPANY)?.trim() ?? "",
    address: localStorage.getItem(LS_AGENT_ADDRESS)?.trim() ?? "",
    phone: localStorage.getItem(LS_AGENT_PHONE)?.trim() ?? "",
    jobFunction: localStorage.getItem(LS_AGENT_JOB)?.trim() ?? "",
    avatarDataUrl: localStorage.getItem(LS_AGENT_AVATAR_DATAURL) ?? "",
  };
}

export function upsertAgentProfile(patch: Partial<AgentProfile>): void {
  if (typeof window === "undefined") return;
  if (patch.fullName != null) setAgentDisplayName(patch.fullName);
  if (patch.email != null) localStorage.setItem(LS_AGENT_EMAIL, patch.email);
  if (patch.company != null)
    localStorage.setItem(LS_AGENT_COMPANY, patch.company);
  if (patch.address != null)
    localStorage.setItem(LS_AGENT_ADDRESS, patch.address);
  if (patch.phone != null) localStorage.setItem(LS_AGENT_PHONE, patch.phone);
  if (patch.jobFunction != null)
    localStorage.setItem(LS_AGENT_JOB, patch.jobFunction);
  if (patch.avatarDataUrl != null)
    localStorage.setItem(LS_AGENT_AVATAR_DATAURL, patch.avatarDataUrl);
  window.dispatchEvent(new Event("secupro-profile-updated"));
}

export function clearAgentAvatar(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_AGENT_AVATAR_DATAURL);
  window.dispatchEvent(new Event("secupro-profile-updated"));
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
  localStorage.removeItem(LS_AGENT_EMAIL);
  localStorage.removeItem(LS_AGENT_COMPANY);
  localStorage.removeItem(LS_AGENT_ADDRESS);
  localStorage.removeItem(LS_AGENT_PHONE);
  localStorage.removeItem(LS_AGENT_JOB);
  localStorage.removeItem(LS_AGENT_AVATAR_DATAURL);
}

export function getEntrepriseId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(LS_ENTREPRISE_ID)?.trim() ?? "";
}

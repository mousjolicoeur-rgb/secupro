/**
 * Envoi d’alerte mission → table `rapports`.
 *
 * IMPORTANT (client / navigateur) :
 * - Utilise uniquement `createClient` avec NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   via `@/lib/supabaseClient`.
 * - Ne jamais importer ou utiliser SUPABASE_SERVICE_ROLE_KEY ici : réservé
 *   aux routes API serveur uniquement.
 */

import { supabase } from "@/lib/supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";

export type MissionSignalPayload = {
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  entreprise_id: string;
  agent_name: string;
};

export type SendMissionSignalResult = {
  ok: boolean;
  /** Texte lisible pour l’UI (message Supabase + détails). */
  message: string;
  /** Erreur PostgREST si présente. */
  postgrestError: PostgrestError | null;
};

function formatPostgrestError(err: PostgrestError): string {
  const parts = [err.message];
  if (err.code) parts.push(`Code: ${err.code}`);
  if (err.details) parts.push(`Details: ${err.details}`);
  if (err.hint) parts.push(`Hint: ${err.hint}`);
  return parts.join("\n");
}

/**
 * Insert une ligne dans `rapports` avec la clé anon (même client que l’app agent).
 */
export async function sendMissionSignal(
  payload: MissionSignalPayload
): Promise<SendMissionSignalResult> {
  const row = {
    type: payload.type,
    description: payload.description,
    latitude: payload.latitude,
    longitude: payload.longitude,
    entreprise_id: payload.entreprise_id,
    agent_name: payload.agent_name.trim() || "Agent",
  };

  try {
    const { error } = await supabase.from("rapports").insert(row);

    if (error) {
      console.error("[signalService] Supabase insert failed:", error);
      console.error("[signalService] Payload sent (no secrets):", {
        ...row,
        entreprise_id: row.entreprise_id ? `${row.entreprise_id.slice(0, 8)}…` : "",
      });
      return {
        ok: false,
        message: formatPostgrestError(error),
        postgrestError: error,
      };
    }

    return { ok: true, message: "", postgrestError: null };
  } catch (e) {
    console.error("[signalService] Unexpected exception:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      message: msg || "Unknown error during insert",
      postgrestError: null,
    };
  }
}

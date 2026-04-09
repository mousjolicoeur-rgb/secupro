/**
 * Envoi d’alerte mission → table `public.rapports`.
 *
 * Colonnes attendues (à aligner sur ta table Supabase) :
 * `type`, `description`, `latitude`, `longitude`, `entreprise_id`, `agent_name`
 * (+ `id` / `created_at` générés côté DB si besoin).
 *
 * Client : ANON uniquement via `supabaseRapportsInsert` (en-têtes dédiés insert).
 */

import { supabaseRapportsInsert } from "@/lib/supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";

export type MissionSignalPayload = {
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  entreprise_id: string;
  agent_name: string;
};

/** Une seule ligne d’insert — aucune clé en trop pour éviter PGRST204. */
export type RapportInsertRow = {
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  entreprise_id: string;
  agent_name: string;
};

export type SendMissionSignalResult = {
  ok: boolean;
  message: string;
  postgrestError: PostgrestError | null;
};

function formatPostgrestError(err: PostgrestError): string {
  const parts = [err.message];
  if (err.code) parts.push(`Code: ${err.code}`);
  if (err.details) parts.push(`Details: ${err.details}`);
  if (err.hint) parts.push(`Hint: ${err.hint}`);
  return parts.join("\n");
}

function buildRapportRow(payload: MissionSignalPayload): RapportInsertRow {
  const lat = Number(payload.latitude);
  const lng = Number(payload.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error("Invalid latitude or longitude");
  }
  return {
    type: String(payload.type).trim(),
    description: String(payload.description).trim(),
    latitude: lat,
    longitude: lng,
    entreprise_id: String(payload.entreprise_id).trim(),
    agent_name: String(payload.agent_name || "Agent").trim() || "Agent",
  };
}

export async function sendMissionSignal(
  payload: MissionSignalPayload
): Promise<SendMissionSignalResult> {
  let reportData: RapportInsertRow;
  try {
    reportData = buildRapportRow(payload);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[signalService] Invalid payload:", payload, e);
    return { ok: false, message: msg, postgrestError: null };
  }

  console.log("Sending data:", reportData);

  try {
    const { error } = await supabaseRapportsInsert
      .from("rapports")
      .insert(reportData);

    if (error) {
      console.error("[signalService] Supabase insert failed:", error);
      console.error("[signalService] Last payload keys:", Object.keys(reportData));
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

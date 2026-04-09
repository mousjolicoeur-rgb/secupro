/**
 * Insert minimal dans `public.rapports` (clé anon, schéma `public` via supabaseClient).
 * Une seule ligne, tableau `[{ ... }]` comme attendu par PostgREST.
 */

import { supabase } from "@/lib/supabaseClient";
import type { PostgrestError } from "@supabase/supabase-js";

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

/**
 * Payload minimal — uniquement les colonnes envoyées (pas d’entreprise_id ici).
 */
export async function sendMissionSignal(params: {
  latitude: number;
  longitude: number;
  agent_name: string;
}): Promise<SendMissionSignalResult> {
  const lat = Number(params.latitude);
  const lng = Number(params.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, message: "Invalid latitude or longitude", postgrestError: null };
  }

  const nameFromSession = String(params.agent_name || "Agent").trim() || "Agent";

  const row = [
    {
      description: "Alerte manuelle",
      type: "alarm",
      agent_name: nameFromSession,
      latitude: lat,
      longitude: lng,
    },
  ];

  console.log("Sending data:", row);

  try {
    const { error } = await supabase.from("rapports").insert(row);

    if (error) {
      console.error("[signalService] Supabase insert failed:", error);
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

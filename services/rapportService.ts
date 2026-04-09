import { getAgentDisplayName } from "@/lib/agentSession";
import { sendMissionSignal } from "@/services/signalService";

/**
 * @deprecated Utilisez `sendMissionSignal` ({ latitude, longitude, agent_name }).
 * L’insert ne contient plus que : description, type, agent_name, latitude, longitude.
 */
export async function createRapport(
  _type: string,
  _description: string,
  latitude: number,
  longitude: number,
  _entreprise_id: string
) {
  const result = await sendMissionSignal({
    latitude,
    longitude,
    agent_name: getAgentDisplayName() || "Agent terrain",
  });

  if (result.ok) {
    return { error: null as null };
  }

  const synthetic = {
    message: result.message,
    code: result.postgrestError?.code,
    details: result.postgrestError?.details,
    hint: result.postgrestError?.hint,
  };
  return { error: synthetic as import("@supabase/supabase-js").PostgrestError };
}

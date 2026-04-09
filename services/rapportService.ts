import { getAgentDisplayName } from "@/lib/agentSession";
import { sendMissionSignal } from "@/services/signalService";

/**
 * @deprecated Préférez `sendMissionSignal` depuis `@/services/signalService`.
 * Conservé pour compatibilité : utilise le client anon et le nom agent en session.
 */
export async function createRapport(
  type: string,
  description: string,
  latitude: number,
  longitude: number,
  entreprise_id: string
) {
  const result = await sendMissionSignal({
    type,
    description,
    latitude,
    longitude,
    entreprise_id,
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

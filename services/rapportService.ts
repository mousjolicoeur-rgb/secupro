import { supabase } from "@/lib/supabaseClient";

export async function createRapport(
  type: string,
  description: string,
  latitude: number,
  longitude: number,
  entreprise_id: string
) {
  const { error } = await supabase.from("rapports").insert({
    type,
    description,
    latitude,
    longitude,
    entreprise_id,
    agent_name: "Agent terrain",
  });

  return { error };
}

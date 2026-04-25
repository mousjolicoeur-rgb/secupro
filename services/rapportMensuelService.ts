import { createClient } from "@supabase/supabase-js";

export interface RapportData {
  societeId: string;
  mois: string; // format "YYYY-MM"
  agentsActifs: number;
  heuresTravaillees: number;
  missionsRealisees: number;
  incidentsSignales: number;
  tauxPresence: number; // pourcentage 0-100
  societeName: string;
  donneurOrdreEmail: string | null;
}

let _client: ReturnType<typeof createClient> | null = null;

function getServerClient() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

type PerfRow = {
  agent_id: string;
  heures_travaillees: number | null;
  missions_effectuees: number | null;
  ponctualite: number | null;
};

export async function getRapportData(
  societeId: string,
  mois: string
): Promise<RapportData> {
  if (!societeId?.trim()) {
    throw new Error("societeId is required");
  }
  if (!/^\d{4}-\d{2}$/.test(mois)) {
    throw new Error(`mois must be in YYYY-MM format, received: "${mois}"`);
  }

  const supabase = getServerClient();

  const [societeResult, agentsResult] = await Promise.all([
    supabase
      .from("entreprises")
      .select("id, nom")
      .eq("id", societeId)
      .maybeSingle<{ id: string; nom: string }>(),
    supabase
      .from("agents")
      .select("id, statut")
      .eq("societe_id", societeId)
      .eq("statut", "actif")
      .returns<{ id: string; statut: string }[]>(),
  ]);

  if (societeResult.error) {
    throw new Error(
      `Failed to fetch entreprise "${societeId}": ${societeResult.error.message}`
    );
  }
  if (!societeResult.data) {
    throw new Error(`Entreprise not found: "${societeId}"`);
  }

  if (agentsResult.error) {
    throw new Error(
      `Failed to fetch agents for societe "${societeId}": ${agentsResult.error.message}`
    );
  }

  const societeRow = societeResult.data;
  const agents = agentsResult.data ?? [];
  const agentIds = agents.map((a) => a.id);

  const monthStart = `${mois}-01`;
  const [year, month] = mois.split("-").map(Number);
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  let heuresTravaillees = 0;
  let missionsRealisees = 0;
  let tauxPresence = 0;

  if (agentIds.length > 0) {
    const { data: perfRows, error: perfError } = await supabase
      .from("performances")
      .select("agent_id, heures_travaillees, missions_effectuees, ponctualite")
      .in("agent_id", agentIds)
      .gte("mois", monthStart)
      .lt("mois", nextMonth)
      .returns<PerfRow[]>();

    if (perfError) {
      throw new Error(
        `Failed to fetch performances for mois "${mois}": ${perfError.message}`
      );
    }

    const rows = perfRows ?? [];

    heuresTravaillees = rows.reduce(
      (sum, r) => sum + (r.heures_travaillees ?? 0),
      0
    );
    missionsRealisees = rows.reduce(
      (sum, r) => sum + (r.missions_effectuees ?? 0),
      0
    );

    if (rows.length > 0) {
      const totalPonctualite = rows.reduce(
        (sum, r) => sum + (r.ponctualite ?? 0),
        0
      );
      tauxPresence = Math.round(totalPonctualite / rows.length);
    }
  }

  return {
    societeId,
    mois,
    agentsActifs: agents.length,
    heuresTravaillees: Math.round(heuresTravaillees * 100) / 100,
    missionsRealisees,
    incidentsSignales: 0,
    tauxPresence,
    societeName: societeRow.nom,
    donneurOrdreEmail: null,
  };
}

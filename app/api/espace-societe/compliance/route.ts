import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/supabase/server-session";
import { createComplianceClient } from "@/lib/supabase/compliance-client";

export interface ComplianceAnalyse {
  id:           string;
  nom_document: string;
  score:        number;
  risques:      string[];
  actions:      string[];
  type:         string;
  statut:       string;
  created_at:   string;
}

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const compliance = createComplianceClient();
    const { data, error } = await compliance.rpc("get_analyses_safe");
    if (error) throw error;
    return NextResponse.json({ analyses: (data ?? []) as ComplianceAnalyse[] });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erreur inattendue";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

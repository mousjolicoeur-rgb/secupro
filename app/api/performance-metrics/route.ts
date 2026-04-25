import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const [
      { count: agentsActifs },
      { count: contratsActifs },
      { data: revenusData },
      { data: perfData },
      { data: agents },
      { data: contrats },
      { data: performances },
    ] = await Promise.all([
      supabase.from('agents').select('*', { count: 'exact', head: true }).eq('statut', 'actif'),
      supabase.from('contrats').select('*', { count: 'exact', head: true }).eq('status', 'actif'),
      supabase.from('contrats').select('montant').eq('status', 'actif'),
      supabase.from('performances')
        .select('score')
        .gte('mois', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
      supabase.from('agents').select('id, nom, prenom, statut').limit(100),
      supabase.from('contrats').select('agent_id, client_nom, type_mission, montant, status').eq('status', 'actif').limit(100),
      supabase.from('performances').select('agent_id, mois, score, missions_effectuees').order('mois', { ascending: false }).limit(300),
    ]);

    const revenuTotal = (revenusData || []).reduce((sum: number, r: any) => sum + parseFloat(r.montant || 0), 0);
    const scores = (perfData || []).map((p: any) => parseFloat(p.score));
    const performanceMoyenne = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // agentMetrics: agents with their avg score and contract count
    const agentMetrics = (agents || []).map((a: any) => {
      const agentPerfs = (performances || []).filter((p: any) => p.agent_id === a.id);
      const agentContrats = (contrats || []).filter((c: any) => c.agent_id === a.id);
      const avgScore = agentPerfs.length > 0
        ? agentPerfs.reduce((sum: number, p: any) => sum + parseFloat(p.score || 0), 0) / agentPerfs.length
        : 85;
      return {
        name: `${a.prenom} ${a.nom}`,
        status: a.statut,
        contracts: agentContrats.length,
        performance: Math.round(avgScore),
        count: 1,
      };
    });

    // contractData: revenu par type de mission
    const byType: Record<string, number> = {};
    (contrats || []).forEach((c: any) => {
      byType[c.type_mission] = (byType[c.type_mission] || 0) + parseFloat(c.montant || 0);
    });
    const contractData = Object.entries(byType).map(([name, value]) => ({ name, value: Math.round(value) }));

    // performanceData: avg score by month (last 6 months)
    const byMonth: Record<string, number[]> = {};
    (performances || []).forEach((p: any) => {
      const month = p.mois?.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = [];
      byMonth[month].push(parseFloat(p.score || 0));
    });
    const performanceData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, scores]) => ({
        day: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
        score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        missions: scores.length,
      }));

    // graphData: nodes (agents) + links (agent → contrat client)
    const nodes = (agents || []).map((a: any) => ({
      id: a.id,
      name: `${a.prenom} ${a.nom}`,
      type: 'agent',
      status: a.statut,
    }));
    const clientNodes = [...new Set((contrats || []).map((c: any) => c.client_nom))].map(name => ({
      id: name,
      name,
      type: 'contract',
    }));
    const links = (contrats || []).map((c: any) => ({
      source: c.agent_id,
      target: c.client_nom,
    }));

    return NextResponse.json({
      summary: {
        agentsActifs: agentsActifs || 0,
        contratsActifs: contratsActifs || 0,
        revenuTotal: Math.round(revenuTotal),
        performanceMoyenne: Math.round(performanceMoyenne * 10) / 10,
      },
      agentMetrics,
      contractData,
      performanceData,
      graphData: { nodes: [...nodes, ...clientNodes], links },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  try {
    const { agents, batchId, filename, totalRows, orgId, societeId } = await req.json();
    const orgIdFinal = orgId || societeId;
    if (!orgIdFinal) return Response.json({ error: 'societe_id manquant' }, { status: 400 });

    let successful = 0;
    let failed = 0;
    let duplicates = 0;
    const errorDetails: { email?: string; error: string }[] = [];

    // Vérifier les emails existants en une seule requête
    const { data: existingAgents } = await supabase
      .from('agents')
      .select('email')
      .eq('societe_id', orgIdFinal);

    const existingEmails = new Set(existingAgents?.map((a: { email: string }) => a.email) ?? []);

    const agentsToInsert = [];
    for (const agent of agents) {
      if (existingEmails.has(agent.email)) {
        duplicates++;
        errorDetails.push({ email: agent.email, error: 'Email déjà existant' });
      } else {
        agentsToInsert.push({
          societe_id: orgIdFinal,
          email: agent.email.toLowerCase(),
          nom: agent.nom.trim(),
          prenom: agent.prenom.trim(),
          telephone: agent.telephone || null,
          adresse: agent.adresse || null,
          statut: (agent.statut || 'actif').toLowerCase(),
          date_embauche: agent.date_embauche || null,
          specialite: agent.specialite || null,
          carte_pro: agent.carte_pro || null,
            expiration_carte: agent.expiration_carte || null,
            site_affectation: agent.site_affectation || agent.site || null,
            salaire_brut: agent.salaire_brut ? parseFloat(agent.salaire_brut) : null,
          import_batch_id: batchId,
        });
      }
    }

    if (agentsToInsert.length > 0) {
      const { error: insertError, data: insertedData } = await supabase
        .from('agents')
        .insert(agentsToInsert)
        .select();

      if (insertError) {
        errorDetails.push({ error: insertError.message });
        failed = agentsToInsert.length;
      } else {
        successful = insertedData?.length ?? 0;
      }
    }

    const graphData = {
      nodes: agentsToInsert.map(a => ({
        id: a.email,
        type: 'agent',
        name: `${a.prenom} ${a.nom}`,
        status: a.statut,
      })),
      links: agentsToInsert.map(a => ({
        source: a.email,
        target: orgIdFinal,
        type: 'assigned',
      })),
    };

    const auditId = uuidv4();
    const { error: auditError } = await supabase.from('import_audits').insert({
      id: auditId,
      societe_id: orgIdFinal,
      filename,
      total_rows: totalRows,
      successful_imports: successful,
      failed_imports: failed,
      duplicates_found: duplicates,
      errors: errorDetails,
      graph_data: graphData,
    });

    if (auditError) console.error('Audit error:', auditError);

    return Response.json({ success: true, successful, failed, duplicates, batchId, auditId, errors: errorDetails });
  } catch (error: any) {
    console.error('Import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

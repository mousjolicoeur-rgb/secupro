import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendCarteProAlertEmail } from '@/lib/emails';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  // Sécurisation basique du cron
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    processed: 0,
    sent: 0,
    errors: [] as string[]
  };

  try {
    // 1. Récupérer tous les agents actifs avec une date d'expiration
    const { data: agents, error } = await supabaseAdmin
      .from('agents')
      .select(`
        id, nom, prenom, carte_pro_expiration, statut,
        societes ( id, nom, email_contact )
      `)
      .eq('statut', 'actif')
      .not('carte_pro_expiration', 'is', null)
      .not('societe_id', 'is', null);

    if (error) throw error;
    if (!agents) return NextResponse.json({ success: true, results });

    const now = new Date();
    // On ignore l'heure pour les comparaisons de dates
    now.setHours(0, 0, 0, 0);

    for (const agent of agents) {
      results.processed++;
      const societe = agent.societes as any;
      if (!societe || !societe.email_contact) continue;

      const expDate = new Date(agent.carte_pro_expiration);
      expDate.setHours(0, 0, 0, 0);
      
      const diffTime = expDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let urgency: 'informatif' | 'urgent' | 'critique' | null = null;

      // Logique des plages de jours
      if (diffDays >= 88 && diffDays <= 92) {
        urgency = 'informatif';
      } else if (diffDays >= 28 && diffDays <= 32) {
        urgency = 'urgent';
      } else if (diffDays >= 5 && diffDays <= 9) {
        urgency = 'critique';
      }

      if (urgency) {
        try {
          // Formatage de la date en FR (JJ/MM/AAAA)
          const formattedDate = expDate.toLocaleDateString('fr-FR');
          
          await sendCarteProAlertEmail(
            societe.email_contact,
            agent.nom,
            agent.prenom,
            formattedDate,
            urgency,
            diffDays
          );

          // Logger l'envoi
          await supabaseAdmin
            .from('import_audits')
            .insert({
              societe_id: societe.id,
              fichier_nom: `Alerte_CartePro_J${diffDays}`,
              nb_lignes: 1,
              nb_succes: 1,
              nb_erreurs: 0,
              erreurs: { agentId: agent.id, agentNom: agent.nom, urgency, date: now.toISOString() }
            });

          results.sent++;
        } catch (emailErr: any) {
          results.errors.push(`Erreur agent ${agent.id}: ${emailErr.message}`);
        }
      }
    }

    return NextResponse.json({ success: true, results });

  } catch (globalErr: any) {
    return NextResponse.json({ success: false, error: globalErr.message }, { status: 500 });
  }
}

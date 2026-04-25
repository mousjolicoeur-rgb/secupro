'use server';

import { supabase } from '@/lib/supabaseClient';
import Papa from 'papaparse';
import { z } from 'zod';

const SMIC_HORAIRE = 11.65; // SMIC de référence

// Schéma de validation pour une ligne du CSV
const csvRowSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  email: z.string().email("Format d'email invalide"),
  telephone: z.string().optional().or(z.literal('')),
  carte_pro: z.string().regex(
    /^(CAR|AUT|MAC|REC)-/i, 
    "Format CNAPS invalide (doit commencer par CAR-, AUT-, MAC- ou REC-)"
  ),
  coefficient: z.coerce.number()
    .min(120, "Le coefficient minimum est 120 (Grille IDCC 1351)")
    .max(200, "Le coefficient maximum est 200 (Grille IDCC 1351)"),
  taux_horaire: z.coerce.number()
    .min(SMIC_HORAIRE, `Le taux horaire doit être supérieur ou égal au SMIC (${SMIC_HORAIRE}€)`)
});

/**
 * Action serveur pour importer une liste d'agents via CSV (provisioning).
 */
export async function importAgentsCSV(
  societeId: string,
  fileName: string,
  csvContent: string
) {
  try {
    // 1. Récupérer les emails existants pour cette société afin de détecter les doublons
    const { data: existingAgents, error: fetchError } = await supabase
      .from('agents')
      .select('email')
      .eq('societe_id', societeId);

    if (fetchError) {
      throw new Error("Impossible de vérifier les agents existants pour les doublons.");
    }

    const existingEmails = new Set(
      existingAgents?.filter(a => a.email).map(a => a.email.toLowerCase()) || []
    );

    // 2. Parser le contenu du CSV
    const parsed = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      // Standardise les en-têtes (minuscules, sans espaces)
      transformHeader: (header) => header.trim().toLowerCase()
    });

    const rows = parsed.data as any[];
    let nb_succes = 0;
    let nb_erreurs = 0;
    const erreurs: any[] = [];
    
    // 3. Traitement ligne par ligne
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const ligne = i + 2; // +1 pour l'index 0-based, +1 pour la ligne d'en-tête
      
      try {
        // A. Validation des données Zod
        const validated = csvRowSchema.parse(row);
        
        // B. Vérification du doublon email + société
        if (existingEmails.has(validated.email.toLowerCase())) {
          throw new Error(`Un agent avec l'email ${validated.email} existe déjà pour votre société.`);
        }

        // C. Insertion de l'agent
        const { data: agent, error: agentError } = await supabase
          .from('agents')
          .insert({
            societe_id: societeId,
            nom: validated.nom.toUpperCase(), // Convention: nom en majuscules
            prenom: validated.prenom,
            email: validated.email.toLowerCase(),
            telephone: validated.telephone,
            carte_pro: validated.carte_pro,
            statut: 'actif'
          })
          .select('id')
          .single();

        if (agentError) {
          throw new Error(`Erreur lors de la création de l'agent: ${agentError.message}`);
        }

        // D. Insertion du contrat
        const { error: contratError } = await supabase
          .from('contrats')
          .insert({
            agent_id: agent.id,
            type_contrat: 'CDI', // Par défaut lors d'un import brut
            coefficient: validated.coefficient,
            taux_horaire: validated.taux_horaire,
            // Date de début par défaut (aujourd'hui) si non spécifiée dans le CSV
            date_debut: new Date().toISOString().split('T')[0]
          });

        if (contratError) {
          // Note : en environnement de production réel, on implémenterait un rollback de l'agent ici
          // ou l'utilisation d'une procédure stockée RPC pour l'atomicité.
          throw new Error(`Erreur lors de la création du contrat: ${contratError.message}`);
        }

        // Succès de la ligne
        existingEmails.add(validated.email.toLowerCase());
        nb_succes++;

      } catch (err: any) {
        nb_erreurs++;
        let message = err.message || 'Erreur inconnue';
        
        // Formatage clair des erreurs Zod
        if (err instanceof z.ZodError) {
          message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(' | ');
        }
        
        erreurs.push({
          ligne,
          email: row.email || 'N/A',
          message
        });
      }
    }

    // 4. Enregistrement du log d'audit
    const { error: auditError } = await supabase
      .from('import_audits')
      .insert({
        societe_id: societeId,
        fichier_nom: fileName,
        nb_lignes: rows.length,
        nb_succes,
        nb_erreurs,
        erreurs
      });

    if (auditError) {
      console.error("[SecuPRO] Erreur lors de la sauvegarde de l'audit d'import:", auditError);
      // On ne throw pas l'erreur pour ne pas bloquer le retour d'information à l'utilisateur
    }

    return {
      success: true,
      data: {
        nb_lignes: rows.length,
        nb_succes,
        nb_erreurs,
        erreurs
      }
    };
    
  } catch (error: any) {
    console.error('[SecuPRO] Erreur importAgentsCSV:', error);
    return { 
      success: false, 
      error: error.message || "Une erreur inattendue est survenue lors de l'importation." 
    };
  }
}

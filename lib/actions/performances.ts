'use server';

import { supabase } from '@/lib/supabaseClient';

/**
 * Récupère le rapport de performance pour une société donnée et une période (YYYY-MM),
 * et calcule le taux d'absentéisme moyen.
 */
export async function getPerformanceReport(
  societeId: string,
  periode: string  // format 'YYYY-MM'
) {
  try {
    const { data, error } = await supabase
      .from('performances')
      .select(`
        *,
        agents!inner(nom, prenom, statut, societe_id)
      `)
      .eq('agents.societe_id', societeId)
      .eq('periode', periode);

    if (error) {
      console.error('[SecuPRO] Erreur Supabase lors de la récupération des performances:', error);
      throw error;
    }

    // Calcul du taux d'absentéisme moyen
    let taux_absenteisme_moyen = 0;
    if (data && data.length > 0) {
      // On s'assure de convertir en nombre au cas où Supabase renvoie des strings pour les champs numeric
      const sum = data.reduce((acc, curr) => acc + (Number(curr.taux_absenteisme) || 0), 0);
      taux_absenteisme_moyen = Number((sum / data.length).toFixed(2));
    }

    // On peut également calculer d'autres moyennes si besoin
    let heures_totales_realisees = 0;
    if (data && data.length > 0) {
      heures_totales_realisees = data.reduce((acc, curr) => acc + (Number(curr.heures_realisees) || 0), 0);
    }

    return { 
      success: true, 
      data: {
        performances: data,
        metriques: {
          taux_absenteisme_moyen,
          heures_totales_realisees,
          nombre_agents_evalues: data.length
        }
      } 
    };
  } catch (error) {
    console.error('[SecuPRO] Erreur getPerformanceReport:', error);
    return { 
      success: false, 
      error: 'Une erreur est survenue lors de la récupération du rapport de performance.' 
    };
  }
}

export type ParsedShift = {
  id: string;
  date: string; // Format YYYY-MM-DD
  startMin: number;
  endMin: number;
  societeId: string | null;
  raw: any;
};

export type Conflict = {
  type: 'overlap' | 'repos' | 'max_jour' | 'max_semaine';
  message: string;
  shiftIds: string[];
};

/**
 * Extrait les minutes depuis minuit d'une chaîne horaire.
 * Formats gérés: "08:00", "8h00", "08h30"
 */
export function parseTime(timeStr: string): number | null {
  const match = timeStr.trim().match(/(\d{1,2})[h:](\d{2})/i);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h * 60 + m;
}

/**
 * Parse une plage horaire pour récupérer le début et la fin en minutes.
 * Gère les shifts de nuit (fin < début).
 * Ex: "08:00-18:00", "08:00 - 18:00", "8h00 à 18h00"
 */
export function parseHoraires(horaires: string): { startMin: number, endMin: number } | null {
  const parts = horaires.split(/[-à]|au/i);
  if (parts.length < 2) return null;
  
  const startMin = parseTime(parts[0]);
  const endMin = parseTime(parts[1]);
  
  if (startMin === null || endMin === null) return null;
  
  let end = endMin;
  if (end < startMin) {
    // Si la fin est inférieure au début, c'est que la vacation finit le lendemain
    end += 24 * 60; 
  }
  
  return { startMin, endMin: end };
}

/**
 * Convertit un shift en timestamps absolus (en ms) pour faciliter 
 * les comparaisons entre jours différents.
 */
export function getShiftTimestamps(shift: ParsedShift): { startTs: number, endTs: number } {
  const [y, m, d] = shift.date.split('-').map(Number);
  // Mois 0-indexé
  const baseTs = new Date(y, m - 1, d).getTime(); 
  const startTs = baseTs + shift.startMin * 60000;
  const endTs = baseTs + shift.endMin * 60000;
  return { startTs, endTs };
}

/**
 * Applique les règles IDCC 1351 pour détecter les conflits
 * sur un ensemble de vacations d'une semaine.
 */
export function detectConflicts(shifts: ParsedShift[]): Conflict[] {
  const conflicts: Conflict[] = [];
  let totalMinutesWeek = 0;
  
  // Trier les shifts par date/heure de début chronologique
  const sortedShifts = [...shifts].sort((a, b) => {
    return getShiftTimestamps(a).startTs - getShiftTimestamps(b).startTs;
  });

  for (let i = 0; i < sortedShifts.length; i++) {
    const s1 = sortedShifts[i];
    const { startTs: start1, endTs: end1 } = getShiftTimestamps(s1);
    
    const durationMins = (end1 - start1) / 60000;
    totalMinutesWeek += durationMins;

    // Règle 2 : Durée max journalière de 12h
    if (durationMins > 12 * 60) {
      conflicts.push({
        type: 'max_jour',
        message: `Durée journalière max (12h) dépassée : ${Math.round(durationMins/60)}h le ${s1.date}`,
        shiftIds: [s1.id]
      });
    }

    if (i > 0) {
      const s0 = sortedShifts[i - 1];
      const { endTs: end0 } = getShiftTimestamps(s0);

      // Règle 1 : Chevauchement d'horaires
      if (start1 < end0) {
        conflicts.push({
          type: 'overlap',
          message: `Chevauchement entre deux vacations le ${s0.date} et ${s1.date} !`,
          shiftIds: [s0.id, s1.id]
        });
      } else {
        // Règle 3 : Repos minimum de 11h consécutives
        const restMins = (start1 - end0) / 60000;
        if (restMins > 0 && restMins < 11 * 60) {
          conflicts.push({
            type: 'repos',
            message: `Temps de repos insuffisant (< 11h) : seulement ${Math.floor(restMins/60)}h${Math.round(restMins%60)}min`,
            shiftIds: [s0.id, s1.id]
          });
        }
      }
    }
  }

  // Règle 4 : Durée max hebdomadaire absolue de 48h
  if (totalMinutesWeek > 48 * 60) {
    conflicts.push({
      type: 'max_semaine',
      message: `Durée hebdomadaire > 48h (${Math.round(totalMinutesWeek/60)}h planifiées)`,
      shiftIds: sortedShifts.map(s => s.id)
    });
  }

  return conflicts;
}
